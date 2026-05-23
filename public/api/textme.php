<?php
declare(strict_types=1);

const TEXTME_TEST_MODE = true;
const TEXTME_TEST_ALLOWED_NUMBER = '6138803625';

function send_textme_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function send_textme_headers(): void
{
    $allowedOrigins = [
        'https://www.hawkesburyjrgolf.ca',
        'https://hawkesburyjrgolf.ca',
        'http://127.0.0.1:4174',
        'http://localhost:4174',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');
}

function get_textme_admin_member_id(PDO $pdo): int
{
    $token = get_bearer_token();

    if ($token === '') {
        $token = (string) ($_GET['token'] ?? $_POST['token'] ?? '');
    }

    $payload = $token === '' ? null : verify_member_jwt($token);
    $memberId = (int) ($payload['sub'] ?? 0);

    if ($memberId < 1) {
        send_textme_json(401, ['ok' => false, 'message' => 'Please log in as an admin.']);
    }

    $statement = $pdo->prepare(
        'SELECT membership_type, is_active
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch();

    if (!$member || $member['membership_type'] !== 'ADMIN' || !(bool) $member['is_active']) {
        send_textme_json(403, ['ok' => false, 'message' => 'Only admins can send text messages.']);
    }

    return $memberId;
}

function get_twilio_config(): array
{
    $config = [
        'accountSid' => getenv('HAWKJR_TWILIO_ACCOUNT_SID') ?: '',
        'authToken' => getenv('HAWKJR_TWILIO_AUTH_TOKEN') ?: '',
        'fromNumber' => getenv('HAWKJR_TWILIO_FROM_NUMBER') ?: '',
    ];

    $configPath = __DIR__ . '/twilio-secret.php';

    if (is_file($configPath)) {
        $fileConfig = require $configPath;

        if (is_array($fileConfig)) {
            $config['accountSid'] = (string) ($fileConfig['accountSid'] ?? $fileConfig['sid'] ?? $config['accountSid']);
            $config['authToken'] = (string) ($fileConfig['authToken'] ?? $fileConfig['token'] ?? $config['authToken']);
            $config['fromNumber'] = (string) ($fileConfig['fromNumber'] ?? $fileConfig['twilio_number'] ?? $fileConfig['from'] ?? $config['fromNumber']);
        }
    }

    if ($config['accountSid'] === '' || $config['authToken'] === '' || $config['fromNumber'] === '') {
        throw new RuntimeException('Twilio is not configured.');
    }

    return $config;
}

function load_twilio_autoload(): void
{
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
    $autoloadPaths = [
        __DIR__ . '/vendor/autoload.php',
        dirname(__DIR__) . '/vendor/autoload.php',
        dirname(__DIR__, 2) . '/vendor/autoload.php',
        $documentRoot . '/vendor/autoload.php',
        $documentRoot . '/../vendor/autoload.php',
    ];

    foreach ($autoloadPaths as $autoloadPath) {
        if (is_file($autoloadPath)) {
            require_once $autoloadPath;
            return;
        }
    }

    throw new RuntimeException('Twilio vendor autoload.php was not found.');
}

function normalize_text_recipient($recipient): array
{
    if (is_string($recipient)) {
        return [
            'to' => trim($recipient),
            'name' => '',
        ];
    }

    if (!is_array($recipient)) {
        throw new InvalidArgumentException('Each recipient must be a phone number or an object with to and name.');
    }

    return [
        'to' => trim((string) ($recipient['to'] ?? $recipient['number'] ?? '')),
        'name' => trim((string) ($recipient['name'] ?? $recipient['firstName'] ?? '')),
    ];
}

function personalize_text_message(string $message, array $recipient): string
{
    return str_replace(
        ['{name}', '{firstName}'],
        [$recipient['name'], $recipient['name']],
        $message
    );
}

function normalize_text_number_for_test(string $number): string
{
    return preg_replace('/\D+/', '', $number) ?? '';
}

function send_text_message(string $to, string $message): string
{
    $config = get_twilio_config();
    load_twilio_autoload();

    if (!class_exists('Twilio\\Rest\\Client')) {
        throw new RuntimeException('Twilio REST client class was not found.');
    }

    $clientClass = 'Twilio\\Rest\\Client';
    $client = new $clientClass($config['accountSid'], $config['authToken']);
    $text = $client->messages->create(
        $to,
        [
            'from' => $config['fromNumber'],
            'body' => $message,
        ]
    );

    return (string) $text->sid;
}

function send_text_messages(array $recipients, string $message): array
{
    $results = [];

    foreach ($recipients as $recipient) {
        $normalized = normalize_text_recipient($recipient);

        if ($normalized['to'] === '') {
            $results[] = [
                'ok' => false,
                'to' => '',
                'name' => $normalized['name'],
                'message' => 'Missing phone number.',
            ];
            continue;
        }

        $personalizedMessage = personalize_text_message($message, $normalized);
        $isAllowedTestNumber = normalize_text_number_for_test($normalized['to']) === TEXTME_TEST_ALLOWED_NUMBER
            || normalize_text_number_for_test($normalized['to']) === '1' . TEXTME_TEST_ALLOWED_NUMBER;

        if (TEXTME_TEST_MODE && !$isAllowedTestNumber) {
            $results[] = [
                'ok' => true,
                'testing' => true,
                'skipped' => true,
                'to' => $normalized['to'],
                'name' => $normalized['name'],
                'message' => "Testing mode: no text sent to {$normalized['to']}. Message preview: " . $personalizedMessage,
            ];
            continue;
        }

        try {
            $results[] = [
                'ok' => true,
                'testing' => TEXTME_TEST_MODE,
                'to' => $normalized['to'],
                'name' => $normalized['name'],
                'sid' => send_text_message($normalized['to'], $personalizedMessage),
                'message' => TEXTME_TEST_MODE
                    ? "Testing mode: real text sent only because {$normalized['to']} is the approved test number."
                    : 'Text sent.',
            ];
        } catch (Throwable $error) {
            $results[] = [
                'ok' => false,
                'to' => $normalized['to'],
                'name' => $normalized['name'],
                'message' => $error->getMessage(),
            ];
        }
    }

    return $results;
}

if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) !== __FILE__) {
    return;
}

send_textme_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_textme_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

try {
    $pdo = get_database();
    ensure_members_table($pdo);
    get_textme_admin_member_id($pdo);

    $input = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($input)) {
        send_textme_json(400, ['ok' => false, 'message' => 'Invalid JSON body.']);
    }

    $message = trim((string) ($input['message'] ?? ''));
    $recipients = $input['recipients'] ?? null;

    if ($recipients === null && isset($input['to'])) {
        $recipients = [
            [
                'to' => $input['to'],
                'name' => $input['name'] ?? $input['firstName'] ?? '',
            ],
        ];
    }

    if ($message === '') {
        send_textme_json(400, ['ok' => false, 'message' => 'Message is required.']);
    }

    if (!is_array($recipients) || count($recipients) < 1) {
        send_textme_json(400, ['ok' => false, 'message' => 'At least one recipient is required.']);
    }

    $results = send_text_messages($recipients, $message);
    $sent = count(array_filter($results, static fn (array $result): bool => (bool) $result['ok']));

    send_textme_json(200, [
        'ok' => $sent > 0,
        'sent' => $sent,
        'failed' => count($results) - $sent,
        'results' => $results,
    ]);
} catch (Throwable $error) {
    error_log('Text message error: ' . $error->getMessage());

    send_textme_json(500, [
        'ok' => false,
        'message' => 'The text message service is not available right now.',
    ]);
}

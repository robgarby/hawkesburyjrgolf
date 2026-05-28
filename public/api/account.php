<?php
declare(strict_types=1);

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

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

function send_account_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function get_account_member_id(): int
{
    $token = get_bearer_token();

    if ($token === '') {
        $token = (string) ($_GET['token'] ?? $_POST['token'] ?? '');
    }

    $payload = $token === '' ? null : verify_member_jwt($token);
    $memberId = (int) ($payload['sub'] ?? 0);

    if ($memberId < 1) {
        send_account_json(401, ['ok' => false, 'message' => 'Please log in before updating your account.']);
    }

    return $memberId;
}

function get_account_profile(PDO $pdo, int $memberId): array
{
    $statement = $pdo->prepare(
        'SELECT id, username, first_name, last_name, membership_type, parent_email, parent_email_notify,
                notify_lessons_parent_email, notify_lessons_player_text, notify_lessons_parent_text,
                notify_events_parent_email, notify_events_player_text, notify_events_parent_text,
                notify_games_parent_email, notify_games_player_text, notify_games_parent_text,
                parent_name, parent_text, parent_text_notify, player_age, player_text, player_text_notify,
                show_public_stats
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch();

    if (!$member) {
        send_account_json(404, ['ok' => false, 'message' => 'Account not found.']);
    }

    return [
        'id' => (int) $member['id'],
        'username' => $member['username'],
        'firstName' => $member['first_name'],
        'lastName' => $member['last_name'],
        'membershipType' => $member['membership_type'],
        'parentEmail' => $member['parent_email'],
        'parentEmailNotify' => (bool) $member['parent_email_notify'],
        'notifyLessonsParentEmail' => (bool) $member['notify_lessons_parent_email'],
        'notifyLessonsPlayerText' => (bool) $member['notify_lessons_player_text'],
        'notifyLessonsParentText' => (bool) $member['notify_lessons_parent_text'],
        'notifyEventsParentEmail' => (bool) $member['notify_events_parent_email'],
        'notifyEventsPlayerText' => (bool) $member['notify_events_player_text'],
        'notifyEventsParentText' => (bool) $member['notify_events_parent_text'],
        'notifyGamesParentEmail' => (bool) $member['notify_games_parent_email'],
        'notifyGamesPlayerText' => (bool) $member['notify_games_player_text'],
        'notifyGamesParentText' => (bool) $member['notify_games_parent_text'],
        'parentName' => $member['parent_name'],
        'parentText' => $member['parent_text'],
        'parentTextNotify' => (bool) $member['parent_text_notify'],
        'playerAge' => $member['player_age'] ? (int) $member['player_age'] : null,
        'playerText' => $member['player_text'],
        'playerTextNotify' => (bool) $member['player_text_notify'],
        'showPublicStats' => (bool) $member['show_public_stats'],
    ];
}

try {
    $memberId = get_account_member_id();
    $pdo = get_database();
    run_schema_setup('Account service', static function () use ($pdo): void {
        ensure_members_table($pdo);
    });

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_account_json(200, [
            'ok' => true,
            'member' => get_account_profile($pdo, $memberId),
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_account_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
    }

    $parentEmail = trim((string) ($_POST['parent_email'] ?? ''));
    $parentText = trim((string) ($_POST['parent_text'] ?? ''));
    $playerText = trim((string) ($_POST['player_text'] ?? ''));
    $notifyLessonsParentEmail = isset($_POST['notify_lessons_parent_email']) ? 1 : 0;
    $notifyLessonsPlayerText = isset($_POST['notify_lessons_player_text']) ? 1 : 0;
    $notifyLessonsParentText = isset($_POST['notify_lessons_parent_text']) ? 1 : 0;
    $notifyEventsParentEmail = isset($_POST['notify_events_parent_email']) ? 1 : 0;
    $notifyEventsPlayerText = isset($_POST['notify_events_player_text']) ? 1 : 0;
    $notifyEventsParentText = isset($_POST['notify_events_parent_text']) ? 1 : 0;
    $notifyGamesParentEmail = isset($_POST['notify_games_parent_email']) ? 1 : 0;
    $notifyGamesPlayerText = isset($_POST['notify_games_player_text']) ? 1 : 0;
    $notifyGamesParentText = isset($_POST['notify_games_parent_text']) ? 1 : 0;
    $parentEmailNotify = ($notifyLessonsParentEmail || $notifyEventsParentEmail || $notifyGamesParentEmail) ? 1 : 0;
    $playerTextNotify = ($notifyLessonsPlayerText || $notifyEventsPlayerText || $notifyGamesPlayerText) ? 1 : 0;
    $parentTextNotify = ($notifyLessonsParentText || $notifyEventsParentText || $notifyGamesParentText) ? 1 : 0;
    $showPublicStats = isset($_POST['show_public_stats']) && (string) $_POST['show_public_stats'] !== '0' ? 1 : 0;

    if (!filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        send_account_json(422, ['ok' => false, 'message' => 'Please enter a valid parent email.']);
    }

    $statement = $pdo->prepare(
        'UPDATE members
         SET parent_email = :parent_email,
             parent_email_notify = :parent_email_notify,
             notify_lessons_parent_email = :notify_lessons_parent_email,
             notify_lessons_player_text = :notify_lessons_player_text,
             notify_lessons_parent_text = :notify_lessons_parent_text,
             notify_events_parent_email = :notify_events_parent_email,
             notify_events_player_text = :notify_events_player_text,
             notify_events_parent_text = :notify_events_parent_text,
             notify_games_parent_email = :notify_games_parent_email,
             notify_games_player_text = :notify_games_player_text,
             notify_games_parent_text = :notify_games_parent_text,
             parent_text = :parent_text,
             parent_text_notify = :parent_text_notify,
             player_text = :player_text,
             player_text_notify = :player_text_notify,
             show_public_stats = :show_public_stats
         WHERE id = :id'
    );
    $statement->execute([
        'parent_email' => $parentEmail,
        'parent_email_notify' => $parentEmailNotify,
        'notify_lessons_parent_email' => $notifyLessonsParentEmail,
        'notify_lessons_player_text' => $notifyLessonsPlayerText,
        'notify_lessons_parent_text' => $notifyLessonsParentText,
        'notify_events_parent_email' => $notifyEventsParentEmail,
        'notify_events_player_text' => $notifyEventsPlayerText,
        'notify_events_parent_text' => $notifyEventsParentText,
        'notify_games_parent_email' => $notifyGamesParentEmail,
        'notify_games_player_text' => $notifyGamesPlayerText,
        'notify_games_parent_text' => $notifyGamesParentText,
        'parent_text' => $parentText === '' ? null : $parentText,
        'parent_text_notify' => $parentTextNotify,
        'player_text' => $playerText === '' ? null : $playerText,
        'player_text_notify' => $playerTextNotify,
        'show_public_stats' => $showPublicStats,
        'id' => $memberId,
    ]);

    send_account_json(200, [
        'ok' => true,
        'message' => 'Account notifications saved.',
        'member' => get_account_profile($pdo, $memberId),
    ]);
} catch (Throwable $error) {
    error_log('Account service error: ' . $error->getMessage());

    send_account_json(500, [
        'ok' => false,
        'message' => 'The account service is not available right now.',
    ]);
}

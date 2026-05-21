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

function send_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function get_member_payload(): array
{
    $token = get_bearer_token();

    if ($token === '') {
        $token = (string) ($_GET['token'] ?? $_POST['token'] ?? '');
    }

    if ($token === '') {
        send_json(401, [
            'ok' => false,
            'message' => 'Please log in before entering scores.',
        ]);
    }

    $payload = verify_member_jwt($token);

    if (!$payload) {
        send_json(401, [
            'ok' => false,
            'message' => 'Your login has expired. Please log in again.',
        ]);
    }

    return $payload;
}

function get_member_rounds(PDO $pdo, int $memberId): array
{
    $statement = $pdo->prepare(
        'SELECT id, round_date, tee, format, score, created_at
         FROM member_rounds
         WHERE member_id = :member_id
         ORDER BY round_date DESC, id DESC'
    );
    $statement->execute(['member_id' => $memberId]);

    return array_map(
        static fn (array $round): array => [
            'id' => (int) $round['id'],
            'roundDate' => $round['round_date'],
            'tee' => $round['tee'],
            'format' => $round['format'],
            'score' => $round['score'],
            'createdAt' => $round['created_at'],
        ],
        $statement->fetchAll()
    );
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    ensure_members_table($pdo);
    ensure_member_rounds_table($pdo);
    ensure_member_points_table($pdo);
    ensure_round_points_for_member($pdo, $memberId);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rounds = get_member_rounds($pdo, $memberId);

        send_json(200, [
            'ok' => true,
            'points' => count($rounds),
            'roundsPlayed' => count($rounds),
            'rounds' => $rounds,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(405, [
            'ok' => false,
            'message' => 'Method not allowed.',
        ]);
    }

    $roundDate = trim((string) ($_POST['round_date'] ?? ''));
    $tee = trim((string) ($_POST['tee'] ?? ''));
    $format = trim((string) ($_POST['format'] ?? ''));
    $score = trim((string) ($_POST['score'] ?? ''));

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $roundDate);
    $dateErrors = DateTimeImmutable::getLastErrors();
    $isValidDate = $date instanceof DateTimeImmutable
        && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
        && $date->format('Y-m-d') === $roundDate;

    $validTees = ['red', 'white', 'blue', 'black', 'gold'];
    $validFormats = ['practice', '1-2-3', 'match-play', 'score', 'stableford'];

    if (!$isValidDate || $score === '' || strlen($score) > 40 || !in_array($tee, $validTees, true) || !in_array($format, $validFormats, true)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a valid round date, tee, format, and score.',
        ]);
    }

    $insert = $pdo->prepare(
        'INSERT INTO member_rounds (member_id, round_date, tee, format, score)
         VALUES (:member_id, :round_date, :tee, :format, :score)'
    );
    $insert->execute([
        'member_id' => $memberId,
        'round_date' => $roundDate,
        'tee' => $tee,
        'format' => $format,
        'score' => $score,
    ]);
    $roundId = (int) $pdo->lastInsertId();

    add_member_point(
        $pdo,
        $memberId,
        'ROUND',
        $roundDate,
        "Round - {$roundDate}",
        1,
        'member_rounds',
        $roundId
    );

    $rounds = get_member_rounds($pdo, $memberId);

    send_json(200, [
        'ok' => true,
        'message' => 'Round saved. 1 point added.',
        'points' => count($rounds),
        'roundsPlayed' => count($rounds),
        'rounds' => $rounds,
    ]);
} catch (Throwable $error) {
    error_log('Scores service error: ' . $error->getMessage());

    send_json(500, [
        'ok' => false,
        'message' => 'The scores service is not available right now.',
    ]);
}

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
            'message' => 'Please log in before viewing points.',
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

function get_points_balance(PDO $pdo, int $memberId): int
{
    $statement = $pdo->prepare(
        'SELECT COALESCE(SUM(points), 0) AS balance
         FROM member_points
         WHERE member_id = :member_id'
    );
    $statement->execute(['member_id' => $memberId]);

    return (int) ($statement->fetch()['balance'] ?? 0);
}

function get_pending_cashout_total(PDO $pdo, int $memberId): int
{
    $statement = $pdo->prepare(
        "SELECT COALESCE(SUM(points), 0) AS pending_total
         FROM member_point_cashouts
         WHERE member_id = :member_id
         AND status = 'REQUESTED'"
    );
    $statement->execute(['member_id' => $memberId]);

    return (int) ($statement->fetch()['pending_total'] ?? 0);
}

function get_member_points(PDO $pdo, int $memberId): array
{
    $statement = $pdo->prepare(
        'SELECT id, point_type, point_date, description, points, created_at
         FROM member_points
         WHERE member_id = :member_id
         ORDER BY point_date DESC, id DESC'
    );
    $statement->execute(['member_id' => $memberId]);

    return array_map(
        static fn (array $point): array => [
            'id' => (int) $point['id'],
            'type' => $point['point_type'],
            'date' => $point['point_date'],
            'description' => $point['description'],
            'points' => (int) $point['points'],
            'createdAt' => $point['created_at'],
        ],
        $statement->fetchAll()
    );
}

function get_member_cashout_requests(PDO $pdo, int $memberId): array
{
    $statement = $pdo->prepare(
        'SELECT id, points, status, requested_at, approved_at
         FROM member_point_cashouts
         WHERE member_id = :member_id
         ORDER BY requested_at DESC, id DESC'
    );
    $statement->execute(['member_id' => $memberId]);

    return array_map(
        static fn (array $request): array => [
            'id' => (int) $request['id'],
            'points' => (int) $request['points'],
            'status' => $request['status'],
            'requestedAt' => $request['requested_at'],
            'approvedAt' => $request['approved_at'],
        ],
        $statement->fetchAll()
    );
}

function send_points_response(PDO $pdo, int $memberId, string $message = ''): void
{
    $entries = get_member_points($pdo, $memberId);

    send_json(200, [
        'ok' => true,
        'message' => $message,
        'balance' => get_points_balance($pdo, $memberId),
        'entries' => $entries,
        'cashoutRequests' => get_member_cashout_requests($pdo, $memberId),
    ]);
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    ensure_members_table($pdo);
    ensure_member_rounds_table($pdo);
    ensure_member_points_table($pdo);
    ensure_member_point_cashouts_table($pdo);
    ensure_round_points_for_member($pdo, $memberId);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_points_response($pdo, $memberId);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(405, [
            'ok' => false,
            'message' => 'Method not allowed.',
        ]);
    }

    $action = (string) ($_POST['action'] ?? '');

    if ($action !== 'cash_out') {
        send_json(422, [
            'ok' => false,
            'message' => 'Please choose a valid points action.',
        ]);
    }

    $amount = filter_var($_POST['points'] ?? null, FILTER_VALIDATE_INT, [
        'options' => [
            'min_range' => 1,
            'max_range' => 999,
        ],
    ]);
    $balance = get_points_balance($pdo, $memberId);
    $availableBalance = $balance - get_pending_cashout_total($pdo, $memberId);

    if ($amount === false || $amount > $availableBalance) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please choose a valid number of points to cash out.',
        ]);
    }

    $insert = $pdo->prepare(
        'INSERT INTO member_point_cashouts (member_id, points)
         VALUES (:member_id, :points)'
    );
    $insert->execute([
        'member_id' => $memberId,
        'points' => (int) $amount,
    ]);

    send_points_response($pdo, $memberId, 'Cash out request sent for admin approval.');
} catch (Throwable $error) {
    error_log('Points service error: ' . $error->getMessage());

    send_json(500, [
        'ok' => false,
        'message' => 'The points service is not available right now.',
    ]);
}

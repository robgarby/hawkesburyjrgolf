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

if (!function_exists('is_member_admin_type')) {
    function is_member_admin_type(string $type): bool
    {
        return in_array(strtoupper(trim($type)), ['SUPER_ADMIN', 'ADMIN'], true);
    }
}

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

function get_member_type(PDO $pdo, int $memberId): string
{
    $statement = $pdo->prepare(
        'SELECT membership_type
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);

    return (string) ($statement->fetch()['membership_type'] ?? '');
}

function ensure_round_points_for_all_members(PDO $pdo): void
{
    $pdo->exec(
        "INSERT IGNORE INTO member_points
            (member_id, point_type, point_date, description, points, source_table, source_id)
         SELECT
            rounds.member_id,
            'ROUND',
            rounds.round_date,
            CONCAT('Round - ', DATE_FORMAT(rounds.round_date, '%Y-%m-%d')),
            1,
            'member_rounds',
            rounds.id
         FROM member_rounds rounds"
    );
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

function get_active_juniors(PDO $pdo): array
{
    $statement = $pdo->query(
        "SELECT id, first_name, last_name, username, membership_type
         FROM members
         WHERE is_active = 1
           AND membership_type IN ('CUP', 'COMMUNITY')
         ORDER BY membership_type ASC, first_name ASC, last_name ASC, username ASC"
    );
    $juniors = [
        'CUP' => [],
        'COMMUNITY' => [],
    ];

    foreach ($statement->fetchAll() as $row) {
        $path = (string) $row['membership_type'];
        $name = trim((string) (($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')));

        $juniors[$path][] = [
            'id' => (int) $row['id'],
            'name' => $name !== '' ? $name : (string) ($row['username'] ?? 'Junior'),
            'username' => $row['username'],
            'membershipType' => $path,
        ];
    }

    return $juniors;
}

function get_active_junior_id(PDO $pdo, int $memberId): int
{
    $statement = $pdo->prepare(
        "SELECT id
         FROM members
         WHERE id = :id
           AND is_active = 1
           AND membership_type IN ('CUP', 'COMMUNITY')
         LIMIT 1"
    );
    $statement->execute(['id' => $memberId]);
    $row = $statement->fetch();

    return $row ? (int) $row['id'] : 0;
}

function get_admin_point_histories(PDO $pdo): array
{
    $statement = $pdo->query(
        'SELECT id, member_id, point_type, point_date, description, points, created_at
         FROM member_points
         ORDER BY point_date DESC, id DESC'
    );
    $histories = [];

    foreach ($statement->fetchAll() as $point) {
        $memberId = (int) $point['member_id'];

        if (!isset($histories[$memberId])) {
            $histories[$memberId] = [];
        }

        $histories[$memberId][] = [
            'id' => (int) $point['id'],
            'type' => $point['point_type'],
            'date' => $point['point_date'],
            'description' => $point['description'],
            'points' => (int) $point['points'],
            'createdAt' => $point['created_at'],
        ];
    }

    return $histories;
}

function get_admin_points_leaderboard(PDO $pdo): array
{
    ensure_round_points_for_all_members($pdo);
    $histories = get_admin_point_histories($pdo);

    $statement = $pdo->query(
        "SELECT members.id, members.first_name, members.last_name, members.username, members.membership_type,
                COALESCE(point_totals.points_total, 0) AS points_total,
                COALESCE(round_totals.rounds_played, 0) AS rounds_played
         FROM members
         LEFT JOIN (
            SELECT member_id, SUM(points) AS points_total
            FROM member_points
            GROUP BY member_id
         ) point_totals ON point_totals.member_id = members.id
         LEFT JOIN (
            SELECT member_id, COUNT(*) AS rounds_played
            FROM member_rounds
            GROUP BY member_id
         ) round_totals ON round_totals.member_id = members.id
         WHERE members.is_active = 1
           AND members.membership_type IN ('CUP', 'COMMUNITY')
         ORDER BY points_total DESC, rounds_played DESC, members.first_name ASC, members.last_name ASC, members.username ASC"
    );
    $leaderboard = [
        'CUP' => [],
        'COMMUNITY' => [],
    ];

    foreach ($statement->fetchAll() as $member) {
        $name = trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? '')));
        $path = (string) $member['membership_type'];

        $leaderboard[$path][] = [
            'id' => (int) $member['id'],
            'name' => $name !== '' ? $name : (string) ($member['username'] ?? 'Member'),
            'username' => $member['username'],
            'membershipType' => $path,
            'points' => (int) $member['points_total'],
            'roundsPlayed' => (int) $member['rounds_played'],
            'entries' => $histories[(int) $member['id']] ?? [],
        ];
    }

    return $leaderboard;
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

    run_schema_setup('Points service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_rounds_table($pdo);
        ensure_member_points_table($pdo);
        ensure_member_point_cashouts_table($pdo);
    });
    ensure_round_points_for_member($pdo, $memberId);
    $memberType = get_member_type($pdo, $memberId);
    $isPointsAdmin = is_member_admin_type($memberType);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($isPointsAdmin) {
            send_json(200, [
                'ok' => true,
                'adminView' => true,
                'activeJuniors' => get_active_juniors($pdo),
                'leaderboard' => get_admin_points_leaderboard($pdo),
            ]);
        }

        send_points_response($pdo, $memberId);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(405, [
            'ok' => false,
            'message' => 'Method not allowed.',
        ]);
    }

    $action = (string) ($_POST['action'] ?? '');

    if ($action === 'award_points') {
        if (!$isPointsAdmin) {
            send_json(403, [
                'ok' => false,
                'message' => 'Only admins can enter points for players.',
            ]);
        }

        $targetMemberId = get_active_junior_id($pdo, (int) ($_POST['member_id'] ?? 0));
        $amount = filter_var($_POST['points'] ?? null, FILTER_VALIDATE_INT, [
            'options' => [
                'min_range' => 1,
                'max_range' => 999,
            ],
        ]);
        $description = trim((string) ($_POST['description'] ?? ''));
        $pointDate = trim((string) ($_POST['point_date'] ?? ''));
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $pointDate);
        $dateErrors = DateTimeImmutable::getLastErrors();
        $isValidDate = $date instanceof DateTimeImmutable
            && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
            && $date->format('Y-m-d') === $pointDate;

        if ($targetMemberId <= 0) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose an active junior before saving points.',
            ]);
        }

        if ($amount === false || $description === '' || strlen($description) > 160 || !$isValidDate) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please enter a valid date, reason, and points amount.',
            ]);
        }

        add_member_point(
            $pdo,
            $targetMemberId,
            'COACH_AWARD',
            $pointDate,
            $description,
            (int) $amount
        );

        send_json(200, [
            'ok' => true,
            'adminView' => true,
            'message' => 'Points saved.',
            'activeJuniors' => get_active_juniors($pdo),
            'leaderboard' => get_admin_points_leaderboard($pdo),
        ]);
    }

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

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

function get_admin_rounds_report(PDO $pdo): array
{
    $statement = $pdo->query(
        "SELECT members.id AS member_id, members.first_name, members.last_name, members.username, members.membership_type,
                rounds.id AS round_id, rounds.round_date, rounds.tee, rounds.format, rounds.score, rounds.created_at
         FROM members
         LEFT JOIN member_rounds rounds ON rounds.member_id = members.id
         WHERE members.is_active = 1
           AND members.membership_type IN ('CUP', 'COMMUNITY')
         ORDER BY members.membership_type ASC, members.first_name ASC, members.last_name ASC, members.username ASC,
                  rounds.round_date DESC, rounds.id DESC"
    );
    $members = [];

    foreach ($statement->fetchAll() as $row) {
        $memberId = (int) $row['member_id'];

        if (!isset($members[$memberId])) {
            $name = trim((string) (($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')));
            $members[$memberId] = [
                'id' => $memberId,
                'name' => $name !== '' ? $name : (string) ($row['username'] ?? 'Member'),
                'username' => $row['username'],
                'membershipType' => $row['membership_type'],
                'roundsPlayed' => 0,
                'rounds' => [],
            ];
        }

        if ($row['round_id'] === null) {
            continue;
        }

        $members[$memberId]['roundsPlayed']++;
        $members[$memberId]['rounds'][] = [
            'id' => (int) $row['round_id'],
            'roundDate' => $row['round_date'],
            'tee' => $row['tee'],
            'format' => $row['format'],
            'score' => $row['score'],
            'createdAt' => $row['created_at'],
        ];
    }

    $report = [
        'CUP' => [],
        'COMMUNITY' => [],
    ];

    foreach ($members as $member) {
        $report[$member['membershipType']][] = $member;
    }

    foreach ($report as &$membersByPath) {
        usort($membersByPath, static function (array $a, array $b): int {
            return ($b['roundsPlayed'] <=> $a['roundsPlayed'])
                ?: strcasecmp((string) $a['name'], (string) $b['name']);
        });
    }
    unset($membersByPath);

    return $report;
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    run_schema_setup('Scores service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_rounds_table($pdo);
        ensure_member_points_table($pdo);
    });
    $isSuperAdmin = is_super_admin_type(get_member_type($pdo, $memberId));

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if ($isSuperAdmin) {
            send_json(200, [
                'ok' => true,
                'adminView' => true,
                'activeJuniors' => get_active_juniors($pdo),
                'roundsReport' => get_admin_rounds_report($pdo),
            ]);
        }

        ensure_round_points_for_member($pdo, $memberId);
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
    $targetMemberId = $memberId;

    if ($isSuperAdmin) {
        $targetMemberId = (int) ($_POST['member_id'] ?? 0);
        $targetMemberId = get_active_junior_id($pdo, $targetMemberId);

        if ($targetMemberId <= 0) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose an active junior before saving the score.',
            ]);
        }
    }

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $roundDate);
    $dateErrors = DateTimeImmutable::getLastErrors();
    $isValidDate = $date instanceof DateTimeImmutable
        && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
        && $date->format('Y-m-d') === $roundDate;

    $validTees = ['red', 'white', 'blue', 'black', 'gold'];
    $validFormats = ['practice', 'match-play', 'score', 'stableford'];

    if (!in_array($format, $validFormats, true)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please choose a valid score type.',
        ]);
    }

    if ($format !== 'score') {
        $tee = 'red';
    }

    if ($format === 'practice') {
        $score = 'Practice';
    }

    if ($format === 'score' && !preg_match('/^\d{1,3}$/', $score)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a numeric regular round score.',
        ]);
    }

    if ($format === 'stableford' && !preg_match('/^\d{1,3}$/', $score)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a numeric Stableford score.',
        ]);
    }

    if ($format === 'match-play' && ($score === '' || strlen($score) > 40)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a match play result.',
        ]);
    }

    if (!$isValidDate || !in_array($tee, $validTees, true) || strlen($score) > 40) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a valid round date, score type, tee, and score.',
        ]);
    }

    $insert = $pdo->prepare(
        'INSERT INTO member_rounds (member_id, round_date, tee, format, score)
         VALUES (:member_id, :round_date, :tee, :format, :score)'
    );
    $insert->execute([
        'member_id' => $targetMemberId,
        'round_date' => $roundDate,
        'tee' => $tee,
        'format' => $format,
        'score' => $score,
    ]);
    $roundId = (int) $pdo->lastInsertId();

    ensure_round_points_for_member($pdo, $targetMemberId);
    add_member_point(
        $pdo,
        $targetMemberId,
        'ROUND',
        $roundDate,
        "Round - {$roundDate}",
        1,
        'member_rounds',
        $roundId
    );

    if ($isSuperAdmin) {
        send_json(200, [
            'ok' => true,
            'adminView' => true,
            'message' => 'Round saved. 1 point added.',
            'activeJuniors' => get_active_juniors($pdo),
            'roundsReport' => get_admin_rounds_report($pdo),
        ]);
    }

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

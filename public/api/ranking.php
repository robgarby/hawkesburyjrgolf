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

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

function send_ranking_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function require_ranking_member(): void
{
    $token = get_bearer_token();

    if ($token === '') {
        $token = (string) ($_GET['token'] ?? '');
    }

    if ($token === '' || !verify_member_jwt($token)) {
        send_ranking_json(401, [
            'ok' => false,
            'message' => 'Please log in before viewing rankings.',
        ]);
    }
}

function ensure_round_points_for_all_ranking_members(PDO $pdo): void
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

function get_cup_ranking_members(PDO $pdo): array
{
    $statement = $pdo->query(
        "SELECT members.id, members.first_name, members.last_name, members.username,
                COALESCE(point_totals.points_total, 0) AS points_total,
                COALESCE(round_totals.rounds_played, 0) AS rounds_played,
                round_totals.lowest_score
         FROM members
         LEFT JOIN (
            SELECT member_id, SUM(points) AS points_total
            FROM member_points
            GROUP BY member_id
         ) point_totals ON point_totals.member_id = members.id
         LEFT JOIN (
            SELECT
                member_id,
                COUNT(*) AS rounds_played,
                MIN(CASE
                    WHEN format = 'score' AND score REGEXP '^[0-9]+$' THEN CAST(score AS UNSIGNED)
                    ELSE NULL
                END) AS lowest_score
            FROM member_rounds
            GROUP BY member_id
         ) round_totals ON round_totals.member_id = members.id
         WHERE members.is_active = 1
           AND members.membership_type = 'CUP'
           AND members.show_public_stats = 1"
    );

    $members = [];
    $memberIds = [];

    foreach ($statement->fetchAll() as $member) {
        $memberId = (int) $member['id'];
        $name = trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? '')));
        $memberIds[] = $memberId;
        $members[$memberId] = [
            'id' => $memberId,
            'name' => $name !== '' ? $name : (string) ($member['username'] ?? 'Member'),
            'points' => (int) $member['points_total'],
            'roundsPlayed' => (int) $member['rounds_played'],
            'lowestScore' => $member['lowest_score'] === null ? null : (int) $member['lowest_score'],
            'recentRegularRounds' => [],
        ];
    }

    if ($memberIds) {
        $placeholders = implode(',', array_fill(0, count($memberIds), '?'));
        $roundStatement = $pdo->prepare(
            "SELECT member_id, round_date, tee, score
             FROM member_rounds
             WHERE member_id IN ({$placeholders})
               AND format = 'score'
               AND score REGEXP '^[0-9]+$'
             ORDER BY member_id ASC, round_date DESC, id DESC"
        );
        $roundStatement->execute($memberIds);
        $roundCounts = [];

        foreach ($roundStatement->fetchAll() as $round) {
            $memberId = (int) $round['member_id'];
            $roundCounts[$memberId] = ($roundCounts[$memberId] ?? 0) + 1;

            if ($roundCounts[$memberId] > 5 || !isset($members[$memberId])) {
                continue;
            }

            $members[$memberId]['recentRegularRounds'][] = [
                'roundDate' => $round['round_date'],
                'tee' => $round['tee'],
                'score' => (int) $round['score'],
            ];
        }
    }

    return array_values($members);
}

try {
    require_ranking_member();

    $pdo = get_database();
    run_schema_setup('Ranking service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_rounds_table($pdo);
        ensure_member_points_table($pdo);
    });
    ensure_round_points_for_all_ranking_members($pdo);

    $members = get_cup_ranking_members($pdo);
    $points = $members;
    $rounds = $members;
    $scores = array_values(array_filter($members, static fn (array $member): bool => $member['lowestScore'] !== null));

    usort($points, static function (array $a, array $b): int {
        return ($b['points'] <=> $a['points'])
            ?: ($b['roundsPlayed'] <=> $a['roundsPlayed'])
            ?: strcasecmp($a['name'], $b['name']);
    });

    usort($rounds, static function (array $a, array $b): int {
        return ($b['roundsPlayed'] <=> $a['roundsPlayed'])
            ?: (($a['lowestScore'] ?? PHP_INT_MAX) <=> ($b['lowestScore'] ?? PHP_INT_MAX))
            ?: strcasecmp($a['name'], $b['name']);
    });

    usort($scores, static function (array $a, array $b): int {
        return ($a['lowestScore'] <=> $b['lowestScore'])
            ?: ($b['points'] <=> $a['points'])
            ?: strcasecmp($a['name'], $b['name']);
    });

    send_ranking_json(200, [
        'ok' => true,
        'cupOnly' => true,
        'points' => $points,
        'rounds' => $rounds,
        'scores' => $scores,
        'travelTeam' => [],
    ]);
} catch (Throwable $error) {
    error_log('Ranking service error: ' . $error->getMessage());

    send_ranking_json(500, [
        'ok' => false,
        'message' => 'The ranking service is not available right now.',
    ]);
}

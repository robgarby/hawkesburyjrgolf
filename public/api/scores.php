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

function read_hole_scores(): array
{
    $rawHoleScores = trim((string) ($_POST['hole_scores'] ?? ''));

    if ($rawHoleScores === '') {
        return [];
    }

    $holeScores = json_decode($rawHoleScores, true);

    if (!is_array($holeScores)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter valid hole scores.',
        ]);
    }

    $scores = [];

    foreach ($holeScores as $score) {
        $value = filter_var($score, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 0, 'max_range' => 30],
        ]);

        if ($value === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please enter valid hole scores.',
            ]);
        }

        $scores[] = (int) $value;
    }

    if (!in_array(count($scores), [0, 9, 18], true)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter either 9 or 18 hole scores.',
        ]);
    }

    return $scores;
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
        ensure_member_events_table($pdo);
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
    $holeScores = read_hole_scores();
    $sourceEventId = filter_var($_POST['event_id'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);
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

    $targetMemberIds = [$targetMemberId];

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

    if ($format === 'practice' && $score === '') {
        $score = 'Practice';
    }

    if ($format === 'practice' && strlen($score) > 40) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter practice shot details under 40 characters.',
        ]);
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

    if ($sourceEventId !== false && $sourceEventId !== null) {
        $eventStatement = $pdo->prepare(
            'SELECT id, event_date, teams_published
             FROM member_events
             WHERE id = :id
             LIMIT 1'
        );
        $eventStatement->execute(['id' => (int) $sourceEventId]);
        $event = $eventStatement->fetch();

        if (!$event || !(bool) $event['teams_published']) {
            send_json(422, [
                'ok' => false,
                'message' => 'This event round is not published yet.',
            ]);
        }

        $scorerMemberId = $targetMemberId;
        $scorerStatement = $pdo->prepare(
            'SELECT team_name, tee_time, scoring_for_member_id, scoring_for_team_name, scoring_for_group
             FROM member_event_attendees
             WHERE event_id = :event_id
               AND member_id = :member_id
             LIMIT 1'
        );
        $scorerStatement->execute([
            'event_id' => (int) $sourceEventId,
            'member_id' => $scorerMemberId,
        ]);
        $scorer = $scorerStatement->fetch();

        if (!$scorer) {
            send_json(403, [
                'ok' => false,
                'message' => 'Only players in this event can save an event score.',
            ]);
        }

        $scoringForTeamName = trim((string) ($scorer['scoring_for_team_name'] ?? ''));

        if (!empty($scorer['scoring_for_group'])) {
            $scorerTeeTime = $scorer['tee_time'] === null ? '' : substr((string) $scorer['tee_time'], 0, 5);

            if ($scorerTeeTime !== '') {
                $groupStatement = $pdo->prepare(
                    'SELECT member_id
                     FROM member_event_attendees
                     WHERE event_id = :event_id
                       AND tee_time = :tee_time'
                );
                $groupStatement->execute([
                    'event_id' => (int) $sourceEventId,
                    'tee_time' => $scorerTeeTime,
                ]);
            } else {
                send_json(422, [
                    'ok' => false,
                    'message' => 'Whole Group scoring needs a T-Time.',
                ]);
            }

            $targetMemberIds = array_map(static fn (array $row): int => (int) $row['member_id'], $groupStatement->fetchAll());
        } elseif ($scoringForTeamName !== '') {
            $teamStatement = $pdo->prepare(
                'SELECT member_id
                 FROM member_event_attendees
                 WHERE event_id = :event_id
                   AND team_name = :team_name'
            );
            $teamStatement->execute([
                'event_id' => (int) $sourceEventId,
                'team_name' => $scoringForTeamName,
            ]);
            $targetMemberIds = array_map(
                static fn (array $row): int => (int) $row['member_id'],
                $teamStatement->fetchAll()
            );
        } elseif (!empty($scorer['scoring_for_member_id'])) {
            $targetMemberId = (int) $scorer['scoring_for_member_id'];
            $targetMemberIds = [$targetMemberId];
        } else {
            $targetMemberIds = [$targetMemberId];
        }

        if (!$targetMemberIds) {
            send_json(403, [
                'ok' => false,
                'message' => 'This scorekeeper is not assigned to a valid player or team.',
            ]);
        }

        $placeholders = implode(',', array_fill(0, count($targetMemberIds), '?'));
        $attendeeStatement = $pdo->prepare(
            "SELECT member_id
             FROM member_event_attendees
             WHERE event_id = ?
               AND member_id IN ({$placeholders})"
        );
        $attendeeStatement->execute([(int) $sourceEventId, ...$targetMemberIds]);
        $validTargetMemberIds = array_map(
            static fn (array $row): int => (int) $row['member_id'],
            $attendeeStatement->fetchAll()
        );

        if (count($validTargetMemberIds) !== count($targetMemberIds)) {
            send_json(403, [
                'ok' => false,
                'message' => 'This scorekeeper is not assigned to that player or team.',
            ]);
        }

        $targetMemberIds = $validTargetMemberIds;

        $roundDate = (string) $event['event_date'];
        $format = 'score';

        if (!in_array(count($holeScores), [9, 18], true)) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please enter each hole score before saving this event round.',
            ]);
        }
    } else {
        $sourceEventId = null;
    }

    $holeScoresJson = $holeScores ? json_encode($holeScores) : null;

    $savedCount = 0;
    $updatedCount = 0;

    foreach ($targetMemberIds as $saveMemberId) {
        $roundId = 0;

        if ($sourceEventId !== null) {
            $existingStatement = $pdo->prepare(
                'SELECT id
                 FROM member_rounds
                 WHERE member_id = :member_id
                   AND source_event_id = :source_event_id
                 ORDER BY id DESC
                 LIMIT 1'
            );
            $existingStatement->execute([
                'member_id' => $saveMemberId,
                'source_event_id' => $sourceEventId,
            ]);
            $existingRound = $existingStatement->fetch();

            if ($existingRound) {
                $roundId = (int) $existingRound['id'];
                $update = $pdo->prepare(
                    'UPDATE member_rounds
                     SET round_date = :round_date,
                         tee = :tee,
                         format = :format,
                         score = :score,
                         hole_scores = :hole_scores
                     WHERE id = :id'
                );
                $update->execute([
                    'round_date' => $roundDate,
                    'tee' => $tee,
                    'format' => $format,
                    'score' => $score,
                    'hole_scores' => $holeScoresJson,
                    'id' => $roundId,
                ]);
                $updatedCount++;
            }
        }

        if (!$roundId) {
            $insert = $pdo->prepare(
                'INSERT INTO member_rounds (member_id, round_date, tee, format, score, hole_scores, source_event_id)
                 VALUES (:member_id, :round_date, :tee, :format, :score, :hole_scores, :source_event_id)'
            );
            $insert->execute([
                'member_id' => $saveMemberId,
                'round_date' => $roundDate,
                'tee' => $tee,
                'format' => $format,
                'score' => $score,
                'hole_scores' => $holeScoresJson,
                'source_event_id' => $sourceEventId,
            ]);
            $roundId = (int) $pdo->lastInsertId();

            ensure_round_points_for_member($pdo, $saveMemberId);
            add_member_point(
                $pdo,
                $saveMemberId,
                'ROUND',
                $roundDate,
                "Round - {$roundDate}",
                1,
                'member_rounds',
                $roundId
            );
            $savedCount++;
        }
    }

    $message = $updatedCount > 0 && $savedCount === 0
        ? 'Score updated.'
        : ($savedCount > 1 ? 'Team score saved. 1 point added for each player.' : 'Round saved. 1 point added.');

    if ($isSuperAdmin) {
        send_json(200, [
            'ok' => true,
            'adminView' => true,
            'message' => $message,
            'activeJuniors' => get_active_juniors($pdo),
            'roundsReport' => get_admin_rounds_report($pdo),
        ]);
    }

    $rounds = get_member_rounds($pdo, $memberId);

    send_json(200, [
        'ok' => true,
        'message' => $message,
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

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

function send_live_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function normalize_live_code(string $code): string
{
    return strtoupper(substr(preg_replace('/[^A-Z0-9]/i', '', $code) ?? '', 0, 4));
}

function member_name(array $row, string $prefix = ''): string
{
    $name = trim((string) (($row[$prefix . 'first_name'] ?? '') . ' ' . ($row[$prefix . 'last_name'] ?? '')));

    return $name !== '' ? $name : (string) ($row[$prefix . 'username'] ?? 'Junior');
}

function get_live_context(PDO $pdo, string $code): array
{
    $statement = $pdo->prepare(
        "SELECT attendees.member_id, attendees.team_name, attendees.tee_time,
                attendees.scoring_for_member_id, attendees.scoring_for_team_name, attendees.scoring_for_group,
                events.id AS event_id, events.event_name, events.event_date, events.teams_published,
                members.first_name, members.last_name, members.username,
                scoring_members.first_name AS scoring_first_name,
                scoring_members.last_name AS scoring_last_name,
                scoring_members.username AS scoring_username
         FROM member_event_attendees attendees
         INNER JOIN member_events events ON events.id = attendees.event_id
         INNER JOIN members ON members.id = attendees.member_id
         LEFT JOIN members scoring_members ON scoring_members.id = attendees.scoring_for_member_id
         WHERE attendees.live_score_code = :code
         LIMIT 1"
    );
    $statement->execute(['code' => $code]);
    $context = $statement->fetch();

    if (!$context || !(bool) $context['teams_published']) {
        send_live_json(404, [
            'ok' => false,
            'message' => 'Live scorecard not found.',
        ]);
    }

    return $context;
}

function live_target_member_ids(PDO $pdo, array $context): array
{
    $eventId = (int) $context['event_id'];

    if (!empty($context['scoring_for_group'])) {
        $teeTime = $context['tee_time'] === null ? '' : substr((string) $context['tee_time'], 0, 5);

        if ($teeTime === '') {
            send_live_json(422, [
                'ok' => false,
                'message' => 'Whole Group scoring needs a T-Time.',
            ]);
        }

        $statement = $pdo->prepare(
            'SELECT member_id
             FROM member_event_attendees
             WHERE event_id = :event_id
               AND tee_time = :tee_time'
        );
        $statement->execute([
            'event_id' => $eventId,
            'tee_time' => $teeTime,
        ]);

        return array_map(static fn (array $row): int => (int) $row['member_id'], $statement->fetchAll());
    }

    $teamName = trim((string) ($context['scoring_for_team_name'] ?? ''));

    if ($teamName !== '') {
        $statement = $pdo->prepare(
            'SELECT member_id
             FROM member_event_attendees
             WHERE event_id = :event_id
               AND team_name = :team_name'
        );
        $statement->execute([
            'event_id' => $eventId,
            'team_name' => $teamName,
        ]);

        return array_map(static fn (array $row): int => (int) $row['member_id'], $statement->fetchAll());
    }

    if (!empty($context['scoring_for_member_id'])) {
        return [(int) $context['scoring_for_member_id']];
    }

    return [(int) $context['member_id']];
}

function live_scoring_for_label(PDO $pdo, array $context): string
{
    if (!empty($context['scoring_for_group'])) {
        return 'Whole Group';
    }

    $teamName = trim((string) ($context['scoring_for_team_name'] ?? ''));

    if ($teamName !== '') {
        return $teamName;
    }

    $scoringName = member_name($context, 'scoring_');

    if (!empty($context['scoring_for_member_id']) && $scoringName !== 'Junior') {
        return $scoringName;
    }

    return member_name($context);
}

function read_live_hole_scores(): array
{
    $raw = trim((string) ($_POST['hole_scores'] ?? ''));
    $decoded = json_decode($raw, true);

    if (!is_array($decoded) || !in_array(count($decoded), [9, 18], true)) {
        send_live_json(422, [
            'ok' => false,
            'message' => 'Please enter either 9 or 18 hole scores.',
        ]);
    }

    $scores = [];

    foreach ($decoded as $score) {
        $value = filter_var($score, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 0, 'max_range' => 30],
        ]);

        if ($value === false) {
            send_live_json(422, [
                'ok' => false,
                'message' => 'Please enter valid hole scores.',
            ]);
        }

        $scores[] = (int) $value;
    }

    return $scores;
}

function save_live_round(PDO $pdo, int $memberId, array $context, array $holeScores): bool
{
    $eventId = (int) $context['event_id'];
    $score = (string) array_sum($holeScores);
    $holeScoresJson = json_encode($holeScores);

    $existing = $pdo->prepare(
        'SELECT id
         FROM member_rounds
         WHERE member_id = :member_id
           AND source_event_id = :event_id
         ORDER BY id DESC
         LIMIT 1'
    );
    $existing->execute([
        'member_id' => $memberId,
        'event_id' => $eventId,
    ]);
    $round = $existing->fetch();

    if ($round) {
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
            'round_date' => $context['event_date'],
            'tee' => 'red',
            'format' => 'score',
            'score' => $score,
            'hole_scores' => $holeScoresJson,
            'id' => (int) $round['id'],
        ]);

        return false;
    }

    $insert = $pdo->prepare(
        'INSERT INTO member_rounds (member_id, round_date, tee, format, score, hole_scores, source_event_id)
         VALUES (:member_id, :round_date, :tee, :format, :score, :hole_scores, :source_event_id)'
    );
    $insert->execute([
        'member_id' => $memberId,
        'round_date' => $context['event_date'],
        'tee' => 'red',
        'format' => 'score',
        'score' => $score,
        'hole_scores' => $holeScoresJson,
        'source_event_id' => $eventId,
    ]);
    $roundId = (int) $pdo->lastInsertId();

    add_member_point(
        $pdo,
        $memberId,
        'ROUND',
        (string) $context['event_date'],
        'Round - ' . $context['event_date'],
        1,
        'member_rounds',
        $roundId
    );

    return true;
}

try {
    $pdo = get_database();

    run_schema_setup('Live score service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_events_table($pdo);
        ensure_member_rounds_table($pdo);
        ensure_member_points_table($pdo);
    });

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $code = normalize_live_code((string) ($_GET['code'] ?? ''));

        if (strlen($code) !== 4) {
            send_live_json(422, ['ok' => false, 'message' => 'Please enter a valid 4-letter code.']);
        }

        $context = get_live_context($pdo, $code);

        send_live_json(200, [
            'ok' => true,
            'code' => $code,
            'eventId' => (int) $context['event_id'],
            'eventName' => $context['event_name'],
            'eventDate' => $context['event_date'],
            'playerName' => member_name($context),
            'scoringFor' => live_scoring_for_label($pdo, $context),
            'holes' => 18,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_live_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
    }

    $code = normalize_live_code((string) ($_POST['code'] ?? ''));

    if (strlen($code) !== 4) {
        send_live_json(422, ['ok' => false, 'message' => 'Please enter a valid 4-letter code.']);
    }

    $context = get_live_context($pdo, $code);
    $holeScores = read_live_hole_scores();
    $targetMemberIds = live_target_member_ids($pdo, $context);

    if (!$targetMemberIds) {
        send_live_json(422, ['ok' => false, 'message' => 'This code is not assigned to a score target.']);
    }

    $created = 0;

    foreach ($targetMemberIds as $targetMemberId) {
        if (save_live_round($pdo, $targetMemberId, $context, $holeScores)) {
            $created++;
        }
    }

    send_live_json(200, [
        'ok' => true,
        'message' => $created > 0 ? 'Score saved.' : 'Score updated.',
    ]);
} catch (Throwable $error) {
    error_log('Live score service error: ' . $error->getMessage());

    send_live_json(500, [
        'ok' => false,
        'message' => 'The live score service is not available right now.',
    ]);
}

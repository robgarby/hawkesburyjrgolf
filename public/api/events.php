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
            'message' => 'Please log in before viewing events.',
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

function get_event_attendees(PDO $pdo, int $eventId): array
{
    $statement = $pdo->prepare(
        'SELECT attendees.member_id, attendees.created_at, members.first_name, members.last_name, members.username, members.membership_type
         FROM member_event_attendees attendees
         INNER JOIN members ON members.id = attendees.member_id
         WHERE attendees.event_id = :event_id
         ORDER BY attendees.created_at ASC, attendees.id ASC'
    );
    $statement->execute(['event_id' => $eventId]);

    return array_map(
        static function (array $attendee): array {
            $name = trim((string) ($attendee['first_name'] . ' ' . $attendee['last_name']));

            return [
                'memberId' => (int) $attendee['member_id'],
                'name' => $name !== '' ? $name : $attendee['username'],
                'username' => $attendee['username'],
                'membershipType' => $attendee['membership_type'],
                'joinedAt' => $attendee['created_at'],
            ];
        },
        $statement->fetchAll()
    );
}

function get_events(PDO $pdo, int $memberId): array
{
    $memberDetails = get_member_details($pdo, $memberId);
    $playerAge = $memberDetails['playerAge'];
    $statement = $pdo->query(
        'SELECT id, created_by_member_id, event_name, event_date, event_time, winner_points, participant_points, max_players, event_path, min_age, max_age, community_cost, location, description, winner, attendee_csv, created_at
         FROM member_events
         ORDER BY event_date ASC, event_time ASC, id ASC'
    );
    $today = (new DateTimeImmutable('today'))->format('Y-m-d');
    $events = [
        'upcoming' => [],
        'past' => [],
    ];

    foreach ($statement->fetchAll() as $event) {
        $attendees = get_event_attendees($pdo, (int) $event['id']);
        $attendeeCount = count($attendees);
        $maxPlayers = (int) $event['max_players'];
        $minAge = $event['min_age'] === null ? null : (int) $event['min_age'];
        $maxAge = $event['max_age'] === null ? null : (int) $event['max_age'];
        $mappedEvent = [
            'id' => (int) $event['id'],
            'createdByMemberId' => (int) $event['created_by_member_id'],
            'eventName' => $event['event_name'],
            'eventDate' => $event['event_date'],
            'eventTime' => substr((string) $event['event_time'], 0, 5),
            'winnerPoints' => (int) $event['winner_points'],
            'participantPoints' => (int) $event['participant_points'],
            'maxPlayers' => $maxPlayers,
            'eventPath' => $event['event_path'] ?? 'EVERYONE',
            'minAge' => $minAge,
            'maxAge' => $maxAge,
            'isAgeEligible' => age_allows_member($minAge, $maxAge, $playerAge),
            'communityCost' => (float) $event['community_cost'],
            'location' => $event['location'],
            'description' => $event['description'] ?? '',
            'winner' => $event['winner'],
            'attendeeCsv' => $event['attendee_csv'],
            'attendees' => $attendees,
            'attendeeCount' => $attendeeCount,
            'spotsRemaining' => $maxPlayers > 0 ? max(0, $maxPlayers - $attendeeCount) : null,
            'isJoined' => in_array($memberId, array_column($attendees, 'memberId'), true),
            'createdAt' => $event['created_at'],
        ];

        $events[$event['event_date'] >= $today ? 'upcoming' : 'past'][] = $mappedEvent;
    }

    return $events;
}

function get_member_details(PDO $pdo, int $memberId): array
{
    $statement = $pdo->prepare(
        'SELECT membership_type, player_age
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch();

    return [
        'membershipType' => (string) ($member['membership_type'] ?? ''),
        'playerAge' => isset($member['player_age']) ? (int) $member['player_age'] : null,
    ];
}

function path_allows_member(string $path, string $memberType): bool
{
    if ($path === 'EVERYONE') {
        return in_array($memberType, ['CUP', 'COMMUNITY'], true);
    }

    return $memberType === $path;
}

function age_allows_member(?int $minAge, ?int $maxAge, ?int $playerAge): bool
{
    if ($minAge === null && $maxAge === null) {
        return true;
    }

    if ($playerAge === null || $playerAge < 1) {
        return false;
    }

    if ($minAge !== null && $playerAge < $minAge) {
        return false;
    }

    return $maxAge === null || $playerAge <= $maxAge;
}

function read_age_range(): array
{
    $minAgeRaw = trim((string) ($_POST['min_age'] ?? ''));
    $maxAgeRaw = trim((string) ($_POST['max_age'] ?? ''));
    $minAge = $minAgeRaw === '' ? null : filter_var($minAgeRaw, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 99],
    ]);
    $maxAge = $maxAgeRaw === '' ? null : filter_var($maxAgeRaw, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 99],
    ]);

    if ($minAge === false || $maxAge === false || ($minAge !== null && $maxAge !== null && $minAge > $maxAge)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a valid age range.',
        ]);
    }

    return [$minAge, $maxAge];
}

function send_events_response(PDO $pdo, int $memberId, string $message = ''): void
{
    $events = get_events($pdo, $memberId);

    send_json(200, [
        'ok' => true,
        'message' => $message,
        'upcoming' => $events['upcoming'],
        'past' => array_reverse($events['past']),
    ]);
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    ensure_members_table($pdo);
    ensure_member_events_table($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_events_response($pdo, $memberId);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(405, [
            'ok' => false,
            'message' => 'Method not allowed.',
        ]);
    }

    $action = (string) ($_POST['action'] ?? 'add_event');

    if ($action === 'join') {
        $eventId = filter_var($_POST['event_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($eventId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid event.',
            ]);
        }

        $eventStatement = $pdo->prepare(
            'SELECT id, event_date, max_players, event_path, min_age, max_age
             FROM member_events
             WHERE id = :id
             LIMIT 1'
        );
        $eventStatement->execute(['id' => (int) $eventId]);
        $event = $eventStatement->fetch();

        if (!$event) {
            send_json(404, [
                'ok' => false,
                'message' => 'Event not found.',
            ]);
        }

        $today = (new DateTimeImmutable('today'))->format('Y-m-d');

        if ($event['event_date'] < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past events cannot be joined.',
            ]);
        }

        $memberDetails = get_member_details($pdo, $memberId);
        $memberType = $memberDetails['membershipType'];
        $playerAge = $memberDetails['playerAge'];
        $eventPath = (string) ($event['event_path'] ?? 'EVERYONE');

        if (!path_allows_member($eventPath, $memberType)) {
            send_json(403, [
                'ok' => false,
                'message' => 'This event is not open to your membership path.',
            ]);
        }

        $minAge = $event['min_age'] === null ? null : (int) $event['min_age'];
        $maxAge = $event['max_age'] === null ? null : (int) $event['max_age'];

        if (!age_allows_member($minAge, $maxAge, $playerAge)) {
            send_json(403, [
                'ok' => false,
                'message' => 'This event is not open to your age group.',
            ]);
        }

        $countStatement = $pdo->prepare(
            'SELECT COUNT(*) AS attendee_count
             FROM member_event_attendees
             WHERE event_id = :event_id'
        );
        $countStatement->execute(['event_id' => (int) $eventId]);
        $attendeeCount = (int) ($countStatement->fetch()['attendee_count'] ?? 0);
        $maxPlayers = (int) $event['max_players'];

        if ($maxPlayers > 0 && $attendeeCount >= $maxPlayers) {
            send_json(422, [
                'ok' => false,
                'message' => 'This event is full.',
            ]);
        }

        $insertAttendee = $pdo->prepare(
            'INSERT IGNORE INTO member_event_attendees (event_id, member_id)
             VALUES (:event_id, :member_id)'
        );
        $insertAttendee->execute([
            'event_id' => (int) $eventId,
            'member_id' => $memberId,
        ]);

        send_events_response($pdo, $memberId, 'You are added to the event.');
    }

    if ($action === 'leave') {
        $eventId = filter_var($_POST['event_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($eventId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid event.',
            ]);
        }

        $eventStatement = $pdo->prepare(
            'SELECT id, event_date
             FROM member_events
             WHERE id = :id
             LIMIT 1'
        );
        $eventStatement->execute(['id' => (int) $eventId]);
        $event = $eventStatement->fetch();

        if (!$event) {
            send_json(404, [
                'ok' => false,
                'message' => 'Event not found.',
            ]);
        }

        $today = (new DateTimeImmutable('today'))->format('Y-m-d');

        if ($event['event_date'] < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past events cannot be changed.',
            ]);
        }

        $deleteAttendee = $pdo->prepare(
            'DELETE FROM member_event_attendees
             WHERE event_id = :event_id
             AND member_id = :member_id'
        );
        $deleteAttendee->execute([
            'event_id' => (int) $eventId,
            'member_id' => $memberId,
        ]);

        send_events_response($pdo, $memberId, 'You have been removed from the event.');
    }

    if (!in_array($action, ['add_event', 'update_event', 'delete_event'], true)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please choose a valid event action.',
        ]);
    }

    $memberStatement = $pdo->prepare(
        'SELECT membership_type
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $memberStatement->execute(['id' => $memberId]);
    $memberRow = $memberStatement->fetch();

    if (!in_array(($memberRow['membership_type'] ?? ''), ['ADMIN', 'TEACHER'], true)) {
        send_json(403, [
            'ok' => false,
            'message' => 'Only admins and teachers can manage events.',
        ]);
    }

    $eventId = null;

    if (in_array($action, ['update_event', 'delete_event'], true)) {
        $eventId = filter_var($_POST['event_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($eventId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid event.',
            ]);
        }

        $existingEvent = $pdo->prepare(
            'SELECT id
             FROM member_events
             WHERE id = :id
             LIMIT 1'
        );
        $existingEvent->execute(['id' => (int) $eventId]);

        if (!$existingEvent->fetch()) {
            send_json(404, [
                'ok' => false,
                'message' => 'Event not found.',
            ]);
        }
    }

    if ($action === 'delete_event') {
        $delete = $pdo->prepare(
            'DELETE FROM member_events
             WHERE id = :id'
        );
        $delete->execute(['id' => (int) $eventId]);

        send_events_response($pdo, $memberId, 'Event removed.');
    }

    $eventName = trim((string) ($_POST['event_name'] ?? ''));
    $eventDate = trim((string) ($_POST['event_date'] ?? ''));
    $eventTime = trim((string) ($_POST['event_time'] ?? ''));
    $winnerPoints = filter_var($_POST['winner_points'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 0, 'max_range' => 999],
    ]);
    $participantPoints = filter_var($_POST['participant_points'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 0, 'max_range' => 999],
    ]);
    $maxPlayers = filter_var($_POST['max_players'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 999],
    ]);
    $eventPath = strtoupper(trim((string) ($_POST['event_path'] ?? 'EVERYONE')));
    [$minAge, $maxAge] = read_age_range();
    $communityCost = filter_var($_POST['community_cost'] ?? null, FILTER_VALIDATE_FLOAT);
    $location = trim((string) ($_POST['location'] ?? 'Hawkesbury'));
    $description = trim((string) ($_POST['description'] ?? ''));
    $winner = trim((string) ($_POST['winner'] ?? ''));
    $attendeeCsv = trim((string) ($_POST['attendee_csv'] ?? ''));

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $eventDate);
    $dateErrors = DateTimeImmutable::getLastErrors();
    $isValidDate = $date instanceof DateTimeImmutable
        && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
        && $date->format('Y-m-d') === $eventDate;
    $isValidTime = (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $eventTime);

    if (!in_array($eventPath, ['CUP', 'COMMUNITY', 'EVERYONE'], true)) {
        $eventPath = 'EVERYONE';
    }

    if ($eventName === '' || !$isValidDate || !$isValidTime || $winnerPoints === false || $participantPoints === false || $maxPlayers === false || $communityCost === false || $communityCost < 0 || $communityCost > 9999 || $description === '') {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a valid event name, date, time, point values, maximum players, path, community cost, and description.',
        ]);
    }

    if ($location === '') {
        $location = 'Hawkesbury';
    }

    if ($action === 'update_event') {
        $countStatement = $pdo->prepare(
            'SELECT COUNT(*) AS attendee_count
             FROM member_event_attendees
             WHERE event_id = :event_id'
        );
        $countStatement->execute(['event_id' => (int) $eventId]);
        $attendeeCount = (int) ($countStatement->fetch()['attendee_count'] ?? 0);

        if ((int) $maxPlayers < $attendeeCount) {
            send_json(422, [
                'ok' => false,
                'message' => 'Maximum players cannot be lower than the current attendee count.',
            ]);
        }

        $update = $pdo->prepare(
            'UPDATE member_events
             SET event_name = :event_name,
                 event_date = :event_date,
                 event_time = :event_time,
                 winner_points = :winner_points,
                 participant_points = :participant_points,
                 max_players = :max_players,
                 event_path = :event_path,
                 min_age = :min_age,
                 max_age = :max_age,
                 community_cost = :community_cost,
                 location = :location,
                 description = :description,
                 winner = :winner,
                 attendee_csv = :attendee_csv
             WHERE id = :id'
        );
        $update->execute([
            'id' => (int) $eventId,
            'event_name' => $eventName,
            'event_date' => $eventDate,
            'event_time' => $eventTime,
            'winner_points' => (int) $winnerPoints,
            'participant_points' => (int) $participantPoints,
            'max_players' => (int) $maxPlayers,
            'event_path' => $eventPath,
            'min_age' => $minAge,
            'max_age' => $maxAge,
            'community_cost' => number_format((float) $communityCost, 2, '.', ''),
            'location' => $location,
            'description' => $description,
            'winner' => $winner,
            'attendee_csv' => $attendeeCsv,
        ]);

        send_events_response($pdo, $memberId, 'Event updated.');
    }

    $insert = $pdo->prepare(
        'INSERT INTO member_events
            (created_by_member_id, event_name, event_date, event_time, winner_points, participant_points, max_players, event_path, min_age, max_age, community_cost, location, description, winner, attendee_csv)
         VALUES
            (:created_by_member_id, :event_name, :event_date, :event_time, :winner_points, :participant_points, :max_players, :event_path, :min_age, :max_age, :community_cost, :location, :description, :winner, :attendee_csv)'
    );
    $insert->execute([
        'created_by_member_id' => $memberId,
        'event_name' => $eventName,
        'event_date' => $eventDate,
        'event_time' => $eventTime,
        'winner_points' => (int) $winnerPoints,
        'participant_points' => (int) $participantPoints,
        'max_players' => (int) $maxPlayers,
        'event_path' => $eventPath,
        'min_age' => $minAge,
        'max_age' => $maxAge,
        'community_cost' => number_format((float) $communityCost, 2, '.', ''),
        'location' => $location,
        'description' => $description,
        'winner' => $winner,
        'attendee_csv' => $attendeeCsv,
    ]);

    send_events_response($pdo, $memberId, 'Event saved.');
} catch (Throwable $error) {
    error_log('Events service error: ' . $error->getMessage());

    send_json(500, [
        'ok' => false,
        'message' => 'The events service is not available right now.',
    ]);
}

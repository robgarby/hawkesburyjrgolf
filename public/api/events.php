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
require_once __DIR__ . '/textme.php';

if (!function_exists('is_member_admin_type')) {
    function is_member_admin_type(string $type): bool
    {
        return in_array(strtoupper(trim($type)), ['SUPER_ADMIN', 'ADMIN'], true);
    }
}

if (!function_exists('is_super_admin_type')) {
    function is_super_admin_type(string $type): bool
    {
        return strtoupper(trim($type)) === 'SUPER_ADMIN';
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
    $memberType = $memberDetails['membershipType'];
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
            'canManage' => member_can_manage_event($event, $memberId, $memberType),
            'canEdit' => is_super_admin_type($memberType)
                || (is_member_admin_type($memberType) && (int) $event['created_by_member_id'] === $memberId),
            'canDelete' => is_super_admin_type($memberType)
                || (is_member_admin_type($memberType) && (int) $event['created_by_member_id'] === $memberId),
            'canAddPlayer' => is_super_admin_type($memberType),
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

function get_member_display_name(PDO $pdo, int $memberId): string
{
    $statement = $pdo->prepare(
        'SELECT first_name, last_name, username
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch() ?: [];
    $name = trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? '')));

    return $name !== '' ? $name : (string) ($member['username'] ?? 'HJG');
}

function get_active_juniors(PDO $pdo): array
{
    $statement = $pdo->query(
        "SELECT id, first_name, last_name, username, membership_type, player_age
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
            'playerAge' => isset($row['player_age']) ? (int) $row['player_age'] : null,
        ];
    }

    return $juniors;
}

function get_active_junior(PDO $pdo, int $memberId): ?array
{
    $statement = $pdo->prepare(
        "SELECT id, membership_type, player_age
         FROM members
         WHERE id = :id
           AND is_active = 1
           AND membership_type IN ('CUP', 'COMMUNITY')
         LIMIT 1"
    );
    $statement->execute(['id' => $memberId]);
    $junior = $statement->fetch();

    if (!$junior) {
        return null;
    }

    return [
        'id' => (int) $junior['id'],
        'membershipType' => (string) $junior['membership_type'],
        'playerAge' => isset($junior['player_age']) ? (int) $junior['player_age'] : null,
    ];
}

function path_allows_member(string $path, string $memberType): bool
{
    if ($path === 'EVERYONE') {
        return in_array($memberType, ['CUP', 'COMMUNITY'], true);
    }

    return $memberType === $path;
}

function member_can_manage_event(array $event, int $memberId, string $memberType): bool
{
    return is_super_admin_type($memberType)
        || (is_member_admin_type($memberType) && (int) ($event['created_by_member_id'] ?? 0) === $memberId);
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

function mask_text_number(?string $number): string
{
    $digits = preg_replace('/\D+/', '', (string) $number) ?? '';

    return strlen($digits) < 4 ? '' : '***-***-' . substr($digits, -4);
}

function build_event_text_preview(
    PDO $pdo,
    int $createdByMemberId,
    string $posterName,
    string $eventName,
    string $eventPath,
    ?int $minAge,
    ?int $maxAge,
    string $eventDate,
    string $eventTime,
    string $location,
    string $description,
    int $maxPlayers
): array {
    if ($maxPlayers < 1) {
        return ['dryRun' => true, 'message' => '', 'recipients' => []];
    }

    $message = sprintf(
        "HJG Notice: A new event has been added by %s.\n\nEvent: %s\nDate: %s\nTime: %s\nLocation: %s\nSpots open: %d\nDetails: %s\n\nYou can Add or Join this event in the HJG Website or App.",
        $posterName,
        $eventName,
        $eventDate,
        $eventTime,
        $location,
        $maxPlayers,
        $description
    );

    $statement = $pdo->query(
        "SELECT id, first_name, last_name, username, membership_type, player_age,
                parent_text, player_text, notify_events_player_text, notify_events_parent_text
         FROM members
         WHERE is_active = 1
           AND membership_type IN ('CUP', 'COMMUNITY')
           AND (notify_events_player_text = 1 OR notify_events_parent_text = 1)
         ORDER BY first_name ASC, last_name ASC, username ASC, id ASC"
    );
    $recipients = [];

    foreach ($statement->fetchAll() as $member) {
        $memberId = (int) $member['id'];

        if ($memberId === $createdByMemberId) {
            continue;
        }

        if (
            !path_allows_member($eventPath, (string) ($member['membership_type'] ?? ''))
            || !age_allows_member($minAge, $maxAge, isset($member['player_age']) ? (int) $member['player_age'] : null)
        ) {
            continue;
        }

        $name = trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? '')));
        $name = $name !== '' ? $name : (string) ($member['username'] ?? 'Member');

        if ((bool) $member['notify_events_player_text'] && trim((string) ($member['player_text'] ?? '')) !== '') {
            $recipients[] = [
                'memberId' => $memberId,
                'name' => $name,
                'recipientType' => 'player',
                'to' => $member['player_text'],
                'phone' => mask_text_number($member['player_text']),
                'message' => $message,
            ];
        }

        if ((bool) $member['notify_events_parent_text'] && trim((string) ($member['parent_text'] ?? '')) !== '') {
            $recipients[] = [
                'memberId' => $memberId,
                'name' => $name,
                'recipientType' => 'parent',
                'to' => $member['parent_text'],
                'phone' => mask_text_number($member['parent_text']),
                'message' => $message,
            ];
        }
    }

    return ['dryRun' => true, 'contextLabel' => 'event', 'message' => $message, 'recipients' => $recipients];
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

function send_events_response(PDO $pdo, int $memberId, string $message = '', ?array $textResults = null): void
{
    $events = get_events($pdo, $memberId);
    $memberDetails = get_member_details($pdo, $memberId);

    $payload = [
        'ok' => true,
        'message' => $message,
        'upcoming' => $events['upcoming'],
        'past' => array_reverse($events['past']),
    ];

    if (is_super_admin_type($memberDetails['membershipType'])) {
        $payload['activeJuniors'] = get_active_juniors($pdo);
    }

    if ($textResults !== null) {
        $payload['textResults'] = $textResults;
    }

    send_json(200, $payload);
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    run_schema_setup('Events service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_events_table($pdo);
    });

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

    if ($action === 'add_attendee') {
        $memberDetails = get_member_details($pdo, $memberId);

        if (!is_super_admin_type($memberDetails['membershipType'])) {
            send_json(403, [
                'ok' => false,
                'message' => 'Only super admins can add players to events.',
            ]);
        }

        $eventId = filter_var($_POST['event_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);
        $targetMemberId = filter_var($_POST['member_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($eventId === false || $targetMemberId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid event and player.',
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
                'message' => 'Past events cannot be changed.',
            ]);
        }

        $junior = get_active_junior($pdo, (int) $targetMemberId);

        if (!$junior) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose an active junior.',
            ]);
        }

        $eventPath = (string) ($event['event_path'] ?? 'EVERYONE');
        $minAge = $event['min_age'] === null ? null : (int) $event['min_age'];
        $maxAge = $event['max_age'] === null ? null : (int) $event['max_age'];

        if (!path_allows_member($eventPath, $junior['membershipType']) || !age_allows_member($minAge, $maxAge, $junior['playerAge'])) {
            send_json(403, [
                'ok' => false,
                'message' => 'This player does not match the event path or age range.',
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
            'member_id' => $junior['id'],
        ]);

        send_events_response($pdo, $memberId, 'Player added to event.');
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
    $managerType = (string) ($memberRow['membership_type'] ?? '');

    if ($action === 'add_event' && !is_member_admin_type($managerType)) {
        send_json(403, [
            'ok' => false,
            'message' => 'Only admins can add events.',
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
            'SELECT id, created_by_member_id
             FROM member_events
             WHERE id = :id
             LIMIT 1'
        );
        $existingEvent->execute(['id' => (int) $eventId]);
        $existingEventRow = $existingEvent->fetch();

        if (!$existingEventRow) {
            send_json(404, [
                'ok' => false,
                'message' => 'Event not found.',
            ]);
        }

        if (
            in_array($action, ['update_event', 'delete_event'], true)
            && !is_super_admin_type($managerType)
            && (!is_member_admin_type($managerType) || (int) $existingEventRow['created_by_member_id'] !== $memberId)
        ) {
            send_json(403, [
                'ok' => false,
                'message' => 'Admins can only edit or remove events they created.',
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
    $shouldNotifyOthers = $action === 'add_event' && isset($_POST['notify_others']);
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

    $textResults = null;

    if ($shouldNotifyOthers) {
        $textNotice = build_event_text_preview(
            $pdo,
            $memberId,
            get_member_display_name($pdo, $memberId),
            $eventName,
            $eventPath,
            $minAge,
            $maxAge,
            $eventDate,
            $eventTime,
            $location,
            $description,
            (int) $maxPlayers
        );
        $textResults = send_text_messages($textNotice['recipients'], $textNotice['message']);
    }

    send_events_response($pdo, $memberId, 'Event saved.', $textResults);
} catch (Throwable $error) {
    error_log('Events service error: ' . $error->getMessage());

    send_json(500, [
        'ok' => false,
        'message' => 'The events service is not available right now.',
    ]);
}

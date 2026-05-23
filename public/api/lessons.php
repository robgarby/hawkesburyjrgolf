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
        send_json(401, ['ok' => false, 'message' => 'Please log in before viewing lessons.']);
    }

    $payload = verify_member_jwt($token);

    if (!$payload) {
        send_json(401, ['ok' => false, 'message' => 'Your login has expired. Please log in again.']);
    }

    return $payload;
}

function member_name(array $row): string
{
    $name = trim((string) (($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')));

    return $name !== '' ? $name : (string) ($row['username'] ?? '');
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

function get_member_age(PDO $pdo, int $memberId): ?int
{
    $statement = $pdo->prepare(
        'SELECT player_age
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $age = $statement->fetch()['player_age'] ?? null;

    return $age === null ? null : (int) $age;
}

function get_slot_students(PDO $pdo, int $slotId): array
{
    $statement = $pdo->prepare(
        'SELECT students.member_id, students.created_at, members.first_name, members.last_name, members.username, members.membership_type
         FROM member_lesson_slot_students students
         INNER JOIN members ON members.id = students.member_id
         WHERE students.lesson_slot_id = :slot_id
         ORDER BY students.created_at ASC, students.id ASC'
    );
    $statement->execute(['slot_id' => $slotId]);

    return array_map(
        static fn (array $student): array => [
            'memberId' => (int) $student['member_id'],
            'name' => member_name($student),
            'username' => $student['username'],
            'membershipType' => $student['membership_type'],
            'joinedAt' => $student['created_at'],
        ],
        $statement->fetchAll()
    );
}

function get_lessons(PDO $pdo, int $memberId): array
{
    $today = (new DateTimeImmutable('today'))->format('Y-m-d');
    $memberType = get_member_type($pdo, $memberId);
    $memberAge = get_member_age($pdo, $memberId);
    $canTeach = in_array($memberType, ['ADMIN', 'TEACHER'], true);
    $slotsStatement = $pdo->query(
        'SELECT slots.*, members.first_name, members.last_name, members.username, members.membership_type
         FROM member_lesson_slots slots
         INNER JOIN members ON members.id = slots.provider_member_id
         ORDER BY slots.lesson_date ASC, slots.lesson_time ASC, slots.id ASC'
    );
    $slots = [];
    $booked = [];

    foreach ($slotsStatement->fetchAll() as $slot) {
        if ($slot['lesson_date'] < $today) {
            continue;
        }

        $students = get_slot_students($pdo, (int) $slot['id']);
        $studentCount = count($students);
        $minAge = $slot['min_age'] === null ? null : (int) $slot['min_age'];
        $maxAge = $slot['max_age'] === null ? null : (int) $slot['max_age'];

        $mappedSlot = [
            'id' => (int) $slot['id'],
            'providerMemberId' => (int) $slot['provider_member_id'],
            'providerName' => member_name($slot),
            'providerMembershipType' => $slot['membership_type'],
            'sourceRequestId' => $slot['source_request_id'] === null ? null : (int) $slot['source_request_id'],
            'lessonDate' => $slot['lesson_date'],
            'lessonTime' => substr((string) $slot['lesson_time'], 0, 5),
            'lessonType' => $slot['lesson_type'],
            'maxStudents' => (int) $slot['max_students'],
            'lessonPath' => $slot['lesson_path'] ?? 'EVERYONE',
            'minAge' => $minAge,
            'maxAge' => $maxAge,
            'isAgeEligible' => age_allows_member($minAge, $maxAge, $memberAge),
            'spotsRemaining' => max(0, (int) $slot['max_students'] - $studentCount),
            'location' => $slot['location'],
            'notes' => $slot['notes'],
            'students' => $students,
            'isJoined' => in_array($memberId, array_column($students, 'memberId'), true),
        ];

        if ($mappedSlot['providerMemberId'] === $memberId || $mappedSlot['isJoined']) {
            $booked[] = $mappedSlot;
        }

        if (
            $mappedSlot['spotsRemaining'] > 0
            && !$mappedSlot['isJoined']
            && $mappedSlot['providerMemberId'] !== $memberId
        ) {
            $slots[] = $mappedSlot;
        }
    }

    $requestsStatement = $pdo->query(
        'SELECT requests.*, requester.first_name AS requester_first_name, requester.last_name AS requester_last_name,
                requester.username AS requester_username, requester.membership_type AS requester_membership_type,
                accepter.first_name AS accepter_first_name, accepter.last_name AS accepter_last_name,
                accepter.username AS accepter_username, accepter.membership_type AS accepter_membership_type
         FROM member_lesson_requests requests
         INNER JOIN members requester ON requester.id = requests.requester_member_id
         LEFT JOIN members accepter ON accepter.id = requests.accepted_by_member_id
         ORDER BY requests.preferred_date ASC, requests.preferred_time ASC, requests.id ASC'
    );
    $requests = [];

    foreach ($requestsStatement->fetchAll() as $request) {
        if ($request['preferred_date'] < $today) {
            continue;
        }

        if ($request['accepted_by_member_id'] !== null) {
            continue;
        }

        $mappedRequest = [
            'id' => (int) $request['id'],
            'requesterMemberId' => (int) $request['requester_member_id'],
            'requesterName' => member_name([
                'first_name' => $request['requester_first_name'],
                'last_name' => $request['requester_last_name'],
                'username' => $request['requester_username'],
            ]),
            'requesterMembershipType' => $request['requester_membership_type'],
            'preferredDate' => $request['preferred_date'],
            'preferredTime' => substr((string) $request['preferred_time'], 0, 5),
            'lessonType' => $request['lesson_type'],
            'maxStudents' => (int) $request['max_students'],
            'lessonPath' => $request['lesson_path'] ?? $request['requester_membership_type'] ?? 'EVERYONE',
            'notes' => $request['notes'],
            'acceptedByMemberId' => $request['accepted_by_member_id'] === null ? null : (int) $request['accepted_by_member_id'],
            'acceptedByName' => $request['accepted_by_member_id'] === null ? '' : member_name([
                'first_name' => $request['accepter_first_name'],
                'last_name' => $request['accepter_last_name'],
                'username' => $request['accepter_username'],
            ]),
            'acceptedByMembershipType' => $request['accepted_by_member_id'] === null ? '' : $request['accepter_membership_type'],
        ];

        if (!$canTeach && (int) $request['requester_member_id'] !== $memberId) {
            continue;
        }

        $requests[] = $mappedRequest;
    }

    return ['slots' => $slots, 'booked' => $booked, 'requests' => $requests];
}

function send_lessons_response(PDO $pdo, int $memberId, string $message = ''): void
{
    $lessons = get_lessons($pdo, $memberId);

    send_json(200, [
        'ok' => true,
        'message' => $message,
        'slots' => $lessons['slots'],
        'booked' => $lessons['booked'],
        'requests' => $lessons['requests'],
    ]);
}

function read_lesson_type(): string
{
    $type = strtoupper(trim((string) ($_POST['lesson_type'] ?? 'SINGLE')));

    return in_array($type, ['SINGLE', 'GROUP'], true) ? $type : 'SINGLE';
}

function read_path(string $fieldName): string
{
    $path = strtoupper(trim((string) ($_POST[$fieldName] ?? 'EVERYONE')));

    return in_array($path, ['CUP', 'COMMUNITY', 'EVERYONE'], true) ? $path : 'EVERYONE';
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
        send_json(422, ['ok' => false, 'message' => 'Please enter a valid age range.']);
    }

    return [$minAge, $maxAge];
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    ensure_members_table($pdo);
    ensure_member_lessons_table($pdo);
    $memberType = get_member_type($pdo, $memberId);
    $canTeach = in_array($memberType, ['ADMIN', 'TEACHER'], true);
    $canRequestLesson = in_array($memberType, ['CUP', 'COMMUNITY'], true);
    $canJoinLesson = in_array($memberType, ['CUP', 'COMMUNITY'], true);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_lessons_response($pdo, $memberId);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
    }

    $action = (string) ($_POST['action'] ?? 'add_slot');

    if ($action === 'join_slot' || $action === 'leave_slot') {
        $slotId = filter_var($_POST['slot_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($slotId === false) {
            send_json(422, ['ok' => false, 'message' => 'Please choose a valid lesson time.']);
        }

        $slotStatement = $pdo->prepare('SELECT id, lesson_date, max_students, lesson_path, min_age, max_age FROM member_lesson_slots WHERE id = :id LIMIT 1');
        $slotStatement->execute(['id' => (int) $slotId]);
        $slot = $slotStatement->fetch();

        if (!$slot) {
            send_json(404, ['ok' => false, 'message' => 'Lesson time not found.']);
        }

        if ($slot['lesson_date'] < (new DateTimeImmutable('today'))->format('Y-m-d')) {
            send_json(422, ['ok' => false, 'message' => 'Past lesson times cannot be changed.']);
        }

        if ($action === 'join_slot') {
            if (!$canJoinLesson) {
                send_json(403, ['ok' => false, 'message' => 'Only CUP and Community members can join lessons.']);
            }

            if (!path_allows_member((string) ($slot['lesson_path'] ?? 'EVERYONE'), $memberType)) {
                send_json(403, ['ok' => false, 'message' => 'This lesson is not open to your membership path.']);
            }

            $minAge = $slot['min_age'] === null ? null : (int) $slot['min_age'];
            $maxAge = $slot['max_age'] === null ? null : (int) $slot['max_age'];

            if (!age_allows_member($minAge, $maxAge, get_member_age($pdo, $memberId))) {
                send_json(403, ['ok' => false, 'message' => 'This lesson is not open to your age group.']);
            }

            $countStatement = $pdo->prepare('SELECT COUNT(*) AS student_count FROM member_lesson_slot_students WHERE lesson_slot_id = :slot_id');
            $countStatement->execute(['slot_id' => (int) $slotId]);

            if ((int) ($countStatement->fetch()['student_count'] ?? 0) >= (int) $slot['max_students']) {
                send_json(422, ['ok' => false, 'message' => 'This lesson is full.']);
            }

            $insert = $pdo->prepare('INSERT IGNORE INTO member_lesson_slot_students (lesson_slot_id, member_id) VALUES (:slot_id, :member_id)');
            $insert->execute(['slot_id' => (int) $slotId, 'member_id' => $memberId]);

            send_lessons_response($pdo, $memberId, 'You are added to the lesson.');
        }

        $delete = $pdo->prepare('DELETE FROM member_lesson_slot_students WHERE lesson_slot_id = :slot_id AND member_id = :member_id');
        $delete->execute(['slot_id' => (int) $slotId, 'member_id' => $memberId]);

        send_lessons_response($pdo, $memberId, 'You have left the lesson.');
    }

    if ($action === 'delete_slot') {
        if (!$canTeach) {
            send_json(403, ['ok' => false, 'message' => 'Only admins and teachers can remove lesson times.']);
        }

        $slotId = filter_var($_POST['slot_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($slotId === false) {
            send_json(422, ['ok' => false, 'message' => 'Please choose a valid lesson time.']);
        }

        $slotStatement = $pdo->prepare(
            'SELECT id, provider_member_id, lesson_date
             FROM member_lesson_slots
             WHERE id = :id
             LIMIT 1'
        );
        $slotStatement->execute(['id' => (int) $slotId]);
        $slot = $slotStatement->fetch();

        if (!$slot || (int) $slot['provider_member_id'] !== $memberId) {
            send_json(404, ['ok' => false, 'message' => 'Lesson time not found.']);
        }

        if ($slot['lesson_date'] < (new DateTimeImmutable('today'))->format('Y-m-d')) {
            send_json(422, ['ok' => false, 'message' => 'Past lesson times cannot be removed.']);
        }

        $countStatement = $pdo->prepare('SELECT COUNT(*) AS student_count FROM member_lesson_slot_students WHERE lesson_slot_id = :slot_id');
        $countStatement->execute(['slot_id' => (int) $slotId]);

        if ((int) ($countStatement->fetch()['student_count'] ?? 0) > 0) {
            send_json(422, ['ok' => false, 'message' => 'This lesson already has a student booked.']);
        }

        $delete = $pdo->prepare('DELETE FROM member_lesson_slots WHERE id = :id AND provider_member_id = :member_id');
        $delete->execute(['id' => (int) $slotId, 'member_id' => $memberId]);

        send_lessons_response($pdo, $memberId, 'Lesson time removed.');
    }

    if ($action === 'accept_request') {
        if (!$canTeach) {
            send_json(403, ['ok' => false, 'message' => 'Only admins and teachers can accept lesson requests.']);
        }

        $requestId = filter_var($_POST['request_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($requestId === false) {
            send_json(422, ['ok' => false, 'message' => 'Please choose a valid request.']);
        }

        $requestStatement = $pdo->prepare(
            'SELECT id, requester_member_id, preferred_date, preferred_time, lesson_type, max_students, lesson_path, notes
             FROM member_lesson_requests
             WHERE id = :id
             AND requester_member_id <> :member_id
             AND accepted_by_member_id IS NULL
             LIMIT 1'
        );
        $requestStatement->execute([
            'id' => (int) $requestId,
            'member_id' => $memberId,
        ]);
        $request = $requestStatement->fetch();

        if (!$request) {
            send_json(422, ['ok' => false, 'message' => 'This request cannot be accepted.']);
        }

        $pdo->beginTransaction();

        $insertSlot = $pdo->prepare(
            'INSERT INTO member_lesson_slots
                (provider_member_id, lesson_date, lesson_time, lesson_type, max_students, lesson_path, location, notes, source_request_id)
             VALUES
                (:provider_member_id, :lesson_date, :lesson_time, :lesson_type, :max_students, :lesson_path, :location, :notes, :source_request_id)'
        );
        $insertSlot->execute([
            'provider_member_id' => $memberId,
            'lesson_date' => $request['preferred_date'],
            'lesson_time' => $request['preferred_time'],
            'lesson_type' => $request['lesson_type'],
            'max_students' => (int) $request['max_students'],
            'lesson_path' => $request['lesson_path'] ?? 'EVERYONE',
            'location' => 'Hawkesbury',
            'notes' => $request['notes'],
            'source_request_id' => (int) $request['id'],
        ]);
        $slotId = (int) $pdo->lastInsertId();

        $insertStudent = $pdo->prepare(
            'INSERT INTO member_lesson_slot_students (lesson_slot_id, member_id)
             VALUES (:slot_id, :member_id)'
        );
        $insertStudent->execute([
            'slot_id' => $slotId,
            'member_id' => (int) $request['requester_member_id'],
        ]);

        $update = $pdo->prepare(
            'UPDATE member_lesson_requests
             SET accepted_by_member_id = :member_id, accepted_at = NOW()
             WHERE id = :id'
        );
        $update->execute(['id' => (int) $requestId, 'member_id' => $memberId]);

        $pdo->commit();

        send_lessons_response($pdo, $memberId, 'Lesson request accepted.');
    }

    if ($action === 'delete_request') {
        if (!$canRequestLesson) {
            send_json(403, ['ok' => false, 'message' => 'Only CUP and Community members can remove lesson requests.']);
        }

        $requestId = filter_var($_POST['request_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($requestId === false) {
            send_json(422, ['ok' => false, 'message' => 'Please choose a valid request.']);
        }

        $delete = $pdo->prepare(
            'DELETE FROM member_lesson_requests
             WHERE id = :id
             AND requester_member_id = :member_id
             AND accepted_by_member_id IS NULL'
        );
        $delete->execute(['id' => (int) $requestId, 'member_id' => $memberId]);

        if ($delete->rowCount() === 0) {
            send_json(422, ['ok' => false, 'message' => 'This request cannot be removed.']);
        }

        send_lessons_response($pdo, $memberId, 'Lesson request removed.');
    }

    if ($action === 'add_slot') {
        if (!$canTeach) {
            send_json(403, ['ok' => false, 'message' => 'Only admins and teachers can make lesson times available.']);
        }

        $lessonDate = trim((string) ($_POST['lesson_date'] ?? ''));
        $lessonTime = trim((string) ($_POST['lesson_time'] ?? ''));
        $lessonType = read_lesson_type();
        $maxStudents = filter_var($_POST['max_students'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 12]]);
        $lessonPath = read_path('lesson_path');
        [$minAge, $maxAge] = read_age_range();
        $location = trim((string) ($_POST['location'] ?? 'Hawkesbury'));
        $notes = trim((string) ($_POST['notes'] ?? ''));
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $lessonDate);
        $dateErrors = DateTimeImmutable::getLastErrors();
        $isValidDate = $date instanceof DateTimeImmutable
            && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
            && $date->format('Y-m-d') === $lessonDate;
        $isValidTime = (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $lessonTime);

        if (!$isValidDate || !$isValidTime || $maxStudents === false) {
            send_json(422, ['ok' => false, 'message' => 'Please enter a valid lesson date, time, type, and maximum.']);
        }

        if ($location === '') {
            $location = 'Hawkesbury';
        }

        $insert = $pdo->prepare(
            'INSERT INTO member_lesson_slots (provider_member_id, lesson_date, lesson_time, lesson_type, max_students, lesson_path, min_age, max_age, location, notes)
             VALUES (:member_id, :lesson_date, :lesson_time, :lesson_type, :max_students, :lesson_path, :min_age, :max_age, :location, :notes)'
        );
        $insert->execute([
            'member_id' => $memberId,
            'lesson_date' => $lessonDate,
            'lesson_time' => $lessonTime,
            'lesson_type' => $lessonType,
            'max_students' => (int) $maxStudents,
            'lesson_path' => $lessonPath,
            'min_age' => $minAge,
            'max_age' => $maxAge,
            'location' => $location,
            'notes' => $notes,
        ]);

        send_lessons_response($pdo, $memberId, 'Lesson time added.');
    }

    if ($action === 'request_lesson') {
        if (!$canRequestLesson) {
            send_json(403, ['ok' => false, 'message' => 'Only CUP and Community members can request lessons.']);
        }

        $preferredDate = trim((string) ($_POST['preferred_date'] ?? ''));
        $preferredTime = trim((string) ($_POST['preferred_time'] ?? ''));
        $lessonType = read_lesson_type();
        $maxStudents = filter_var($_POST['max_students'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 12]]);
        $notes = trim((string) ($_POST['notes'] ?? ''));
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $preferredDate);
        $dateErrors = DateTimeImmutable::getLastErrors();
        $isValidDate = $date instanceof DateTimeImmutable
            && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
            && $date->format('Y-m-d') === $preferredDate;
        $isValidTime = (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $preferredTime);

        if (!$isValidDate || !$isValidTime || $maxStudents === false || $notes === '') {
            send_json(422, ['ok' => false, 'message' => 'Please enter a valid preferred date, time, lesson type, group size, and notes.']);
        }

        $insert = $pdo->prepare(
            'INSERT INTO member_lesson_requests (requester_member_id, preferred_date, preferred_time, lesson_type, max_students, lesson_path, notes)
             VALUES (:member_id, :preferred_date, :preferred_time, :lesson_type, :max_students, :lesson_path, :notes)'
        );
        $insert->execute([
            'member_id' => $memberId,
            'preferred_date' => $preferredDate,
            'preferred_time' => $preferredTime,
            'lesson_type' => $lessonType,
            'max_students' => (int) $maxStudents,
            'lesson_path' => in_array($memberType, ['CUP', 'COMMUNITY'], true) ? $memberType : 'EVERYONE',
            'notes' => $notes,
        ]);

        send_lessons_response($pdo, $memberId, 'Lesson requested.');
    }

    send_json(422, ['ok' => false, 'message' => 'Please choose a valid lesson action.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Lessons service error: ' . $error->getMessage());

    send_json(500, [
        'ok' => false,
        'message' => 'The lessons service is not available right now.',
    ]);
}

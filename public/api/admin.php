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

if (!function_exists('is_super_admin_type')) {
    function is_super_admin_type(string $type): bool
    {
        return strtoupper(trim($type)) === 'SUPER_ADMIN';
    }
}

if (!function_exists('is_member_admin_type')) {
    function is_member_admin_type(string $type): bool
    {
        return in_array(strtoupper(trim($type)), ['SUPER_ADMIN', 'ADMIN'], true);
    }
}

function send_admin_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function get_admin_member_id(PDO $pdo): int
{
    $token = get_bearer_token();

    if ($token === '') {
        $token = (string) ($_GET['token'] ?? $_POST['token'] ?? '');
    }

    $payload = $token === '' ? null : verify_member_jwt($token);
    $memberId = (int) ($payload['sub'] ?? 0);

    if ($memberId < 1) {
        send_admin_json(401, ['ok' => false, 'message' => 'Please log in as an admin.']);
    }

    $statement = $pdo->prepare(
        'SELECT membership_type, is_active
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch();

    if (!$member || !is_member_admin_type((string) $member['membership_type']) || !(bool) $member['is_active']) {
        send_admin_json(403, ['ok' => false, 'message' => 'Only admins and super admins can use this panel.']);
    }

    return $memberId;
}

function get_admin_member_type(PDO $pdo, int $memberId): string
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

function get_admin_members(PDO $pdo): array
{
    $statement = $pdo->query(
        'SELECT members.id, members.is_active, members.first_name, members.last_name, members.username, members.parent_email,
                members.parent_name, members.parent_text, members.parent_email_notify, members.parent_text_notify,
                members.player_age, members.player_text, members.player_text_notify, members.show_public_stats,
                members.notify_lessons_parent_email, members.notify_lessons_player_text, members.notify_lessons_parent_text,
                members.notify_events_parent_email, members.notify_events_player_text, members.notify_events_parent_text,
                members.notify_games_parent_email, members.notify_games_player_text, members.notify_games_parent_text,
                members.membership_type, members.email_verified_at,
                COALESCE(SUM(member_points.points), 0) AS points_balance
         FROM members
         LEFT JOIN member_points ON member_points.member_id = members.id
         GROUP BY members.id, members.is_active, members.first_name, members.last_name, members.username, members.parent_email,
                  members.parent_name, members.parent_text, members.parent_email_notify, members.parent_text_notify,
                  members.player_age, members.player_text, members.player_text_notify, members.show_public_stats,
                  members.notify_lessons_parent_email, members.notify_lessons_player_text, members.notify_lessons_parent_text,
                  members.notify_events_parent_email, members.notify_events_player_text, members.notify_events_parent_text,
                  members.notify_games_parent_email, members.notify_games_player_text, members.notify_games_parent_text,
                  members.membership_type, members.email_verified_at
         ORDER BY members.created_at DESC, members.id DESC'
    );
    $members = array_map(
        static fn (array $member): array => [
            'id' => (int) $member['id'],
            'isActive' => (bool) $member['is_active'],
            'firstName' => $member['first_name'],
            'lastName' => $member['last_name'],
            'name' => trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? ''))) ?: (string) $member['username'],
            'username' => $member['username'],
            'parentEmail' => $member['parent_email'],
            'parentName' => $member['parent_name'],
            'parentText' => $member['parent_text'],
            'parentEmailNotify' => (bool) $member['parent_email_notify'],
            'parentTextNotify' => (bool) $member['parent_text_notify'],
            'playerAge' => $member['player_age'] ? (int) $member['player_age'] : null,
            'playerText' => $member['player_text'],
            'playerTextNotify' => (bool) $member['player_text_notify'],
            'showPublicStats' => (bool) $member['show_public_stats'],
            'notifyLessonsParentEmail' => (bool) $member['notify_lessons_parent_email'],
            'notifyLessonsPlayerText' => (bool) $member['notify_lessons_player_text'],
            'notifyLessonsParentText' => (bool) $member['notify_lessons_parent_text'],
            'notifyEventsParentEmail' => (bool) $member['notify_events_parent_email'],
            'notifyEventsPlayerText' => (bool) $member['notify_events_player_text'],
            'notifyEventsParentText' => (bool) $member['notify_events_parent_text'],
            'notifyGamesParentEmail' => (bool) $member['notify_games_parent_email'],
            'notifyGamesPlayerText' => (bool) $member['notify_games_player_text'],
            'notifyGamesParentText' => (bool) $member['notify_games_parent_text'],
            'membershipType' => $member['membership_type'],
            'emailVerified' => $member['email_verified_at'] !== null,
            'status' => $member['email_verified_at'] === null ? 'Email Not Verified' : 'Email Verified',
            'points' => (int) $member['points_balance'],
            'pointEntries' => [],
            'rounds' => [],
            'events' => [],
            'lessons' => [],
        ],
        $statement->fetchAll()
    );
    $memberIds = array_column($members, 'id');

    if (!$memberIds) {
        return $members;
    }

    $placeholders = implode(',', array_fill(0, count($memberIds), '?'));
    $pointsStatement = $pdo->prepare(
        "SELECT member_id, id, point_type, point_date, description, points
         FROM member_points
         WHERE member_id IN ({$placeholders})
         ORDER BY point_date DESC, id DESC"
    );
    $pointsStatement->execute($memberIds);
    $pointsByMember = [];

    foreach ($pointsStatement->fetchAll() as $point) {
        $pointsByMember[(int) $point['member_id']][] = [
            'id' => (int) $point['id'],
            'type' => $point['point_type'],
            'date' => $point['point_date'],
            'description' => $point['description'],
            'points' => (int) $point['points'],
        ];
    }

    $roundsStatement = $pdo->prepare(
        "SELECT member_id, id, round_date, tee, format, score, created_at
         FROM member_rounds
         WHERE member_id IN ({$placeholders})
         ORDER BY round_date DESC, id DESC"
    );
    $roundsStatement->execute($memberIds);
    $roundsByMember = [];

    foreach ($roundsStatement->fetchAll() as $round) {
        $roundsByMember[(int) $round['member_id']][] = [
            'id' => (int) $round['id'],
            'date' => $round['round_date'],
            'tee' => $round['tee'],
            'format' => $round['format'],
            'score' => $round['score'],
            'createdAt' => $round['created_at'],
        ];
    }

    $eventsByMember = [];
    $attendedEventsStatement = $pdo->prepare(
        "SELECT attendees.member_id, events.id, events.event_name, events.event_date, events.event_time,
                events.event_path, events.location, events.winner_points, events.participant_points
         FROM member_event_attendees attendees
         INNER JOIN member_events events ON events.id = attendees.event_id
         WHERE attendees.member_id IN ({$placeholders})
         ORDER BY events.event_date DESC, events.event_time DESC, events.id DESC"
    );
    $attendedEventsStatement->execute($memberIds);

    foreach ($attendedEventsStatement->fetchAll() as $event) {
        $eventsByMember[(int) $event['member_id']][] = [
            'id' => (int) $event['id'],
            'role' => 'Attending',
            'name' => $event['event_name'],
            'date' => $event['event_date'],
            'time' => $event['event_time'],
            'path' => $event['event_path'],
            'location' => $event['location'],
            'winnerPoints' => (int) $event['winner_points'],
            'participantPoints' => (int) $event['participant_points'],
        ];
    }

    $createdEventsStatement = $pdo->prepare(
        "SELECT created_by_member_id, id, event_name, event_date, event_time,
                event_path, location, winner_points, participant_points
         FROM member_events
         WHERE created_by_member_id IN ({$placeholders})
         ORDER BY event_date DESC, event_time DESC, id DESC"
    );
    $createdEventsStatement->execute($memberIds);

    foreach ($createdEventsStatement->fetchAll() as $event) {
        $eventsByMember[(int) $event['created_by_member_id']][] = [
            'id' => (int) $event['id'],
            'role' => 'Created',
            'name' => $event['event_name'],
            'date' => $event['event_date'],
            'time' => $event['event_time'],
            'path' => $event['event_path'],
            'location' => $event['location'],
            'winnerPoints' => (int) $event['winner_points'],
            'participantPoints' => (int) $event['participant_points'],
        ];
    }

    $lessonsByMember = [];
    $studentLessonsStatement = $pdo->prepare(
        "SELECT students.member_id, slots.id, slots.lesson_date, slots.lesson_time, slots.lesson_type,
                slots.lesson_path, slots.location, slots.notes
         FROM member_lesson_slot_students students
         INNER JOIN member_lesson_slots slots ON slots.id = students.lesson_slot_id
         WHERE students.member_id IN ({$placeholders})
         ORDER BY slots.lesson_date DESC, slots.lesson_time DESC, slots.id DESC"
    );
    $studentLessonsStatement->execute($memberIds);

    foreach ($studentLessonsStatement->fetchAll() as $lesson) {
        $lessonsByMember[(int) $lesson['member_id']][] = [
            'id' => (int) $lesson['id'],
            'role' => 'Student',
            'date' => $lesson['lesson_date'],
            'time' => $lesson['lesson_time'],
            'type' => $lesson['lesson_type'],
            'path' => $lesson['lesson_path'],
            'location' => $lesson['location'],
            'notes' => $lesson['notes'],
        ];
    }

    $providerLessonsStatement = $pdo->prepare(
        "SELECT provider_member_id, id, lesson_date, lesson_time, lesson_type,
                lesson_path, location, notes
         FROM member_lesson_slots
         WHERE provider_member_id IN ({$placeholders})
         ORDER BY lesson_date DESC, lesson_time DESC, id DESC"
    );
    $providerLessonsStatement->execute($memberIds);

    foreach ($providerLessonsStatement->fetchAll() as $lesson) {
        $lessonsByMember[(int) $lesson['provider_member_id']][] = [
            'id' => (int) $lesson['id'],
            'role' => 'Provider',
            'date' => $lesson['lesson_date'],
            'time' => $lesson['lesson_time'],
            'type' => $lesson['lesson_type'],
            'path' => $lesson['lesson_path'],
            'location' => $lesson['location'],
            'notes' => $lesson['notes'],
        ];
    }

    $lessonRequestsStatement = $pdo->prepare(
        "SELECT requester_member_id, id, preferred_date, preferred_time, lesson_type,
                lesson_path, notes, accepted_by_member_id
         FROM member_lesson_requests
         WHERE requester_member_id IN ({$placeholders})
         ORDER BY preferred_date DESC, preferred_time DESC, id DESC"
    );
    $lessonRequestsStatement->execute($memberIds);

    foreach ($lessonRequestsStatement->fetchAll() as $lesson) {
        $lessonsByMember[(int) $lesson['requester_member_id']][] = [
            'id' => (int) $lesson['id'],
            'role' => $lesson['accepted_by_member_id'] === null ? 'Requested' : 'Accepted Request',
            'date' => $lesson['preferred_date'],
            'time' => $lesson['preferred_time'],
            'type' => $lesson['lesson_type'],
            'path' => $lesson['lesson_path'],
            'location' => '',
            'notes' => $lesson['notes'],
        ];
    }

    return array_map(
        static function (array $member) use ($pointsByMember, $roundsByMember, $eventsByMember, $lessonsByMember): array {
            $member['pointEntries'] = $pointsByMember[$member['id']] ?? [];
            $member['rounds'] = $roundsByMember[$member['id']] ?? [];
            $member['events'] = $eventsByMember[$member['id']] ?? [];
            $member['lessons'] = $lessonsByMember[$member['id']] ?? [];

            return $member;
        },
        $members
    );
}

function get_pending_cashouts(PDO $pdo): array
{
    $statement = $pdo->query(
        "SELECT cashouts.id, cashouts.member_id, cashouts.points, cashouts.requested_at,
                members.first_name, members.last_name, members.username, members.membership_type,
                COALESCE(SUM(member_points.points), 0) AS points_balance
         FROM member_point_cashouts cashouts
         INNER JOIN members ON members.id = cashouts.member_id
         LEFT JOIN member_points ON member_points.member_id = members.id
         WHERE cashouts.status = 'REQUESTED'
         GROUP BY cashouts.id, cashouts.member_id, cashouts.points, cashouts.requested_at,
                  members.first_name, members.last_name, members.username, members.membership_type
         ORDER BY cashouts.requested_at ASC, cashouts.id ASC"
    );

    return array_map(
        static fn (array $cashout): array => [
            'id' => (int) $cashout['id'],
            'memberId' => (int) $cashout['member_id'],
            'name' => trim((string) (($cashout['first_name'] ?? '') . ' ' . ($cashout['last_name'] ?? ''))) ?: (string) $cashout['username'],
            'username' => $cashout['username'],
            'membershipType' => $cashout['membership_type'],
            'points' => (int) $cashout['points'],
            'balance' => (int) $cashout['points_balance'],
            'requestedAt' => $cashout['requested_at'],
        ],
        $statement->fetchAll()
    );
}

function send_admin_members_response(PDO $pdo, string $message = ''): void
{
    send_admin_json(200, [
        'ok' => true,
        'message' => $message,
        'members' => get_admin_members($pdo),
        'cashoutRequests' => get_pending_cashouts($pdo),
    ]);
}

try {
    $pdo = get_database();
    run_schema_setup('Admin service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_rounds_table($pdo);
        ensure_member_points_table($pdo);
        ensure_member_point_cashouts_table($pdo);
        ensure_member_events_table($pdo);
        ensure_member_lessons_table($pdo);
    });
    $adminMemberId = get_admin_member_id($pdo);
    $adminMemberType = get_admin_member_type($pdo, $adminMemberId);
    $isSuperAdmin = is_super_admin_type($adminMemberType);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_admin_members_response($pdo);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_admin_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
    }

    $action = (string) ($_POST['action'] ?? 'update_member');

    if ($action === 'create_member') {
        if (!$isSuperAdmin) {
            send_admin_json(403, ['ok' => false, 'message' => 'Only super admins can create accounts.']);
        }

        $firstName = trim((string) ($_POST['first_name'] ?? ''));
        $lastName = trim((string) ($_POST['last_name'] ?? ''));
        $parentEmail = trim((string) ($_POST['parent_email'] ?? ''));
        $username = normalize_username((string) ($_POST['username'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $membershipType = normalize_membership_type((string) ($_POST['membership_type'] ?? 'COMMUNITY'));
        $playerAgeRaw = trim((string) ($_POST['player_age'] ?? ''));
        $playerAge = $playerAgeRaw === ''
            ? null
            : filter_var($playerAgeRaw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 18]]);

        if ($firstName === '' || $lastName === '' || $username === '' || $password === '' || $playerAge === false) {
            send_admin_json(422, ['ok' => false, 'message' => 'Please enter a valid name, username, password, role/path, and age.']);
        }

        if (in_array($membershipType, ['CUP', 'COMMUNITY'], true) && $playerAge === null) {
            send_admin_json(422, ['ok' => false, 'message' => 'Please enter an age for junior members.']);
        }

        if ($parentEmail !== '' && !filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
            send_admin_json(422, ['ok' => false, 'message' => 'Please enter a valid parent email address.']);
        }

        if (!is_valid_username($username)) {
            send_admin_json(422, ['ok' => false, 'message' => 'Usernames must be 3 to 40 characters and may use letters, numbers, dots, underscores, and hyphens.']);
        }

        if (strlen($password) < 8) {
            send_admin_json(422, ['ok' => false, 'message' => 'Passwords must be at least 8 characters.']);
        }

        $insert = $pdo->prepare(
            'INSERT INTO members
                (membership_type, first_name, last_name, username, password_hash, parent_email, player_age, email_verified_at)
             VALUES
                (:membership_type, :first_name, :last_name, :username, :password_hash, :parent_email, :player_age, NOW())'
        );
        $insert->execute([
            'membership_type' => $membershipType,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'username' => $username,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'parent_email' => $parentEmail === '' ? null : $parentEmail,
            'player_age' => $playerAge,
        ]);

        $newMemberId = (int) $pdo->lastInsertId();

        if (in_array($membershipType, ['CUP', 'COMMUNITY'], true)) {
            add_welcome_points_for_member($pdo, $newMemberId);
        }

        send_admin_members_response($pdo, 'Member account created.');
    }

    if ($action === 'approve_cashout') {
        if (!$isSuperAdmin) {
            send_admin_json(403, ['ok' => false, 'message' => 'Only super admins can approve cash out requests.']);
        }

        $cashoutId = filter_var($_POST['cashout_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($cashoutId === false) {
            send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid cash out request.']);
        }

        $cashoutStatement = $pdo->prepare(
            "SELECT id, member_id, points
             FROM member_point_cashouts
             WHERE id = :id
             AND status = 'REQUESTED'
             LIMIT 1"
        );
        $cashoutStatement->execute(['id' => (int) $cashoutId]);
        $cashout = $cashoutStatement->fetch();

        if (!$cashout) {
            send_admin_json(404, ['ok' => false, 'message' => 'Cash out request not found.']);
        }

        $balanceStatement = $pdo->prepare(
            'SELECT COALESCE(SUM(points), 0) AS points_balance
             FROM member_points
             WHERE member_id = :member_id'
        );
        $balanceStatement->execute(['member_id' => (int) $cashout['member_id']]);

        if ((int) ($balanceStatement->fetch()['points_balance'] ?? 0) < (int) $cashout['points']) {
            send_admin_json(422, ['ok' => false, 'message' => 'This member does not have enough points for this cash out.']);
        }

        $today = (new DateTimeImmutable('now'))->format('Y-m-d');
        $pdo->beginTransaction();

        add_member_point(
            $pdo,
            (int) $cashout['member_id'],
            'CASH_OUT',
            $today,
            "Cash Out Approved - {$today}",
            -1 * (int) $cashout['points'],
            'member_point_cashouts',
            (int) $cashout['id']
        );

        $updateCashout = $pdo->prepare(
            "UPDATE member_point_cashouts
             SET status = 'APPROVED',
                 approved_by_member_id = :admin_member_id,
                 approved_at = NOW()
             WHERE id = :id
             AND status = 'REQUESTED'"
        );
        $updateCashout->execute([
            'admin_member_id' => $adminMemberId,
            'id' => (int) $cashoutId,
        ]);

        $pdo->commit();

        send_admin_members_response($pdo, 'Cash out approved.');
    }

    if (in_array($action, ['update_points', 'add_points', 'remove_points'], true)) {
        send_admin_json(403, ['ok' => false, 'message' => 'Points are managed from the Points section.']);
    }

    if ($action === 'set_inactive_member' || $action === 'delete_member') {
        if (!$isSuperAdmin) {
            send_admin_json(403, ['ok' => false, 'message' => 'Only super admins can set members inactive.']);
        }

        $memberId = filter_var($_POST['member_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($memberId === false) {
            send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid member.']);
        }

        if ((int) $memberId === $adminMemberId) {
            send_admin_json(422, ['ok' => false, 'message' => 'You cannot delete your own admin account from this panel.']);
        }

        $statement = $pdo->prepare('UPDATE members SET is_active = 0 WHERE id = :id LIMIT 1');
        $statement->execute(['id' => (int) $memberId]);

        if ($statement->rowCount() < 1) {
            send_admin_json(404, ['ok' => false, 'message' => 'Member not found.']);
        }

        send_admin_members_response($pdo, 'Member set inactive.');
    }

    if ($action === 'activate_member') {
        if (!$isSuperAdmin) {
            send_admin_json(403, ['ok' => false, 'message' => 'Only super admins can reactivate members.']);
        }

        $memberId = filter_var($_POST['member_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($memberId === false) {
            send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid member.']);
        }

        $statement = $pdo->prepare('UPDATE members SET is_active = 1 WHERE id = :id LIMIT 1');
        $statement->execute(['id' => (int) $memberId]);

        if ($statement->rowCount() < 1) {
            send_admin_json(404, ['ok' => false, 'message' => 'Member not found.']);
        }

        send_admin_members_response($pdo, 'Member reactivated.');
    }

    $memberId = filter_var($_POST['member_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

    if ($memberId === false) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid member.']);
    }

    $memberStatement = $pdo->prepare(
        'SELECT is_active, email_verified_at, email_verification_token_hash, player_age, membership_type
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $memberStatement->execute(['id' => (int) $memberId]);
    $existingMember = $memberStatement->fetch();

    if (!$existingMember) {
        send_admin_json(404, ['ok' => false, 'message' => 'Member not found.']);
    }

    $membershipType = $isSuperAdmin
        ? strtoupper(trim((string) ($_POST['membership_type'] ?? $existingMember['membership_type'] ?? 'COMMUNITY')))
        : (string) ($existingMember['membership_type'] ?? 'COMMUNITY');

    if (!in_array($membershipType, ['CUP', 'COMMUNITY', 'SUPER_ADMIN', 'ADMIN', 'TEACHER', 'COACH'], true)) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid path.']);
    }

    $emailVerified = $isSuperAdmin && (array_key_exists('email_verified_present', $_POST) || array_key_exists('email_verified', $_POST))
        ? (array_key_exists('email_verified', $_POST) ? 1 : 0)
        : ($existingMember['email_verified_at'] === null ? 0 : 1);
    $isActive = $isSuperAdmin && array_key_exists('is_active', $_POST)
        ? filter_var($_POST['is_active'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 1]])
        : (int) $existingMember['is_active'];
    $playerAge = $existingMember['player_age'] === null ? null : (int) $existingMember['player_age'];

    if (array_key_exists('player_age', $_POST)) {
        $playerAgeRaw = trim((string) $_POST['player_age']);
        $playerAge = $playerAgeRaw === ''
            ? null
            : filter_var($playerAgeRaw, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 18]]);
    }

    if ($playerAge === false) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please enter a valid player age.']);
    }

    if ($isActive === false) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid active status.']);
    }

    if ((int) $memberId === $adminMemberId && (int) $isActive === 0) {
        send_admin_json(422, ['ok' => false, 'message' => 'You cannot make your own admin account inactive.']);
    }

    if ((int) $memberId === $adminMemberId && !is_super_admin_type($membershipType)) {
        send_admin_json(422, ['ok' => false, 'message' => 'You cannot remove your own super admin role from this panel.']);
    }

    $firstName = trim((string) ($_POST['first_name'] ?? ''));
    $lastName = trim((string) ($_POST['last_name'] ?? ''));
    $parentEmail = trim((string) ($_POST['parent_email'] ?? ''));
    $parentName = trim((string) ($_POST['parent_name'] ?? ''));
    $parentText = trim((string) ($_POST['parent_text'] ?? ''));
    $playerText = trim((string) ($_POST['player_text'] ?? ''));
    $showPublicStats = isset($_POST['show_public_stats']) && (string) $_POST['show_public_stats'] !== '0' ? 1 : 0;

    if ($parentEmail !== '' && !filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please enter a valid parent email address.']);
    }

    $notificationFields = [
        'notify_lessons_parent_email',
        'notify_lessons_player_text',
        'notify_lessons_parent_text',
        'notify_events_parent_email',
        'notify_events_player_text',
        'notify_events_parent_text',
        'notify_games_parent_email',
        'notify_games_player_text',
        'notify_games_parent_text',
    ];
    $notificationUpdates = [];

    foreach ($notificationFields as $field) {
        $notificationUpdates[$field] = $isSuperAdmin && array_key_exists($field, $_POST) ? 1 : 0;
    }

    $notificationsEditableSql = $isSuperAdmin ? '1' : '0';
    $statement = $pdo->prepare(
        'UPDATE members
         SET first_name = :first_name,
             last_name = :last_name,
             parent_email = :parent_email,
             parent_name = :parent_name,
             parent_text = :parent_text,
             player_text = :player_text,
             show_public_stats = :show_public_stats,
             membership_type = :membership_type,
             is_active = :is_active,
             player_age = :player_age,
             email_verified_at = CASE WHEN :email_verified_status = 1 THEN COALESCE(email_verified_at, NOW()) ELSE NULL END,
             email_verification_token_hash = CASE WHEN :email_verified_token = 1 THEN NULL ELSE email_verification_token_hash END,
             notify_lessons_parent_email = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_lessons_parent_email ELSE notify_lessons_parent_email END,
             notify_lessons_player_text = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_lessons_player_text ELSE notify_lessons_player_text END,
             notify_lessons_parent_text = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_lessons_parent_text ELSE notify_lessons_parent_text END,
             notify_events_parent_email = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_events_parent_email ELSE notify_events_parent_email END,
             notify_events_player_text = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_events_player_text ELSE notify_events_player_text END,
             notify_events_parent_text = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_events_parent_text ELSE notify_events_parent_text END,
             notify_games_parent_email = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_games_parent_email ELSE notify_games_parent_email END,
             notify_games_player_text = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_games_player_text ELSE notify_games_player_text END,
             notify_games_parent_text = CASE WHEN ' . $notificationsEditableSql . ' = 1 THEN :notify_games_parent_text ELSE notify_games_parent_text END
         WHERE id = :id'
    );
    $statement->execute(array_merge([
        'first_name' => $firstName === '' ? null : $firstName,
        'last_name' => $lastName === '' ? null : $lastName,
        'parent_email' => $parentEmail === '' ? null : $parentEmail,
        'parent_name' => $parentName === '' ? null : $parentName,
        'parent_text' => $parentText === '' ? null : $parentText,
        'player_text' => $playerText === '' ? null : $playerText,
        'show_public_stats' => $showPublicStats,
        'membership_type' => $membershipType,
        'is_active' => $isActive,
        'player_age' => $playerAge,
        'email_verified_status' => $emailVerified,
        'email_verified_token' => $emailVerified,
        'id' => (int) $memberId,
    ], $notificationUpdates));

    send_admin_members_response($pdo, 'Member updated.');
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Admin service error: ' . $error->getMessage());

    send_admin_json(500, [
        'ok' => false,
        'message' => 'The admin service is not available right now.',
    ]);
}

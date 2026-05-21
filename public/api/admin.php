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
        'SELECT membership_type
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch();

    if (!$member || $member['membership_type'] !== 'ADMIN') {
        send_admin_json(403, ['ok' => false, 'message' => 'Only admins can use this panel.']);
    }

    return $memberId;
}

function get_admin_members(PDO $pdo): array
{
    $statement = $pdo->query(
        'SELECT members.id, members.first_name, members.last_name, members.username, members.parent_email,
                members.membership_type, members.email_verified_at,
                COALESCE(SUM(member_points.points), 0) AS points_balance
         FROM members
         LEFT JOIN member_points ON member_points.member_id = members.id
         GROUP BY members.id, members.first_name, members.last_name, members.username, members.parent_email,
                  members.membership_type, members.email_verified_at
         ORDER BY members.created_at DESC, members.id DESC'
    );
    $members = array_map(
        static fn (array $member): array => [
            'id' => (int) $member['id'],
            'name' => trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? ''))) ?: (string) $member['username'],
            'username' => $member['username'],
            'parentEmail' => $member['parent_email'],
            'membershipType' => $member['membership_type'],
            'emailVerified' => $member['email_verified_at'] !== null,
            'status' => $member['email_verified_at'] === null ? 'Email Not Verified' : 'Email Verified',
            'points' => (int) $member['points_balance'],
            'pointEntries' => [],
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

    return array_map(
        static function (array $member) use ($pointsByMember): array {
            $member['pointEntries'] = $pointsByMember[$member['id']] ?? [];

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
    ensure_members_table($pdo);
    ensure_member_points_table($pdo);
    ensure_member_point_cashouts_table($pdo);
    $adminMemberId = get_admin_member_id($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_admin_members_response($pdo);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_admin_json(405, ['ok' => false, 'message' => 'Method not allowed.']);
    }

    $action = (string) ($_POST['action'] ?? 'update_member');

    if ($action === 'approve_cashout') {
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

    if ($action === 'add_points') {
        $memberId = filter_var($_POST['member_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $points = filter_var($_POST['points'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 999]]);
        $description = trim((string) ($_POST['description'] ?? ''));

        if ($memberId === false || $points === false || $description === '') {
            send_admin_json(422, ['ok' => false, 'message' => 'Please enter a member, point amount, and reason.']);
        }

        if (strlen($description) > 160) {
            $description = substr($description, 0, 160);
        }

        $memberCheck = $pdo->prepare('SELECT id FROM members WHERE id = :id LIMIT 1');
        $memberCheck->execute(['id' => (int) $memberId]);

        if (!$memberCheck->fetch()) {
            send_admin_json(404, ['ok' => false, 'message' => 'Member not found.']);
        }

        add_member_point(
            $pdo,
            (int) $memberId,
            'COACH_AWARD',
            (new DateTimeImmutable('now'))->format('Y-m-d'),
            $description,
            (int) $points
        );

        send_admin_members_response($pdo, 'Points added.');
    }

    $memberId = filter_var($_POST['member_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $membershipType = strtoupper(trim((string) ($_POST['membership_type'] ?? 'COMMUNITY')));
    $emailVerified = isset($_POST['email_verified']) ? 1 : 0;

    if ($memberId === false) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid member.']);
    }

    if (!in_array($membershipType, ['CUP', 'COMMUNITY', 'ADMIN', 'TEACHER'], true)) {
        send_admin_json(422, ['ok' => false, 'message' => 'Please choose a valid path.']);
    }

    $statement = $pdo->prepare(
        'UPDATE members
         SET membership_type = :membership_type,
             email_verified_at = CASE WHEN :email_verified_status = 1 THEN COALESCE(email_verified_at, NOW()) ELSE NULL END,
             email_verification_token_hash = CASE WHEN :email_verified_token = 1 THEN NULL ELSE email_verification_token_hash END
         WHERE id = :id'
    );
    $statement->execute([
        'membership_type' => $membershipType,
        'email_verified_status' => $emailVerified,
        'email_verified_token' => $emailVerified,
        'id' => (int) $memberId,
    ]);

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

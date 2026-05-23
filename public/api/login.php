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

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

try {
    $pdo = get_database();
    ensure_members_table($pdo);

    $username = normalize_username((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $sessionMode = (string) ($_POST['session_mode'] ?? 'site');
    $jwtTtl = get_member_jwt_ttl_for_mode($sessionMode);

    if ($username === '' || $password === '') {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Please enter your username and password.',
        ]);
        exit;
    }

    $statement = $pdo->prepare(
        'SELECT
            id,
            is_active,
            first_name,
            last_name,
            username,
            password_hash,
            membership_type,
            parent_name,
            parent_text,
            player_age,
            player_text,
            email_verified_at
         FROM members
         WHERE username = :username
         LIMIT 1'
    );
    $statement->execute(['username' => $username]);
    $member = $statement->fetch();

    if (!$member || !$member['password_hash'] || !password_verify($password, $member['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'ok' => false,
            'message' => 'The username or password is incorrect.',
        ]);
        exit;
    }

    if (!(bool) $member['is_active']) {
        http_response_code(403);
        echo json_encode([
            'ok' => false,
            'message' => 'This account is inactive. Please contact an admin.',
        ]);
        exit;
    }

    if (!$member['email_verified_at']) {
        http_response_code(403);
        echo json_encode([
            'ok' => false,
            'message' => 'Please verify the parent email before logging in.',
        ]);
        exit;
    }

    start_member_session();
    $_SESSION['member_id'] = (int) $member['id'];
    $_SESSION['member_username'] = $member['username'];

    $profileComplete = is_member_profile_complete($member);
    $profileToken = null;

    if (!$profileComplete) {
        $profileToken = bin2hex(random_bytes(32));
        $profileTokenHash = hash('sha256', $profileToken);
        $update = $pdo->prepare(
            'UPDATE members
             SET profile_completion_token_hash = :token_hash
             WHERE id = :id'
        );
        $update->execute([
            'token_hash' => $profileTokenHash,
            'id' => (int) $member['id'],
        ]);
    }

    echo json_encode([
        'ok' => true,
        'message' => $profileComplete ? 'You are logged in.' : 'Please complete the parent and player contact details.',
        'requiresProfile' => !$profileComplete,
        'profileToken' => $profileToken,
        'token' => create_member_jwt($member, $jwtTtl),
        'expiresIn' => $jwtTtl,
        'member' => [
            'id' => (int) $member['id'],
            'firstName' => $member['first_name'],
            'lastName' => $member['last_name'],
            'username' => $member['username'],
            'membershipType' => $member['membership_type'],
            'parentName' => $member['parent_name'],
            'parentText' => $member['parent_text'],
            'playerAge' => $member['player_age'] ? (int) $member['player_age'] : null,
            'playerText' => $member['player_text'],
        ],
    ]);
} catch (Throwable $error) {
    error_log('Login setup error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The login service is not available right now.',
    ]);
}

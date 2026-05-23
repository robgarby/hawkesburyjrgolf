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
    start_member_session();

    $memberId = (int) ($_SESSION['member_id'] ?? 0);
    $profileToken = (string) ($_POST['profile_token'] ?? '');
    $profileUsername = normalize_username((string) ($_POST['profile_username'] ?? ''));
    $profilePassword = (string) ($_POST['profile_password'] ?? '');

    if ($memberId < 1) {
        if ($profileToken === '') {
            if ($profileUsername === '' || $profilePassword === '') {
                http_response_code(401);
                echo json_encode([
                    'ok' => false,
                    'message' => 'Please log in again before completing contact details. The contact form token was missing.',
                ]);
                exit;
            }

            $pdo = get_database();
            ensure_members_table($pdo);

            $statement = $pdo->prepare(
                'SELECT id, username, first_name, last_name, membership_type, password_hash, email_verified_at
                 FROM members
                 WHERE username = :username
                 LIMIT 1'
            );
            $statement->execute(['username' => $profileUsername]);
            $member = $statement->fetch();

            if (!$member || !$member['email_verified_at'] || !$member['password_hash'] || !password_verify($profilePassword, $member['password_hash'])) {
                http_response_code(401);
                echo json_encode([
                    'ok' => false,
                    'message' => 'Please log in again before completing contact details. The login confirmation was not accepted.',
                ]);
                exit;
            }
        } else {
            $pdo = get_database();
            ensure_members_table($pdo);

            $tokenHash = hash('sha256', $profileToken);
            $statement = $pdo->prepare(
                'SELECT id, username, first_name, last_name, membership_type
                 FROM members
                 WHERE profile_completion_token_hash = :token_hash
                 LIMIT 1'
            );
            $statement->execute(['token_hash' => $tokenHash]);
            $member = $statement->fetch();

            if (!$member) {
                http_response_code(401);
                echo json_encode([
                    'ok' => false,
                    'message' => 'Please log in again before completing contact details. The contact form token was not accepted.',
                ]);
                exit;
            }
        }

        $memberId = (int) $member['id'];
    }

    $parentName = trim((string) ($_POST['parent_name'] ?? ''));
    $parentText = trim((string) ($_POST['parent_text'] ?? ''));
    $playerAge = (int) ($_POST['player_age'] ?? 0);
    $playerText = trim((string) ($_POST['player_text'] ?? ''));

    if ($parentName === '' || $parentText === '' || $playerAge < 1 || $playerAge > 18) {
        $currentYear = date('Y');
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => "Please enter parent name, parent text phone, and the player's age as of August 31, {$currentYear}.",
        ]);
        exit;
    }

    if ($playerAge > 12 && $playerText === '') {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Please enter the player text phone because the player is over 12.',
        ]);
        exit;
    }

    if ($playerAge <= 12) {
        $playerText = '';
    }

    if (!isset($pdo)) {
        $pdo = get_database();
    }
    ensure_members_table($pdo);

    $statement = $pdo->prepare(
        'UPDATE members
         SET parent_name = :parent_name,
             parent_text = :parent_text,
             player_age = :player_age,
             player_text = :player_text,
             profile_completion_token_hash = NULL
         WHERE id = :id'
    );
    $statement->execute([
        'parent_name' => $parentName,
        'parent_text' => $parentText,
        'player_age' => $playerAge,
        'player_text' => $playerText === '' ? null : $playerText,
        'id' => $memberId,
    ]);

    $_SESSION['member_id'] = $memberId;

    if (!isset($member) || empty($member['username'])) {
        $memberStatement = $pdo->prepare(
            'SELECT id, username, first_name, last_name, membership_type
             FROM members
             WHERE id = :id
             LIMIT 1'
        );
        $memberStatement->execute(['id' => $memberId]);
        $member = $memberStatement->fetch();
    }

    $jwtTtl = get_member_jwt_ttl_for_mode((string) ($_POST['session_mode'] ?? 'site'));

    echo json_encode([
        'ok' => true,
        'message' => 'Contact details saved. You are logged in.',
        'token' => $member ? create_member_jwt($member, $jwtTtl) : null,
        'expiresIn' => $jwtTtl,
    ]);
} catch (Throwable $error) {
    error_log('Profile setup error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The profile service is not available right now.',
    ]);
}

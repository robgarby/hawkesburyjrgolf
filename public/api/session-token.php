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
header('Access-Control-Allow-Headers: Content-Type, Authorization');
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
    $token = get_bearer_token();
    $payload = $token === '' ? null : verify_member_jwt($token);
    $memberId = (int) ($payload['sub'] ?? 0);

    if ($memberId < 1) {
        http_response_code(401);
        echo json_encode([
            'ok' => false,
            'message' => 'Your login has expired. Please log in again.',
        ]);
        exit;
    }

    $pdo = get_database();
    run_schema_setup('Session token service', static function () use ($pdo): void {
        ensure_members_table($pdo);
    });

    $statement = $pdo->prepare(
        'SELECT id, is_active, username, first_name, last_name, membership_type
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch();

    if (!$member || !(bool) $member['is_active']) {
        http_response_code(401);
        echo json_encode([
            'ok' => false,
            'message' => 'Your login has expired. Please log in again.',
        ]);
        exit;
    }

    $mode = (string) ($_POST['session_mode'] ?? 'site');
    $jwtTtl = get_member_jwt_ttl_for_mode($mode);

    echo json_encode([
        'ok' => true,
        'token' => create_member_jwt($member, $jwtTtl),
        'expiresIn' => $jwtTtl,
        'mode' => $jwtTtl === HAWKJR_JWT_APP_TTL_SECONDS ? 'app' : 'site',
    ]);
} catch (Throwable $error) {
    error_log('Session token refresh error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The session service is not available right now.',
    ]);
}

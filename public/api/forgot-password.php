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
require_once __DIR__ . '/mail.php';

$successMessage = 'If that parent email is connected to an account, a password reset email has been sent. Please check your inbox and spam, junk, and trash folders.';

try {
    $pdo = get_database();
    ensure_members_table($pdo);

    $parentEmail = trim((string) ($_POST['parent_email'] ?? ''));

    if (!filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Please enter the parent email used to create the account.',
        ]);
        exit;
    }

    $statement = $pdo->prepare(
        'SELECT id, first_name, username, parent_email
         FROM members
         WHERE parent_email = :parent_email
         ORDER BY id DESC'
    );
    $statement->execute(['parent_email' => $parentEmail]);
    $members = $statement->fetchAll();

    if (!$members) {
        echo json_encode([
            'ok' => true,
            'message' => $successMessage,
        ]);
        exit;
    }

    $links = [];
    $update = $pdo->prepare(
        'UPDATE members
         SET password_reset_token_hash = :token_hash,
             password_reset_sent_at = NOW()
         WHERE id = :id'
    );

    foreach ($members as $member) {
        $resetToken = bin2hex(random_bytes(32));
        $resetTokenHash = hash('sha256', $resetToken);
        $update->execute([
            'token_hash' => $resetTokenHash,
            'id' => (int) $member['id'],
        ]);

        $juniorName = trim((string) ($member['first_name'] ?? ''));
        $username = trim((string) ($member['username'] ?? ''));
        $label = $juniorName === '' ? $username : "{$juniorName} ({$username})";
        $resetUrl = 'https://www.hawkesburyjrgolf.ca/api/reset-password.php?token=' . urlencode($resetToken);
        $links[] = "- {$label}: {$resetUrl}";
    }

    $subject = 'Reset your Hawkesbury Junior Golf password';
    $message = "Hi,\n\nWe received a request to reset the password for your Hawkesbury Junior Golf account.\n\nUse the link below to create a new password. This link expires in 2 hours:\n" . implode("\n", $links) . "\n\nIf you did not ask for a password reset, you can ignore this email.\n\nIf you do not see this email in your inbox, please check your spam, junk, and trash folders.\n\nThank you,\nHawkesbury Junior Golf";

    send_smtp_mail($parentEmail, $subject, $message);

    echo json_encode([
        'ok' => true,
        'message' => $successMessage,
    ]);
} catch (Throwable $error) {
    error_log('Forgot password error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The password reset service is not available right now. If you are having problems, email info@hawkesburyjrgolf.ca.',
    ]);
}

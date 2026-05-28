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

try {
    $pdo = get_database();
    run_schema_setup('Resend verification service', static function () use ($pdo): void {
        ensure_members_table($pdo);
    });

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
        'SELECT id, first_name, parent_email, email_verified_at
         FROM members
         WHERE parent_email = :parent_email
         ORDER BY id DESC
         LIMIT 1'
    );
    $statement->execute(['parent_email' => $parentEmail]);
    $member = $statement->fetch();

    if (!$member) {
        echo json_encode([
            'ok' => true,
            'message' => 'If an unverified account uses that parent email, a new verification email has been sent. Because the website is new, please check spam or junk if it is not in the inbox.',
        ]);
        exit;
    }

    if ($member['email_verified_at']) {
        echo json_encode([
            'ok' => true,
            'message' => 'That parent email is already verified. You can log in.',
        ]);
        exit;
    }

    $verificationToken = bin2hex(random_bytes(32));
    $verificationTokenHash = hash('sha256', $verificationToken);
    $update = $pdo->prepare(
        'UPDATE members
         SET email_verification_token_hash = :token_hash,
             email_verification_sent_at = NOW()
         WHERE id = :id'
    );
    $update->execute([
        'token_hash' => $verificationTokenHash,
        'id' => (int) $member['id'],
    ]);

    $verificationUrl = 'https://www.hawkesburyjrgolf.ca/api/verify-email.php?token=' . urlencode($verificationToken);
    $firstName = trim((string) ($member['first_name'] ?? ''));
    $greeting = $firstName === '' ? 'Hi' : "Hi {$firstName}";
    $subject = 'Verify your Hawkesbury Junior Golf account';
    $message = "{$greeting},\n\nHere is a new parent email verification link for your Hawkesbury Junior Golf account:\n{$verificationUrl}\n\nAfter you click the verification link, it will send you back to the Log in page.\n\nImportant: because the Hawkesbury Junior Golf website is new, this email will probably be in your spam or junk folder. Please check spam, junk, and trash if it is not in your inbox. If you are still having problems, email info@hawkesburyjrgolf.ca.\n\nThank you,\nHawkesbury Junior Golf";

    send_smtp_mail($parentEmail, $subject, $message);

    echo json_encode([
        'ok' => true,
        'message' => 'A new verification email has been sent. Because the website is new, it will probably be in spam or junk if it is not in the inbox. If you still have problems, email info@hawkesburyjrgolf.ca.',
    ]);
} catch (Throwable $error) {
    error_log('Resend verification error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The verification email service is not available right now. If you are having problems, email info@hawkesburyjrgolf.ca.',
    ]);
}

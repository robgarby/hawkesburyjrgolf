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
    run_schema_setup('Register service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_points_table($pdo);
    });

    $firstName = trim((string) ($_POST['first_name'] ?? ''));
    $lastName = trim((string) ($_POST['last_name'] ?? ''));
    $parentEmail = trim((string) ($_POST['parent_email'] ?? ''));
    $membershipType = strtoupper(trim((string) ($_POST['membership_type'] ?? 'COMMUNITY')));
    $username = normalize_username((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if ($firstName === '' || $lastName === '' || $parentEmail === '' || $username === '' || $password === '') {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Please complete all account fields.',
        ]);
        exit;
    }

    if (!filter_var($parentEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Please enter a valid parent email address.',
        ]);
        exit;
    }

    $membershipType = in_array($membershipType, ['CUP', 'COMMUNITY'], true) ? $membershipType : 'COMMUNITY';

    if (!is_valid_username($username)) {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Usernames must be 3 to 40 characters and may use letters, numbers, dots, underscores, and hyphens.',
        ]);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(422);
        echo json_encode([
            'ok' => false,
            'message' => 'Passwords must be at least 8 characters.',
        ]);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $verificationToken = bin2hex(random_bytes(32));
    $verificationTokenHash = hash('sha256', $verificationToken);
    $statement = $pdo->prepare(
        'INSERT INTO members (
            membership_type,
            first_name,
            last_name,
            username,
            password_hash,
            parent_email,
            email_verification_token_hash,
            email_verification_sent_at
        )
         VALUES (
            :membership_type,
            :first_name,
            :last_name,
            :username,
            :password_hash,
            :parent_email,
            :email_verification_token_hash,
            NOW()
        )'
    );
    $statement->execute([
        'membership_type' => $membershipType,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'username' => $username,
        'password_hash' => $passwordHash,
        'parent_email' => $parentEmail,
        'email_verification_token_hash' => $verificationTokenHash,
    ]);
    $memberId = (int) $pdo->lastInsertId();
    add_welcome_points_for_member($pdo, $memberId);

    $verificationUrl = 'https://www.hawkesburyjrgolf.ca/api/verify-email.php?token=' . urlencode($verificationToken);
    $subject = 'Verify your Hawkesbury Junior Golf account';
    $message = "Hi {$firstName},\n\nPlease verify your parent email before logging in:\n{$verificationUrl}\n\nAfter you click the verification link, it will send you back to the Log in page.\n\nImportant: because the Hawkesbury Junior Golf website is new, this email will probably be in your spam or junk folder. Please check spam, junk, and trash if it is not in your inbox.\n\nThank you,\nHawkesbury Junior Golf";
    send_smtp_mail($parentEmail, $subject, $message);

    http_response_code(201);
    echo json_encode([
        'ok' => true,
        'message' => 'YOUR ACCOUNT WAS CREATED. Next step: verify the account before logging in. Check the parent email for the verification link, and please check spam, junk, and trash if it is not in the inbox. The verification link will send you back to the Log in page.',
    ]);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        http_response_code(409);
        echo json_encode([
            'ok' => false,
            'message' => 'That username is already taken. Please choose another username.',
        ]);
        exit;
    }

    error_log('Registration database error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The account service is not available right now.',
    ]);
} catch (Throwable $error) {
    error_log('Registration setup error: ' . $error->getMessage());

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The account service is not available right now.',
    ]);
}

<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$token = (string) ($_GET['token'] ?? '');

if ($token === '') {
    http_response_code(400);
    echo 'This verification link is missing its token.';
    exit;
}

try {
    $pdo = get_database();
    ensure_members_table($pdo);

    $tokenHash = hash('sha256', $token);
    $statement = $pdo->prepare(
        'SELECT id, email_verified_at
         FROM members
         WHERE email_verification_token_hash = :token_hash
         LIMIT 1'
    );
    $statement->execute(['token_hash' => $tokenHash]);
    $member = $statement->fetch();

    if (!$member) {
        http_response_code(404);
        echo 'This verification link is invalid or has already been used.';
        exit;
    }

    if (!$member['email_verified_at']) {
        $update = $pdo->prepare(
            'UPDATE members
             SET email_verified_at = NOW(),
                 email_verification_token_hash = NULL
             WHERE id = :id'
        );
        $update->execute(['id' => (int) $member['id']]);
    }

    header('Location: https://www.hawkesburyjrgolf.ca/#login');
    exit;
} catch (Throwable $error) {
    error_log('Email verification error: ' . $error->getMessage());

    http_response_code(500);
    echo 'The verification service is not available right now.';
}

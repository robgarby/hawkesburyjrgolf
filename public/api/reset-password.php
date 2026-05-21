<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function render_reset_page(string $token, string $message = '', bool $isError = false): void
{
    $safeToken = htmlspecialchars($token, ENT_QUOTES, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $messageClass = $isError ? 'status error' : 'status success';
    $loginUrl = 'https://www.hawkesburyjrgolf.ca/#login';

    echo <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Create a New Password | Hawkesbury Junior Golf</title>
  <style>
    :root { color: #14231d; background: #fffdf6; font: 16px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100svh; display: grid; place-items: center; padding: 24px; background: linear-gradient(180deg, #d9edf799, transparent 360px), #fffdf6; }
    main { width: min(520px, 100%); border: 1px solid #14231d24; background: #fff; border-radius: 8px; box-shadow: 0 24px 70px #14231d29; padding: clamp(26px, 5vw, 42px); }
    h1 { color: #0f3527; margin: 0 0 12px; font-size: clamp(1.7rem, 5vw, 2.4rem); line-height: 1.1; }
    p { margin: 0 0 18px; color: #64736b; font-weight: 700; }
    label { color: #0f3527; display: grid; gap: 7px; font-weight: 800; margin-bottom: 18px; }
    input { border: 1px solid #14231d24; background: #fffdf6; width: 100%; min-height: 50px; color: #14231d; font: inherit; border-radius: 8px; padding: 12px 14px; }
    input:focus { border-color: #e1b851; outline: 3px solid #e1b85159; }
    button, a { border: 0; border-radius: 999px; min-height: 50px; padding: 12px 20px; background: #17583b; color: #fff; cursor: pointer; font: inherit; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
    button:hover, a:hover { background: #0f3527; }
    .status { border-left: 4px solid #e1b851; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; }
    .success { background: #dfeeda; color: #17583b; }
    .error { background: #f8e1dc; color: #9f2f24; }
  </style>
</head>
<body>
  <main>
    <h1>Create a new password</h1>
    <p>Enter a new password for your Hawkesbury Junior Golf account.</p>
HTML;

    if ($safeMessage !== '') {
        echo "<p class=\"{$messageClass}\">{$safeMessage}</p>";
    }

    if ($token !== '') {
        echo <<<HTML
    <form method="post">
      <input type="hidden" name="token" value="{$safeToken}">
      <label>
        <span>New password</span>
        <input type="password" name="password" autocomplete="new-password" minlength="8" required>
      </label>
      <label>
        <span>Confirm new password</span>
        <input type="password" name="password_confirm" autocomplete="new-password" minlength="8" required>
      </label>
      <button type="submit">Save new password</button>
    </form>
HTML;
    } elseif (!$isError) {
        echo "<a href=\"{$loginUrl}\">Return to login</a>";
    }

    echo <<<HTML
  </main>
</body>
</html>
HTML;
}

try {
    $pdo = get_database();
    ensure_members_table($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $token = (string) ($_GET['token'] ?? '');

        if ($token === '') {
            http_response_code(400);
            render_reset_page('', 'This password reset link is missing its token.', true);
            exit;
        }

        render_reset_page($token);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo 'Method not allowed.';
        exit;
    }

    $token = (string) ($_POST['token'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    $passwordConfirm = (string) ($_POST['password_confirm'] ?? '');

    if ($token === '') {
        http_response_code(400);
        render_reset_page('', 'This password reset link is missing its token.', true);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(422);
        render_reset_page($token, 'Passwords must be at least 8 characters.', true);
        exit;
    }

    if ($password !== $passwordConfirm) {
        http_response_code(422);
        render_reset_page($token, 'The password confirmation does not match.', true);
        exit;
    }

    $tokenHash = hash('sha256', $token);
    $statement = $pdo->prepare(
        'SELECT id
         FROM members
         WHERE password_reset_token_hash = :token_hash
           AND password_reset_sent_at >= (NOW() - INTERVAL 2 HOUR)
         LIMIT 1'
    );
    $statement->execute(['token_hash' => $tokenHash]);
    $member = $statement->fetch();

    if (!$member) {
        http_response_code(404);
        render_reset_page('', 'This password reset link is invalid, expired, or has already been used.', true);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $update = $pdo->prepare(
        'UPDATE members
         SET password_hash = :password_hash,
             password_reset_token_hash = NULL,
             password_reset_sent_at = NULL
         WHERE id = :id'
    );
    $update->execute([
        'password_hash' => $passwordHash,
        'id' => (int) $member['id'],
    ]);

    render_reset_page('', 'Your password has been updated. You can now return to the login page and sign in.', false);
} catch (Throwable $error) {
    error_log('Password reset error: ' . $error->getMessage());

    http_response_code(500);
    render_reset_page('', 'The password reset service is not available right now.', true);
}

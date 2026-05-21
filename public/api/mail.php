<?php
declare(strict_types=1);

function get_smtp_password(): string
{
    $password = getenv('HAWKJR_SMTP_PASSWORD');

    if ($password !== false && $password !== '') {
        return $password;
    }

    $configPath = __DIR__ . '/smtp-secret.php';

    if (is_file($configPath)) {
        $config = require $configPath;

        if (is_array($config) && !empty($config['password'])) {
            return (string) $config['password'];
        }
    }

    return '';
}

function smtp_expect($socket, array $codes): string
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;

        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }

    $code = (int) substr($response, 0, 3);

    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($response));
    }

    return $response;
}

function smtp_command($socket, string $command, array $codes): string
{
    fwrite($socket, $command . "\r\n");

    return smtp_expect($socket, $codes);
}

function send_smtp_mail(string $to, string $subject, string $body): void
{
    send_phpmailer_mail($to, $subject, $body);
}

function send_phpmailer_mail(string $to, string $subject, string $body): void
{
    $host = 'hawkesburyjrgolf.ca';
    $port = 465;
    $username = 'info@hawkesburyjrgolf.ca';
    $password = get_smtp_password();
    $from = 'info@hawkesburyjrgolf.ca';
    $fromName = 'Hawkesbury Junior Golf';
    $replyTo = 'info@hawkesburyjrgolf.ca';
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/');

    if ($password === '') {
        throw new RuntimeException('SMTP password is not configured.');
    }

    $autoloadPaths = [
        __DIR__ . '/vendor/autoload.php',
        dirname(__DIR__) . '/vendor/autoload.php',
        dirname(__DIR__, 2) . '/vendor/autoload.php',
        $documentRoot . '/vendor/autoload.php',
        $documentRoot . '/../vendor/autoload.php',
    ];

    foreach ($autoloadPaths as $autoloadPath) {
        if (is_file($autoloadPath)) {
            require_once $autoloadPath;
            break;
        }
    }

    if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        $mailerClass = 'PHPMailer\\PHPMailer\\PHPMailer';
        $smtpClass = 'PHPMailer\\PHPMailer\\SMTP';
        $mailer = new $mailerClass(true);

        $mailer->isSMTP();
        $mailer->Host = $host;
        $mailer->SMTPAuth = true;
        $mailer->Username = $username;
        $mailer->Password = $password;
        $mailer->SMTPSecure = defined($smtpClass . '::ENCRYPTION_SMTPS')
            ? constant($smtpClass . '::ENCRYPTION_SMTPS')
            : 'ssl';
        $mailer->Port = $port;
        $mailer->CharSet = 'UTF-8';

        $mailer->setFrom($from, $fromName);
        $mailer->addReplyTo($replyTo);
        $mailer->addAddress($to);
        $mailer->Subject = $subject;
        $mailer->Body = $body;
        $mailer->AltBody = $body;
        $mailer->send();

        return;
    }

    $phpmailerPaths = [
        __DIR__ . '/PHPMailer/src/PHPMailer.php',
        __DIR__ . '/PHPMailer/src/SMTP.php',
        __DIR__ . '/PHPMailer/src/Exception.php',
        dirname(__DIR__) . '/PHPMailer/src/PHPMailer.php',
        dirname(__DIR__) . '/PHPMailer/src/SMTP.php',
        dirname(__DIR__) . '/PHPMailer/src/Exception.php',
        $documentRoot . '/PHPMailer/src/PHPMailer.php',
        $documentRoot . '/PHPMailer/src/SMTP.php',
        $documentRoot . '/PHPMailer/src/Exception.php',
    ];

    foreach ($phpmailerPaths as $phpmailerPath) {
        if (is_file($phpmailerPath)) {
            require_once $phpmailerPath;
        }
    }

    if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        $mailerClass = 'PHPMailer\\PHPMailer\\PHPMailer';
        $smtpClass = 'PHPMailer\\PHPMailer\\SMTP';
        $mailer = new $mailerClass(true);

        $mailer->isSMTP();
        $mailer->Host = $host;
        $mailer->SMTPAuth = true;
        $mailer->Username = $username;
        $mailer->Password = $password;
        $mailer->SMTPSecure = defined($smtpClass . '::ENCRYPTION_SMTPS')
            ? constant($smtpClass . '::ENCRYPTION_SMTPS')
            : 'ssl';
        $mailer->Port = $port;
        $mailer->CharSet = 'UTF-8';

        $mailer->setFrom($from, $fromName);
        $mailer->addReplyTo($replyTo);
        $mailer->addAddress($to);
        $mailer->Subject = $subject;
        $mailer->Body = $body;
        $mailer->AltBody = $body;
        $mailer->send();

        return;
    }

    $socket = fsockopen('ssl://' . $host, $port, $errno, $errstr, 20);

    if (!$socket) {
        throw new RuntimeException("Could not connect to SMTP server: {$errstr}");
    }

    stream_set_timeout($socket, 20);

    try {
        smtp_expect($socket, [220]);
        smtp_command($socket, 'EHLO hawkesburyjrgolf.ca', [250]);
        smtp_command($socket, 'AUTH LOGIN', [334]);
        smtp_command($socket, base64_encode($username), [334]);
        smtp_command($socket, base64_encode($password), [235]);
        smtp_command($socket, 'MAIL FROM:<' . $from . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $headers = [
            'From: ' . $fromName . ' <' . $from . '>',
            'Reply-To: ' . $replyTo,
            'To: <' . $to . '>',
            'Subject: ' . $subject,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];
        $message = implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n.", "\n..", $body);

        fwrite($socket, $message . "\r\n.\r\n");
        smtp_expect($socket, [250]);
        smtp_command($socket, 'QUIT', [221]);
    } finally {
        fclose($socket);
    }
}

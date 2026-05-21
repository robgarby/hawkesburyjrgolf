<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/mail.php';

$autoloadPaths = [
    __DIR__ . '/vendor/autoload.php',
    dirname(__DIR__) . '/vendor/autoload.php',
    dirname(__DIR__, 2) . '/vendor/autoload.php',
];

foreach ($autoloadPaths as $autoloadPath) {
    if (is_file($autoloadPath)) {
        require_once $autoloadPath;
        break;
    }
}

echo json_encode([
    'ok' => true,
    'secretFileExists' => is_file(__DIR__ . '/smtp-secret.php'),
    'passwordConfigured' => get_smtp_password() !== '',
    'phpmailerAvailable' => class_exists('PHPMailer\\PHPMailer\\PHPMailer'),
    'message' => 'SMTP check complete. No password value is shown here.',
]);

<?php
declare(strict_types=1);

const INBOUND_TEXT_FORWARD_TO = '+16138803625';

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/textme.php';

function twiml_response(string $message = ''): void
{
    header('Content-Type: text/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?><Response>';

    if ($message !== '') {
        echo '<Message>' . htmlspecialchars($message, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</Message>';
    }

    echo '</Response>';
    exit;
}

function inbound_text_value(string $key): string
{
    return trim((string) ($_POST[$key] ?? $_GET[$key] ?? ''));
}

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'POST'], true)) {
    http_response_code(405);
    twiml_response();
}

try {
    $from = inbound_text_value('From');
    $to = inbound_text_value('To');
    $body = inbound_text_value('Body');
    $messageSid = inbound_text_value('MessageSid') ?: inbound_text_value('SmsSid');
    $accountSid = inbound_text_value('AccountSid');
    $fromCity = inbound_text_value('FromCity');
    $fromState = inbound_text_value('FromState');
    $fromCountry = inbound_text_value('FromCountry');

    if ($from === '' && $body === '') {
        twiml_response();
    }

    $pdo = get_database();
    run_schema_setup('Receive text service', static function () use ($pdo): void {
        ensure_received_texts_table($pdo);
    });

    $statement = $pdo->prepare(
        'INSERT INTO receivedTexts
            (from_number, to_number, message_body, twilio_message_sid, account_sid, from_city, from_state, from_country, forwarded_to)
         VALUES
            (:from_number, :to_number, :message_body, :twilio_message_sid, :account_sid, :from_city, :from_state, :from_country, :forwarded_to)'
    );
    $statement->execute([
        'from_number' => $from,
        'to_number' => $to,
        'message_body' => $body,
        'twilio_message_sid' => $messageSid === '' ? null : $messageSid,
        'account_sid' => $accountSid === '' ? null : $accountSid,
        'from_city' => $fromCity === '' ? null : $fromCity,
        'from_state' => $fromState === '' ? null : $fromState,
        'from_country' => $fromCountry === '' ? null : $fromCountry,
        'forwarded_to' => INBOUND_TEXT_FORWARD_TO,
    ]);
    $receivedTextId = (int) $pdo->lastInsertId();

    $forwardBody = trim("Reply from {$from}:\n{$body}");

    try {
        $forwardedSid = send_text_message(INBOUND_TEXT_FORWARD_TO, $forwardBody);
        $update = $pdo->prepare(
            'UPDATE receivedTexts
             SET forwarded_message_sid = :forwarded_message_sid
             WHERE id = :id'
        );
        $update->execute([
            'forwarded_message_sid' => $forwardedSid,
            'id' => $receivedTextId,
        ]);
    } catch (Throwable $forwardError) {
        $update = $pdo->prepare(
            'UPDATE receivedTexts
             SET forward_error = :forward_error
             WHERE id = :id'
        );
        $update->execute([
            'forward_error' => $forwardError->getMessage(),
            'id' => $receivedTextId,
        ]);

        error_log('Inbound text forward error: ' . $forwardError->getMessage());
    }

    twiml_response();
} catch (Throwable $error) {
    error_log('Inbound text webhook error: ' . $error->getMessage());
    twiml_response();
}

<?php
require __DIR__ . '/vendor/autoload.php';

use Twilio\Rest\Client;

$sid = 'YOUR_TWILIO_ACCOUNT_SID';
$token = 'YOUR_TWILIO_AUTH_TOKEN';
$from = '+15555555555'; // Your Twilio phone number
$to = '+15555555555';   // Your real cell number

$client = new Client($sid, $token);

$message = $client->messages->create(
    $to,
    [
        'from' => $from,
        'body' => 'Test message from my website.'
    ]
);

echo 'Message sent. SID: ' . $message->sid;

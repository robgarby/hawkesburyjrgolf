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

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/textme.php';

function send_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function get_member_payload(): array
{
    $token = get_bearer_token();

    if ($token === '') {
        $token = (string) ($_GET['token'] ?? $_POST['token'] ?? '');
    }

    if ($token === '') {
        send_json(401, [
            'ok' => false,
            'message' => 'Please log in before viewing games.',
        ]);
    }

    $payload = verify_member_jwt($token);

    if (!$payload) {
        send_json(401, [
            'ok' => false,
            'message' => 'Your login has expired. Please log in again.',
        ]);
    }

    return $payload;
}

function get_find_game_players(PDO $pdo, int $gameId): array
{
    $statement = $pdo->prepare(
        'SELECT players.member_id, players.created_at, members.first_name, members.last_name, members.username, members.membership_type
         FROM member_find_game_players players
         INNER JOIN members ON members.id = players.member_id
         WHERE players.find_game_id = :game_id
         ORDER BY players.created_at ASC, players.id ASC'
    );
    $statement->execute(['game_id' => $gameId]);

    return array_map(
        static function (array $player): array {
            $name = trim((string) ($player['first_name'] . ' ' . $player['last_name']));

            return [
                'memberId' => (int) $player['member_id'],
                'name' => $name !== '' ? $name : $player['username'],
                'username' => $player['username'],
                'membershipType' => $player['membership_type'],
                'joinedAt' => $player['created_at'],
            ];
        },
        $statement->fetchAll()
    );
}

function get_member_details(PDO $pdo, int $memberId): array
{
    $statement = $pdo->prepare(
        'SELECT membership_type, player_age
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);

    $member = $statement->fetch();

    return [
        'membershipType' => (string) ($member['membership_type'] ?? ''),
        'playerAge' => isset($member['player_age']) ? (int) $member['player_age'] : null,
    ];
}

function get_member_display_name(PDO $pdo, int $memberId): string
{
    $statement = $pdo->prepare(
        'SELECT first_name, last_name, username
         FROM members
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $memberId]);
    $member = $statement->fetch() ?: [];
    $name = trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? '')));

    return $name !== '' ? $name : (string) ($member['username'] ?? 'HJG');
}

function read_path(string $fieldName): string
{
    $path = strtoupper(trim((string) ($_POST[$fieldName] ?? 'EVERYONE')));

    return in_array($path, ['CUP', 'COMMUNITY', 'EVERYONE'], true) ? $path : 'EVERYONE';
}

function path_allows_member(string $path, string $memberType): bool
{
    if ($path === 'EVERYONE') {
        return in_array($memberType, ['CUP', 'COMMUNITY'], true);
    }

    return $memberType === $path;
}

function member_can_post_find_game_path(string $path, string $memberType): bool
{
    if (is_super_admin_type($memberType)) {
        return in_array($path, ['CUP', 'COMMUNITY', 'EVERYONE'], true);
    }

    return path_allows_member($path, $memberType);
}

function member_can_manage_find_game(array $game, int $memberId, string $memberType): bool
{
    return (int) ($game['created_by_member_id'] ?? 0) === $memberId
        || is_super_admin_type($memberType);
}

function age_allows_member(?int $minAge, ?int $maxAge, ?int $playerAge): bool
{
    if ($minAge === null && $maxAge === null) {
        return true;
    }

    if ($playerAge === null || $playerAge < 1) {
        return false;
    }

    if ($minAge !== null && $playerAge < $minAge) {
        return false;
    }

    return $maxAge === null || $playerAge <= $maxAge;
}

function mask_text_number(?string $number): string
{
    $digits = preg_replace('/\D+/', '', (string) $number) ?? '';

    if (strlen($digits) < 4) {
        return '';
    }

    return '***-***-' . substr($digits, -4);
}

function build_find_game_text_preview(
    PDO $pdo,
    int $createdByMemberId,
    string $posterName,
    string $gamePath,
    ?int $minAge,
    ?int $maxAge,
    string $gameDate,
    string $gameTime,
    int $gameHoles,
    string $location,
    string $roundDetails,
    int $spotsOpen
): array {
    if ($spotsOpen < 1) {
        return [
            'dryRun' => true,
            'message' => '',
            'recipients' => [],
        ];
    }

    $message = sprintf(
        "HJG Notice: A new round has been added by %s.\n\nDate: %s\nTime: %s\nHoles: %d\nLocation: %s\nSpots open: %d\nDetails: %s\n\nYou can Add or Join this round in the HJG Website or App.",
        $posterName,
        $gameDate,
        $gameTime,
        $gameHoles,
        $location,
        $spotsOpen,
        $roundDetails
    );

    $statement = $pdo->query(
        "SELECT id, first_name, last_name, username, membership_type, player_age,
                parent_text, player_text, notify_games_player_text, notify_games_parent_text
         FROM members
         WHERE is_active = 1
           AND membership_type IN ('CUP', 'COMMUNITY')
           AND (notify_games_player_text = 1 OR notify_games_parent_text = 1)
         ORDER BY first_name ASC, last_name ASC, username ASC, id ASC"
    );

    $recipients = [];

    foreach ($statement->fetchAll() as $member) {
        $memberId = (int) $member['id'];

        if ($memberId === $createdByMemberId) {
            continue;
        }

        $memberType = (string) ($member['membership_type'] ?? '');
        $playerAge = isset($member['player_age']) ? (int) $member['player_age'] : null;

        if (!path_allows_member($gamePath, $memberType) || !age_allows_member($minAge, $maxAge, $playerAge)) {
            continue;
        }

        $name = trim((string) (($member['first_name'] ?? '') . ' ' . ($member['last_name'] ?? '')));
        $name = $name !== '' ? $name : (string) ($member['username'] ?? 'Member');

        if ((bool) $member['notify_games_player_text'] && trim((string) ($member['player_text'] ?? '')) !== '') {
            $recipients[] = [
                'memberId' => $memberId,
                'name' => $name,
                'recipientType' => 'player',
                'to' => $member['player_text'],
                'phone' => mask_text_number($member['player_text']),
                'message' => $message,
            ];
        }

        if ((bool) $member['notify_games_parent_text'] && trim((string) ($member['parent_text'] ?? '')) !== '') {
            $recipients[] = [
                'memberId' => $memberId,
                'name' => $name,
                'recipientType' => 'parent',
                'to' => $member['parent_text'],
                'phone' => mask_text_number($member['parent_text']),
                'message' => $message,
            ];
        }
    }

    return [
        'dryRun' => true,
        'contextLabel' => 'round',
        'message' => $message,
        'recipients' => $recipients,
    ];
}

function get_find_games(PDO $pdo, int $memberId): array
{
    $memberDetails = get_member_details($pdo, $memberId);
    $playerAge = $memberDetails['playerAge'];
    $memberType = $memberDetails['membershipType'];
    $statement = $pdo->query(
        'SELECT id, created_by_member_id, game_date, game_time, game_holes, spots_open, game_path, min_age, max_age, round_details, location, created_at
         FROM member_find_games
         ORDER BY game_date ASC, game_time ASC, id ASC'
    );
    $today = (new DateTimeImmutable('today'))->format('Y-m-d');
    $games = [];

    foreach ($statement->fetchAll() as $game) {
        if ($game['game_date'] < $today) {
            continue;
        }

        $players = get_find_game_players($pdo, (int) $game['id']);
        $playerCount = count($players);
        $spotsOpen = (int) $game['spots_open'];
        $spotsRemaining = max(0, $spotsOpen - max(0, $playerCount - 1));
        $minAge = $game['min_age'] === null ? null : (int) $game['min_age'];
        $maxAge = $game['max_age'] === null ? null : (int) $game['max_age'];

        $games[] = [
            'id' => (int) $game['id'],
            'createdByMemberId' => (int) $game['created_by_member_id'],
            'gameDate' => $game['game_date'],
            'gameTime' => substr((string) $game['game_time'], 0, 5),
            'gameHoles' => (int) ($game['game_holes'] ?? 9),
            'spotsOpen' => $spotsOpen,
            'spotsRemaining' => $spotsRemaining,
            'gamePath' => $game['game_path'] ?? 'EVERYONE',
            'minAge' => $minAge,
            'maxAge' => $maxAge,
            'isAgeEligible' => age_allows_member($minAge, $maxAge, $playerAge),
            'roundDetails' => $game['round_details'],
            'location' => $game['location'],
            'players' => $players,
            'playerCount' => $playerCount,
            'isJoined' => in_array($memberId, array_column($players, 'memberId'), true),
            'canManage' => member_can_manage_find_game($game, $memberId, $memberType),
            'createdAt' => $game['created_at'],
        ];
    }

    return $games;
}

function send_games_response(PDO $pdo, int $memberId, string $message = '', ?array $textResults = null): void
{
    $payload = [
        'ok' => true,
        'message' => $message,
        'games' => get_find_games($pdo, $memberId),
    ];

    if ($textResults !== null) {
        $payload['textResults'] = $textResults;
    }

    send_json(200, $payload);
}

try {
    $member = get_member_payload();
    $memberId = (int) $member['sub'];
    $pdo = get_database();

    run_schema_setup('Find games service', static function () use ($pdo): void {
        ensure_members_table($pdo);
        ensure_member_find_games_table($pdo);
    });
    $memberDetails = get_member_details($pdo, $memberId);
    $memberType = $memberDetails['membershipType'];
    $playerAge = $memberDetails['playerAge'];

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        send_games_response($pdo, $memberId);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_json(405, [
            'ok' => false,
            'message' => 'Method not allowed.',
        ]);
    }

    $action = (string) ($_POST['action'] ?? 'post_game');

    if ($action === 'join') {
        $gameId = filter_var($_POST['game_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($gameId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid game.',
            ]);
        }

        $gameStatement = $pdo->prepare(
            'SELECT id, game_date, spots_open, game_path, min_age, max_age
             FROM member_find_games
             WHERE id = :id
             LIMIT 1'
        );
        $gameStatement->execute(['id' => (int) $gameId]);
        $game = $gameStatement->fetch();

        if (!$game) {
            send_json(404, [
                'ok' => false,
                'message' => 'Game not found.',
            ]);
        }

        $today = (new DateTimeImmutable('today'))->format('Y-m-d');

        if ($game['game_date'] < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past games cannot be joined.',
            ]);
        }

        if (!path_allows_member((string) ($game['game_path'] ?? 'EVERYONE'), $memberType)) {
            send_json(403, [
                'ok' => false,
                'message' => 'This game is not open to your membership path.',
            ]);
        }

        $minAge = $game['min_age'] === null ? null : (int) $game['min_age'];
        $maxAge = $game['max_age'] === null ? null : (int) $game['max_age'];

        if (!age_allows_member($minAge, $maxAge, $playerAge)) {
            send_json(403, [
                'ok' => false,
                'message' => 'This game is not open to your age group.',
            ]);
        }

        $countStatement = $pdo->prepare(
            'SELECT COUNT(*) AS player_count
             FROM member_find_game_players
             WHERE find_game_id = :game_id'
        );
        $countStatement->execute(['game_id' => (int) $gameId]);
        $playerCount = (int) ($countStatement->fetch()['player_count'] ?? 0);
        $spotsOpen = (int) $game['spots_open'];

        if ($playerCount > 0 && $playerCount - 1 >= $spotsOpen) {
            send_json(422, [
                'ok' => false,
                'message' => 'This game is full.',
            ]);
        }

        $insertPlayer = $pdo->prepare(
            'INSERT IGNORE INTO member_find_game_players (find_game_id, member_id)
             VALUES (:game_id, :member_id)'
        );
        $insertPlayer->execute([
            'game_id' => (int) $gameId,
            'member_id' => $memberId,
        ]);

        send_games_response($pdo, $memberId, 'You are added to the game.');
    }

    if ($action === 'leave') {
        $gameId = filter_var($_POST['game_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($gameId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid game.',
            ]);
        }

        $gameStatement = $pdo->prepare(
            'SELECT id, created_by_member_id, game_date
             FROM member_find_games
             WHERE id = :id
             LIMIT 1'
        );
        $gameStatement->execute(['id' => (int) $gameId]);
        $game = $gameStatement->fetch();

        if (!$game) {
            send_json(404, [
                'ok' => false,
                'message' => 'Game not found.',
            ]);
        }

        if ((int) $game['created_by_member_id'] === $memberId) {
            send_json(422, [
                'ok' => false,
                'message' => 'The poster cannot leave their own game.',
            ]);
        }

        $today = (new DateTimeImmutable('today'))->format('Y-m-d');

        if ($game['game_date'] < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past games cannot be changed.',
            ]);
        }

        $deletePlayer = $pdo->prepare(
            'DELETE FROM member_find_game_players
             WHERE find_game_id = :game_id
             AND member_id = :member_id'
        );
        $deletePlayer->execute([
            'game_id' => (int) $gameId,
            'member_id' => $memberId,
        ]);

        send_games_response($pdo, $memberId, 'You have left the game.');
    }

    if ($action === 'delete_game') {
        $gameId = filter_var($_POST['game_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($gameId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid game.',
            ]);
        }

        $gameStatement = $pdo->prepare(
            'SELECT id, created_by_member_id, game_date
             FROM member_find_games
             WHERE id = :id
             LIMIT 1'
        );
        $gameStatement->execute(['id' => (int) $gameId]);
        $game = $gameStatement->fetch();

        if (!$game) {
            send_json(404, [
                'ok' => false,
                'message' => 'Game not found.',
            ]);
        }

        if (!member_can_manage_find_game($game, $memberId, $memberType)) {
            send_json(403, [
                'ok' => false,
                'message' => 'You can only remove rounds you posted.',
            ]);
        }

        $today = (new DateTimeImmutable('today'))->format('Y-m-d');

        if ($game['game_date'] < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past games cannot be changed.',
            ]);
        }

        $deleteGame = $pdo->prepare(
            'DELETE FROM member_find_games
             WHERE id = :id'
        );
        $deleteGame->execute(['id' => (int) $gameId]);

        send_games_response($pdo, $memberId, 'Game removed.');
    }

    if ($action === 'update_game') {
        $gameId = filter_var($_POST['game_id'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1],
        ]);

        if ($gameId === false) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please choose a valid game.',
            ]);
        }

        $gameStatement = $pdo->prepare(
            'SELECT id, created_by_member_id, game_date
             FROM member_find_games
             WHERE id = :id
             LIMIT 1'
        );
        $gameStatement->execute(['id' => (int) $gameId]);
        $game = $gameStatement->fetch();

        if (!$game) {
            send_json(404, [
                'ok' => false,
                'message' => 'Game not found.',
            ]);
        }

        if (!member_can_manage_find_game($game, $memberId, $memberType)) {
            send_json(403, [
                'ok' => false,
                'message' => 'You can only edit rounds you posted.',
            ]);
        }

        $today = (new DateTimeImmutable('today'))->format('Y-m-d');

        if ($game['game_date'] < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past games cannot be changed.',
            ]);
        }

        $gameDate = trim((string) ($_POST['game_date'] ?? ''));
        $gameTime = trim((string) ($_POST['game_time'] ?? ''));
        $gameHoles = filter_var($_POST['game_holes'] ?? 9, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 9, 'max_range' => 18],
        ]);
        $spotsOpen = filter_var($_POST['spots_open'] ?? null, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 12],
        ]);
        $gamePath = read_path('game_path');
        $minAgeRaw = trim((string) ($_POST['min_age'] ?? ''));
        $maxAgeRaw = trim((string) ($_POST['max_age'] ?? ''));
        $minAge = $minAgeRaw === '' ? null : filter_var($minAgeRaw, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 99],
        ]);
        $maxAge = $maxAgeRaw === '' ? null : filter_var($maxAgeRaw, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 99],
        ]);
        $roundDetails = trim((string) ($_POST['round_details'] ?? ''));
        $location = trim((string) ($_POST['location'] ?? 'Hawkesbury'));

        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $gameDate);
        $dateErrors = DateTimeImmutable::getLastErrors();
        $isValidDate = $date instanceof DateTimeImmutable
            && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
            && $date->format('Y-m-d') === $gameDate;
        $isValidTime = (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $gameTime);

        if (!$isValidDate || !$isValidTime || !in_array($gameHoles, [9, 18], true) || $spotsOpen === false || $roundDetails === '') {
            send_json(422, [
                'ok' => false,
                'message' => 'Please enter a valid date, time, holes, open spots, and round details.',
            ]);
        }

        if ($gameDate < $today) {
            send_json(422, [
                'ok' => false,
                'message' => 'Past games cannot be changed.',
            ]);
        }

        if ($minAge === false || $maxAge === false || ($minAge !== null && $maxAge !== null && $minAge > $maxAge)) {
            send_json(422, [
                'ok' => false,
                'message' => 'Please enter a valid age range.',
            ]);
        }

        if ($location === '') {
            $location = 'Hawkesbury';
        }

        if (!member_can_post_find_game_path($gamePath, $memberType)) {
            send_json(403, [
                'ok' => false,
                'message' => 'You can only post games for your own membership path or both paths.',
            ]);
        }

        $countStatement = $pdo->prepare(
            'SELECT COUNT(*) AS player_count
             FROM member_find_game_players
             WHERE find_game_id = :game_id'
        );
        $countStatement->execute(['game_id' => (int) $gameId]);
        $playerCount = (int) ($countStatement->fetch()['player_count'] ?? 0);

        if ($playerCount > 0 && $playerCount - 1 > (int) $spotsOpen) {
            send_json(422, [
                'ok' => false,
                'message' => 'Open spots cannot be lower than the players already added.',
            ]);
        }

        $update = $pdo->prepare(
            'UPDATE member_find_games
             SET game_date = :game_date,
                 game_time = :game_time,
                 game_holes = :game_holes,
                 spots_open = :spots_open,
                 game_path = :game_path,
                 min_age = :min_age,
                 max_age = :max_age,
                 round_details = :round_details,
                 location = :location
             WHERE id = :id'
        );
        $update->execute([
            'game_date' => $gameDate,
            'game_time' => $gameTime,
            'game_holes' => (int) $gameHoles,
            'spots_open' => (int) $spotsOpen,
            'game_path' => $gamePath,
            'min_age' => $minAge,
            'max_age' => $maxAge,
            'round_details' => $roundDetails,
            'location' => $location,
            'id' => (int) $gameId,
        ]);

        send_games_response($pdo, $memberId, 'Game updated.');
    }

    if ($action !== 'post_game') {
        send_json(422, [
            'ok' => false,
            'message' => 'Please choose a valid game action.',
        ]);
    }

    $shouldNotifyOthers = isset($_POST['notify_others']);
    $gameDate = trim((string) ($_POST['game_date'] ?? ''));
    $gameTime = trim((string) ($_POST['game_time'] ?? ''));
    $gameHoles = filter_var($_POST['game_holes'] ?? 9, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 9, 'max_range' => 18],
    ]);
    $spotsOpen = filter_var($_POST['spots_open'] ?? null, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 12],
    ]);
    $gamePath = read_path('game_path');
    $minAgeRaw = trim((string) ($_POST['min_age'] ?? ''));
    $maxAgeRaw = trim((string) ($_POST['max_age'] ?? ''));
    $minAge = $minAgeRaw === '' ? null : filter_var($minAgeRaw, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 99],
    ]);
    $maxAge = $maxAgeRaw === '' ? null : filter_var($maxAgeRaw, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 99],
    ]);
    $roundDetails = trim((string) ($_POST['round_details'] ?? ''));
    $location = trim((string) ($_POST['location'] ?? 'Hawkesbury'));

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $gameDate);
    $dateErrors = DateTimeImmutable::getLastErrors();
    $isValidDate = $date instanceof DateTimeImmutable
        && ($dateErrors === false || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0))
        && $date->format('Y-m-d') === $gameDate;
    $isValidTime = (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $gameTime);

    if (!$isValidDate || !$isValidTime || !in_array($gameHoles, [9, 18], true) || $spotsOpen === false || $roundDetails === '') {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a valid date, time, holes, open spots, and round details.',
        ]);
    }

    if ($minAge === false || $maxAge === false || ($minAge !== null && $maxAge !== null && $minAge > $maxAge)) {
        send_json(422, [
            'ok' => false,
            'message' => 'Please enter a valid age range.',
        ]);
    }

    if ($location === '') {
        $location = 'Hawkesbury';
    }

    if (!member_can_post_find_game_path($gamePath, $memberType)) {
        send_json(403, [
            'ok' => false,
            'message' => 'You can only post games for your own membership path or both paths.',
        ]);
    }

    $pdo->beginTransaction();

    $insert = $pdo->prepare(
        'INSERT INTO member_find_games
            (created_by_member_id, game_date, game_time, game_holes, spots_open, game_path, min_age, max_age, round_details, location)
         VALUES
            (:created_by_member_id, :game_date, :game_time, :game_holes, :spots_open, :game_path, :min_age, :max_age, :round_details, :location)'
    );
    $insert->execute([
        'created_by_member_id' => $memberId,
        'game_date' => $gameDate,
        'game_time' => $gameTime,
        'game_holes' => (int) $gameHoles,
        'spots_open' => (int) $spotsOpen,
        'game_path' => $gamePath,
        'min_age' => $minAge,
        'max_age' => $maxAge,
        'round_details' => $roundDetails,
        'location' => $location,
    ]);

    $gameId = (int) $pdo->lastInsertId();
    $insertPlayer = $pdo->prepare(
        'INSERT INTO member_find_game_players (find_game_id, member_id)
         VALUES (:game_id, :member_id)'
    );
    $insertPlayer->execute([
        'game_id' => $gameId,
        'member_id' => $memberId,
    ]);

    $pdo->commit();

    $textResults = null;

    if ($shouldNotifyOthers) {
        $textNotice = build_find_game_text_preview(
            $pdo,
            $memberId,
            get_member_display_name($pdo, $memberId),
            $gamePath,
            $minAge,
            $maxAge,
            $gameDate,
            $gameTime,
            (int) $gameHoles,
            $location,
            $roundDetails,
            (int) $spotsOpen
        );
        $textResults = send_text_messages($textNotice['recipients'], $textNotice['message']);
    }

    send_games_response($pdo, $memberId, 'Game posted.', $textResults);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log('Find games service error: ' . $error->getMessage());

    send_json(500, [
        'ok' => false,
        'message' => 'The find a game service is not available right now.',
    ]);
}

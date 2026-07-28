<?php
require_owner();

if ($method === 'GET') {
    json_response(get_settings());
}

if ($method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('
        INSERT INTO Setting (`key`, `value`) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)
    ');
    foreach ($body as $key => $value) {
        $stmt->execute([$key, (string) $value]);
    }
    json_response(get_settings());
}

<?php

if ($method === 'POST') {
    $body = request_body();
    $name = $body['name'] ?? '';
    $email = $body['email'] ?? '';
    $message = $body['message'] ?? '';

    if (!is_string($name) || trim($name) === '' ||
        !is_string($email) || trim($email) === '' ||
        !is_string($message) || trim($message) === ''
    ) {
        json_response(['error' => 'Invalid request'], 400);
    }

    $stmt = $pdo->prepare('
        INSERT INTO ContactSubmission (name, email, phone, message, `read`)
        VALUES (?, ?, ?, ?, 0)
    ');
    $stmt->execute([$name, $email, $body['phone'] ?? null, $message]);
    json_response(['ok' => true]);
}

if ($method === 'GET') {
    require_admin();
    $submissions = $pdo->query('SELECT * FROM ContactSubmission ORDER BY createdAt DESC')->fetchAll();
    json_response($submissions);
}

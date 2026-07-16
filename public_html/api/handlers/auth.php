<?php
// $method, $sub, $pdo available from api/index.php

if ($sub === 'login' && $method === 'POST') {
    $body = request_body();
    $email = $body['email'] ?? null;
    $password = $body['password'] ?? null;

    if (!is_string($email) || !is_string($password)) {
        json_response(['error' => 'Invalid request'], 400);
    }

    $user = attempt_login($email, $password);
    if (!$user) {
        json_response(['error' => 'Invalid credentials'], 401);
    }

    login_session($user);
    json_response(['ok' => true]);
}

if ($sub === 'logout' && $method === 'POST') {
    logout_session();
    json_response(['ok' => true]);
}

if ($sub === 'me' && $method === 'GET') {
    $admin = current_admin();
    if (!$admin) {
        json_response(['error' => 'Unauthorized'], 401);
    }
    json_response($admin);
}

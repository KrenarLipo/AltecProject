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

if ($sub === 'forgot-password' && $method === 'POST') {
    $body = request_body();
    $email = $body['email'] ?? null;

    if (is_string($email) && trim($email) !== '') {
        request_password_reset(trim($email));
    }

    // Same response whether or not the email exists, so this endpoint can't be used to enumerate admin accounts.
    json_response(['ok' => true]);
}

if ($sub === 'reset-password' && $method === 'POST') {
    $body = request_body();
    $token = $body['token'] ?? null;
    $password = $body['password'] ?? null;

    if (!is_string($token) || !is_string($password) || strlen($password) < 8) {
        json_response(['error' => 'Invalid request'], 400);
    }

    if (!reset_password_with_token($token, $password)) {
        json_response(['error' => 'This reset link is invalid or has expired'], 400);
    }

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

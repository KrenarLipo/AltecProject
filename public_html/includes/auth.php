<?php

declare(strict_types=1);

function attempt_login(string $email, string $password): ?array {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT * FROM AdminUser WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['passwordHash'])) {
        return null;
    }

    return $user;
}

function login_session(array $user): void {
    $_SESSION['admin_id'] = (int) $user['id'];
    $_SESSION['admin_email'] = $user['email'];
}

function logout_session(): void {
    $_SESSION = [];
    session_destroy();
}

function current_admin(): ?array {
    if (empty($_SESSION['admin_id'])) {
        return null;
    }
    return [
        'id' => $_SESSION['admin_id'],
        'email' => $_SESSION['admin_email'],
    ];
}

/** Sends a 401 JSON response and exits if there's no logged-in admin. */
function require_admin(): void {
    if (current_admin() === null) {
        json_response(['error' => 'Unauthorized'], 401);
    }
}

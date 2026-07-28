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
    $_SESSION['admin_name'] = $user['name'];
    $_SESSION['admin_email'] = $user['email'];
    $_SESSION['admin_role'] = $user['role'];
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
        'name' => $_SESSION['admin_name'],
        'email' => $_SESSION['admin_email'],
        'role' => $_SESSION['admin_role'],
    ];
}

/**
 * Sends a 401/403 JSON response and exits unless the logged-in user is staff
 * (OWNER or EDITOR). SUBSCRIBER accounts (public self-registration) can hold a
 * session but have no admin-panel/API access at all.
 */
function require_admin(): void {
    $admin = current_admin();
    if ($admin === null) {
        json_response(['error' => 'Unauthorized'], 401);
    }
    if ($admin['role'] === 'SUBSCRIBER') {
        json_response(['error' => 'Forbidden'], 403);
    }
}

/** Sends a 403 JSON response and exits unless the logged-in admin is an OWNER (Administrator). */
function require_owner(): void {
    $admin = current_admin();
    if ($admin === null) {
        json_response(['error' => 'Unauthorized'], 401);
    }
    if ($admin['role'] !== 'OWNER') {
        json_response(['error' => 'Forbidden'], 403);
    }
}

/**
 * Generates and emails a password reset link if the email matches an admin
 * account. Always call this without branching on its return value in the API
 * layer — the caller should respond identically either way so we don't leak
 * which emails are registered.
 */
function request_password_reset(string $email): void {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id FROM AdminUser WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) {
        return;
    }

    $token = bin2hex(random_bytes(32));

    // Expiry is computed by MySQL itself (NOW() + INTERVAL), not PHP's time() — PHP defaults to UTC while the
    // DB server's NOW() runs in local time, and mixing the two here caused tokens to look expired immediately.
    $stmt = $pdo->prepare('UPDATE AdminUser SET resetToken = ?, resetTokenExpiresAt = NOW() + INTERVAL 1 HOUR WHERE id = ?');
    $stmt->execute([$token, $user['id']]);

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $link = "$scheme://$host/admin/reset-password?token=" . urlencode($token);

    $subject = 'Altec Admin — Reset your password';
    $body = "A password reset was requested for the Altec admin panel.\n\n"
        . "Set a new password here (link expires in 1 hour):\n$link\n\n"
        . "If you didn't request this, you can safely ignore this email.";
    $headers = "From: klipo90@gmail.com\r\nContent-Type: text/plain; charset=UTF-8";

    mail($email, $subject, $body, $headers);
}

function reset_password_with_token(string $token, string $password): bool {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id FROM AdminUser WHERE resetToken = ? AND resetTokenExpiresAt > NOW()');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) {
        return false;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE AdminUser SET passwordHash = ?, resetToken = NULL, resetTokenExpiresAt = NULL WHERE id = ?');
    $stmt->execute([$hash, $user['id']]);
    return true;
}

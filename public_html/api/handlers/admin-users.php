<?php
// $method, $sub (id), $pdo, request_body() available from api/index.php
require_owner();

if ($method === 'GET' && $sub === null) {
    $stmt = $pdo->query('SELECT id, name, email, role, createdAt FROM AdminUser ORDER BY id ASC');
    json_response($stmt->fetchAll());
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    $name = is_string($body['name'] ?? null) ? trim($body['name']) : '';
    $email = is_string($body['email'] ?? null) ? trim($body['email']) : '';
    $password = $body['password'] ?? '';
    $role = $body['role'] ?? '';

    if ($name === '' || $email === '' || !is_string($password) || strlen($password) < 8 || !in_array($role, ['OWNER', 'EDITOR'], true)) {
        json_response(['error' => 'Invalid request'], 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $stmt = $pdo->prepare('INSERT INTO AdminUser (name, email, passwordHash, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, $hash, $role]);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'Duplicate entry')) {
            json_response(['error' => 'An account with that email already exists'], 409);
        }
        throw $e;
    }
    json_response(['id' => (int) $pdo->lastInsertId()], 201);
}

if ($sub !== null && $method === 'DELETE') {
    $admin = current_admin();
    if ((int) $sub === (int) $admin['id']) {
        json_response(['error' => "You can't delete your own account"], 400);
    }
    $pdo->prepare('DELETE FROM AdminUser WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

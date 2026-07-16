<?php
// $method, $sub (id), $pdo, $handlers-resolved request_body() available from api/index.php
require_admin();

if ($method === 'GET' && $sub === null) {
    $categories = $pdo->query('SELECT * FROM Category ORDER BY id ASC')->fetchAll();
    attach_translations($pdo, 'CategoryTranslation', 'categoryId', $categories);
    json_response($categories);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    $stmt = $pdo->prepare('INSERT INTO Category (type, parentId) VALUES (?, ?)');
    $stmt->execute([$body['type'] ?? 'PRODUCT', $body['parentId'] ?? null]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'CategoryTranslation', 'categoryId', $id, $body['translations'] ?? [], ['name']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'GET') {
    $rows = [['id' => (int) $sub]];
    $stmt = $pdo->prepare('SELECT * FROM Category WHERE id = ?');
    $stmt->execute([$sub]);
    $category = $stmt->fetch();
    if (!$category) {
        json_response(['error' => 'Not found'], 404);
    }
    $rows = [$category];
    attach_translations($pdo, 'CategoryTranslation', 'categoryId', $rows);
    json_response($rows[0]);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('UPDATE Category SET type = ?, parentId = ? WHERE id = ?');
    $stmt->execute([$body['type'] ?? 'PRODUCT', $body['parentId'] ?? null, $sub]);
    save_translations($pdo, 'CategoryTranslation', 'categoryId', (int) $sub, $body['translations'] ?? [], ['name']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM Category WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

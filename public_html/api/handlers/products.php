<?php
require_admin();

if ($sub !== null && $subResource === 'images') {
    handle_item_images($pdo, 'ProductImage', 'productId', (int) $sub, $method, $subResourceId);
}

if ($method === 'GET' && $sub === null) {
    $products = $pdo->query('SELECT * FROM Product ORDER BY id ASC')->fetchAll();
    attach_translations($pdo, 'ProductTranslation', 'productId', $products);
    $imgStmt = $pdo->prepare('SELECT * FROM ProductImage WHERE productId = ? ORDER BY sortOrder ASC');
    foreach ($products as &$product) {
        $imgStmt->execute([$product['id']]);
        $product['images'] = $imgStmt->fetchAll();
    }
    unset($product);
    json_response($products);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    $stmt = $pdo->prepare('INSERT INTO Product (categoryId, brand, published, brochureUrl) VALUES (?, ?, ?, ?)');
    $stmt->execute([
        $body['categoryId'] ?? null,
        $body['brand'] ?? null,
        !empty($body['published']) ? 1 : 0,
        $body['brochureUrl'] ?? null,
    ]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'ProductTranslation', 'productId', $id, $body['translations'] ?? [], ['name', 'description']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'GET') {
    $stmt = $pdo->prepare('SELECT * FROM Product WHERE id = ?');
    $stmt->execute([$sub]);
    $product = $stmt->fetch();
    if (!$product) {
        json_response(['error' => 'Not found'], 404);
    }
    $rows = [$product];
    attach_translations($pdo, 'ProductTranslation', 'productId', $rows);
    $imgStmt = $pdo->prepare('SELECT * FROM ProductImage WHERE productId = ? ORDER BY sortOrder ASC');
    $imgStmt->execute([$sub]);
    $rows[0]['images'] = $imgStmt->fetchAll();
    json_response($rows[0]);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('UPDATE Product SET categoryId = ?, brand = ?, published = ?, brochureUrl = ? WHERE id = ?');
    $stmt->execute([
        $body['categoryId'] ?? null,
        $body['brand'] ?? null,
        !empty($body['published']) ? 1 : 0,
        $body['brochureUrl'] ?? null,
        $sub,
    ]);
    save_translations($pdo, 'ProductTranslation', 'productId', (int) $sub, $body['translations'] ?? [], ['name', 'description']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM Product WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

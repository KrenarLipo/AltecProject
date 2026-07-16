<?php
require_admin();

if ($method === 'GET' && $sub === null) {
    $items = $pdo->query('SELECT * FROM MenuItem ORDER BY sortOrder ASC')->fetchAll();
    attach_translations($pdo, 'MenuItemTranslation', 'menuItemId', $items);
    json_response($items);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    $stmt = $pdo->prepare('
        INSERT INTO MenuItem (parentId, linkType, targetSlug, sortOrder, visible)
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $body['parentId'] ?? null,
        $body['linkType'] ?? 'URL',
        $body['targetSlug'] ?? null,
        $body['sortOrder'] ?? 0,
        !empty($body['visible']) ? 1 : 0,
    ]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'MenuItemTranslation', 'menuItemId', $id, $body['translations'] ?? [], ['label']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('
        UPDATE MenuItem SET parentId = ?, linkType = ?, targetSlug = ?, sortOrder = ?, visible = ?
        WHERE id = ?
    ');
    $stmt->execute([
        $body['parentId'] ?? null,
        $body['linkType'] ?? 'URL',
        $body['targetSlug'] ?? null,
        $body['sortOrder'] ?? 0,
        !empty($body['visible']) ? 1 : 0,
        $sub,
    ]);
    save_translations($pdo, 'MenuItemTranslation', 'menuItemId', (int) $sub, $body['translations'] ?? [], ['label']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM MenuItem WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

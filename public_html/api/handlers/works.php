<?php
require_admin();

if ($sub !== null && $subResource === 'images') {
    handle_item_images($pdo, 'WorkItemImage', 'workItemId', (int) $sub, $method, $subResourceId);
}

if ($method === 'GET' && $sub === null) {
    $items = $pdo->query('SELECT * FROM WorkItem ORDER BY id ASC')->fetchAll();
    attach_translations($pdo, 'WorkItemTranslation', 'workItemId', $items);
    $imgStmt = $pdo->prepare('SELECT * FROM WorkItemImage WHERE workItemId = ? ORDER BY sortOrder ASC');
    foreach ($items as &$item) {
        $imgStmt->execute([$item['id']]);
        $item['images'] = $imgStmt->fetchAll();
    }
    unset($item);
    json_response($items);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    $stmt = $pdo->prepare('INSERT INTO WorkItem (projectType, date) VALUES (?, ?)');
    $stmt->execute([
        $body['projectType'] ?? null,
        $body['date'] ?? null,
    ]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'WorkItemTranslation', 'workItemId', $id, $body['translations'] ?? [], ['title', 'description']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('UPDATE WorkItem SET projectType = ?, date = ? WHERE id = ?');
    $stmt->execute([
        $body['projectType'] ?? null,
        $body['date'] ?? null,
        $sub,
    ]);
    save_translations($pdo, 'WorkItemTranslation', 'workItemId', (int) $sub, $body['translations'] ?? [], ['title', 'description']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM WorkItem WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

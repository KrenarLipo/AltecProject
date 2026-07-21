<?php
require_admin();

if ($method === 'GET' && $sub === null) {
    $slides = $pdo->query('SELECT * FROM Slide ORDER BY sortOrder ASC')->fetchAll();
    attach_translations($pdo, 'SlideTranslation', 'slideId', $slides);
    json_response($slides);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    if (empty($body['mediaUrl'])) {
        json_response(['error' => 'Invalid request'], 400);
    }
    $stmt = $pdo->prepare('INSERT INTO Slide (mediaType, mediaUrl, linkUrl, sortOrder, visible) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        $body['mediaType'] ?? 'IMAGE',
        $body['mediaUrl'],
        $body['linkUrl'] ?? null,
        $body['sortOrder'] ?? 0,
        !empty($body['visible']) ? 1 : 0,
    ]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'SlideTranslation', 'slideId', $id, $body['translations'] ?? [], ['title', 'subtitle']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('UPDATE Slide SET mediaType = ?, mediaUrl = ?, linkUrl = ?, sortOrder = ?, visible = ? WHERE id = ?');
    $stmt->execute([
        $body['mediaType'] ?? 'IMAGE',
        $body['mediaUrl'] ?? '',
        $body['linkUrl'] ?? null,
        $body['sortOrder'] ?? 0,
        !empty($body['visible']) ? 1 : 0,
        $sub,
    ]);
    save_translations($pdo, 'SlideTranslation', 'slideId', (int) $sub, $body['translations'] ?? [], ['title', 'subtitle']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM Slide WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

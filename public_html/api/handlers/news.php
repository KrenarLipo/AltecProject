<?php
require_admin();

if ($method === 'GET' && $sub === null) {
    $posts = $pdo->query('SELECT * FROM NewsPost ORDER BY id ASC')->fetchAll();
    attach_translations($pdo, 'NewsPostTranslation', 'newsPostId', $posts);
    json_response($posts);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    if (empty($body['slug'])) {
        json_response(['error' => 'Invalid request'], 400);
    }
    $stmt = $pdo->prepare('INSERT INTO NewsPost (slug, coverImage, publishedAt) VALUES (?, ?, ?)');
    $stmt->execute([
        $body['slug'],
        $body['coverImage'] ?? null,
        $body['publishedAt'] ?? null,
    ]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'NewsPostTranslation', 'newsPostId', $id, $body['translations'] ?? [], ['title', 'body']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('UPDATE NewsPost SET slug = ?, coverImage = ?, publishedAt = ? WHERE id = ?');
    $stmt->execute([
        $body['slug'] ?? null,
        $body['coverImage'] ?? null,
        $body['publishedAt'] ?? null,
        $sub,
    ]);
    save_translations($pdo, 'NewsPostTranslation', 'newsPostId', (int) $sub, $body['translations'] ?? [], ['title', 'body']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM NewsPost WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

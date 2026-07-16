<?php
require_admin();

if ($method === 'GET' && $sub === null) {
    $pages = $pdo->query('SELECT * FROM Page ORDER BY id ASC')->fetchAll();
    attach_translations($pdo, 'PageTranslation', 'pageId', $pages);
    json_response($pages);
}

if ($method === 'POST' && $sub === null) {
    $body = request_body();
    if (empty($body['slug'])) {
        json_response(['error' => 'Invalid request'], 400);
    }
    $stmt = $pdo->prepare('INSERT INTO Page (slug, seoTitle, seoDescription) VALUES (?, ?, ?)');
    $stmt->execute([
        $body['slug'],
        $body['seoTitle'] ?? null,
        $body['seoDescription'] ?? null,
    ]);
    $id = (int) $pdo->lastInsertId();
    save_translations($pdo, 'PageTranslation', 'pageId', $id, $body['translations'] ?? [], ['title', 'body']);
    json_response(['id' => $id], 201);
}

if ($sub !== null && $method === 'PUT') {
    $body = request_body();
    $stmt = $pdo->prepare('UPDATE Page SET slug = ?, seoTitle = ?, seoDescription = ? WHERE id = ?');
    $stmt->execute([
        $body['slug'] ?? null,
        $body['seoTitle'] ?? null,
        $body['seoDescription'] ?? null,
        $sub,
    ]);
    save_translations($pdo, 'PageTranslation', 'pageId', (int) $sub, $body['translations'] ?? [], ['title', 'body']);
    json_response(['ok' => true]);
}

if ($sub !== null && $method === 'DELETE') {
    $pdo->prepare('DELETE FROM Page WHERE id = ?')->execute([$sub]);
    json_response(['ok' => true]);
}

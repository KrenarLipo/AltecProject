<?php

declare(strict_types=1);

function json_response(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function h(?string $value): string {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

const DEFAULT_SETTINGS = [
    'site_name' => 'Altec',
    'contact_phone' => '',
    'contact_email' => '',
    'contact_address' => '',
    'social_facebook' => '',
    'social_instagram' => '',
    'social_linkedin' => '',
    'social_youtube' => '',
    'homepage_promo_title' => '',
    'homepage_promo_body' => '',
];

function get_settings(): array {
    $pdo = get_pdo();
    $rows = $pdo->query('SELECT `key`, `value` FROM Setting')->fetchAll();
    $settings = DEFAULT_SETTINGS;
    foreach ($rows as $row) {
        $settings[$row['key']] = $row['value'];
    }
    return $settings;
}

function get_setting(string $key): string {
    return get_settings()[$key] ?? '';
}

function resolve_menu_href(array $item): string {
    if ($item['linkType'] === 'URL' || $item['linkType'] === 'CUSTOM') {
        return $item['targetSlug'] ?? '#';
    }
    if ($item['linkType'] === 'PAGE' || $item['linkType'] === 'CATEGORY') {
        return '/' . ($item['targetSlug'] ?? '');
    }
    return '#';
}

function get_menu_tree(string $lang = 'en', string $location = 'PRIMARY'): array {
    $pdo = get_pdo();

    $stmt = $pdo->prepare('
        SELECT mi.*, COALESCE(mit.label, mit_en.label) AS label
        FROM MenuItem mi
        LEFT JOIN MenuItemTranslation mit
            ON mit.menuItemId = mi.id AND mit.languageCode = ?
        LEFT JOIN MenuItemTranslation mit_en
            ON mit_en.menuItemId = mi.id AND mit_en.languageCode = \'en\'
        WHERE mi.visible = 1 AND mi.location = ?
        ORDER BY mi.sortOrder ASC
    ');
    $stmt->execute([$lang, $location]);
    $rows = $stmt->fetchAll();

    $nodesById = [];
    foreach ($rows as $row) {
        $nodesById[$row['id']] = [
            'id' => (int) $row['id'],
            'label' => $row['label'] ?? ('#' . $row['id']),
            'href' => resolve_menu_href($row),
            'parentId' => $row['parentId'] !== null ? (int) $row['parentId'] : null,
            'children' => [],
        ];
    }

    $roots = [];
    foreach ($nodesById as $id => &$node) {
        if ($node['parentId'] !== null && isset($nodesById[$node['parentId']])) {
            $nodesById[$node['parentId']]['children'][] = &$node;
        } else {
            $roots[] = &$node;
        }
    }
    unset($node);

    return $roots;
}

const SUPPORTED_LANGUAGES = ['en', 'it', 'al'];

/** Resolves the active language from ?lang=, falling back to a cookie, falling back to 'en'. */
function current_lang(): string {
    $requested = $_GET['lang'] ?? null;
    if (is_string($requested) && in_array($requested, SUPPORTED_LANGUAGES, true)) {
        if (($_COOKIE['altec_lang'] ?? null) !== $requested) {
            setcookie('altec_lang', $requested, time() + 60 * 60 * 24 * 365, '/');
        }
        return $requested;
    }

    $cookie = $_COOKIE['altec_lang'] ?? null;
    if (is_string($cookie) && in_array($cookie, SUPPORTED_LANGUAGES, true)) {
        return $cookie;
    }

    return 'en';
}

function pick_translation(array $translations, string $lang): ?array {
    foreach ($translations as $translation) {
        if ($translation['languageCode'] === $lang) {
            return $translation;
        }
    }
    return $translations[0] ?? null;
}

/** Upserts one row per language in $translationsByLang (e.g. ['en' => ['name' => ...], 'al' => [...]]) into a *Translation table. */
function save_translations(
    PDO $pdo,
    string $table,
    string $fkColumn,
    int $fkValue,
    array $translationsByLang,
    array $fields,
): void {
    foreach ($translationsByLang as $lang => $values) {
        $columns = array_merge([$fkColumn, 'languageCode'], $fields);
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $updateAssignments = implode(', ', array_map(fn($f) => "`$f` = VALUES(`$f`)", $fields));

        $sql = sprintf(
            'INSERT INTO `%s` (%s) VALUES (%s) ON DUPLICATE KEY UPDATE %s',
            $table,
            implode(', ', array_map(fn($c) => "`$c`", $columns)),
            $placeholders,
            $updateAssignments,
        );

        $params = array_merge([$fkValue, $lang], array_map(fn($f) => $values[$f] ?? null, $fields));
        $pdo->prepare($sql)->execute($params);
    }
}

/** Attaches a `translations` array to each row (or to a single row) from a *Translation table. */
function attach_translations(PDO $pdo, string $table, string $fkColumn, array &$rows): void {
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE `$fkColumn` = ?");
    foreach ($rows as &$row) {
        $stmt->execute([$row['id']]);
        $row['translations'] = $stmt->fetchAll();
    }
    unset($row);
}

/**
 * Handles the /{resource}/{id}/images[/{imageId}] sub-route shared by products and works.
 * $imageTable/$fkColumn are internal (never client-controlled), safe to interpolate.
 * Always ends the request (via json_response).
 */
function handle_item_images(
    PDO $pdo,
    string $imageTable,
    string $fkColumn,
    int $parentId,
    string $method,
    ?string $imageId,
): void {
    if ($method === 'POST' && $imageId === null) {
        $body = request_body();
        if (empty($body['url'])) {
            json_response(['error' => 'Invalid request'], 400);
        }
        $stmt = $pdo->prepare("INSERT INTO `$imageTable` (`$fkColumn`, url, sortOrder) VALUES (?, ?, 0)");
        $stmt->execute([$parentId, $body['url']]);
        $id = (int) $pdo->lastInsertId();
        $row = $pdo->prepare("SELECT * FROM `$imageTable` WHERE id = ?");
        $row->execute([$id]);
        json_response($row->fetch(), 201);
    }

    if ($method === 'PUT' && $imageId !== null) {
        $body = request_body();
        if (!empty($body['isPrimary'])) {
            $pdo->prepare("UPDATE `$imageTable` SET isPrimary = 0 WHERE `$fkColumn` = ?")->execute([$parentId]);
            $pdo->prepare("UPDATE `$imageTable` SET isPrimary = 1 WHERE id = ? AND `$fkColumn` = ?")
                ->execute([$imageId, $parentId]);
        }
        json_response(['ok' => true]);
    }

    if ($method === 'DELETE' && $imageId !== null) {
        $stmt = $pdo->prepare("SELECT url FROM `$imageTable` WHERE id = ? AND `$fkColumn` = ?");
        $stmt->execute([$imageId, $parentId]);
        $image = $stmt->fetch();
        if ($image) {
            $path = __DIR__ . '/../..' . $image['url'];
            if (is_file($path)) {
                @unlink($path);
            }
        }
        $pdo->prepare("DELETE FROM `$imageTable` WHERE id = ? AND `$fkColumn` = ?")->execute([$imageId, $parentId]);
        json_response(['ok' => true]);
    }

    json_response(['error' => 'Not found'], 404);
}

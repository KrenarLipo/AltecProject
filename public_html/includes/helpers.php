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

function get_menu_tree(string $lang = 'en'): array {
    $pdo = get_pdo();

    $stmt = $pdo->prepare('
        SELECT mi.*, mit.label
        FROM MenuItem mi
        LEFT JOIN MenuItemTranslation mit
            ON mit.menuItemId = mi.id AND mit.languageCode = ?
        WHERE mi.visible = 1
        ORDER BY mi.sortOrder ASC
    ');
    $stmt->execute([$lang]);
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

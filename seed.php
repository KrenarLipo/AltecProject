<?php
/**
 * Seeds languages, the admin user, default settings, menu, and pages.
 * Usage: ADMIN_EMAIL=you@example.com ADMIN_SEED_PASSWORD=... php seed.php
 * Safe to re-run — every insert is an upsert.
 */
declare(strict_types=1);

require __DIR__ . '/public_html/includes/db.php';

$pdo = get_pdo();

$adminEmail = getenv('ADMIN_EMAIL') ?: null;
$adminPassword = getenv('ADMIN_SEED_PASSWORD') ?: null;
if (!$adminEmail || !$adminPassword) {
    fwrite(STDERR, "ADMIN_EMAIL and ADMIN_SEED_PASSWORD environment variables are required.\n");
    exit(1);
}

// Languages
$pdo->prepare('INSERT INTO Language (code, label) VALUES (?, ?) ON DUPLICATE KEY UPDATE label = VALUES(label)')
    ->execute(['en', 'English']);
$pdo->prepare('INSERT INTO Language (code, label) VALUES (?, ?) ON DUPLICATE KEY UPDATE label = VALUES(label)')
    ->execute(['al', 'Shqip']);

// Admin user
$passwordHash = password_hash($adminPassword, PASSWORD_BCRYPT);
$pdo->prepare('
    INSERT INTO AdminUser (email, passwordHash, role) VALUES (?, ?, \'OWNER\')
    ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash)
')->execute([$adminEmail, $passwordHash]);

// Default settings
$defaultSettings = [
    'site_name' => 'Altec',
    'contact_phone' => '',
    'contact_email' => $adminEmail,
    'contact_address' => 'Tirana, Albania',
    'social_facebook' => '',
    'social_instagram' => '',
    'social_linkedin' => '',
    'social_youtube' => '',
    'homepage_promo_title' => 'AC Sales & Installation',
    'homepage_promo_body' => 'Altec provides AC sales and installation, reconstruction, and home furnishing services.',
];
$settingStmt = $pdo->prepare('
    INSERT INTO Setting (`key`, `value`) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE `value` = `value`
');
foreach ($defaultSettings as $key => $value) {
    $settingStmt->execute([$key, $value]);
}

// Default menu
$menuItems = [
    ['targetSlug' => '/', 'linkType' => 'URL', 'labelEn' => 'Home', 'labelAl' => 'Kryefaqja', 'sortOrder' => 0],
    ['targetSlug' => '/ac-sales-installation', 'linkType' => 'URL', 'labelEn' => 'AC Sales & Installation', 'labelAl' => 'Shitje & Instalim Kondicioneri', 'sortOrder' => 1],
    ['targetSlug' => '/reconstruction-furnishing', 'linkType' => 'URL', 'labelEn' => 'Reconstruction & Furnishing', 'labelAl' => 'Rikonstruksion & Mobilim', 'sortOrder' => 2],
    ['targetSlug' => 'about', 'linkType' => 'PAGE', 'labelEn' => 'About Us', 'labelAl' => 'Rreth Nesh', 'sortOrder' => 3],
    ['targetSlug' => 'partners', 'linkType' => 'PAGE', 'labelEn' => 'Partners', 'labelAl' => 'Partnerë', 'sortOrder' => 4],
    ['targetSlug' => '/works', 'linkType' => 'URL', 'labelEn' => 'Works', 'labelAl' => 'Punimet', 'sortOrder' => 5],
    ['targetSlug' => '/news', 'linkType' => 'URL', 'labelEn' => 'News', 'labelAl' => 'Lajme', 'sortOrder' => 6],
    ['targetSlug' => '/contact', 'linkType' => 'URL', 'labelEn' => 'Contact', 'labelAl' => 'Kontakt', 'sortOrder' => 7],
];

$findMenuItem = $pdo->prepare('SELECT id FROM MenuItem WHERE targetSlug = ? AND linkType = ?');
$insertMenuItem = $pdo->prepare('INSERT INTO MenuItem (linkType, targetSlug, sortOrder) VALUES (?, ?, ?)');
$upsertMenuTranslation = $pdo->prepare('
    INSERT INTO MenuItemTranslation (menuItemId, languageCode, label) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE label = VALUES(label)
');

foreach ($menuItems as $item) {
    $findMenuItem->execute([$item['targetSlug'], $item['linkType']]);
    $existing = $findMenuItem->fetch();

    if ($existing) {
        $id = (int) $existing['id'];
    } else {
        $insertMenuItem->execute([$item['linkType'], $item['targetSlug'], $item['sortOrder']]);
        $id = (int) $pdo->lastInsertId();
    }

    $upsertMenuTranslation->execute([$id, 'en', $item['labelEn']]);
    $upsertMenuTranslation->execute([$id, 'al', $item['labelAl']]);
}

// Default pages
$pages = [
    [
        'slug' => 'about',
        'titleEn' => 'About Us',
        'bodyEn' => 'Altec Group provides AC sales and installation, reconstruction, and home furnishing services in Albania.',
        'titleAl' => 'Rreth Nesh',
        'bodyAl' => 'Altec Group ofron shitje dhe instalim kondicioneri, rikonstruksion dhe mobilim shtëpish në Shqipëri.',
    ],
    [
        'slug' => 'partners',
        'titleEn' => 'Partners',
        'bodyEn' => 'Altec collaborates with Viessmann.',
        'titleAl' => 'Partnerë',
        'bodyAl' => 'Altec bashkëpunon me Viessmann.',
    ],
];

$findPage = $pdo->prepare('SELECT id FROM Page WHERE slug = ?');
$insertPage = $pdo->prepare('INSERT INTO Page (slug) VALUES (?)');
$upsertPageTranslation = $pdo->prepare('
    INSERT INTO PageTranslation (pageId, languageCode, title, body) VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body)
');

foreach ($pages as $page) {
    $findPage->execute([$page['slug']]);
    $existing = $findPage->fetch();

    if ($existing) {
        $id = (int) $existing['id'];
    } else {
        $insertPage->execute([$page['slug']]);
        $id = (int) $pdo->lastInsertId();
    }

    $upsertPageTranslation->execute([$id, 'en', $page['titleEn'], $page['bodyEn']]);
    $upsertPageTranslation->execute([$id, 'al', $page['titleAl'], $page['bodyAl']]);
}

echo "Seed complete.\n";

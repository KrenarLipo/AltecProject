<?php
/** @var string|null $pageTitle */
/** @var string|null $lang */
enforce_site_status();

$lang = $lang ?? current_lang();
$menu = get_menu_tree($lang);

$languageLabels = [
  'en' => ['flag' => '🇬🇧', 'name' => 'English'],
  'it' => ['flag' => '🇮🇹', 'name' => 'Italiano'],
  'al' => ['flag' => '🇦🇱', 'name' => 'Shqip'],
];
$currentPath = strtok($_SERVER['REQUEST_URI'], '?');
parse_str(parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '', $currentQuery);
?>
<!doctype html>
<html lang="<?= h($lang) ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= h(($pageTitle ?? '') !== '' ? $pageTitle . ' — Altec Group' : 'Altec Group') ?></title>
  <link rel="icon" type="image/png" href="/assets/img/altec-logo.png">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<header class="site-header">
  <div class="topbar">
    <div class="container topbar-inner">
      <div class="lang-switch">
        <?php foreach ($languageLabels as $code => $info): ?>
          <?php $query = array_merge($currentQuery, ['lang' => $code]); ?>
          <a href="<?= h($currentPath . '?' . http_build_query($query)) ?>"
             class="<?= $code === $lang ? 'active' : '' ?>"
             title="<?= h($info['name']) ?>" aria-label="<?= h($info['name']) ?>">
            <span class="flag" aria-hidden="true"><?= $info['flag'] ?></span>
          </a>
        <?php endforeach; ?>
      </div>
      <div class="account-switch">
        <?php if ($currentAdmin = current_admin()): ?>
          <a href="/account.php"><?= h($currentAdmin['name'] ?? 'My Account') ?></a>
        <?php else: ?>
          <a href="/login.php">Login / Register</a>
        <?php endif; ?>
      </div>
    </div>
  </div>
  <div class="container main-row">
    <a class="brand" href="/">
      <img src="/assets/img/altec-logo.png" alt="Altec Group" width="200" height="111">
    </a>
    <nav class="main-nav">
      <ul>
        <?php foreach ($menu as $item): ?>
          <li>
            <a href="<?= h($item['href']) ?>"><?= h($item['label']) ?></a>
            <?php if (!empty($item['children'])): ?>
              <ul>
                <?php foreach ($item['children'] as $child): ?>
                  <li><a href="<?= h($child['href']) ?>"><?= h($child['label']) ?></a></li>
                <?php endforeach; ?>
              </ul>
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
      </ul>
    </nav>
  </div>
</header>
<main>

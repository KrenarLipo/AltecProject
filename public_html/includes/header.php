<?php
/** @var string|null $pageTitle */
$menu = get_menu_tree('en');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= h(($pageTitle ?? '') !== '' ? $pageTitle . ' — Altec' : 'Altec') ?></title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #171717; }
    a { color: inherit; text-decoration: none; }
    main { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
    header { border-bottom: 1px solid #ddd; padding: 1rem; }
    header .inner { display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto; }
    nav ul { display: flex; gap: 1.5rem; list-style: none; margin: 0; padding: 0; }
    nav ul ul { list-style: none; padding-left: 1rem; }
    footer { border-top: 1px solid #ddd; padding: 2rem 1rem; margin-top: 3rem; }
    footer .inner { max-width: 1100px; margin: 0 auto; }
  </style>
</head>
<body>
<header>
  <div class="inner">
    <a href="/" style="font-weight:700;font-size:1.25rem;">Altec</a>
    <nav>
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

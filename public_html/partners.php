<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();
$stmt = $pdo->prepare("
    SELECT pt.title, pt.body
    FROM Page p
    JOIN PageTranslation pt ON pt.pageId = p.id AND pt.languageCode = ?
    WHERE p.slug = 'partners'
");
$stmt->execute([$lang]);
$page = $stmt->fetch();

$pageTitle = $page['title'] ?? 'Partners';
require __DIR__ . '/includes/header.php';
?>

<section class="section">
  <div class="container" style="max-width: 760px;">
    <span class="eyebrow">Who We Work With</span>
    <h1><?= h($page['title'] ?? 'Partners') ?></h1>
    <p style="white-space: pre-wrap; font-size: 1.05rem;"><?= h($page['body'] ?? 'Content coming soon.') ?></p>

    <div class="card" style="margin-top: 1.5rem;">
      <span class="brand-tag">Certified Partner</span>
      <h3>Viessmann</h3>
      <p>Altec is a Viessmann collaborator, offering Viessmann's heating, cooling, and heat pump systems as part of our AC sales and installation service.</p>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

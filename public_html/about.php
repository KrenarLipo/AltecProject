<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();
$stmt = $pdo->prepare("
    SELECT pt.title, pt.body
    FROM Page p
    JOIN PageTranslation pt ON pt.pageId = p.id AND pt.languageCode = ?
    WHERE p.slug = 'about'
");
$stmt->execute([$lang]);
$page = $stmt->fetch();

$pageTitle = $page['title'] ?? 'About Us';
require __DIR__ . '/includes/header.php';
?>

<section class="section">
  <div class="container reveal" style="max-width: 760px;">
    <span class="eyebrow">Altec Group</span>
    <h1><?= h($page['title'] ?? 'About Us') ?></h1>
    <p style="white-space: pre-wrap; font-size: 1.05rem;"><?= h($page['body'] ?? 'Content coming soon.') ?></p>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

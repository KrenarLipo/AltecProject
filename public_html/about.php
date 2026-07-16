<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();
$stmt = $pdo->prepare("
    SELECT pt.title, pt.body
    FROM Page p
    JOIN PageTranslation pt ON pt.pageId = p.id AND pt.languageCode = 'en'
    WHERE p.slug = 'about'
");
$stmt->execute();
$page = $stmt->fetch();

$pageTitle = $page['title'] ?? 'About Us';
require __DIR__ . '/includes/header.php';
?>

<h1><?= h($page['title'] ?? 'About Us') ?></h1>
<p style="white-space: pre-wrap;"><?= h($page['body'] ?? 'Content coming soon.') ?></p>

<?php require __DIR__ . '/includes/footer.php'; ?>

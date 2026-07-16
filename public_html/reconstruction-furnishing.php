<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();

$categories = $pdo->query("
    SELECT c.id, ct.name
    FROM Category c
    JOIN CategoryTranslation ct ON ct.categoryId = c.id AND ct.languageCode = 'en'
    WHERE c.type = 'SERVICE' AND c.parentId IS NULL
")->fetchAll();

$pageTitle = 'Reconstruction & Home Furnishing';
require __DIR__ . '/includes/header.php';
?>

<h1>Reconstruction &amp; Home Furnishing</h1>
<?php if (empty($categories)): ?>
  <p>No services listed yet.</p>
<?php endif; ?>
<ul>
  <?php foreach ($categories as $category): ?>
    <li><?= h($category['name']) ?></li>
  <?php endforeach; ?>
</ul>

<?php require __DIR__ . '/includes/footer.php'; ?>

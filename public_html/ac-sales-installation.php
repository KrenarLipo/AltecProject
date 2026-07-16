<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();

$categories = $pdo->query("
    SELECT c.id, ct.name
    FROM Category c
    JOIN CategoryTranslation ct ON ct.categoryId = c.id AND ct.languageCode = 'en'
    WHERE c.type = 'PRODUCT' AND c.parentId IS NULL
")->fetchAll();

$productStmt = $pdo->prepare("
    SELECT p.id, p.brand, pt.name
    FROM Product p
    JOIN ProductTranslation pt ON pt.productId = p.id AND pt.languageCode = 'en'
    WHERE p.published = 1 AND p.categoryId = ?
");

$pageTitle = 'AC Sales & Installation';
require __DIR__ . '/includes/header.php';
?>

<h1>AC Sales &amp; Installation</h1>
<?php if (empty($categories)): ?>
  <p>No categories yet.</p>
<?php endif; ?>
<?php foreach ($categories as $category): ?>
  <section style="margin-bottom: 2rem;">
    <h2><?= h($category['name']) ?></h2>
    <?php
    $productStmt->execute([$category['id']]);
    $products = $productStmt->fetchAll();
    ?>
    <ul>
      <?php if (empty($products)): ?>
        <li>No products yet.</li>
      <?php endif; ?>
      <?php foreach ($products as $product): ?>
        <li>
          <?= h($product['name']) ?><?= $product['brand'] ? ' — ' . h($product['brand']) : '' ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </section>
<?php endforeach; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();

$categories = $pdo->prepare("
    SELECT c.id, ct.name
    FROM Category c
    JOIN CategoryTranslation ct ON ct.categoryId = c.id AND ct.languageCode = ?
    WHERE c.type = 'PRODUCT' AND c.parentId IS NULL
");
$categories->execute([$lang]);
$categories = $categories->fetchAll();

$productStmt = $pdo->prepare("
    SELECT p.id, p.brand, p.brochureUrl, pt.name, pt.description
    FROM Product p
    JOIN ProductTranslation pt ON pt.productId = p.id AND pt.languageCode = ?
    WHERE p.published = 1 AND p.categoryId = ?
    ORDER BY p.id ASC
");

$imageStmt = $pdo->prepare("
    SELECT url FROM ProductImage WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC LIMIT 1
");

$pageTitle = 'AC Sales & Installation';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Primary Service</span>
    <h1>AC Sales &amp; Installation</h1>
    <p>Air conditioning systems sold and installed by Altec, including certified Viessmann equipment for homes and businesses.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <?php if (empty($categories)): ?>
      <p>No categories yet.</p>
    <?php endif; ?>
    <?php foreach ($categories as $category): ?>
      <div class="reveal" style="margin-bottom: 3rem;">
        <h2><?= h($category['name']) ?></h2>
        <?php
        $productStmt->execute([$lang, $category['id']]);
        $products = $productStmt->fetchAll();
        ?>
        <?php if (empty($products)): ?>
          <p>No products in this category yet.</p>
        <?php else: ?>
          <div class="grid">
            <?php foreach ($products as $product): ?>
              <?php
              $imageStmt->execute([$product['id']]);
              $image = $imageStmt->fetchColumn();
              ?>
              <div class="card reveal">
                <?php if ($image): ?>
                  <img src="<?= h($image) ?>" alt="<?= h($product['name']) ?>" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius); margin-bottom: 0.8rem;">
                <?php endif; ?>
                <?php if ($product['brand']): ?><span class="brand-tag"><?= h($product['brand']) ?></span><?php endif; ?>
                <h3><?= h($product['name']) ?></h3>
                <?php if ($product['description']): ?><p><?= h($product['description']) ?></p><?php endif; ?>
                <?php if ($product['brochureUrl']): ?><a href="<?= h($product['brochureUrl']) ?>" target="_blank" rel="noopener">Download datasheet (PDF) &rarr;</a><?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

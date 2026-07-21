<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();

$categories = $pdo->prepare("
    SELECT c.id, ct.name
    FROM Category c
    JOIN CategoryTranslation ct ON ct.categoryId = c.id AND ct.languageCode = ?
    WHERE c.type = 'SERVICE' AND c.parentId IS NULL
");
$categories->execute([$lang]);
$categories = $categories->fetchAll();

$pageTitle = 'Reconstruction & Home Furnishing';
require __DIR__ . '/includes/header.php';
?>

<section class="hero" style="background: linear-gradient(120deg, rgba(0,162,232,0.92) 0%, rgba(28,28,28,0.9) 100%);">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Also Offered</span>
    <h1>Reconstruction &amp; Home Furnishing</h1>
    <p>Renovation and furnishing services for clients who want more than climate control — a secondary line of work alongside our core AC business.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <?php if (empty($categories)): ?>
      <p>No services listed yet.</p>
    <?php else: ?>
      <div class="grid">
        <?php foreach ($categories as $category): ?>
          <div class="card">
            <h3><?= h($category['name']) ?></h3>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

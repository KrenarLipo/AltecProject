<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();
$settings = get_settings();

$featuredProducts = $pdo->query("
    SELECT p.id, pt.name
    FROM Product p
    JOIN ProductTranslation pt ON pt.productId = p.id AND pt.languageCode = 'en'
    WHERE p.published = 1
    ORDER BY p.createdAt DESC
    LIMIT 4
")->fetchAll();

$recentNews = $pdo->query("
    SELECT n.id, n.slug, nt.title
    FROM NewsPost n
    JOIN NewsPostTranslation nt ON nt.newsPostId = n.id AND nt.languageCode = 'en'
    WHERE n.publishedAt IS NOT NULL
    ORDER BY n.publishedAt DESC
    LIMIT 3
")->fetchAll();

$pageTitle = '';
require __DIR__ . '/includes/header.php';
?>

<section style="padding: 2rem 0;">
  <h1><?= h($settings['homepage_promo_title'] ?: 'Altec') ?></h1>
  <p><?= h($settings['homepage_promo_body'] ?: 'AC sales and installation, reconstruction, and home furnishing.') ?></p>
</section>

<section style="padding: 1.5rem 0;">
  <h2>Featured Products</h2>
  <?php if (empty($featuredProducts)): ?>
    <p>No products published yet.</p>
  <?php endif; ?>
  <ul>
    <?php foreach ($featuredProducts as $product): ?>
      <li><?= h($product['name']) ?></li>
    <?php endforeach; ?>
  </ul>
  <a href="/ac-sales-installation">See all AC products &rarr;</a>
</section>

<section style="padding: 1.5rem 0;">
  <h2>Recent News</h2>
  <?php if (empty($recentNews)): ?>
    <p>No news posts yet.</p>
  <?php endif; ?>
  <ul>
    <?php foreach ($recentNews as $post): ?>
      <li><a href="/news/<?= h($post['slug']) ?>"><?= h($post['title']) ?></a></li>
    <?php endforeach; ?>
  </ul>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();
$settings = get_settings();

$slides = $pdo->prepare("
    SELECT s.id, s.mediaType, s.mediaUrl, s.linkUrl, st.title, st.subtitle
    FROM Slide s
    LEFT JOIN SlideTranslation st ON st.slideId = s.id AND st.languageCode = ?
    WHERE s.visible = 1
    ORDER BY s.sortOrder ASC
");
$slides->execute([$lang]);
$slides = $slides->fetchAll();

$featuredProducts = $pdo->prepare("
    SELECT p.id, p.brand, pt.name
    FROM Product p
    JOIN ProductTranslation pt ON pt.productId = p.id AND pt.languageCode = ?
    WHERE p.published = 1
    ORDER BY p.createdAt DESC
    LIMIT 4
");
$featuredProducts->execute([$lang]);
$featuredProducts = $featuredProducts->fetchAll();

$productImageStmt = $pdo->prepare("
    SELECT url FROM ProductImage WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC LIMIT 1
");

$recentNews = $pdo->prepare("
    SELECT n.id, n.slug, nt.title
    FROM NewsPost n
    JOIN NewsPostTranslation nt ON nt.newsPostId = n.id AND nt.languageCode = ?
    WHERE n.publishedAt IS NOT NULL
    ORDER BY n.publishedAt DESC
    LIMIT 3
");
$recentNews->execute([$lang]);
$recentNews = $recentNews->fetchAll();

$partnersPage = $pdo->prepare("
    SELECT pt.title, pt.body
    FROM Page p
    JOIN PageTranslation pt ON pt.pageId = p.id AND pt.languageCode = ?
    WHERE p.slug = 'partners'
");
$partnersPage->execute([$lang]);
$partnersPage = $partnersPage->fetch();

$pageTitle = '';
require __DIR__ . '/includes/header.php';
?>

<?php if (!empty($slides)): ?>
<section class="slideshow" id="hero-slideshow">
  <?php foreach ($slides as $i => $slide): ?>
    <div class="slide <?= $i === 0 ? 'is-active' : '' ?>">
      <?php if ($slide['mediaType'] === 'VIDEO'): ?>
        <video src="<?= h($slide['mediaUrl']) ?>" autoplay muted loop playsinline></video>
      <?php else: ?>
        <img src="<?= h($slide['mediaUrl']) ?>" alt="<?= h($slide['title'] ?? '') ?>">
      <?php endif; ?>
      <?php if ($slide['title'] || $slide['subtitle']): ?>
        <div class="slide-caption">
          <?php if ($slide['title']): ?><h1><?= h($slide['title']) ?></h1><?php endif; ?>
          <?php if ($slide['subtitle']): ?><p><?= h($slide['subtitle']) ?></p><?php endif; ?>
          <?php if ($slide['linkUrl']): ?><a class="btn" href="<?= h($slide['linkUrl']) ?>">Learn more</a><?php endif; ?>
        </div>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
  <?php if (count($slides) > 1): ?>
    <button class="slide-nav prev" aria-label="Previous slide">&#8249;</button>
    <button class="slide-nav next" aria-label="Next slide">&#8250;</button>
    <div class="slide-dots">
      <?php foreach ($slides as $i => $slide): ?>
        <button class="<?= $i === 0 ? 'is-active' : '' ?>" data-slide="<?= $i ?>" aria-label="Slide <?= $i + 1 ?>"></button>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
  <button class="scroll-cue" aria-label="Scroll down">&#8595;</button>
</section>
<script src="/assets/js/slideshow.js" defer></script>
<?php else: ?>
<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Altec Group</span>
    <h1><?= h($settings['homepage_promo_title'] ?: 'AC Sales & Installation') ?></h1>
    <p><?= h($settings['homepage_promo_body'] ?: 'Altec provides AC sales and installation, reconstruction, and home furnishing services across Albania.') ?></p>
    <a class="btn btn-outline" href="/ac-sales-installation">Explore AC Solutions</a>
  </div>
  <button class="scroll-cue" aria-label="Scroll down">&#8595;</button>
</section>
<?php endif; ?>

<section class="section">
  <div class="container">
    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
      <div class="card reveal">
        <span class="eyebrow">Primary Service</span>
        <h3>AC Sales &amp; Installation</h3>
        <p>Residential and commercial air conditioning, sold and installed by our team — including Viessmann systems.</p>
        <a href="/ac-sales-installation">See products &rarr;</a>
      </div>
      <div class="card reveal">
        <span class="eyebrow">Also Offered</span>
        <h3>Reconstruction &amp; Furnishing</h3>
        <p>Renovation and home furnishing services for clients who need more than just climate control.</p>
        <a href="/reconstruction-furnishing">Learn more &rarr;</a>
      </div>
      <div class="card reveal">
        <span class="eyebrow">Partnership</span>
        <h3>Viessmann Partner</h3>
        <p>Altec is a Viessmann collaborator, bringing certified heating and cooling systems to Albanian homes.</p>
        <a href="#partners">About our partners &rarr;</a>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head reveal">
      <h2>Featured Products</h2>
      <a class="link-more" href="/ac-sales-installation">See all AC products &rarr;</a>
    </div>
    <?php if (empty($featuredProducts)): ?>
      <p>No products published yet.</p>
    <?php else: ?>
      <div class="grid">
        <?php foreach ($featuredProducts as $product): ?>
          <?php
          $productImageStmt->execute([$product['id']]);
          $productImage = $productImageStmt->fetchColumn();
          ?>
          <div class="card reveal">
            <?php if ($productImage): ?>
              <img src="<?= h($productImage) ?>" alt="<?= h($product['name']) ?>" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius); margin-bottom: 0.8rem;">
            <?php endif; ?>
            <?php if ($product['brand']): ?><span class="brand-tag"><?= h($product['brand']) ?></span><?php endif; ?>
            <h3><?= h($product['name']) ?></h3>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <h2>Recent News</h2>
      <a class="link-more" href="/news">All news &rarr;</a>
    </div>
    <?php if (empty($recentNews)): ?>
      <p>No news posts yet.</p>
    <?php else: ?>
      <ul class="card-list">
        <?php foreach ($recentNews as $post): ?>
          <li class="reveal"><a href="/news/<?= h($post['slug']) ?>"><?= h($post['title']) ?></a></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>
</section>

<section class="section section-alt" id="partners">
  <div class="container" style="max-width: 760px;">
    <span class="eyebrow">Who We Work With</span>
    <h2><?= h($partnersPage['title'] ?? 'Partners') ?></h2>
    <p style="white-space: pre-wrap; font-size: 1.05rem;"><?= h($partnersPage['body'] ?? 'Content coming soon.') ?></p>

    <div class="card reveal" style="margin-top: 1.5rem;">
      <span class="brand-tag">Certified Partner</span>
      <h3>Viessmann</h3>
      <p>Altec is a Viessmann collaborator, offering Viessmann's heating, cooling, and heat pump systems as part of our AC sales and installation service.</p>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

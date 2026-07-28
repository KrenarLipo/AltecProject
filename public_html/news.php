<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();
$slug = $_GET['slug'] ?? null;

if ($slug !== null) {
    $stmt = $pdo->prepare("
        SELECT n.slug, n.publishedAt, nt.title, nt.body
        FROM NewsPost n
        JOIN NewsPostTranslation nt ON nt.newsPostId = n.id AND nt.languageCode = ?
        WHERE n.slug = ?
    ");
    $stmt->execute([$lang, $slug]);
    $post = $stmt->fetch();

    if (!$post || !$post['publishedAt']) {
        http_response_code(404);
        $pageTitle = 'Not Found';
        require __DIR__ . '/includes/header.php';
        echo '<section class="section"><div class="container"><h1>Not Found</h1></div></section>';
        require __DIR__ . '/includes/footer.php';
        exit;
    }

    $pageTitle = $post['title'];
    require __DIR__ . '/includes/header.php';
    ?>
    <section class="section">
      <div class="container reveal" style="max-width: 760px;">
        <article>
          <span class="eyebrow"><?= h(date('F j, Y', strtotime($post['publishedAt']))) ?></span>
          <h1><?= h($post['title']) ?></h1>
          <p style="white-space: pre-wrap; font-size: 1.05rem;"><?= h($post['body']) ?></p>
        </article>
      </div>
    </section>
    <?php
    require __DIR__ . '/includes/footer.php';
    exit;
}

$posts = $pdo->prepare("
    SELECT n.slug, nt.title
    FROM NewsPost n
    JOIN NewsPostTranslation nt ON nt.newsPostId = n.id AND nt.languageCode = ?
    WHERE n.publishedAt IS NOT NULL
    ORDER BY n.publishedAt DESC
");
$posts->execute([$lang]);
$posts = $posts->fetchAll();

$pageTitle = 'News';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Updates</span>
    <h1>News</h1>
    <p>The latest from Altec — new products, completed projects, and company updates.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: 760px;">
    <?php if (empty($posts)): ?>
      <p>No news posts yet.</p>
    <?php else: ?>
      <ul class="card-list">
        <?php foreach ($posts as $post): ?>
          <li class="reveal"><a href="/news/<?= h($post['slug']) ?>"><?= h($post['title']) ?></a></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

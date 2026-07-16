<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();
$slug = $_GET['slug'] ?? null;

if ($slug !== null) {
    $stmt = $pdo->prepare("
        SELECT n.slug, n.publishedAt, nt.title, nt.body
        FROM NewsPost n
        JOIN NewsPostTranslation nt ON nt.newsPostId = n.id AND nt.languageCode = 'en'
        WHERE n.slug = ?
    ");
    $stmt->execute([$slug]);
    $post = $stmt->fetch();

    if (!$post || !$post['publishedAt']) {
        http_response_code(404);
        $pageTitle = 'Not Found';
        require __DIR__ . '/includes/header.php';
        echo '<h1>Not Found</h1>';
        require __DIR__ . '/includes/footer.php';
        exit;
    }

    $pageTitle = $post['title'];
    require __DIR__ . '/includes/header.php';
    ?>
    <article>
      <h1><?= h($post['title']) ?></h1>
      <p style="white-space: pre-wrap;"><?= h($post['body']) ?></p>
    </article>
    <?php
    require __DIR__ . '/includes/footer.php';
    exit;
}

$posts = $pdo->query("
    SELECT n.slug, nt.title
    FROM NewsPost n
    JOIN NewsPostTranslation nt ON nt.newsPostId = n.id AND nt.languageCode = 'en'
    WHERE n.publishedAt IS NOT NULL
    ORDER BY n.publishedAt DESC
")->fetchAll();

$pageTitle = 'News';
require __DIR__ . '/includes/header.php';
?>

<h1>News</h1>
<?php if (empty($posts)): ?>
  <p>No news posts yet.</p>
<?php endif; ?>
<ul>
  <?php foreach ($posts as $post): ?>
    <li><a href="/news/<?= h($post['slug']) ?>"><?= h($post['title']) ?></a></li>
  <?php endforeach; ?>
</ul>

<?php require __DIR__ . '/includes/footer.php'; ?>

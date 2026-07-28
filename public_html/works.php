<?php
require __DIR__ . '/includes/bootstrap.php';

$lang = current_lang();
$pdo = get_pdo();
$id = $_GET['id'] ?? null;

if ($id !== null) {
    $stmt = $pdo->prepare("
        SELECT w.id, w.projectType, w.date, wt.title, wt.description
        FROM WorkItem w
        JOIN WorkItemTranslation wt ON wt.workItemId = w.id AND wt.languageCode = ?
        WHERE w.id = ?
    ");
    $stmt->execute([$lang, $id]);
    $project = $stmt->fetch();

    if (!$project) {
        http_response_code(404);
        $pageTitle = 'Not Found';
        require __DIR__ . '/includes/header.php';
        echo '<section class="section"><div class="container"><h1>Not Found</h1></div></section>';
        require __DIR__ . '/includes/footer.php';
        exit;
    }

    $imagesStmt = $pdo->prepare('SELECT url FROM WorkItemImage WHERE workItemId = ? ORDER BY isPrimary DESC, sortOrder ASC');
    $imagesStmt->execute([$id]);
    $images = $imagesStmt->fetchAll(PDO::FETCH_COLUMN);

    $pageTitle = $project['title'];
    require __DIR__ . '/includes/header.php';
    ?>
    <section class="section">
      <div class="container reveal" style="max-width: 900px;">
        <a href="/works" class="link-more">&larr; All works</a>
        <?php if ($project['projectType']): ?><span class="brand-tag" style="margin-top:1rem;"><?= h($project['projectType']) ?></span><?php endif; ?>
        <h1><?= h($project['title']) ?></h1>
        <?php if ($project['description']): ?>
          <p style="white-space: pre-wrap; font-size: 1.05rem;"><?= h($project['description']) ?></p>
        <?php endif; ?>
        <?php if (!empty($images)): ?>
          <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin-top: 1.5rem;">
            <?php foreach ($images as $imageUrl): ?>
              <img src="<?= h($imageUrl) ?>" alt="" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius);">
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </section>
    <?php
    require __DIR__ . '/includes/footer.php';
    exit;
}

$workItems = $pdo->prepare("
    SELECT w.id, w.projectType, wt.title, wt.description
    FROM WorkItem w
    JOIN WorkItemTranslation wt ON wt.workItemId = w.id AND wt.languageCode = ?
    ORDER BY w.date DESC
");
$workItems->execute([$lang]);
$workItems = $workItems->fetchAll();

$imageStmt = $pdo->prepare('SELECT url FROM WorkItemImage WHERE workItemId = ? ORDER BY isPrimary DESC, sortOrder ASC LIMIT 1');

$pageTitle = 'Works';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Portfolio</span>
    <h1>Works</h1>
    <p>A selection of projects completed by Altec — AC installations, reconstructions, and furnishing work.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    <?php if (empty($workItems)): ?>
      <p>No projects published yet.</p>
    <?php else: ?>
      <div class="grid">
        <?php foreach ($workItems as $item): ?>
          <?php
          $imageStmt->execute([$item['id']]);
          $thumbnail = $imageStmt->fetchColumn();
          ?>
          <a class="card reveal" href="/works/<?= (int) $item['id'] ?>" style="display: block; color: inherit;">
            <?php if ($thumbnail): ?>
              <img src="<?= h($thumbnail) ?>" alt="<?= h($item['title']) ?>" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius); margin-bottom: 0.8rem;">
            <?php endif; ?>
            <?php if ($item['projectType']): ?><span class="brand-tag"><?= h($item['projectType']) ?></span><?php endif; ?>
            <h3><?= h($item['title']) ?></h3>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

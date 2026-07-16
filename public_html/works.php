<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();
$workItems = $pdo->query("
    SELECT w.id, w.projectType, wt.title, wt.description
    FROM WorkItem w
    JOIN WorkItemTranslation wt ON wt.workItemId = w.id AND wt.languageCode = 'en'
    ORDER BY w.date DESC
")->fetchAll();

$pageTitle = 'Works';
require __DIR__ . '/includes/header.php';
?>

<h1>Works</h1>
<?php if (empty($workItems)): ?>
  <p>No projects published yet.</p>
<?php endif; ?>
<ul>
  <?php foreach ($workItems as $item): ?>
    <li style="margin-bottom: 1rem;">
      <strong><?= h($item['title']) ?></strong>
      <?php if ($item['projectType']): ?><span> — <?= h($item['projectType']) ?></span><?php endif; ?>
      <?php if ($item['description']): ?><p><?= h($item['description']) ?></p><?php endif; ?>
    </li>
  <?php endforeach; ?>
</ul>

<?php require __DIR__ . '/includes/footer.php'; ?>

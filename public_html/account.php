<?php
require __DIR__ . '/includes/bootstrap.php';

$admin = current_admin();
if (!$admin) {
    header('Location: /login.php');
    exit;
}

$roleLabels = ['OWNER' => 'Administrator', 'EDITOR' => 'Editor', 'SUBSCRIBER' => 'Subscriber'];

$pageTitle = 'My Account';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Your Account</span>
    <h1>My Account</h1>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: 480px;">
    <ul class="info-list">
      <li>Name: <?= h($admin['name'] ?? '—') ?></li>
      <li>Email: <?= h($admin['email']) ?></li>
      <li>Role: <?= h($roleLabels[$admin['role']] ?? $admin['role']) ?></li>
    </ul>

    <?php if ($admin['role'] === 'EDITOR'): ?>
      <p><a href="/admin/" class="btn">Go to Admin Panel</a></p>
    <?php endif; ?>

    <form method="post" action="/logout.php" style="margin-top: 1rem;">
      <button type="submit" class="btn btn-outline">Log Out</button>
    </form>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

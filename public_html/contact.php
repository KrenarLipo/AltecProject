<?php
require __DIR__ . '/includes/bootstrap.php';

$pdo = get_pdo();
$settings = get_settings();
$submitted = false;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($name === '' || $email === '' || $message === '') {
        $error = 'Please fill in your name, email, and message.';
    } else {
        $stmt = $pdo->prepare('
            INSERT INTO ContactSubmission (name, email, phone, message, createdAt, `read`)
            VALUES (?, ?, ?, ?, NOW(3), 0)
        ');
        $stmt->execute([$name, $email, $phone ?: null, $message]);
        $submitted = true;
    }
}

$pageTitle = 'Contact';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Get In Touch</span>
    <h1>Contact</h1>
    <p>Questions about AC installation, reconstruction, or a Viessmann product? Send us a message.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: 620px;">
    <?php if ($settings['contact_phone'] || $settings['contact_email'] || $settings['contact_address']): ?>
      <ul class="info-list">
        <?php if ($settings['contact_phone']): ?><li>Tel: <?= h($settings['contact_phone']) ?></li><?php endif; ?>
        <?php if ($settings['contact_email']): ?><li>Email: <?= h($settings['contact_email']) ?></li><?php endif; ?>
        <?php if ($settings['contact_address']): ?><li><?= h($settings['contact_address']) ?></li><?php endif; ?>
      </ul>
    <?php endif; ?>

    <?php if ($submitted): ?>
      <div class="form-note">Thanks — we'll be in touch soon.</div>
    <?php else: ?>
      <?php if ($error): ?><div class="form-note error" style="margin-bottom: 1rem;"><?= h($error) ?></div><?php endif; ?>
      <form method="post">
        <div class="form-field">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" required value="<?= h($_POST['name'] ?? '') ?>">
        </div>
        <div class="form-field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required value="<?= h($_POST['email'] ?? '') ?>">
        </div>
        <div class="form-field">
          <label for="phone">Phone</label>
          <input id="phone" name="phone" type="tel" value="<?= h($_POST['phone'] ?? '') ?>">
        </div>
        <div class="form-field">
          <label for="message">Message</label>
          <textarea id="message" name="message" required rows="5"><?= h($_POST['message'] ?? '') ?></textarea>
        </div>
        <button class="btn" type="submit">Send</button>
      </form>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

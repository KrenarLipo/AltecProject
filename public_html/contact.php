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

<h1>Contact</h1>
<?php if ($settings['contact_phone']): ?><p>Tel: <?= h($settings['contact_phone']) ?></p><?php endif; ?>
<?php if ($settings['contact_email']): ?><p>Email: <?= h($settings['contact_email']) ?></p><?php endif; ?>
<?php if ($settings['contact_address']): ?><p><?= h($settings['contact_address']) ?></p><?php endif; ?>

<?php if ($submitted): ?>
  <p>Thanks — we'll be in touch soon.</p>
<?php else: ?>
  <?php if ($error): ?><p style="color: crimson;"><?= h($error) ?></p><?php endif; ?>
  <form method="post" style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 480px;">
    <label>
      Name
      <input name="name" type="text" required value="<?= h($_POST['name'] ?? '') ?>">
    </label>
    <label>
      Email
      <input name="email" type="email" required value="<?= h($_POST['email'] ?? '') ?>">
    </label>
    <label>
      Phone
      <input name="phone" type="tel" value="<?= h($_POST['phone'] ?? '') ?>">
    </label>
    <label>
      Message
      <textarea name="message" required rows="5"><?= h($_POST['message'] ?? '') ?></textarea>
    </label>
    <button type="submit">Send</button>
  </form>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

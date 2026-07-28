<?php
require __DIR__ . '/includes/bootstrap.php';

$errors = [];
$name = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm'] ?? '';

    if ($name === '') {
        $errors[] = 'Please enter your name.';
    }
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email.';
    }
    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }
    if ($password !== $confirm) {
        $errors[] = "Passwords don't match.";
    }

    if (empty($errors)) {
        $pdo = get_pdo();
        $stmt = $pdo->prepare('SELECT id FROM AdminUser WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $errors[] = 'An account with that email already exists.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('INSERT INTO AdminUser (name, email, passwordHash, role) VALUES (?, ?, ?, ?)');
            $stmt->execute([$name, $email, $hash, 'SUBSCRIBER']);
            login_session([
                'id' => (int) $pdo->lastInsertId(),
                'name' => $name,
                'email' => $email,
                'role' => 'SUBSCRIBER',
            ]);
            header('Location: /account.php');
            exit;
        }
    }
}

$pageTitle = 'Register';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Join Us</span>
    <h1>Create an Account</h1>
    <p>Register for an account below.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: 480px;">
    <?php foreach ($errors as $error): ?>
      <div class="form-note error" style="margin-bottom: 1rem;"><?= h($error) ?></div>
    <?php endforeach; ?>
    <form method="post">
      <div class="form-field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" required value="<?= h($name) ?>">
      </div>
      <div class="form-field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required value="<?= h($email) ?>">
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required minlength="8">
      </div>
      <div class="form-field">
        <label for="confirm">Confirm Password</label>
        <input id="confirm" name="confirm" type="password" required minlength="8">
      </div>
      <button class="btn" type="submit">Register</button>
    </form>
    <p style="margin-top: 1.25rem;">Already have an account? <a href="/login.php">Log in</a></p>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

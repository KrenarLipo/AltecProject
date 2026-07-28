<?php
require __DIR__ . '/includes/bootstrap.php';

$error = null;
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $user = attempt_login($email, $password);

    if (!$user) {
        $error = 'Invalid email or password.';
    } elseif ($user['role'] === 'OWNER') {
        $error = 'Administrators must log in at /admin.';
    } else {
        login_session($user);
        header('Location: ' . ($user['role'] === 'EDITOR' ? '/admin/' : '/account.php'));
        exit;
    }
}

$pageTitle = 'Login';
require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <span class="eyebrow" style="color:#fff;">Welcome Back</span>
    <h1>Login</h1>
    <p>Sign in to your account.</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width: 480px;">
    <?php if ($error): ?><div class="form-note error" style="margin-bottom: 1rem;"><?= h($error) ?></div><?php endif; ?>
    <form method="post">
      <div class="form-field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required value="<?= h($email) ?>">
      </div>
      <div class="form-field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required>
      </div>
      <button class="btn" type="submit">Log In</button>
    </form>
    <p style="margin-top: 1.25rem;">New here? <a href="/register.php">Create an account</a></p>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php
$settings = get_settings();
$footerMenu = get_menu_tree($lang ?? current_lang(), 'FOOTER');
?>
</main>
<footer class="site-footer">
  <div class="container">
    <div>
      <div class="brand-line">
        <img src="/assets/img/altec-logo.png" alt="Altec Group">
      </div>
      <p>AC sales &amp; installation, reconstruction, and home furnishing in Albania.</p>
    </div>
    <div>
      <h4>Contact</h4>
      <?php if ($settings['contact_phone']): ?><p>Tel: <?= h($settings['contact_phone']) ?></p><?php endif; ?>
      <?php if ($settings['contact_email']): ?><p>Email: <?= h($settings['contact_email']) ?></p><?php endif; ?>
      <?php if ($settings['contact_address']): ?><p><?= h($settings['contact_address']) ?></p><?php endif; ?>
      <?php if ($currentAdmin = current_admin()): ?>
        <p><a href="/account.php"><?= h($currentAdmin['name'] ?? 'My Account') ?></a></p>
      <?php else: ?>
        <p><a href="/login.php">Login / Register</a></p>
      <?php endif; ?>
    </div>
    <?php if (!empty($footerMenu)): ?>
      <div>
        <h4>More</h4>
        <?php foreach ($footerMenu as $item): ?>
          <p><a href="<?= h($item['href']) ?>"><?= h($item['label']) ?></a></p>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
    <div>
      <h4>Follow</h4>
      <div class="social-links">
        <?php if ($settings['social_facebook']): ?><a href="<?= h($settings['social_facebook']) ?>">Facebook</a><?php endif; ?>
        <?php if ($settings['social_instagram']): ?><a href="<?= h($settings['social_instagram']) ?>">Instagram</a><?php endif; ?>
        <?php if ($settings['social_linkedin']): ?><a href="<?= h($settings['social_linkedin']) ?>">LinkedIn</a><?php endif; ?>
        <?php if ($settings['social_youtube']): ?><a href="<?= h($settings['social_youtube']) ?>">YouTube</a><?php endif; ?>
      </div>
    </div>
  </div>
  <div class="footer-bottom">&copy; <?= date('Y') ?> <?= h($settings['site_name']) ?>. All rights reserved.</div>
</footer>
</body>
</html>

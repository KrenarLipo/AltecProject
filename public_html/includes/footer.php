<?php
$settings = get_settings();
?>
</main>
<footer>
  <div class="inner">
    <p style="font-weight:700;"><?= h($settings['site_name']) ?></p>
    <?php if ($settings['contact_phone']): ?><p>Tel: <?= h($settings['contact_phone']) ?></p><?php endif; ?>
    <?php if ($settings['contact_email']): ?><p>Email: <?= h($settings['contact_email']) ?></p><?php endif; ?>
    <?php if ($settings['contact_address']): ?><p><?= h($settings['contact_address']) ?></p><?php endif; ?>
    <p style="display:flex;gap:1rem;margin-top:0.5rem;">
      <?php if ($settings['social_facebook']): ?><a href="<?= h($settings['social_facebook']) ?>">Facebook</a><?php endif; ?>
      <?php if ($settings['social_instagram']): ?><a href="<?= h($settings['social_instagram']) ?>">Instagram</a><?php endif; ?>
      <?php if ($settings['social_linkedin']): ?><a href="<?= h($settings['social_linkedin']) ?>">LinkedIn</a><?php endif; ?>
      <?php if ($settings['social_youtube']): ?><a href="<?= h($settings['social_youtube']) ?>">YouTube</a><?php endif; ?>
    </p>
  </div>
</footer>
</body>
</html>

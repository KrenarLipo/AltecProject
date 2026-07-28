<?php
require __DIR__ . '/includes/bootstrap.php';

logout_session();
header('Location: /');
exit;

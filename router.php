<?php
/**
 * Dev-only router for PHP's built-in server, which does not read .htaccess.
 * Mirrors public_html/.htaccess. Usage: php -S localhost:8000 -t public_html router.php
 */

$root = $_SERVER['DOCUMENT_ROOT'];
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// API front controller
if (preg_match('#^/api/(.*)$#', $uri, $m)) {
    $_GET['__route'] = $m[1];
    require $root . '/api/index.php';
    return true;
}

// Admin SPA — serve real built assets as-is, otherwise fall back to index.html
if (preg_match('#^/admin/(.*)$#', $uri, $m)) {
    $file = $root . '/admin/' . $m[1];
    if ($m[1] !== '' && is_file($file)) {
        return false;
    }
    require $root . '/admin/index.html';
    return true;
}

// Existing static files (css, images, etc.)
if ($uri !== '/' && file_exists($root . $uri)) {
    return false;
}

$routes = [
    '#^/about/?$#' => '/about.php',
    '#^/partners/?$#' => '/partners.php',
    '#^/ac-sales-installation/?$#' => '/ac-sales-installation.php',
    '#^/reconstruction-furnishing/?$#' => '/reconstruction-furnishing.php',
    '#^/works/?$#' => '/works.php',
    '#^/contact/?$#' => '/contact.php',
];

foreach ($routes as $pattern => $target) {
    if (preg_match($pattern, $uri)) {
        require $root . $target;
        return true;
    }
}

if (preg_match('#^/news/([a-zA-Z0-9-]+)/?$#', $uri, $m)) {
    $_GET['slug'] = $m[1];
    require $root . '/news.php';
    return true;
}

if (preg_match('#^/news/?$#', $uri)) {
    require $root . '/news.php';
    return true;
}

if ($uri === '/' || $uri === '') {
    require $root . '/index.php';
    return true;
}

return false;

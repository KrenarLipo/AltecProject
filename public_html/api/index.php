<?php
require __DIR__ . '/../includes/bootstrap.php';

header('Content-Type: application/json');

function request_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

$route = $_GET['__route'] ?? '';
$segments = array_values(array_filter(explode('/', $route), fn($s) => $s !== ''));
$resource = $segments[0] ?? '';
$sub = $segments[1] ?? null; // action name (auth) or numeric id (everything else)
$subResource = $segments[2] ?? null; // e.g. "images" in /products/{id}/images[/{imageId}]
$subResourceId = $segments[3] ?? null;
$method = $_SERVER['REQUEST_METHOD'];
$pdo = get_pdo();

$handlers = [
    'auth' => 'auth.php',
    'admin-users' => 'admin-users.php',
    'categories' => 'categories.php',
    'products' => 'products.php',
    'menu-items' => 'menu-items.php',
    'works' => 'works.php',
    'news' => 'news.php',
    'pages' => 'pages.php',
    'settings' => 'settings.php',
    'contact' => 'contact.php',
    'uploads' => 'uploads.php',
    'slides' => 'slides.php',
];

if (!isset($handlers[$resource])) {
    json_response(['error' => 'Not found'], 404);
}

require __DIR__ . '/handlers/' . $handlers[$resource];
json_response(['error' => 'Not found'], 404);

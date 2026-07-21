<?php
// POST /api/uploads — generic admin-only file upload.
// Accepts a single multipart field named "file". Mime-sniffs the actual
// content (never trusts the client's declared type/extension), stores it
// under public_html/uploads/{images|video|documents}/<random>.<ext>, and
// returns the public URL for the caller to attach to a specific resource
// (ProductImage, WorkItemImage, Slide, or Product.brochureUrl).

require_admin();

if ($method !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_response(['error' => 'No file uploaded'], 400);
}

$tmpPath = $_FILES['file']['tmp_name'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($tmpPath);

$allowed = [
    'image/jpeg' => ['images', 'jpg', 8 * 1024 * 1024],
    'image/png' => ['images', 'png', 8 * 1024 * 1024],
    'image/webp' => ['images', 'webp', 8 * 1024 * 1024],
    'image/gif' => ['images', 'gif', 8 * 1024 * 1024],
    'video/mp4' => ['video', 'mp4', 40 * 1024 * 1024],
    'video/webm' => ['video', 'webm', 40 * 1024 * 1024],
    'application/pdf' => ['documents', 'pdf', 15 * 1024 * 1024],
];

if (!isset($allowed[$mime])) {
    json_response(['error' => 'Unsupported file type: ' . $mime], 400);
}

[$subdir, $ext, $maxBytes] = $allowed[$mime];

if ($_FILES['file']['size'] > $maxBytes) {
    json_response(['error' => 'File too large'], 400);
}

$targetDir = __DIR__ . '/../../uploads/' . $subdir;
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$targetPath = $targetDir . '/' . $filename;

if (!move_uploaded_file($tmpPath, $targetPath)) {
    json_response(['error' => 'Failed to save file'], 500);
}

json_response([
    'url' => '/uploads/' . $subdir . '/' . $filename,
    'mimeType' => $mime,
], 201);

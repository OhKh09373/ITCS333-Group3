<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

if (!isset($_FILES['image'])) {
  http_response_code(400);
  echo json_encode(['error' => 'No image uploaded']);
  exit;
}

$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
  mkdir($uploadDir, 0777, true);
}

$file = $_FILES['image'];
$maxSize = 1000000; // 1MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

if ($file['size'] > $maxSize) {
  http_response_code(400);
  echo json_encode(['error' => 'Image is too large (max 1MB)']);
  exit;
}

if (!in_array($file['type'], $allowedTypes)) {
  http_response_code(400);
  echo json_encode(['error' => 'Only JPG, PNG, and GIF images are allowed']);
  exit;
}

$filename = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9\.]/', '_', $file['name']);
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
  echo json_encode([
    'success' => true,
    'image_url' => $destination
  ]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to upload image']);
}
?>
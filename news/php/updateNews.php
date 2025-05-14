<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = '127.0.0.1';
$db = getenv('db_name') ?: 'mydb';
$user = getenv('db_user') ?: 'user2';
$pass = getenv('db_pass') ?: 'fatema123';
$charset = 'utf8mb4';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

//  Get form data
$id = $_POST['id'] ?? null;
$title = $_POST['title'] ?? '';
$body = $_POST['body'] ?? '';
$category = $_POST['category'] ?? '';

if (empty($id) || empty($title) || empty($body) || empty($category)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

//  Get existing news to keep old image if no new one is uploaded
$stmt = $pdo->prepare("SELECT image_url FROM news WHERE id = ?");
$stmt->execute([$id]);
$existingNews = $stmt->fetch();

if (!$existingNews) {
    http_response_code(404);
    echo json_encode(['error' => 'News not found']);
    exit;
}

$image_url = $existingNews['image_url'];

//  Handle new image upload if provided
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = uniqid() . '_' . basename($_FILES['image']['name']);
    $filepath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $filepath)) {
        $image_url = '/uploads/' . $filename;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload image']);
        exit;
    }
}

//  Update news in database
try {
    $stmt = $pdo->prepare("UPDATE news SET title = ?, body = ?, category = ?, image_url = ? WHERE id = ?");
    $stmt->execute([$title, $body, $category, $image_url, $id]);

    echo json_encode(['message' => 'News updated successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update news: ' . $e->getMessage()]);
}
?>

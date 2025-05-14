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

//  Receive data
$title = $_POST['title'] ?? '';
$body = $_POST['body'] ?? '';
$category = $_POST['category'] ?? '';
$short_desc = $_POST['short_desc'] ?? '';
$publish_date = date('Y-m-d H:i:s');

//  Validate
if (empty($title) || empty($body) || empty($category) || empty($short_desc)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: title, body, category, short_desc']);
    exit;
}

// Handle image upload
$image_url = null;

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
        echo json_encode(['error' => 'Image upload failed']);
        exit;
    }
}

// Insert into DB 
try {
    $stmt = $pdo->prepare("INSERT INTO news (title, body, short_desc, category, image_url, publish_date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$title, $body, $short_desc, $category, $image_url, $publish_date]);

    echo json_encode(['message' => 'News added successfully', 'id' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to insert news: ' . $e->getMessage()]);
}
?>

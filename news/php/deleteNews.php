<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Database Connection
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

// Handle OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get ID from query
$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing news ID']);
    exit;
}

// Perform Delete
try {
    $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'News deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'News not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete news: ' . $e->getMessage()]);
}
?>

<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = '127.0.0.1';
$db = 'mydb';
$user = 'user2';
$pass = 'fatema123';
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

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// GET comments
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $news_id = $_GET['news_id'] ?? null;
    if (!$news_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing news_id']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, name, comment, created_at FROM comment WHERE news_id = ? ORDER BY created_at DESC");
    $stmt->execute([$news_id]);
    $comments = $stmt->fetchAll();

    echo json_encode(['data' => $comments]);
    exit;
}

// POST comment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $news_id = $_POST['news_id'] ?? null;
    $name = $_POST['name'] ?? 'Anonymous';
    $comment = $_POST['comment'] ?? '';

    if (!$news_id || !$comment) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO comment (news_id, name, comment, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$news_id, $name, $comment]);

    echo json_encode(['message' => 'Comment added successfully']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>

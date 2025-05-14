<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$groupId = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

if ($groupId <= 0) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid or missing group_id']);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $stmt = $pdo->prepare("SELECT * FROM comments WHERE group_id = ? ORDER BY created_at DESC");
  $stmt->execute([$groupId]);
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['content']) || empty(trim($data['content']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Content is required']);
    exit;
  }

  $stmt = $pdo->prepare("INSERT INTO comments (group_id, content) VALUES (?, ?)");
  $stmt->execute([$groupId, $data['content']]);

  echo json_encode([
    'message' => 'Comment added successfully',
    'comment' => [
      'content' => $data['content'],
      'created_at' => date('Y-m-d H:i:s')
    ]
  ]);
}
?>
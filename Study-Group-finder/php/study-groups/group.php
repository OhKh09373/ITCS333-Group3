<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid or missing group ID']);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $stmt = $pdo->prepare("SELECT * FROM study_groups WHERE id = ?");
  $stmt->execute([$id]);
  $group = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($group) {
    echo json_encode($group);
  } else {
    http_response_code(404);
    echo json_encode(['error' => 'Study group not found']);
  }

} elseif ($method === 'PUT') {
  $data = json_decode(file_get_contents("php://input"), true);
  
  if (!isset($data['name'], $data['course'], $data['description'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
  }

  $stmt = $pdo->prepare("UPDATE study_groups SET 
    name = :name,
    course = :course,
    description = :description,
    meeting_day = :meeting_day,
    meeting_time = :meeting_time,
    location = :location,
    max_members = :max_members,
    contact = :contact,
    image_url = :image_url
    WHERE id = :id");
  
  $stmt->execute([
    ':id' => $id,
    ':name' => $data['name'],
    ':course' => $data['course'],
    ':description' => $data['description'],
    ':meeting_day' => $data['meeting_day'] ?? null,
    ':meeting_time' => $data['meeting_time'] ?? null,
    ':location' => $data['location'] ?? null,
    ':max_members' => $data['max_members'] ?? null,
    ':contact' => $data['contact'] ?? null,
    ':image_url' => $data['image_url'] ?? null
  ]);
  
  echo json_encode(['message' => 'Study group updated successfully']);

} elseif ($method === 'DELETE') {
  $stmt = $pdo->prepare("DELETE FROM study_groups WHERE id = ?");
  $stmt->execute([$id]);

  if ($stmt->rowCount()) {
    echo json_encode(['message' => 'Study group deleted']);
  } else {
    http_response_code(404);
    echo json_encode(['error' => 'Study group not found or already deleted']);
  }
}
?>
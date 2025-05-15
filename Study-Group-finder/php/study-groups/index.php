<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $query = $pdo->query("SELECT * FROM study_groups ORDER BY created_at DESC");
  echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);

  // Required fields validation
  $required = ['name', 'course', 'description', 'meeting_day', 'meeting_time', 'location', 'max_members', 'contact'];
  foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
      http_response_code(400);
      echo json_encode(['error' => "Missing required field: $field"]);
      exit;
    }
  }

  try {
    $stmt = $pdo->prepare("INSERT INTO study_groups 
      (name, course, description, meeting_day, meeting_time, location, max_members, contact, image_url)
      VALUES (:name, :course, :description, :meeting_day, :meeting_time, :location, :max_members, :contact, :image_url)");

    $stmt->execute([
      ':name' => $data['name'],
      ':course' => $data['course'],
      ':description' => $data['description'],
      ':meeting_day' => $data['meeting_day'],
      ':meeting_time' => $data['meeting_time'],
      ':location' => $data['location'],
      ':max_members' => (int)$data['max_members'],
      ':contact' => $data['contact'],
      ':image_url' => $data['image_url'] ?? null
    ]);

    $groupId = $pdo->lastInsertId();
    echo json_encode([
      'message' => 'Study group created successfully',
      'group_id' => $groupId
    ]);
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
  }
}
?>
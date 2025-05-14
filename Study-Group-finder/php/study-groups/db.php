<?php
$host = 'localhost';
$dbname = 'mydb';
$username = 'user1';
$password = 'abcd1234';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed']);
  exit;
}
?>

<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

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

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handle GET with pagination, search, filter, sort
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = $_GET['search'] ?? '';
    $category = $_GET['category'] ?? '';
    $sort = $_GET['sort'] ?? 'newest';

    $conditions = [];
    $params = [];

    if (!empty($search)) {
        $conditions[] = "(title LIKE ? OR body LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if (!empty($category)) {
        $conditions[] = "category = ?";
        $params[] = $category;
    }

    $where = count($conditions) > 0 ? "WHERE " . implode(" AND ", $conditions) : "";

    $orderBy = "publish_date DESC";
    if ($sort === 'oldest') $orderBy = "publish_date ASC";
    if ($sort === 'title') $orderBy = "title ASC";

    // Total count for pagination
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM news $where");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // Fetch paginated data
    $stmt = $pdo->prepare("SELECT id, title, body, short_desc, category, publish_date, image_url FROM news $where ORDER BY $orderBy LIMIT ? OFFSET ?");
    foreach ($params as $i => $param) {
        $stmt->bindValue($i + 1, $param, PDO::PARAM_STR);
    }
    $stmt->bindValue(count($params) + 1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    $news = $stmt->fetchAll();

    echo json_encode(['data' => $news, 'total' => (int)$total]);
    exit;
}

// Handle POST (Add News)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $body = $_POST['body'] ?? '';
    $category = $_POST['category'] ?? '';
    $short_desc = $_POST['short_desc'] ?? '';
    $publish_date = date('Y-m-d H:i:s');

    $image_url = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $imageName = uniqid() . '_' . basename($_FILES['image']['name']);
        $targetFile = $uploadDir . $imageName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
            $image_url = '/' . $targetFile;
        }
    }

    if (empty($title) || empty($body) || empty($category) || empty($short_desc)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO news (title, body, short_desc, category, image_url, publish_date) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $body, $short_desc, $category, $image_url, $publish_date]);

        echo json_encode(['message' => 'News added', 'id' => $pdo->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to insert news']);
    }
    exit;
}

// Handle DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $deleteVars);
    $id = $deleteVars['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'News deleted']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete news']);
    }
    exit;
}

// Method Not Allowed
http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
?>

<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$input = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];
$table = $_GET['table'] ?? 'activities';

if ($table === 'comments') {
    handleComments($method, $pdo, $input);
} else {
    handleActivities($method, $pdo, $input);
}

function handleActivities($method, $pdo, $input) {
    if ($method === 'GET') {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;

        $countStmt = $pdo->query("SELECT COUNT(*) FROM activities");
        $total = (int)$countStmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT * FROM activities ORDER BY date DESC LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $activities,
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "total" => $total,
                "pages" => max(1, ceil($total / $limit))
            ]
        ]);
    }

    elseif ($method === 'POST') {
        try {
            $stmt = $pdo->prepare("INSERT INTO activities (title, club, date, category, description) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['title'] ?? '',
                $input['club'] ?? '',
                $input['date'] ?? '',
                $input['category'] ?? '',
                $input['description'] ?? ''
            ]);
            $id = $pdo->lastInsertId();  // ✅ Get inserted ID
            echo json_encode(['status' => 'Activity added', 'id' => $id]);  // ✅ Send back
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Failed to add activity: ' . $e->getMessage()]);
        }
    }


    elseif ($method === 'PUT') {
            $data = $input;

            if (!isset($data['id'])) {
                echo json_encode(['error' => 'Missing activity ID']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("UPDATE activities SET title=?, club=?, date=?, category=?, description=? WHERE id=?");
                $stmt->execute([
                    $data['title'], $data['club'], $data['date'],
                    $data['category'], $data['description'], $data['id']
                ]);

                // Check if any rows were actually updated
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['status' => 'Activity updated']);
                } else {
                    echo json_encode(['status' => 'No changes made to the activity']);
                }
            } catch (PDOException $e) {
                echo json_encode(['error' => 'Failed to update activity: ' . $e->getMessage()]);
            }
        }


    elseif ($method === 'DELETE' && isset($_GET['id'])) {
        try {
            $stmt = $pdo->prepare("DELETE FROM activities WHERE id=?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(['status' => 'Activity deleted']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Failed to delete activity: ' . $e->getMessage()]);
        }
    }
}

function handleComments($method, $pdo, $input) {
    if ($method === 'GET' && isset($_GET['activity_id'])) {
        $stmt = $pdo->prepare("SELECT * FROM comments WHERE activity_id = ? ORDER BY created_at DESC");
        $stmt->execute([$_GET['activity_id']]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    elseif ($method === 'POST') {
        if (isset($input['activity_id'], $input['author'], $input['content'])) {
            try {
                $stmt = $pdo->prepare("INSERT INTO comments (activity_id, author, content) VALUES (?, ?, ?)");
                $stmt->execute([$input['activity_id'], $input['author'], $input['content']]);
                echo json_encode(['status' => 'Comment added']);
            } catch (PDOException $e) {
                echo json_encode(['error' => 'Failed to add comment: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['error' => 'Missing required fields']);
        }
    }
}
?>

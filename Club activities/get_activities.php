<?php
require 'db.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

try {
    $countStmt = $pdo->query("SELECT COUNT(*) FROM club_activities");
    $total = $countStmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT * FROM club_activities ORDER BY date DESC LIMIT :limit OFFSET :offset");
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
            "total" => (int) $total,
            "pages" => max(1, ceil($total / $limit))
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to fetch activities"]);
}
?>
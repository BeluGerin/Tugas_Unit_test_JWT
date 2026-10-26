<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$conn = new mysqli("localhost", "root", "", "db_tugas_8_unit_test");
if ($conn->connect_error) { die(json_encode(["status" => "error", "message" => "Koneksi gagal"])); }

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {
    $action = $_POST['action'] ?? ($data['action'] ?? '');
    
    if ($action === 'add') {
        $name = $conn->real_escape_string($data['name']);
        $email = $conn->real_escape_string($data['email']);
        $role = $conn->real_escape_string($data['role']);
        $conn->query("INSERT INTO table_users (name, email, role) VALUES ('$name', '$email', '$role')");
        echo json_encode(["status" => "success"]);
    } 
    else if ($action === 'edit') {
        $id = (int)$data['id'];
        $name = $conn->real_escape_string($data['name']);
        $email = $conn->real_escape_string($data['email']);
        $role = $conn->real_escape_string($data['role']);
        $conn->query("UPDATE table_users SET name='$name', email='$email', role='$role' WHERE id=$id");
        echo json_encode(["status" => "success"]);
    }
    else if ($action === 'delete') {
        $id = (int)$data['id'];
        $conn->query("DELETE FROM table_users WHERE id=$id");
        echo json_encode(["status" => "success"]);
    }
}
$conn->close();
?>
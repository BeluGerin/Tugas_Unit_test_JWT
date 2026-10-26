<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_tugas_8_unit_test";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

$sql = "SELECT * FROM table_menu WHERE is_active = 1";
$result = $conn->query($sql);

$menus = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Paksa ubah ke integer agar sesuai dengan Angular/TypeScript
        $row['id'] = (int)$row['id'];
        $row['parent_id'] = (int)$row['parent_id'];
        $row['is_active'] = (int)$row['is_active'];
        $menus[] = $row;
    }
}

echo json_encode($menus);
$conn->close();
?>
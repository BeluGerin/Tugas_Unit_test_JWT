<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "root", "", "db_tugas_8_unit_test");
if ($conn->connect_error) { die("Koneksi gagal"); }

$result = $conn->query("SELECT * FROM table_barang");
$data = array();
while($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['stok'] = (int)$row['stok'];
    $data[] = $row;
}
echo json_encode($data);
$conn->close();
?>
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
    $action = $data['action'] ?? '';
    
    if ($action === 'add') {
        $nama_barang = $conn->real_escape_string($data['nama_barang']);
        $stok = (int)$data['stok'];
        $harga = (float)$data['harga'];
        $conn->query("INSERT INTO table_barang (nama_barang, stok, harga) VALUES ('$nama_barang', $stok, $harga)");
        echo json_encode(["status" => "success"]);
    } 
    else if ($action === 'edit') {
        $id = (int)$data['id'];
        $nama_barang = $conn->real_escape_string($data['nama_barang']);
        $stok = (int)$data['stok'];
        $harga = (float)$data['harga'];
        $conn->query("UPDATE table_barang SET nama_barang='$nama_barang', stok=$stok, harga=$harga WHERE id=$id");
        echo json_encode(["status" => "success"]);
    }
    else if ($action === 'delete') {
        $id = (int)$data['id'];
        $conn->query("DELETE FROM table_barang WHERE id=$id");
        echo json_encode(["status" => "success"]);
    }
}
$conn->close();
?>
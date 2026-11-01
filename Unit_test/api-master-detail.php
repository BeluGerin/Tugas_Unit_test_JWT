<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

function kirim($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Validasi input
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id < 1) {
    kirim(["message" => "ID dokter tidak valid"], 400);
}

// Koneksi
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $conn = new mysqli("localhost", "root", "", "db_tugas_8_unit_test");
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    kirim(["message" => "Koneksi gagal"], 500);
}

// 1) MASTER: data dokter
$stmt = $conn->prepare("SELECT id, nama, spesialisasi, kuota_harian FROM table_dokter WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$dokter = $stmt->get_result()->fetch_assoc();
if (!$dokter) {
    kirim(["message" => "Dokter tidak ditemukan"], 404);
}
$dokter['id'] = (int)$dokter['id'];
$dokter['kuota_harian'] = (int)$dokter['kuota_harian'];

// 2) KUOTA HARI INI: registrasi yang tidak ditolak
$stmt = $conn->prepare(
    "SELECT COUNT(*) AS total FROM table_pendaftaran
     WHERE dokter_id = ? AND tanggal = CURDATE() AND status_validasi <> 'Rejected'"
);
$stmt->bind_param("i", $id);
$stmt->execute();
$terpakai = (int)$stmt->get_result()->fetch_assoc()['total'];

// 3) DETAIL 1: pendaftaran pasien
$stmt = $conn->prepare(
    "SELECT id, dokter_id, id_pasien, jenis_layanan, status_validasi, tanggal
     FROM table_pendaftaran WHERE dokter_id = ? ORDER BY tanggal DESC, id"
);
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
$pendaftaran = [];
while ($row = $res->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['dokter_id'] = (int)$row['dokter_id'];
    $row['id_pasien'] = (int)$row['id_pasien'];
    $pendaftaran[] = $row;
}

// 4) DETAIL 2: jadwal operasi
$stmt = $conn->prepare(
    "SELECT id, pendaftaran_id, dokter_id, tanggal, jam, ruang_operasi, status
     FROM table_jadwal_operasi WHERE dokter_id = ? ORDER BY tanggal DESC, jam"
);
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
$jadwal = [];
while ($row = $res->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['pendaftaran_id'] = (int)$row['pendaftaran_id'];
    $row['dokter_id'] = (int)$row['dokter_id'];
    $jadwal[] = $row;
}

$conn->close();

kirim([
    "dokter"         => $dokter,
    "kuota"          => ["terpakai" => $terpakai, "maksimal" => $dokter['kuota_harian']],
    "pendaftaran"    => $pendaftaran,
    "jadwal_operasi" => $jadwal
]);

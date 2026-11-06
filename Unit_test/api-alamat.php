<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function wilayahDari(PDO $pdo, int $kecId) {
    $st = $pdo->prepare("
        SELECT p.id AS pid, k.id AS kid, c.id AS cid,
               p.nama AS pn, k.nama AS kn, c.nama AS cn
        FROM wilayah_kecamatan c
        JOIN wilayah_kabupaten k ON k.id = c.kabupaten_id
        JOIN wilayah_provinsi p  ON p.id = k.provinsi_id
        WHERE c.id = ?");
    $st->execute([$kecId]);
    return $st->fetch();
}

function bentukAlamat(array $w): string {
    return str_replace(' ', '_', implode('_', [$w['pn'], $w['kn'], $w['cn']]));
}

try {
    $pdo = new PDO(
        'mysql:host=127.0.0.1;port=3306;dbname=db_tugas_8_unit_test;charset=utf8mb4',
        'root',
        '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );

    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $in = json_decode(file_get_contents('php://input'), true) ?: [];

    if ($action === 'provinsi') {
        out($pdo->query("SELECT id, nama FROM wilayah_provinsi ORDER BY nama")->fetchAll());
    }

    if ($action === 'kabupaten') {
        $st = $pdo->prepare("SELECT id, nama FROM wilayah_kabupaten WHERE provinsi_id = ? ORDER BY nama");
        $st->execute([(int)($_GET['provinsi_id'] ?? 0)]);
        out($st->fetchAll());
    }

    if ($action === 'kecamatan') {
        $st = $pdo->prepare("SELECT id, nama FROM wilayah_kecamatan WHERE kabupaten_id = ? ORDER BY nama");
        $st->execute([(int)($_GET['kabupaten_id'] ?? 0)]);
        out($st->fetchAll());
    }

    if ($action === 'list') {
        $perPage = 5;
        $q = trim((string)($_GET['q'] ?? ''));

        $from = "FROM alamat_tersimpan a
                 JOIN wilayah_provinsi p  ON p.id = a.provinsi_id
                 JOIN wilayah_kabupaten k ON k.id = a.kabupaten_id
                 JOIN wilayah_kecamatan c ON c.id = a.kecamatan_id";
        $where = '';
        $params = [];
        if ($q !== '') {
            $where = "WHERE p.nama LIKE ? OR k.nama LIKE ? OR c.nama LIKE ? OR a.alamat LIKE ?";
            $like = "%$q%";
            $params = [$like, $like, $like, $like];
        }

        $st = $pdo->prepare("SELECT COUNT(*) $from $where");
        $st->execute($params);
        $total = (int)$st->fetchColumn();
        $totalPages = max(1, (int)ceil($total / $perPage));

        // Jika data terakhir dihapus, halaman otomatis mundur ke halaman yang ada
        $page = min(max(1, (int)($_GET['page'] ?? 1)), $totalPages);
        $offset = ($page - 1) * $perPage;

        $st = $pdo->prepare("SELECT a.id, a.provinsi_id, a.kabupaten_id, a.kecamatan_id,
                                    p.nama AS provinsi, k.nama AS kabupaten, c.nama AS kecamatan, a.alamat
                             $from $where
                             ORDER BY a.id DESC
                             LIMIT ? OFFSET ?");
        $i = 1;
        foreach ($params as $p) { $st->bindValue($i++, $p); }
        $st->bindValue($i++, $perPage, PDO::PARAM_INT);
        $st->bindValue($i, $offset, PDO::PARAM_INT);
        $st->execute();

        out([
            'data'        => $st->fetchAll(),
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => $totalPages,
        ]);
    }

    if ($action === 'simpan' && $method === 'POST') {
        $w = wilayahDari($pdo, (int)($in['kecamatan_id'] ?? 0));
        if (!$w) out(['message' => 'Kecamatan tidak valid'], 422);

        $alamat = bentukAlamat($w);
        $ins = $pdo->prepare("INSERT INTO alamat_tersimpan (provinsi_id, kabupaten_id, kecamatan_id, alamat) VALUES (?, ?, ?, ?)");
        $ins->execute([$w['pid'], $w['kid'], $w['cid'], $alamat]);

        out(['message' => 'Alamat tersimpan', 'alamat' => $alamat, 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($action === 'update' && $method === 'POST') {
        $id = (int)($in['id'] ?? 0);

        $cek = $pdo->prepare("SELECT id FROM alamat_tersimpan WHERE id = ?");
        $cek->execute([$id]);
        if (!$cek->fetch()) out(['message' => 'Data tidak ditemukan'], 404);

        $w = wilayahDari($pdo, (int)($in['kecamatan_id'] ?? 0));
        if (!$w) out(['message' => 'Kecamatan tidak valid'], 422);

        $alamat = bentukAlamat($w);
        $up = $pdo->prepare("UPDATE alamat_tersimpan
                             SET provinsi_id = ?, kabupaten_id = ?, kecamatan_id = ?, alamat = ?
                             WHERE id = ?");
        $up->execute([$w['pid'], $w['kid'], $w['cid'], $alamat, $id]);

        out(['message' => 'Alamat diperbarui', 'alamat' => $alamat]);
    }

    if ($action === 'delete' && $method === 'POST') {
        $ids = array_values(array_filter(
            array_map('intval', (array)($in['ids'] ?? [])),
            fn($x) => $x > 0
        ));
        if (!$ids) out(['message' => 'Tidak ada data dipilih'], 422);

        $ph = implode(',', array_fill(0, count($ids), '?'));
        $del = $pdo->prepare("DELETE FROM alamat_tersimpan WHERE id IN ($ph)");
        $del->execute($ids);

        out(['message' => 'Data dihapus', 'jumlah' => $del->rowCount()]);
    }

    out(['message' => 'Action tidak dikenal'], 400);

} catch (Throwable $e) {
    out(['message' => $e->getMessage()], 500);
}
-- =====================================================================
-- Master-Detail: Dokter (master) -> Pendaftaran & Jadwal Operasi (detail)
-- Jalankan di phpMyAdmin / HeidiSQL (Laragon) pada database db_tugas_8_unit_test
-- =====================================================================
USE db_tugas_8_unit_test;

-- ---------- MASTER ----------
CREATE TABLE IF NOT EXISTS table_dokter (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  spesialisasi  VARCHAR(100) NOT NULL,
  kuota_harian  INT NOT NULL DEFAULT 50   -- maksimal layanan dokter umum per hari
);

-- ---------- DETAIL 1: pendaftaran pasien ----------
CREATE TABLE IF NOT EXISTS table_pendaftaran (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  dokter_id       INT NOT NULL,
  id_pasien       INT NOT NULL,
  jenis_layanan   ENUM('Rawat Jalan','Operasi','Rawat Inap') NOT NULL,
  status_validasi ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  tanggal         DATE NOT NULL,
  FOREIGN KEY (dokter_id) REFERENCES table_dokter(id)
);

-- ---------- DETAIL 2: jadwal operasi ----------
CREATE TABLE IF NOT EXISTS table_jadwal_operasi (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  pendaftaran_id INT NOT NULL,
  dokter_id      INT NOT NULL,
  tanggal        DATE NOT NULL,
  jam            TIME NOT NULL,
  ruang_operasi  VARCHAR(20) NOT NULL,     -- OK-1 atau OK-2 (2 ruangan per hari)
  status         ENUM('Terjadwal','Selesai','Batal') NOT NULL DEFAULT 'Terjadwal',
  FOREIGN KEY (pendaftaran_id) REFERENCES table_pendaftaran(id),
  FOREIGN KEY (dokter_id) REFERENCES table_dokter(id)
);

-- ---------- DATA SAMPLE ----------
-- Kosongkan dulu agar bisa dijalankan ulang (urutan karena foreign key)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE table_jadwal_operasi;
TRUNCATE table_pendaftaran;
TRUNCATE table_dokter;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO table_dokter (id, nama, spesialisasi, kuota_harian) VALUES
(1, 'dr. Rina Kusuma, Sp.PD',     'Penyakit Dalam',   50),
(2, 'dr. Andi Wijaya',            'Dokter Umum',      50),
(3, 'dr. Sari Pertiwi, Sp.A',     'Anak',             50),
(4, 'dr. Dimas Prasetyo, Sp.OG',  'Kebidanan',        50),
(5, 'dr. Elvan Li, Sp.B',         'Bedah Umum',       50),
(6, 'dr. Maya Lestari, Sp.An',    'Anestesi',         50),
(7, 'dr. Hendra Gunawan, Sp.OT',  'Bedah Ortopedi',   50),
(8, 'dr. Lina Chandra, Sp.M',     'Mata',             50);

-- Dokter #5 hari ini: 2 pendaftaran (kuota 2/50), 1 di antaranya operasi
INSERT INTO table_pendaftaran (id, dokter_id, id_pasien, jenis_layanan, status_validasi, tanggal) VALUES
(1001, 5, 8821, 'Operasi',     'Approved', CURDATE()),
(1002, 5, 8822, 'Rawat Jalan', 'Approved', CURDATE());

INSERT INTO table_jadwal_operasi (pendaftaran_id, dokter_id, tanggal, jam, ruang_operasi, status) VALUES
(1001, 5, CURDATE(), '08:00:00', 'OK-1', 'Terjadwal');

-- ---------- MENU SIDEBAR ----------
-- Menambah satu item di sidebar (dibaca dari table_menu oleh api-menu.php)
INSERT INTO table_menu (menu_name, url_menu, parent_id, is_active)
SELECT 'Master Detail', '#', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM table_menu WHERE menu_name = 'Master Detail');

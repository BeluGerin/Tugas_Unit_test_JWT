import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dokter {
  id: number;
  nama: string;
  spesialisasi: string;
  kuota_harian: number;
}

export interface Pendaftaran {
  id: number;
  dokter_id: number;
  id_pasien: number;
  jenis_layanan: 'Rawat Jalan' | 'Operasi' | 'Rawat Inap';
  status_validasi: 'Pending' | 'Approved' | 'Rejected';
  tanggal: string;
}

export interface JadwalOperasi {
  id: number;
  pendaftaran_id: number;
  dokter_id: number;
  tanggal: string;
  jam: string;
  ruang_operasi: string;
  status: 'Terjadwal' | 'Selesai' | 'Batal';
}

export interface MasterDetailData {
  dokter: Dokter;
  kuota: { terpakai: number; maksimal: number };
  pendaftaran: Pendaftaran[];
  jadwal_operasi: JadwalOperasi[];
}

@Injectable({ providedIn: 'root' })
export class MasterDetailService {
  private http = inject(HttpClient);
  private url = 'http://localhost/Unit_test/api-master-detail.php';

  getDetail(id: number): Observable<MasterDetailData> {
    return this.http.get<MasterDetailData>(this.url, { params: { id } });
  }
}

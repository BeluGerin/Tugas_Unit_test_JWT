import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost/Unit_test/api-alamat.php';

export interface Wilayah { id: number; nama: string; }

export interface AlamatRow {
  id: number;
  provinsi_id: number;
  kabupaten_id: number;
  kecamatan_id: number;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  alamat: string;
}

export interface ListResponse {
  data: AlamatRow[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

@Injectable({ providedIn: 'root' })
export class AlamatService {
  private http = inject(HttpClient);

  getProvinsi(): Observable<Wilayah[]> {
    return this.http.get<Wilayah[]>(API, { params: { action: 'provinsi' } });
  }

  getKabupaten(provinsiId: number): Observable<Wilayah[]> {
    return this.http.get<Wilayah[]>(API, { params: { action: 'kabupaten', provinsi_id: provinsiId } });
  }

  getKecamatan(kabupatenId: number): Observable<Wilayah[]> {
    return this.http.get<Wilayah[]>(API, { params: { action: 'kecamatan', kabupaten_id: kabupatenId } });
  }

  getList(page: number, q: string): Observable<ListResponse> {
    return this.http.get<ListResponse>(API, { params: { action: 'list', page, q } });
  }

  simpan(kecamatanId: number): Observable<unknown> {
    return this.http.post(`${API}?action=simpan`, { kecamatan_id: kecamatanId });
  }

  update(id: number, kecamatanId: number): Observable<unknown> {
    return this.http.post(`${API}?action=update`, { id, kecamatan_id: kecamatanId });
  }

  hapus(ids: number[]): Observable<unknown> {
    return this.http.post(`${API}?action=delete`, { ids });
  }
}
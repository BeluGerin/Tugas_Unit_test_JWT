import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MasterDetailData, MasterDetailService } from './master-detail.service';

@Component({
  selector: 'app-master-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="md-page">
      <div class="md-header">
        <div>
          <p class="md-eyebrow">Data Master &amp; Detail</p>
          <h3 class="md-title">Dashboard Dokter</h3>
        </div>
        <div class="md-search">
          <label>ID Dokter</label>
          <div class="md-search-row">
            <input type="number" min="1" [(ngModel)]="inputId" (keyup.enter)="tampilkan()">
            <button class="md-btn" (click)="tampilkan()">Tampilkan</button>
          </div>
        </div>
      </div>

      <p *ngIf="loading" class="md-muted">Memuat data...</p>
      <p *ngIf="error" class="md-error">{{ error }}</p>

      <ng-container *ngIf="data as d">
        <!-- MASTER: kartu dokter dan kuota -->
        <div class="md-card">
          <div class="md-card-top">
            <div>
              <div class="md-muted">Dokter #{{ d.dokter.id }}</div>
              <div class="md-name">{{ d.dokter.nama }}</div>
              <div class="md-muted">{{ d.dokter.spesialisasi }}</div>
            </div>
            <div class="md-quota">
              <div class="md-muted">Kuota layanan hari ini</div>
              <div class="md-quota-num">
                <strong>{{ d.kuota.terpakai }}</strong> / {{ d.kuota.maksimal }}
              </div>
            </div>
          </div>
          <div class="md-progress">
            <div class="md-progress-bar" [style.width.%]="persen(d)"></div>
          </div>
        </div>

        <!-- DETAIL: tab pendaftaran dan jadwal operasi -->
        <div class="md-card md-tabs-card">
          <div class="md-tabs">
            <button [class.active]="tab === 'pendaftaran'" (click)="tab = 'pendaftaran'">
              Pendaftaran ({{ d.pendaftaran.length }})
            </button>
            <button [class.active]="tab === 'operasi'" (click)="tab = 'operasi'">
              Jadwal Operasi ({{ d.jadwal_operasi.length }})
            </button>
          </div>

          <table class="md-table" *ngIf="tab === 'pendaftaran'">
            <thead>
              <tr>
                <th>ID Pendaftaran</th>
                <th>ID Pasien</th>
                <th>Jenis Layanan</th>
                <th>Status Validasi</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of d.pendaftaran">
                <td class="md-bold">{{ p.id }}</td>
                <td>{{ p.id_pasien }}</td>
                <td>{{ p.jenis_layanan }}</td>
                <td>{{ p.status_validasi }}</td>
                <td>{{ p.tanggal }}</td>
              </tr>
              <tr *ngIf="d.pendaftaran.length === 0">
                <td colspan="5" class="md-muted">Belum ada pendaftaran.</td>
              </tr>
            </tbody>
          </table>

          <table class="md-table" *ngIf="tab === 'operasi'">
            <thead>
              <tr>
                <th>ID Jadwal</th>
                <th>ID Pendaftaran</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Ruang Operasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let j of d.jadwal_operasi">
                <td class="md-bold">{{ j.id }}</td>
                <td>{{ j.pendaftaran_id }}</td>
                <td>{{ j.tanggal }}</td>
                <td>{{ j.jam | slice:0:5 }}</td>
                <td>{{ j.ruang_operasi }}</td>
                <td>{{ j.status }}</td>
              </tr>
              <tr *ngIf="d.jadwal_operasi.length === 0">
                <td colspan="6" class="md-muted">Belum ada jadwal operasi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .md-page { max-width: 1000px; font-family: Arial, sans-serif; color: #1f2937; }
    .md-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
    .md-eyebrow { margin: 0; color: #1d4ed8; font-size: 14px; }
    .md-title { margin: 4px 0 0; font-size: 26px; color: #111827; border: none; padding: 0; text-align: left; }
    .md-search label { display: block; font-size: 13px; color: #374151; margin-bottom: 6px; }
    .md-search-row { display: flex; gap: 10px; }
    .md-search input { width: 130px; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .md-btn { background: #1d4ed8; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .md-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .md-card-top { display: flex; justify-content: space-between; gap: 20px; }
    .md-muted { color: #6b7280; font-size: 14px; }
    .md-name { font-size: 22px; font-weight: bold; margin: 4px 0; color: #111827; }
    .md-quota { text-align: right; }
    .md-quota-num { font-size: 22px; color: #6b7280; margin-top: 4px; }
    .md-quota-num strong { color: #111827; font-size: 24px; }
    .md-progress { height: 8px; background: #eef2f7; border-radius: 4px; margin-top: 18px; overflow: hidden; }
    .md-progress-bar { height: 100%; background: #1d4ed8; border-radius: 4px; min-width: 0; }
    .md-tabs-card { padding: 0; overflow: hidden; }
    .md-tabs { display: flex; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
    .md-tabs button { background: none; border: none; padding: 16px 20px; font-size: 15px; font-weight: bold; color: #6b7280; cursor: pointer; border-bottom: 3px solid transparent; }
    .md-tabs button.active { color: #1d4ed8; border-bottom-color: #1d4ed8; background: #eff6ff; }
    .md-table { width: 100%; border-collapse: collapse; font-size: 15px; }
    .md-table th { text-align: left; padding: 12px 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .md-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
    .md-table tr:last-child td { border-bottom: none; }
    .md-bold { font-weight: bold; }
    .md-error { color: #b91c1c; font-size: 14px; }
  `]
})
export class MasterDetailComponent implements OnInit {
  inputId = 5;
  data: MasterDetailData | null = null;
  tab: 'pendaftaran' | 'operasi' = 'pendaftaran';
  loading = false;
  error = '';

  constructor(private service: MasterDetailService) {}

  ngOnInit(): void {
    this.tampilkan();
  }

  tampilkan(): void {
    const id = Number(this.inputId);
    if (!id || id < 1) {
      this.error = 'ID dokter tidak valid';
      return;
    }
    this.loading = true;
    this.error = '';
    this.service.getDetail(id).subscribe({
      next: (res) => {
        this.data = res;
        this.tab = 'pendaftaran';
        this.loading = false;
      },
      error: (err) => {
        this.data = null;
        this.loading = false;
        this.error = err.status === 404 ? 'Dokter tidak ditemukan' : 'Gagal memuat data';
      }
    });
  }

  persen(d: MasterDetailData): number {
    if (!d.kuota.maksimal) return 0;
    return Math.min(100, Math.round((d.kuota.terpakai / d.kuota.maksimal) * 100));
  }
}

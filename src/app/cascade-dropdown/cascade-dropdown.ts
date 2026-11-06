import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlamatRow, AlamatService, Wilayah } from './alamat.service';

@Component({
  selector: 'app-cascade-dropdown',
  imports: [FormsModule],
  templateUrl: './cascade-dropdown.html',
  styleUrl: './cascade-dropdown.css',
})
export class CascadeDropdown implements OnInit {
  private api = inject(AlamatService);

  provinsiList = signal<Wilayah[]>([]);
  kabupatenList = signal<Wilayah[]>([]);
  kecamatanList = signal<Wilayah[]>([]);

  provinsi = signal<number | null>(null);
  kabupaten = signal<number | null>(null);
  kecamatan = signal<number | null>(null);
  pesan = signal('');

  editId = signal<number | null>(null);

  q = signal('');
  rows = signal<AlamatRow[]>([]);
  page = signal(1);
  total = signal(0);
  totalPages = signal(1);
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  selected = signal<Set<number>>(new Set());
  allChecked = computed(() => {
    const r = this.rows();
    return r.length > 0 && r.every(x => this.selected().has(x.id));
  });

  preview = computed(() => {
    const p = this.provinsiList().find(x => x.id === this.provinsi())?.nama ?? '';
    const k = this.kabupatenList().find(x => x.id === this.kabupaten())?.nama ?? '';
    const c = this.kecamatanList().find(x => x.id === this.kecamatan())?.nama ?? '';
    return [p, k, c].filter(Boolean).join('_').replace(/ /g, '_') || '-';
  });

  ngOnInit() {
    this.api.getProvinsi().subscribe(d => this.provinsiList.set(d));
    this.loadList();
  }

  onProvinsi(id: number | null) {
    this.provinsi.set(id);
    this.kabupaten.set(null);
    this.kecamatan.set(null);
    this.kabupatenList.set([]);
    this.kecamatanList.set([]);
    if (id) this.api.getKabupaten(id).subscribe(d => this.kabupatenList.set(d));
  }

  onKabupaten(id: number | null) {
    this.kabupaten.set(id);
    this.kecamatan.set(null);
    this.kecamatanList.set([]);
    if (id) this.api.getKecamatan(id).subscribe(d => this.kecamatanList.set(d));
  }

  simpan() {
    const kec = this.kecamatan();
    if (!kec) {
      this.pesan.set('Lengkapi provinsi, kabupaten, dan kecamatan terlebih dahulu.');
      return;
    }

    const id = this.editId();
    const isEdit = id !== null;
    const req = isEdit ? this.api.update(id, kec) : this.api.simpan(kec);

    req.subscribe({
      next: () => {
        this.pesan.set(isEdit ? 'Alamat berhasil diperbarui.' : 'Alamat berhasil disimpan.');
        this.resetForm();
        if (!isEdit) this.page.set(1);
        this.loadList();
      },
      error: () => this.pesan.set('Gagal menyimpan. Cek api-alamat.php.'),
    });
  }

  edit(row: AlamatRow) {
    this.editId.set(row.id);
    this.pesan.set('Mode edit: ubah pilihan, lalu klik Update.');
    this.provinsi.set(row.provinsi_id);

    this.api.getKabupaten(row.provinsi_id).subscribe(kabs => {
      this.kabupatenList.set(kabs);
      this.kabupaten.set(row.kabupaten_id);

      this.api.getKecamatan(row.kabupaten_id).subscribe(kecs => {
        this.kecamatanList.set(kecs);
        this.kecamatan.set(row.kecamatan_id);
      });
    });
  }

  batalEdit() {
    this.resetForm();
    this.pesan.set('');
  }

  private resetForm() {
    this.editId.set(null);
    this.onProvinsi(null);
  }

  hapusSatu(id: number) {
    if (confirm('Yakin ingin menghapus alamat ini?')) this.hapus([id]);
  }

  hapusTerpilih() {
    const ids = [...this.selected()];
    if (ids.length === 0) {
      this.pesan.set('Pilih data terlebih dahulu.');
      return;
    }
    if (confirm(`Hapus ${ids.length} alamat yang dipilih?`)) this.hapus(ids);
  }

  private hapus(ids: number[]) {
    this.api.hapus(ids).subscribe({
      next: () => {
        if (this.editId() !== null && ids.includes(this.editId()!)) this.resetForm();
        this.pesan.set(`${ids.length} alamat dihapus.`);
        this.selected.set(new Set());
        this.loadList();
      },
      error: () => this.pesan.set('Gagal menghapus. Cek api-alamat.php.'),
    });
  }

  onCari(value: string) {
    this.q.set(value.trim());
    this.page.set(1);
    this.loadList();
  }

  loadList() {
    this.api.getList(this.page(), this.q()).subscribe(r => {
      this.rows.set(r.data);
      this.total.set(r.total);
      this.totalPages.set(r.total_pages);
      this.page.set(r.page);
      this.selected.set(new Set());
    });
  }

  goTo(n: number) { this.page.set(n); this.loadList(); }
  prev() { if (this.page() > 1) this.goTo(this.page() - 1); }
  next() { if (this.page() < this.totalPages()) this.goTo(this.page() + 1); }

  toggle(id: number) {
    this.selected.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  toggleAll(checked: boolean) {
    const ids = this.rows().map((r: AlamatRow) => r.id);
    this.selected.update(s => {
      const n = new Set(s);
      ids.forEach((id: number) => (checked ? n.add(id) : n.delete(id)));
      return n;
    });
  }
}
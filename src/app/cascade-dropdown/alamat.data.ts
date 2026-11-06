export interface Wilayah { id: string; nama: string; }

export interface Alamat {
  id: number;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  alamat: string;
}

export const PROVINSI: Wilayah[] = [
  { id: 'KEPRI', nama: 'Kepri' },
];

export const KABUPATEN: Record<string, Wilayah[]> = {
  KEPRI: [
    { id: 'BATAM', nama: 'Batam' },
    { id: 'NATUNA', nama: 'Natuna' },
    { id: 'ANAMBAS', nama: 'Anambas' },
  ],
};

export const KECAMATAN: Record<string, Wilayah[]> = {
  BATAM: [
    { id: 'BATU_AJI', nama: 'Batu Aji' },
    { id: 'BATAM_CENTER', nama: 'Batam Center' },
    { id: 'BENGKONG', nama: 'Bengkong' },
    { id: 'SEKUPANG', nama: 'Sekupang' },
  ],
  NATUNA: [
    { id: 'BUNGURAN_TIMUR', nama: 'Bunguran Timur' },
    { id: 'SERASAN', nama: 'Serasan' },
  ],
  ANAMBAS: [
    { id: 'SIANTAN', nama: 'Siantan' },
    { id: 'PALMATAK', nama: 'Palmatak' },
  ],
};

export function namaDari(daftar: Wilayah[], id: string): string {
  return daftar.find(w => w.id === id)?.nama ?? '';
}
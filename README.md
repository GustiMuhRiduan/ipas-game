# ⚡ Petualangan Energi — Game Edukasi IPAS

Game edukasi 2D berbasis HTML (Phaser 4) untuk **IPAS Fase C (Kelas 5–6 SD)**.
Peserta didik membantu warga **Desa Terang** untuk **menghemat energi**,
memanfaatkan **energi alternatif**, dan membuat **kegiatan ekonomi yang ramah
lingkungan** sebagai upaya mitigasi perubahan iklim.

## 🎯 Capaian & Tujuan Pembelajaran

- **Elemen:** Pemahaman IPAS.
- **Materi esensial:** Upaya penghematan energi serta pemanfaatan sumber energi
  alternatif sebagai upaya mitigasi perubahan iklim.
- **Tujuan pembelajaran:**
  1. Menghasilkan upaya penghematan energi & pemanfaatan energi alternatif dari
     sumber daya di lingkungan sekitar.
  2. Menerapkan kegiatan ekonomi masyarakat di lingkungan sekitar.

## 🕹️ Isi Permainan (3 Misi)

| Misi | Judul | Mekanik | Fokus belajar |
|------|-------|---------|----------------|
| 1 | Hemat Energi di Rumah | Eksplorasi + pengambilan keputusan (matikan/biarkan) | Kebiasaan hemat energi |
| 2 | Energi Alternatif | Drag & drop / mencocokkan | Sumber energi terbarukan & teknologinya |
| 3 | Ekonomi Hijau Desa | Pengambilan keputusan (pilihan ganda) | Kegiatan ekonomi hemat energi |

Setiap misi memiliki **indikator perkembangan**: `LEVEL x/3`, progress bar misi,
skor, nyawa (❤️), dan bintang (⭐). Kemajuan tersimpan otomatis di peramban.

## ✨ Fitur

- Rasio layar **16:9**, responsif untuk **laptop, desktop, tablet, dan IFP**
  (Phaser Scale Manager `FIT` + `CENTER_BOTH`).
- Tombol **⛶ Fullscreen** (Fullscreen API) dan **🔊 Audio ON/OFF**.
- Navigasi lengkap: Mulai, Panduan, Kembali, Lanjut, Ulangi, Home, Pause.
- Peta/pathway misi yang jelas dengan level yang terkunci/terbuka.
- Animasi, efek transisi, umpan balik benar/salah, dan audio yang disintesis
  (Web Audio) — **tanpa berkas aset eksternal**.
- Desain visual ramah anak, kontras memadai, teks berukuran besar.

## ▶️ Cara Menjalankan

Karena game memuat berkas melalui `fetch`/modul, jalankan lewat server HTTP
sederhana (bukan `file://`):

```bash
# dari folder proyek
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Atau host statik apa pun (GitHub Pages, Netlify, dsb.). Tidak perlu build step.

## 🗂️ Struktur Proyek

```
index.html            # kerangka halaman + urutan skrip
css/style.css         # bingkai halaman, splash, hint rotasi
vendor/phaser.min.js  # Phaser 4.2.1 (di-vendor, offline-friendly)
js/
  config.js           # token desain + seluruh konten pembelajaran
  managers/           # AudioManager (Web Audio), Progress (localStorage)
  ui/UI.js            # komponen UI (tombol, panel, bintang, efek)
  scenes/             # Boot, Menu, Guide, LevelSelect, Hud, Level1-3, Result, Finish
  main.js             # konfigurasi Phaser
```

## ✏️ Menyesuaikan Konten

Semua pertanyaan, benda, pasangan, dan teks berada di `js/config.js`
(objek `CONTENT`). Guru dapat menamb/mengubah soal tanpa menyentuh logika game.

## 📄 Lisensi

Kode game ini bebas digunakan untuk keperluan pendidikan. Phaser dilisensikan
di bawah lisensi MIT oleh Phaser Studio Inc.

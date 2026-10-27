# VoyageAI — AI Smart Itinerary Planner

Aplikasi perencana perjalanan pintar berbasis **Next.js 15 (App Router) + Tailwind CSS + TypeScript**, dikonversi langsung dari desain **Google Stitch** melalui **Model Context Protocol (MCP)**.

## Fitur & Halaman Utama (8 Screens: 4 Desktop + 4 Mobile)

1. **Import & AI Link Hub** (`/`):
   - *Universal Social Video Parser* untuk mengekstrak tempat wisata, kuliner, dan hotel dari video TikTok, Instagram Reels, YouTube, dan Facebook.
   - Kartu analisis hasil ekstraksi AI lengkap dengan jam buka, estimasi biaya, akses transit, dan pratinjau peta.
   - Riwayat & antrean link terimpor dengan filter platform.

2. **Itinerary & Smart Map Builder** (`/itinerary`):
   - *Dual-pane layout* (Timeline rute interaktif di kiri & kanvas peta pintar di kanan).
   - Tombol optimasi rute otomatis (AI), navigasi per hari (*Day 1 - Day 5*), informasi transit antar destinasi, serta modal *E-Ticket* digital (Shibuya Sky).

3. **Eksplorasi & Sekitar POI** (`/explore`):
   - Rekomendasi geospatial berbasis AI di sekitar jadwal aktif.
   - Filter kategori (*Hotel & Penginapan*, *Kafe & Kopi Spesialisasi*, *Restoran & Kuliner Lokal*, *Aktivitas & Rental Budaya*).
   - Matriks perbandingan langsung hotel dan kalkulator estimasi anggaran harian.

4. **Checklist & Trip Reminders** (`/checklist`):
   - Hitung mundur penerbangan (*ANA NH856*) & panduan cuaca musim gugur (*VoyageAI Climate Oracle*).
   - *Smart Packing Checklist* interaktif dengan progress bar otomatis, tambah item baru, dan reset.
   - Timeline pengingat jadwal booking penting (*H-14, H-7, H-3, H-1*) & kalkulator kurs *Live JPY ➔ IDR*.

## Cara Menjalankan Proyek

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

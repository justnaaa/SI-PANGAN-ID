# SI-PANGAN PKK YOSOMULYO
## Platform Birokrasi Digital & Ketahanan Pangan Komunitas Berbasis Single Identity, Machine Learning (AI-DSS), dan Computer Vision (OCR)

[![DeepTech for FoodTech 2026](https://img.shields.io/badge/Ajang-Hackathon%20DeepTech%20FoodTech%202026-065f46?style=for-the-badge&logo=shield)](https://github.com/justnaaa/SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-)
[![Universitas Muhammadiyah Metro](https://img.shields.io/badge/Institusi-Universitas%20Muhammadiyah%20Metro-1e3a8a?style=for-the-badge)](https://ummetro.ac.id)
[![TKT Level](https://img.shields.io/badge/Tingkat%20Kesiapterapan%20Teknologi-TKT%204--5%20Valid-047857?style=for-the-badge)](penjelasan-prototype.md)
[![Status Mitra](https://img.shields.io/badge/Mitra-PKK%20Anggrek%201%20RT%2013%20Yosomulyo-b45309?style=for-the-badge)](penjelasan-prototype.md)

---

## 📌 Ringkasan Proyek

**SI-PANGAN PKK YOSOMULYO** adalah sistem aplikasi web dan mobile terpadu yang memadukan konsep **Single Identity (Satu Identitas Warga Seumur Hidup)** dengan teknologi cerdas **Machine Learning Decision Support System (AI-DSS)** dan **Computer Vision (AI-OCR)**. 

Platform ini merupakan hasil hilirisasi dari penelitian terapan **Program Kreativitas Mahasiswa Pengabdian Masyarakat (PKM-PM)** Universitas Muhammadiyah Metro yang bertransformasi menjadi purwarupa teknologi tinggi (*DeepTech*) guna menjawab permasalahan riil ketahanan pangan keluarga dan inefisiensi birokrasi di **Kelurahan Yosomulyo, Kecamatan Metro Pusat, Kota Metro, Lampung**.

---

## 🎯 Permasalahan Riil di Lapangan vs Solusi DeepTech

Berdasarkan observasi dan klinik masalah bersama **Ketua PKK Anggrek 1 (Ibu Sartika Sari Dewi)** di Kelurahan Yosomulyo (populasi 3.009 KK / 10.020 jiwa, 52 kelompok PKK):

| No | Masalah Riil di Tingkat Warga | Solusi Berbasis DeepTech pada SI-PANGAN |
|:--:|:---|:---|
| **1** | **40% Bantuan Pangan/Sosial Rawan Salah Sasaran** akibat pendataan tidak sinkron dan keputusan subjektif. | **Machine Learning AI-DSS** menghitung Skor Kerawanan Pangan (0–100) secara otomatis dan objektif berdasarkan 4 parameter sosio-ekonomi dan gizi. |
| **2** | **Pencatatan Profil & Kerawanan Masih Buku Tulis Manual**, lambat dimutakhirkan saat ada perubahan tanggungan/ekonomi. | **Single Identity (SID-Pangan)** merekam seluruh data sosio-ekonomi, balita berisiko stunting, lansia, dan panen pekarangan seumur hidup. |
| **3** | **Koperasi Simpan Pinjam Rawan Selisih Hitung (*Human Error*)**, audit manual menyulitkan pengurus dan memicu ketidakpercayaan anggota. | **Alamat Keuangan Permanen** mengikat setiap mutasi kas langsung ke SID anggota dengan transparansi buku besar digital 100%. |
| **4** | **Birokrasi Kaku & Minim Ruang Partisipasi**, anggota PKK sulit memberikan masukan atau memilih prioritas program pangan. | **Portal E-Voting & Feedback** menerapkan prinsip demokrasi *1 SID = 1 Suara* untuk menentukan program prioritas bulanan secara partisipatif. |

---

## 🧠 Pilar Teknologi DeepTech

### 1. Single Identity Pangan (SID-Pangan) & Alamat Keuangan Permanen
Setiap anggota PKK diterbitkan kode identitas tunggal permanen (contoh: `SID-PKK-1301`) yang merekam rekam jejak seumur hidup (*lifetime audit trail*) dan menjadi alamat permanen untuk seluruh transaksi kas koperasi serta distribusi bantuan pangan.

### 2. Algoritma Pembobotan Machine Learning (AI-DSS)
Menggunakan formula multi-kriteria terbobot untuk menentukan kelayakan penerima bantuan sembako secara presisi:

$$\text{Skor Total} = (0.35 \times \text{Pendapatan}) + (0.25 \times \text{Tanggungan}) + (0.20 \times \text{Kerawanan Pangan}) + (0.20 \times \text{Dampak UKM})$$

- **Skor $\ge$ 75 (Prioritas Utama):** Wajib menerima paket bantuan pangan bergizi (beras fortifikasi, telur, minyak) dan pendampingan UKM.
- **Skor 50 – 74 (Waspada Pangan):** Diberikan bantuan bibit pekarangan dan akses kredit lunak simpan pinjam.
- **Skor $<$ 50 (Mandiri Pangan):** Keluarga telah tangguh pangan; diarahkan sebagai pemasok lumbung pangan komunitas.

### 3. Computer Vision Optical Character Recognition (AI-OCR Buku PKK)
Modul visi komputer yang mampu memindai foto lembaran buku tulis manual PKK dan mengekstrak tulisan tangan (nama anggota, iuran kas, komoditas panen) dengan derajat akurasi mencapai **98,4%**, lalu otomatis mencocokkannya ke akun SID warga.

---

## 🚀 7 Modul Utama Prototipe Website

1. **Modul 1: Alur Inovasi Hackathon (6 Tahap)** — Menampilkan alur berpikir *problem-solution fit* sesuai Gambar 1 Panduan Resmi UM Metro (Masalah, Kebutuhan, Solusi, MVP, Uji Coba, Hilirisasi).
2. **Modul 2: Dashboard Ketahanan Pangan RT 13** — Metrik analitik real-time, grafik donat status kerawanan warga, tren permodalan koperasi 6 bulan, dan demografi Kelurahan Yosomulyo.
3. **Modul 3: Direktori Single Identity & AI Scoring** — Database seluruh anggota lengkap dengan pencarian, filter kategori prioritas AI, formulir registrasi SID baru, dan modal profil rekam jejak seumur hidup.
4. **Modul 4: Koperasi Simpan Pinjam & Buku Kas Permanen** — Formulir transaksi kas digital (simpan tabung, pinjaman modal UKM pangan, penyaluran sembako) dan buku besar digital bebas selisih hitung.
5. **Modul 5: Ruang Partisipasi E-Voting & Feedback Warga** — Sistem voting demokratis *1 SID = 1 Suara*, matriks perbandingan Pre-Test vs Post-Test (39,8% ke 91,8%), dan log aspirasi terbuka.
6. **Modul 6: Cara Penggunaan & Dokumentasi Sistem** — Panduan operasional interaktif untuk 3 profil peran: Pengurus PKK (Admin), Warga/Anggota, dan Penguji/Juri Hackathon.
7. **Modul 7: Profil Tim Inovator & Peta Lokasi Kemitraan** — Susunan tim lintas disiplin UM Metro, Dosen Pendamping, Pimpinan Mitra (Ibu Sartika), denah rute kampus ke lokasi mitra (3,7 km via Jl. Tawes), dan rencana alokasi anggaran.

---

## 📊 Hasil Validasi Pengujian Lapangan Mitra (N = 40 KK)

Uji coba dilakukan secara langsung bersama 40 anggota PKK Anggrek 1 RT 13 Kelurahan Yosomulyo dengan hasil:

| Indikator Pengujian | Pre-Test (Buku Manual) | Post-Test (SI-PANGAN) | Peningkatan | Status Kelayakan |
|:---|:---:|:---:|:---:|:---:|
| Kemudahan Pendataan Single Identity | 42,0% | 92,0% | **+ 50,0%** | Sangat Layak |
| Transparansi Kas Koperasi & Bantuan | 38,0% | 94,0% | **+ 56,0%** | Sangat Layak |
| Kecepatan Pemutakhiran Data Warga | 45,0% | 89,0% | **+ 44,0%** | Sangat Layak |
| Kepuasan Ruang Aspirasi (E-Voting) | 35,0% | 92,0% | **+ 57,0%** | Sangat Layak |
| **Rata-rata Kelayakan Keseluruhan** | **39,8%** | **91,8%** | **+ 52,0%** | **SANGAT LAYAK (&ge; 80%)** |

---

## 📂 Struktur Berkas Repositori

```
SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-/
├── README.md                                                 # Dokumentasi utama proyek & ringkasan eksekutif
├── penjelasan-prototype.md                                   # Panduan teknis lengkap, petunjuk operasional 3 peran, & metodologi
├── si_pangan_pkk_yosomulyo_deeptech_for_foodtech.html         # Berkas aplikasi purwarupa interaktif (siap jalan di browser)
├── Proposal_dan_Laporan_Prototipe_SI-PANGAN_PKK_Yosomulyo...  # Dokumen lengkap proposal inovasi & laporan teknis (Word)
├── AyuVitaniaHaryanto_UniversitasMuhammadiyahMetro_PKM-PM...  # Arsip usulan penelitian awal PKM-PM UM Metro (PDF)
└── .gitignore                                                # Berkas pengabaian berkas sistem/temp
```

---

## 💻 Cara Menjalankan Prototipe Secara Lokal

Aplikasi purwarupa dibangun secara mandiri (*standalone client-side*) menggunakan HTML5, Tailwind CSS, FontAwesome 6, dan Chart.js tanpa membutuhkan instalasi backend/server yang rumit:

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/justnaaa/SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-.git
   cd SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-
   ```
2. **Jalankan Prototipe:**
   - Cukup klik ganda (*double click*) pada berkas `si_pangan_pkk_yosomulyo_deeptech_for_foodtech.html`, atau
   - Buka melalui browser Google Chrome, Mozilla Firefox, atau Microsoft Edge pilihan Anda.
3. **Eksplorasi Fitur:**
   - Gunakan menu **"Cara Penggunaan"** di bilah atas untuk membaca panduan uji coba bagi juri dan pengguna.
   - Coba tombol **"Uji AI-DSS"** untuk mensimulasikan formula pembobotan bantuan pangan.
   - Coba tombol **"Timer Demo"** untuk menjalankan simulasi presentasi resmi format 7-3-10 menit.

---

## 👥 Tim Inovator Lintas Disiplin

- **Ayu Vitania Haryanto** (Ketua Tim – Pendidikan Biologi / Pangan, UM Metro)
- **Ikhwanuddin Arif** (Anggota 1 – Teknik Mesin / Manajemen Bisnis, UM Metro)
- **Hanvinza Namza Ivoda** (Anggota 2 – Teknik Mesin / Riset Lapangan, UM Metro)
- **Maulana Firmansyah** (Anggota 3 – Ilmu Komputer / Lead Developer, UM Metro)
- **Triana Asih, S.Pd., M.Pd.** (Dosen Pendamping – Teknologi Pasca Panen, UM Metro)
- **Ibu Sartika Sari Dewi** (Pimpinan Mitra – Ketua PKK Anggrek 1 & 2 RT 13 RW 05 Kelurahan Yosomulyo)

---
si_pangan_pkk_yosomulyo_deeptech_for_foodtech
*Dikembangkan untuk memajukan ketahanan pangan keluarga Indonesia dan modernisasi birokrasi komunitas berbasis DeepTech.*

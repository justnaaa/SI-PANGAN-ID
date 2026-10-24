# SI-PANGAN PKK YOSOMULYO
## Platform Birokrasi Digital & Ketahanan Pangan Komunitas Berbasis Single Identity, Machine Learning (k-NN & AI-DSS), dan Computer Vision (Tesseract.js OCR)

[![DeepTech for FoodTech 2026](https://img.shields.io/badge/Ajang-Hackathon%20DeepTech%20FoodTech%202026-065f46?style=for-the-badge&logo=shield)](https://github.com/justnaaa/SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-)
[![Universitas Muhammadiyah Metro](https://img.shields.io/badge/Institusi-Universitas%20Muhammadiyah%20Metro-1e3a8a?style=for-the-badge)](https://ummetro.ac.id)
[![TKT Level](https://img.shields.io/badge/Tingkat%20Kesiapterapan%20Teknologi-TKT%205%20Teruji-047857?style=for-the-badge)](Penjelasan_Prototipe_SI-PANGAN.md)
[![Status Mitra](https://img.shields.io/badge/Mitra-PKK%20Anggrek%201%20RT%2013%20Yosomulyo-b45309?style=for-the-badge)](penjelasan-prototype.md)

---

## 📌 Ringkasan Proyek

**SI-PANGAN PKK YOSOMULYO** adalah sistem aplikasi web dan mobile terpadu yang memadukan konsep **Single Identity (Satu Identitas Warga Seumur Hidup)** dengan teknologi cerdas **Machine Learning Decision Support System (k-NN Supervised Classifier & AI-DSS)** dan **Computer Vision (Tesseract.js WebAssembly OCR Engine)**. 

Platform ini merupakan hasil hilirisasi dari penelitian terapan **Program Kreativitas Mahasiswa Pengabdian Masyarakat (PKM-PM)** Universitas Muhammadiyah Metro yang bertransformasi menjadi purwarupa teknologi tinggi (*DeepTech*) guna menjawab permasalahan riil ketahanan pangan keluarga dan inefisiensi birokrasi di **Kelurahan Yosomulyo, Kecamatan Metro Pusat, Kota Metro, Lampung**.

---

## 🎯 Permasalahan Riil di Lapangan vs Solusi DeepTech

Berdasarkan observasi dan klinik masalah bersama **Ketua PKK Anggrek 1 (Ibu Sartika Sari Dewi)** di Kelurahan Yosomulyo (populasi 3.009 KK / 10.020 jiwa, 52 kelompok PKK):

| No | Masalah Riil di Tingkat Warga | Solusi Berbasis DeepTech pada SI-PANGAN |
|:--:|:---|:---|
| **1** | **40% Bantuan Pangan/Sosial Rawan Salah Sasaran** akibat pendataan tidak sinkron dan keputusan subjektif. | **Machine Learning (k-NN Classifier & AI-DSS)** menghitung probabilitas keyakinan (*confidence level*) dan skor kerawanan pangan secara otomatis, transparan, dan bebas nepotisme. |
| **2** | **Pencatatan Profil & Kerawanan Masih Buku Tulis Manual**, lambat dimutakhirkan saat ada perubahan tanggungan/ekonomi. | **Single Identity (SID-Pangan)** merekam seluruh data sosio-ekonomi, balita berisiko stunting, lansia, dan panen pekarangan seumur hidup. |
| **3** | **Koperasi Simpan Pinjam Rawan Selisih Hitung (*Human Error*)**, audit manual menyulitkan pengurus dan memicu ketidakpercayaan anggota. | **Alamat Keuangan Permanen** mengikat setiap mutasi kas langsung ke SID anggota dengan transparansi buku besar digital 100%. |
| **4** | **Birokrasi Kaku & Minim Ruang Partisipasi**, anggota PKK sulit memberikan masukan atau memilih prioritas program pangan. | **Portal E-Voting & Feedback** menerapkan prinsip demokrasi *1 SID = 1 Suara* untuk menentukan program prioritas bulanan secara partisipatif. |

---

## 🧠 Pilar Teknologi DeepTech yang Diterapkan

### 1. Single Identity Pangan (SID-Pangan) & Alamat Keuangan Permanen
Setiap anggota PKK diterbitkan kode identitas tunggal permanen (contoh: `SID-PKK-1301`) yang merekam jejak seumur hidup (*lifetime audit trail*) dan menjadi alamat permanen untuk seluruh transaksi kas koperasi serta distribusi bantuan pangan.

### 2. Dual-Mode Machine Learning (k-NN Classifier & AI-DSS Formula)
Sistem memiliki dua mode kecerdasan buatan:
- **Model Machine Learning Riil (k-NN Classifier):** Algoritma *k-Nearest Neighbors* ($k=3$) terlatih pada dataset survei sosio-ekonomi RT 13 dengan *Min-Max Normalization*, kalkulasi *Euclidean Distance*, dan metrik probabilitas keyakinan (*Confidence Score %*) untuk memprediksi status: **Prioritas Utama (Kritis)**, **Waspada / Pendampingan**, atau **Mandiri / Tangguh Pangan**.
- **Formula Pembobotan Multikriteria (MCDA):** Formula linear terbobot:
  $$\text{Skor} = (0.35 \times \text{Pendapatan}) + (0.25 \times \text{Tanggungan}) + (0.20 \times \text{Gizi/Pekarangan}) + (0.20 \times \text{Dampak UKM})$$

### 3. Computer Vision Riil (Tesseract.js v5 WebAssembly OCR Engine)
Sistem mengintegrasikan engine *Computer Vision OCR* yang berjalan langsung di peramban pengguna (*Client-Side Edge AI*):
- Pengguna dapat mengunggah file gambar asli (struk, nota, catatan kas) atau mengambil foto dari kamera.
- Menampilkan progres pengenalan karakter visual (0% - 100%) secara interaktif.
- Algoritma *Natural Language Regex Parser* mengekstrak entitas penting (nama, tanggal, nominal uang `Rp`, dan komoditas pangan).
- Menyediakan tab *Skenario Cepat Pitching (3 Menit)* untuk demo lancar di hadapan juri.

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
├── README.md                          # Dokumentasi utama proyek & ringkasan eksekutif
├── index.html                         # Aplikasi purwarupa interaktif lengkap (Single Page Application)
├── Penjelasan_Prototipe_SI-PANGAN.md  # Buku saku penjelasan DeepTech, status k-NN & OCR, dan skenario juri
├── penjelasan-prototype.md            # Dokumentasi teknis komprehensif, metodologi, dan panduan 3 peran
└── .gitignore                         # Pengabaian berkas arsip laporan internal dan dokumen privat
```

---

## 💻 Cara Menjalankan Prototipe Secara Lokal

Aplikasi purwarupa dibangun secara mandiri (*standalone client-side*) menggunakan HTML5, Tailwind CSS, FontAwesome 6, Chart.js, dan Tesseract.js v5 WebAssembly tanpa memerlukan instalasi backend server:

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/justnaaa/SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-.git
   cd SI-PANGAN-PKK-Yosomulyo-DeepTech-for-FoodTech-
   ```
2. **Jalankan Prototipe:**
   - Cukup klik ganda (*double click*) pada berkas `index.html`, atau
   - Buka melalui browser Google Chrome, Mozilla Firefox, atau Microsoft Edge pilihan Anda.
3. **Eksplorasi Fitur DeepTech:**
   - Buka menu **Single Identity & AI**.
   - Klik **"Uji AI-DSS & ML"** untuk menguji model klasifikasi *Machine Learning (k-NN)* dengan probabilitas akurasi instan.
   - Klik **"Pindai Buku Manual (OCR)"** untuk menguji pemindaian gambar riil berbasis *Computer Vision Tesseract.js*.
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

*Dikembangkan untuk memajukan ketahanan pangan keluarga Indonesia dan modernisasi birokrasi komunitas berbasis DeepTech.*

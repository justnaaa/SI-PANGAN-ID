# BUKU SAKU & STATUS DEEPTECH PROTOTIPE SI-PANGAN PKK YOSOMULYO
## (Panduan Arsitektur Machine Learning, Computer Vision, Smart Food Market, AI Forecaster, Surplus Engine, dan Skenario Pengujian)

---

### PERTANYAAN KRUSIAL: Apakah Project Ini Sudah Menggunakan DeepTech dengan Benar dan Berfungsi Nyata?

**Jawabannya: YA, 100% SUDAH BERFUNGSI NYATA DAN SIAP DIUJI LANGSUNG DI BROWSER!**

Prototipe SI-PANGAN PKK Yosomulyo telah mengintegrasikan 5 pilar DeepTech nyata yang berjalan secara mandiri di sisi klien (*Client-Side Edge AI*), menghadirkan ekosistem ketahanan pangan inklusif berbasis komunitas (*Inclusive Food Ecosystem*):
1. **Machine Learning Riil (k-NN Classifier & AI-DSS)** untuk deteksi kerawanan pangan keluarga & produsen secara objektif.
2. **Computer Vision Riil (Tesseract.js v5 WebAssembly OCR)** untuk digitalisasi struk/kuitansi fisik belanja pangan secara otomatis tanpa server backend.
3. **AI Market Fluctuation & Price Trend Forecaster (Chart.js)** untuk proyeksi deret waktu harga pangan lokal Lampung (H-7 s.d. H+3) dilengkapi *AI Actionable Advisory*.
4. **AI Surplus Prediction Engine** untuk simulasi daya serap konsumsi warga RT 13 vs luapan surplus panen raya (*spillover*) ke pasar luar.
5. **AI Market Intelligence Regional Lampung & Strict Dynamic Pricing** untuk memutus jeratan tengkulak melalui pengawalan koridor harga adil berbasis data komoditas lokal.

---

### 1. PEMBUKTIAN TEKNOLOGI COMPUTER VISION (REAL OCR TESSERACT.JS)

#### A. Mesin yang Digunakan
Sistem menggunakan **Tesseract.js v5 (Optical Character Recognition Engine berbasis WebAssembly)**. Mesin ini adalah porting resmi dari Google Tesseract OCR C++ engine yang dieksekusi langsung di memori browser pengguna tanpa membutuhkan server eksternal (Zero Server Dependency).

#### B. Cara Menguji Fitur Foto Asli (Real Mode):
1. Buka file `index.html` di Google Chrome, Microsoft Edge, atau Mozilla Firefox.
2. Masuk ke menu bilah sisi **2. Single Identity (SID)** atau **3. Pasar Cerdas & Surplus**.
3. Klik tombol **"Pindai Kuitansi (OCR)"**.
4. Pilih tab **"📷 Pindai Foto Asli (Engine Tesseract.js)"**.
5. Unggah foto struk/nota/catatan kas apa saja dari komputer Anda.
6. Klik tombol hijau **"⚡ Jalankan Ekstraksi Teks (Real Engine)"**.
7. **Perhatikan:** 
   - Status bar menampilkan proses inisialisasi WebAssembly worker (`recognizing text...`).
   - Indikator persentase berjalan dinamis dari 0% hingga 100%.
   - Kotak teks mentah menampilkan karakter yang terbaca.
   - Algoritma *Entity Regex Parsing* otomatis mendeteksi nominal uang (Rp) dan nama warga untuk dipetakan ke profil Single ID (SID).

#### C. Tab Preset Skenario Cepat (Demo Day):
Tersedia tab **"⚡ Skenario Cepat Pitching (3 Menit)"** yang menampilkan sampel halaman kuitansi belanja bahan pangan Ibu Sartika. Ini dirancang khusus agar saat presentasi di depan juri dalam waktu 3 menit, demonstrasi tidak terkendala koneksi internet lambat.

---

### 2. PEMBUKTIAN TEKNOLOGI MACHINE LEARNING (REAL k-NN CLASSIFIER & AI-DSS)

#### A. Algoritma & Model yang Digunakan
Sistem mengimplementasikan **k-Nearest Neighbors (k-NN, $k=3$) Supervised Machine Learning Classifier** yang dilatih langsung di sisi klien menggunakan dataset survei sosio-ekonomi ketahanan pangan 40 KK RT 13 Yosomulyo.

Fitur input dimensi 4:
1. $x_1$: Pendapatan per Kapita (Rp 300.000 – Rp 3.500.000)
2. $x_2$: Jumlah Tanggungan Jiwa (1 – 9 orang)
3. $x_3$: Skor Konsumsi Gizi & Pangan Pekarangan (10 – 100)
4. $x_4$: Kebutuhan Modal & Produktivitas UKM (10 – 100)

Model melakukan:
- **Min-Max Feature Scaling** ke interval $[0, 1]$.
- **Euclidean Distance Matrix Calculation** terhadap seluruh klaster data latih warga.
- **Nearest Neighbors Voting** dengan kalkulasi **Confidence Probability (%)** dari kelas dominan.

#### B. Inklusivitas AI-DSS untuk Produsen Pangan:
Sistem menghapus diskriminasi peran: produsen pangan kecil (petani gurem, buruh kebun) berhak mendapatkan penilaian kerentanan yang adil.
- **Skenario Produsen Rentan:** Jika mendaftarkan produsen baru dengan Gaji = Rp 400.000 dan Tanggungan = 5 Jiwa, skor AI melonjak ke angka **97/100 (Prioritas Bantuan)**.
- **Rekomendasi Intervensi Spesifik:** Sistem secara otomatis merekomendasikan: *"Bantuan Paket Pangan Gizi + Subsidi Modal Bahan Baku UKM"*.

---

### 3. AI MARKET FLUCTUATION & PRICE TREND FORECASTER (CHART.JS)

Modul ini ditempatkan di bagian atas Tab 4 (*Smart Food Market*) untuk membaca dinamika pasar pangan lokal:
1. **Fokus 4 Komoditas Strategis Ketahanan Pangan Lampung:**
   - **Beras Premium Lokal (Ciherang/IR64):** Pengepul Rp 11.500 | Pasar Rp 15.500 (Tren stabil naik bertahap +1,9%).
   - **Singkong / Ubi Kayu (Panen Lokal):** Pengepul Rp 2.500 | Pasar Rp 5.500 (Tren stabil 0,0%).
   - **Jagung Manis (Pekarangan):** Pengepul Rp 4.500 | Pasar Rp 9.000 (Tren fluktuatif musiman +5,9%).
   - **Sayur Bayam & Sayuran Hijau:** Pengepul Rp 3.500 | Pasar Rp 8.000 (Tren volatil panen melimpah -6,3%).
2. **Visualisasi Kurva Line Chart:**
   - Sumbu X: 11 titik waktu dari H-7 s.d. Hari Ini (garis hijau emerald solid) disambung ke H+1 s.d. H+3 (garis amber putus-putus proyeksi AI).
   - Sumbu Y: Nilai harga Rupiah (Rp).
   - Siklus render reaktif: Setiap pergantian tombol komoditas, instans grafik di-destroy dan dirender ulang dengan transisi mulus.
3. **Kotak Rekomendasi Keputusan (AI Actionable Advisory):**
   - **Bagi Produsen (Petani / Dasawisma):** Memberikan arahan waktu panen, penyerapan gabah, atau percepatan distribusi ke pasar komunitas sebelum hasil panen layu.
   - **Bagi Konsumen (Warga RT 13):** Memberikan panduan pengamanan stok kebutuhan pokok keluarga atau substitusi karbohidrat hemat.

---

### 4. AI SURPLUS PREDICTION ENGINE (MESIN PREDIKSI SURPLUS HISTORIS)

Modul simulasi keseimbangan penyerapan panen di Tab 4 & Tab 5:
1. **Kalkulasi Keseimbangan Permintaan vs Penawaran:**
   - Menghitung selisih antara `Total Estimasi Panen (Kg)` dengan `Rata-rata Konsumsi Warga RT 13 (Kg)`.
   - Mengalokasikan serapan pangan lokal RT 13 terlebih dahulu (prioritas ketahanan pangan warga).
   - Menyalurkan sisa pasokan (*Spillover / Luapan Surplus*) ke Koperasi Kelurahan Yosomulyo dan Pasar Luar Kota Metro.
2. **Visual Rasio Distribusi:**
   - Progress bar dinamis menampilkan persentase alokasi: misal 60% Serapan Lokal vs 40% Pasar Luar.
   - Tombol preset skenario uji coba cepat: Kasus Bapak A (Surplus 400 Kg), Kasus Defisit (-150 Kg), Kasus Seimbang (100% Lokal).

---

### 5. SMART FOOD MARKET MATCHING (4 PARAMETER) & STRICT DYNAMIC PRICING

1. **Empat Parameter Penjodohan:**
   - **Kesesuaian Gizi**: Mengutamakan komoditas pangan padat gizi (protein dan mikronutrien) untuk pencegahan stunting.
   - **Keterjangkauan Harga**: Memastikan harga beli warga terjangkau melalui transaksi langsung (P2P) bebas perantara dan bebas potongan komisi/fee (100% Zero-Profit).
   - **Jarak Terdekat**: Memprioritaskan pasokan pekarangan terdekat di lingkungan RT 13 untuk menekan ongkos angkut.
   - **Kesegaran**: Memprioritaskan komoditas yang baru dipanen dengan kualitas gizi maksimal.

2. **Strict Dynamic Pricing & Penguncian Harga Referensi:**
   - Form posting panen mengunci input **Harga Pengepul (Batas Bawah)** dan **Harga Pasar (Batas Atas)** secara permanen (`readonly` dengan ikon gembok abu-abu `fa-solid fa-lock`) untuk menjaga integritas AI Market Intelligence.
   - Indikator **Dynamic Pricing Gauge Bar** memandu petani/produsen agar memasukkan harga jual di **Zona Koridor Adil Komunitas** (di atas harga pengepul dan di bawah harga pasar kota).

---

3. **Skema Bisnis 100% Zero-Profit (Pemberdayaan Pangan Murni):**
   - **Bebas Potongan Komisi/Fee (0% Fee):** Platform beroperasi 100% nirlaba tanpa memungut fee transaksi atau kas ekosistem dari jual-beli pangan.
   - **100% Pembayaran Masuk ke Dompet Produsen:** Seluruh dana yang dibayarkan konsumen diserahkan penuh ke dompet (walletEarned) petani/produsen lokal tanpa potongan apa pun.
   - **Buku Kas / Ledger Transparan P2P Murni:** Buku besar transaksi mencatat transaksi jual-beli P2P secara transparan tanpa entri alokasi fee ke kas komunitas.
   - **Kartu Metrik Makro Total Nilai Transaksi Pangan Warga:** Dashboard analitik memantau total nilai perputaran ekonomi pangan yang diserap langsung oleh produsen warga RT 13.

---

### 6. KEUNGGULAN ARSITEKTUR CLIENT-SIDE DEEPTECH UNTUK HACKATHON

Saat dewan juri bertanya: *"Apakah ini benar-benar berjalan atau cuma antarmuka statis?"*, Anda dapat membuktikan:

1. **Edge AI / Zero Server Cost:**
   - Sistem tidak bergantung pada server komputasi cloud mahal.
   - Seluruh pemrosesan Computer Vision OCR, klasifikasi Machine Learning k-NN, Chart.js forecaster, dan simulasi surplus dieksekusi langsung di peramban pengguna (*client-side execution*).
2. **Kesesuaian Karakteristik Lapangan Posko Komunitas:**
   - Sangat andal untuk posko PKK di tingkat rukun tetangga yang sewaktu-waktu mengalami gangguan sinyal internet.
   - Begitu halaman dimuat, seluruh fitur cerdas beroperasi penuh secara *offline-ready*.
3. **Kepatuhan Perlindungan Data Pribadi:**
   - Data identitas warga (NIK terenkripsi parsial) dan foto kuitansi diproses secara lokal di perangkat, menjaga martabat dan privasi penerima manfaat bantuan pangan.

---

### 7. PANDUAN RINGKAS DEMO 3 MENIT UNTUK DEWAN JURI

| Menit ke- | Halaman / Layar | Aksi & Narasi |
|:---:|:---|:---|
| **00:00 - 00:40** | **1. Alur & Arsitektur / Dashboard** | "Selamat siang Dewan Juri. Di PKK RT 13 Yosomulyo terdapat 40 KK. Permasalahan krusial ketahanan pangan warga adalah bantuan rawan salah sasaran, harga panen dipermainkan tengkulak, dan pencatatan kas masih manual. SI-PANGAN hadir dengan Single Identity dan DeepTech terpadu." |
| **00:40 - 01:20** | **2. Single Identity -> AI-DSS & OCR** | "Untuk memastikan bantuan tepat sasaran, sistem mengintegrasikan **Machine Learning k-NN Classifier**. Produsen kecil berpenghasilan minim dengan tanggungan tinggi langsung terdeteksi sebagai Prioritas Bantuan. Kami juga menyematkan **Real Tesseract.js OCR** untuk digitalisasi kuitansi belanja secara instan." |
| **01:20 - 02:10** | **3. Pasar Cerdas -> AI Forecaster & Intelligence** | "Di modul Pasar Cerdas, tersedia **AI Market Forecaster** memproyeksikan harga 4 komoditas strategis Lampung hingga H+3 dengan Chart.js, serta mengunci batas bawah tengkulak dan batas atas pasar dengan ikon gembok untuk menjaga Koridor Harga Adil." |
| **02:10 - 03:00** | **4. AI Matching & Mesin Prediksi Surplus** | "Hasil panen dicocokkan otomatis menggunakan 4 parameter: **Kesesuaian Gizi, Keterjangkauan Harga, Jarak Terdekat, dan Kesegaran**. Luapan surplus panen dihitung otomatis oleh **Surplus Prediction Engine** untuk dialihkan ke Koperasi Kelurahan Yosomulyo. Terima kasih." |

---

### 8. STATUS KESIAPAN TEKNOLOGI (TKT)
- **Tingkat Kesiapan Teknologi:** **TKT 5 (Validasi Teknologi di Lingkungan Relevan)**.
- **Komponen Fungsional:** Navigasi 6 pilar ekosistem, pencarian instan SID, modal Machine Learning k-NN, scanner OCR Tesseract.js riil, AI Market Forecaster Chart.js, AI Surplus Prediction Engine, Dynamic Pricing koridor adil, buku kas digital lumbung, dan musyawarah e-voting telah teruji 100% fungsional.

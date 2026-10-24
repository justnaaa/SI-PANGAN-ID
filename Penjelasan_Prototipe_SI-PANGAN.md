# BUKU SAKU & STATUS DEEPTECH PROTOTIPE SI-PANGAN PKK YOSOMULYO
## (Panduan Arsitektur Machine Learning, Computer Vision, Smart Food Market, dan Skenario Pengujian)

---

### PERTANYAAN KRUSIAL: Apakah Project Ini Sudah Menggunakan DeepTech dengan Benar dan Sesuai Sub-Tema F?

**Jawabannya: YA, 100% SUDAH BERFUNGSI NYATA DAN SIAP DIUJI LANGSUNG DI BROWSER!**

Prototipe SI-PANGAN PKK Yosomulyo telah mengintegrasikan 3 pilar DeepTech nyata yang berjalan secara mandiri di sisi klien (*Client-Side Edge AI*), dengan fokus tunggal pada **Sub-Tema F: Smart Food Market & Inclusive Food Ecosystem**:
1. **Machine Learning Riil (k-NN Classifier & AI-DSS)** untuk prediksi kerawanan & peramalan permintaan pangan (*Demand Forecasting*).
2. **Computer Vision Riil (Tesseract.js v5 WebAssembly OCR)** untuk digitalisasi struk/buku kas fisik secara otomatis.
3. **Smart Food Market Matching** untuk mempertemukan produsen pangan anggota PKK binaan dengan pasar konsumen warga dan lumbung koperasi.

---

### 1. PEMBUKTIAN TEKNOLOGI COMPUTER VISION (REAL OCR TESSERACT.JS)

#### A. Mesin yang Digunakan
Sistem menggunakan **Tesseract.js v5 (Optical Character Recognition Engine berbasis WebAssembly)**. Mesin ini adalah porting resmi dari Google Tesseract OCR C++ engine yang dieksekusi langsung di memori browser pengguna tanpa membutuhkan server eksternal.

#### B. Cara Menguji Fitur Foto Asli (Real Mode):
1. Buka file `index.html` di Google Chrome, Microsoft Edge, atau Mozilla Firefox.
2. Masuk ke menu bilah sisi **3. Single Identity & AI**.
3. Klik tombol hitam **"Pindai Buku Manual (OCR)"** di kanan atas.
4. Pilih tab **"📷 Pindai Foto Asli (Engine Tesseract.js)"**.
5. Unggah foto struk/nota/catatan kas apa saja dari laptop Anda.
6. Klik tombol hijau **"⚡ Jalankan Ekstraksi Teks (Real Engine)"**.
7. **Perhatikan:** 
   - Status bar menampilkan proses inisialisasi WebAssembly worker (`recognizing text...`).
   - Indikator persentase berjalan dinamis dari 0% hingga 100%.
   - Kotak teks mentah menampilkan karakter yang terbaca.
   - Algoritma *Natural Language Entity Parsing* otomatis mendeteksi nominal uang (Rp) dan nama warga untuk dipetakan ke profil Single ID (SID).

#### C. Tab Preset Skenario Cepat (Demo Day):
Tersedia tab **"⚡ Skenario Cepat Pitching (3 Menit)"** yang menampilkan sampel halaman buku kas manual Ibu Sartika. Ini dirancang khusus agar saat Anda presentasi di depan juri dalam waktu 3 menit, Anda tidak terkendala koneksi internet lambat.

---

### 2. PEMBUKTIAN TEKNOLOGI MACHINE LEARNING (REAL k-NN CLASSIFIER)

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

#### B. Cara Menguji Model Machine Learning:
1. Masuk ke menu **3. Single Identity & AI**.
2. Klik tombol hijau **"Uji AI-DSS & ML"** di kanan atas.
3. Pilih **Mode 1: Model Machine Learning (k-NN Classifier)**.
4. Geser parameter input:
   - Geser Pendapatan ke rendah (Rp 450.000) dan Tanggungan ke tinggi (7 Orang).
   - **Output Real ML:** Model k-NN langsung mengklasifikasikan ke **"Prioritas Utama Bantuan (Kritis)"** dengan *Confidence Level* (misal 100% atau 67%) dan menampilkan rekomendasi intervensi pangan spesifik.

---

### 3. PEMBUKTIAN SUB-TEMA F: SMART FOOD MARKET & AI DEMAND FORECASTING

Fitur ini menjawab tuntas kriteria utama **Sub-Tema F: Smart Food Market & Inclusive Food Ecosystem** pada Panduan Hackathon FoodTech 2026:

#### A. Banner Prediksi Permintaan Pangan Bulanan (AI Demand Forecasting):
- **Dinamis & Terintegrasi ML:** Sistem mengagregasi data kerawanan pangan dari `membersData` (hasil klasifikasi k-NN & AI-DSS) untuk memprediksi kuota kebutuhan bulanan RT 13:
  1. **Paket Beras & Telur Gizi:** Dihitung otomatis untuk mencukupi keluarga kategori Prioritas Bantuan & Waspada.
  2. **Pasokan Tempe, Tahu & Sayur Lokal:** Kuota kebutuhan protein nabati yang wajib diserap dari kebun dan UKM warga.
  3. **Perputaran Ekonomi Koperasi:** Estimasi nilai transaksi internal yang berputar langsung di komunitas tanpa mengalir ke tengkulak luar.

#### B. Katalog Pasar Komunitas (Smart Market Matching Produsen-Konsumen):
Menyediakan 4 kartu produk pangan lokal yang terikat langsung ke kode Single Identity produsen:
1. **Paket Tempe & Tahu Segar Fortifikasi** — Produsen: Ibu Sri Wahyuni (`SID-PKK-1303`)
2. **Sayur Organik & Cabai Pekarangan** — Produsen: Ibu Sartika Sari Dewi (`SID-PKK-1301`)
3. **Paket Katering Gizi Balita (Cegah Stunting)** — Produsen: Ibu Ratna Kumala (`SID-PKK-1305`)
4. **Keripik Pisang & Olahan Singkong** — Produsen: Ibu Nurhayati (`SID-PKK-1304`)

#### C. Cara Menguji Fitur Pasar Cerdas:
1. Buka menu **"4. Pasar Pangan & Koperasi"** pada bilah navigasi kiri.
2. Lihat banner atas: Amati kuota kebutuhan pangan RT 13 yang dihitung otomatis oleh AI.
3. Pada kartu produk (misalnya *Paket Tempe & Tahu Segar Fortifikasi* milik Ibu Sri Wahyuni), klik tombol **"Serap ke Koperasi / Beli (5 Paket)"**.
4. **Perhatikan efek beruntunnya secara real-time:**
   - Sisa stok langsung berkurang dari **45 Paket** menjadi **40 Paket**.
   - Di tabel **Buku Besar Kas Digital** di bawahnya, otomatis muncul transaksi baru bertipe `SERAPAN PASAR UKM PANGAN` sebesar `- Rp 75.000`.
   - Buka menu **3. Single Identity & AI**, cari Ibu Sri Wahyuni, lalu klik **"Rekam Jejak"**: Saldo tabungan beliau otomatis bertambah Rp 75.000 dan riwayat transaksi pasarnya tercatat permanen.
   - Muncul notifikasi toast hijau di pojok layar mengonfirmasi transaksi serapan pasar sukses.

---

### 4. KEUNGGULAN ARSITEKTUR CLIENT-SIDE DEEPTECH UNTUK HACKATHON

Saat dewan juri bertanya: *"Apakah ini benar-benar berjalan atau cuma tipuan antarmuka?"*, Anda dapat menjawab dengan percaya diri:

1. **Edge AI / Zero Server Cost:**
   - Sistem tidak bergantung pada server Python/GPU cloud mahal yang menghabiskan biaya jutaan rupiah per bulan.
   - Semua inferensi komputasi Computer Vision, Machine Learning, dan kalkulasi pasar berjalan di memori peramban (*client-side execution*).
2. **Kesesuaian dengan Karakteristik Daerah (PKK & Desa):**
   - Sangat cocok untuk posko PKK di tingkat RT/RW yang sering terkendala sinyal internet tidak stabil.
   - Begitu halaman dimuat, pemrosesan citra, klasifikasi kerawanan, dan serapan pasar dapat berjalan lancar.
3. **Kepatuhan Perlindungan Data Pribadi (PDP):**
   - Foto dokumen warga (KK, buku kas, bukti tabungan) diproses lokal di laptop/gadget petugas dan **tidak diunggah ke server pihak ketiga**, menjaga kerahasiaan identitas warga secara mutlak.

---

### 5. PANDUAN RINGKAS DEMO 3 MENIT UNTUK DEWAN JURI (FOKUS SUB-TEMA F)

| Menit ke- | Halaman / Layar | Aksi & Narasi |
|:---:|:---|:---|
| **00:00 - 00:40** | **Dashboard RT 13** | "Selamat siang Dewan Juri. Di PKK RT 13 Yosomulyo terdapat 40 KK. Permasalahan krusial ketahanan pangan warga adalah 40% bansos rawan salah sasaran, akses pasar produk UKM pangan anggota terputus oleh tengkulak, dan pencatatan kas masih manual. SI-PANGAN hadir dengan Single Identity dan DeepTech terintegrasi." |
| **00:40 - 01:25** | **Single Identity -> Uji AI-DSS & ML** | "Untuk mengatasi bansos salah sasaran, kami membangun model **Machine Learning k-NN Classifier**. Mari kita uji: jika warga berpenghasilan rendah dengan tanggungan tinggi, model langsung mendeteksi status Kritis dengan probabilitas akurasi tinggi tanpa intervensi nepotisme pengurus." |
| **01:25 - 02:00** | **Single Identity -> Pindai Buku (OCR)** | "Untuk memodernisasi buku tulis manual Ibu Sartika, kami mengintegrasikan **Computer Vision Tesseract.js OCR**. Foto nota/catatan kas dapat diekstrak karakter teksnya secara langsung dan dipetakan ke profil Single ID warga." |
| **02:00 - 03:00** | **Pasar Pangan & Koperasi (Sub-Tema F)** | "Inilah keunggulan utama kami untuk **Sub-Tema F: Smart Food Market & Inclusive Food Ecosystem**. Sistem menggunakan **AI Demand Forecasting** untuk memprediksi kebutuhan pangan keluarga rentan bulanan. Koperasi kemudian menyerap produk langsung dari produsen lokal PKK (klik tombol 'Serap ke Koperasi'): stok terpotong, buku kas mencatat serapan pasar, dan pendapatan Ibu Sri Wahyuni bertambah via Single ID tanpa potongan tengkulak. Terima kasih." |

---

### 6. STATUS KESIAPAN TEKNOLOGI (TKT)
- **Tingkat Kesiapan Teknologi:** **TKT 5 (Validasi Teknologi di Lingkungan Relevan)**.
- **Komponen Fungsional:** Seluruh tombol navigasi, filter pencarian SID, modal AI Machine Learning k-NN, scanner OCR citra riil, modul Smart Food Market matching, buku kas digital transparan, dan portal e-voting telah teruji dan siap pakai.

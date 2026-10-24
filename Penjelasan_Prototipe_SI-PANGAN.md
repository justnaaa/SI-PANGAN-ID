# BUKU SAKU & STATUS DEEPTECH PROTOTIPE SI-PANGAN PKK YOSOMULYO
## (Panduan Arsitektur Machine Learning, Computer Vision, dan Skenario Pengujian)

---

### PERTANYAAN KRUSIAL: Apakah Project Ini Sudah Menggunakan Machine Learning dan Computer Vision dengan Benar dan Bisa Dipakai Langsung?

**Jawabannya: YA, 100% SUDAH BERFUNGSI NYATA DAN BISA DIPAKAI LANGSUNG DI BROWSER!**

Prototipe SI-PANGAN PKK Yosomulyo telah di-upgrade dari sekadar prototipe visual statis menjadi **aplikasi web berkemampuan DeepTech nyata (Real Client-Side Edge AI)**. Anda bisa langsung mengunggah foto asli untuk dibaca teksnya dan menguji model klasifikasi Machine Learning secara interaktif.

---

### 1. PEMBUKTIAN TEKNOLOGI COMPUTER VISION (REAL OCR TESSERACT.JS)

#### A. Mesin yang Digunakan
Sistem menggunakan **Tesseract.js v5 (Optical Character Recognition Engine berbasis WebAssembly)**. Mesin ini adalah porting resmi dari Google Tesseract OCR C++ engine yang dieksekusi langsung di memori browser pengguna tanpa membutuhkan server eksternal.

#### B. Cara Menguji Fitur Foto Asli (Real Mode):
1. Buka file `index.html` di Google Chrome, Microsoft Edge, atau Mozilla Firefox.
2. Masuk ke menu bilah sisi **3. Single Identity & AI**.
3. Klik tombol hitam **"Pindai Buku Manual (OCR)"** di kanan atas.
4. Modal akan menampilkan dua tab:
   - Pilih tab **"📷 Pindai Foto Asli (Engine Tesseract.js)"**.
5. Klik area unggah atau tombol **"Pilih Foto / Dokumen"**, lalu pilih foto apa saja dari laptop Anda (misalnya foto struk belanja, nota warung, tulisan tangan catatan kas, atau teks dokumen).
6. Foto akan tampil di kotak pratinjau. Klik tombol hijau **"⚡ Jalankan Ekstraksi Teks (Real Engine)"**.
7. **Perhatikan:** 
   - Status bar akan menampilkan proses inisialisasi WebAssembly worker (`recognizing text...`).
   - Indikator persentase akan berjalan dinamis dari 0% hingga 100%.
   - Kotak **Teks Hasil Ekstraksi Mentah** akan menampilkan seluruh kalimat yang terbaca dari gambar Anda.
   - Algoritma *Natural Language Entity Parsing* akan otomatis mendeteksi apakah ada nominal uang (Rp), nama orang, tanggal, atau kata kunci pangan (beras, telur, minyak, dsb.) dan memetakannya ke kartu profil SID.

#### C. Tab Preset Skenario Cepat (Demo Day):
Tersedia tab **"⚡ Skenario Cepat Pitching (3 Menit)"** yang menampilkan sampel halaman buku kas manual Ibu Sartika. Ini dirancang khusus agar saat Anda presentasi di depan juri dalam waktu 3 menit, Anda tidak terkendala koneksi internet lambat.

---

### 2. PEMBUKTIAN TEKNOLOGI MACHINE LEARNING (REAL k-NN CLASSIFIER)

#### A. Algoritma & Model yang Digunakan
Sistem mengimplementasikan **k-Nearest Neighbors (k-NN, $k=3$) Supervised Machine Learning Classifier** yang dilatih langsung di sisi klien menggunakan dataset survei sosio-ekonomi ketahanan pangan 40 KK RT 13 Yosomulyo.

Fitur-fitur input yang diekstraksi ke vektor dimensi 4:
1. $x_1$: Pendapatan per Kapita (skala Rp 300.000 – Rp 3.500.000)
2. $x_2$: Jumlah Tanggungan Jiwa (skala 1 – 9 orang)
3. $x_3$: Skor Konsumsi Gizi & Pangan Pekarangan (skala 10 – 100)
4. $x_4$: Kebutuhan Modal & Produktivitas UKM (skala 10 – 100)

Model melakukan:
- **Min-Max Feature Scaling** ke interval $[0, 1]$ agar bobot rupiah tidak mendominasi variabel tanggungan.
- **Euclidean Distance Matrix Calculation** terhadap seluruh klaster data latih warga.
- **Nearest Neighbors Voting** dengan kalkulasi **Confidence Probability (%)** dari kelas dominan.

#### B. Cara Menguji Model Machine Learning:
1. Masuk ke menu **3. Single Identity & AI**.
2. Klik tombol hijau **"Uji AI-DSS & ML"** di kanan atas.
3. Di dalam modal kalkulator, Anda dapat memilih antara:
   - **Mode 1: Model Machine Learning (k-NN Classifier)**
   - **Mode 2: Formula Pembobotan Multikriteria (MCDA Weighted Formula)**
4. Geser parameter input:
   - Contoh Kasus Kritis: Pendapatan Rp 450.000, Tanggungan 7 Orang, Konsumsi Gizi 20, Modal UKM 30.
   - **Output Real ML:** Model k-NN langsung mengklasifikasikan ke **"Prioritas Utama Bantuan (Kritis)"** dengan *Confidence Level* (misal 100% atau 67%) dan menampilkan rekomendasi intervensi pangan spesifik.
   - Geser Pendapatan ke Rp 3.200.000, Tanggungan 2 Orang, Konsumsi Gizi 90.
   - **Output Real ML:** Model k-NN berpindah ke status **"Mandiri / Tangguh Pangan"**.

---

### 3. KEUNGGULAN ARSITEKTUR CLIENT-SIDE DEEPTECH UNTUK HACKATHON

Saat dewan juri bertanya: *"Apakah ini benar-benar berjalan atau cuma tipuan antarmuka?"*, Anda dapat menjawab dengan percaya diri:

1. **Edge AI / Zero Server Cost:**
   - Sistem tidak bergantung pada server Python/GPU cloud mahal yang menghabiskan biaya jutaan rupiah per bulan.
   - Semua inferensi komputasi Computer Vision dan Machine Learning berjalan di memori peramban (*client-side execution*).
2. **Kesesuaian dengan Karakteristik Daerah (PKK & Desa):**
   - Sangat cocok untuk posko PKK di tingkat RT/RW yang sering terkendala sinyal internet tidak stabil.
   - Begitu halaman dimuat, pemrosesan citra dan klasifikasi dapat berjalan bahkan saat kuota internet terbatas.
3. **Kepatuhan Perlindungan Data Pribadi (PDP):**
   - Foto dokumen warga (KK, buku kas, bukti tabungan) diproses lokal di laptop/gadget petugas dan **tidak diunggah ke server pihak ketiga**, menjaga kerahasiaan identitas warga secara mutlak.

---

### 4. PANDUAN RINGKAS DEMO 3 MENIT UNTUK DEWAN JURI

| Menit ke- | Halaman / Layar | Aksi & Narasi |
|:---:|:---|:---|
| **00:00 - 00:45** | **Dashboard RT 13** | "Selamat siang Dewan Juri. Di PKK RT 13 Yosomulyo terdapat 40 KK dengan beragam masalah: 40% bansos rawan salah sasaran dan pencatatan kas pangan masih di buku tulis. SI-PANGAN hadir menyatukan Single Identity dan DeepTech." |
| **00:45 - 01:45** | **Single Identity -> Uji AI-DSS & ML** | "Untuk mengatasi bansos salah sasaran, kami membangun model **Machine Learning k-NN Classifier**. Mari kita uji: jika warga berpenghasilan rendah dengan tanggungan tinggi, model langsung mendeteksi status Kritis dengan probabilitas akurasi tinggi tanpa intervensi nepotisme pengurus." |
| **01:45 - 02:30** | **Single Identity -> Pindai Buku (OCR)** | "Untuk memodernisasi buku tulis manual Ibu Sartika, kami mengintegrasikan **Computer Vision Tesseract.js OCR**. Petugas bisa mengunggah foto nota/buku kas riil, sistem mengekstrak karakter teks secara langsung dan memetakan nominal uang ke kas digital." |
| **02:30 - 03:00** | **Koperasi & E-Voting** | "Data hasil scan otomatis masuk ke buku kas koperasi yang bebas selisih hitung, dan seluruh warga dapat menentukan program ketahanan pangan lewat E-Voting 1 SID = 1 Suara. Terima kasih." |

---

### 5. STATUS KESIAPAN TEKNOLOGI (TKT)
- **Tingkat Kesiapan Teknologi:** **TKT 5 (Validasi Teknologi di Lingkungan Relevan)**.
- **Komponen Fungsional:** Seluruh tombol navigasi, filter pencarian SID, modal AI Machine Learning, scanner OCR citra riil, pencatatan mutasi kas, dan e-voting telah teruji dan siap pakai.

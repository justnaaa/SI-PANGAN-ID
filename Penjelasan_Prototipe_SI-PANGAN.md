# PANDUAN & PENJELASAN TEKNIS PROTOTIPE SI-PANGAN ID
## (Single Identity, Digital Food Inventory, Community AI Demand Engine, Smart Market & Musyawarah Warga RT 13 Yosomulyo)

---

### GAMBARAN UMUM: APA YANG TELAH BERFUNGSI DI PURWARUPA?

**Purwarupa fungsional SI-PANGAN ID pada [index.html](index.html) berjalan langsung di browser (*Client-Side Edge AI / Zero Server Dependency*) menggunakan HTML5, Tailwind CSS CDN, Vanilla JavaScript, Chart.js v4, dan Tesseract.js v5 WebAssembly — siap di-hosting statis di GitHub Pages tanpa proses *build*.**

Nilai inovasi utama purwarupa ini adalah **produksi pangan berbasis permintaan (*Demand-Driven Production*)**: mengubah pola dari sekadar memproduksi lalu mencari pembeli, menjadi mengetahui kebutuhan pasar terlebih dahulu melalui pemetaan konsumsi per **Single Identity (SID)** dan **Musyawarah E-Voting**, lalu **AI menarik agregasi kebutuhan tersebut ke Panel Pemasok** untuk dipasok langsung ke **Smart Market** dan didistribusikan ke warga secara transparan.

---

### 1. SINGLE IDENTITY (TAB 2): PEMETAAN KEBUTUHAN BULANAN PER SID
1. **Basis Data 40 KK Terstruktur (`window.appState.members`):**
   - Setiap warga memiliki kode identitas tunggal (`SID-RT13-001` s.d. `SID-RT13-040`), hash NIK terenkripsi SHA-256 (*anti-duplikasi*), jarak ke hub RT 13, serta rincian kebutuhan konsumsi bulanan per komoditas (`needs: { beras, sayur, telur, ikan }` dalam Kg/bulan).
   - **Skenario Kebutuhan di Luar Market (10 KK Acak):** 10 dari 40 KK (`SID-RT13-002`, `005`, `008`, `011`, `012`, `018`, `021`, `023`, `029`, `030`) memiliki kebutuhan bulanan **Daging Ayam Kampung/Potong (total 28 Kg/bln)** dan **Tempe Daun & Tahu Segar (total 31 Kg/bln)** yang belum tersedia di etalase Market Tab 3, sehingga otomatis terdeteksi AI sebagai peluang pasok baru.
2. **Desain Tabel Expandable & Privasi (`renderMembersTable`):**
   - Tampilan awal tabel sengaja ringkas dalam 4 kolom utama (**Kode SID**, **Identitas Masked**, **Status Kerentanan**, dan **Lihat Detail**) agar rapi dan *mobile-friendly* (`overflow-x-auto`).
   - Mengklik baris warga membuka **Expandable Row** yang memuat Peran & Alamat, Tanggungan Keluarga, Jarak ke Hub RT 13, serta pill rincian konsumsi komoditas bulanan.
   - Form registrasi warga baru (`#formRegisterMember`) dilengkapi input per komoditas (`#regNeedBeras` s.d. `#regNeedTempe`) yang otomatis menjumlah ke `#regFoodNeedKg` dan memperbarui agregasi AI secara *real-time*.

---

### 2. AI DEMAND-TO-SUPPLIER ENGINE & E-VOTING THRESHOLD (TAB 5)
Tab 5 (**Musyawarah & Transparansi Distribusi Pangan**) mengintegrasikan 3 komponen utama:

1. **Header Overview & Linimasa Transparansi:**
   - **3 Kartu Metrik:** *Progres Distribusi Bulan Ini* (`85%` + Progress Bar dinamis), *Dana Kas Swadaya Terpakai* (`Rp 1.450.000`), dan *Status Surplus/Defisit* (badge *Warning* kuning atau *Aman* hijau).
   - **Linimasa Distribusi Real-Time:** Feed vertikal yang otomatis merekam setiap pengalihan kuota, publikasi pasokan ke Market, serta setiap transaksi pembelian warga dari Market Tab 3.
   - **Forum Intervensi ("Kendala & Pengalihan Kuota"):** Alert card kendala pasokan 5 kg Sayur Kangkung dari *KWT Sumber Rejeki* yang dapat langsung diseimbangkan oleh produsen aktif melalui tombol **"Ambil Alih Kuota"**.

2. **Mesin Penarik Permintaan AI (`generateAiDemands`) & Panel Kelola Distribusi Pemasok:**
   - Fungsi `generateAiDemands()` melakukan iterasi terhadap seluruh data `window.appState.members` dan menjumlahkan kebutuhan bulanan per komoditas.
   - **Filter Bisnis Ketat:** Komoditas hanya muncul di tabel antrean pemasok jika memenuhi **dua syarat**:
     1. Total kebutuhan agregat warga `> 0 Kg/bln`, dan
     2. Komoditas tersebut **belum ada atau stoknya habis (`availableStockKg <= 0`)** di Etalase Market (Tab 3).
   - Pada kondisi awal, *Beras*, *Sayur*, *Telur*, dan *Ikan* sudah memiliki stok di Market Tab 3 sehingga tidak menumpuk di antrean, sedangkan **Daging Ayam Kampung/Potong (10 KK • 28 Kg)** dan **Tempe Daun & Tahu Segar (10 KK • 31 Kg)** langsung tampil siap diambil alih pemasok. Apabila stok suatu komoditas di Market dibeli habis (`0 Kg`), komoditas tersebut otomatis masuk kembali ke antrean Panel Pemasok.

3. **Integrasi Ambang Batas E-Voting (`VOTE_THRESHOLD = 10`):**
   - Warga dapat terus mengajukan atau memvoting komoditas kebutuhan keluarga di luar tarikan SID rutin melalui papan **E-Voting (1 SID = 1 Suara)**.
   - Saat suara mencapai ambang batas (`item.votes >= VOTE_THRESHOLD`), status komoditas otomatis berubah dari **`Voting`** menjadi **`Menunggu Pemasok`** dan diinjeksi ke `window.appState.aiAggregatedDemands` dengan penanda `source: 'voting'` serta badge visual **`🔥 Hasil Voting Warga`** di Panel Pemasok.
   - Item *Tepung Terigu & Gula Pasir* (`dem-005`) dimulai pada **9/10 suara** sehingga 1 kali klik **"Beri Suara"** langsung memperagakan transisi otomatis ke Panel Pemasok.

4. **Alur Terpusat ke Market (Tab 3) & Pembukuan:**
   - Saat pemasok mengklik **"Ambil Alih Kuota"** (baik pada item agregasi SID maupun item `🔥 Hasil Voting Warga`), item tersebut otomatis diterbitkan ke **Market (Tab 3 / `window.appState.listings`)** dengan badge **`Tersedia • Disuplai oleh [Nama Pemasok]`** dan dihapus dari antrean Panel Pemasok.
   - Warga kemudian melakukan transaksi **"Beli Langsung"** dari Market Tab 3 (`handleExecuteBuy`), yang otomatis memotong stok, meneruskan 100% nilai barang ke produsen (0% fee P2P), serta mencatat log transaksi ke **Linimasa Tab 5** dan **Buku Besar Tab 6**.

---

### 3. SMART MARKET, DYNAMIC PRICING & AI FORECASTING (TAB 3 & TAB 4)
1. **Digital Food Inventory & Tesseract.js v5 OCR:**
   - Pencatatan tanggal tanam, estimasi tanggal panen, dan batas kesegaran (*short shelf-life*), ditambah pemindai kuitansi/catatan panen *in-browser* via **Tesseract.js v5 WebAssembly**.
2. **AI Market Fluctuation Forecaster & Koridor Harga Adil:**
   - Grafik proyeksi harga Chart.js 11 titik waktu (H-7 s.d. H+3) disertai rekomendasi aksi bagi produsen dan konsumen.
   - Penguncian batas bawah (**Batas Harga Pengepul**) dan batas atas (**Harga Pasar Luar**) memastikan **Harga Komunitas RT 13** tetap adil bagi produsen maupun konsumen, memperpendek rantai distribusi dan mengurangi ketergantungan pada perantara yang tidak memberi nilai tambah.
3. **Community AI (k-NN Classifier, Surplus Prediction & Multi-Criteria Matching):**
   - Klasifikasi kerentanan rumah tangga berbasis **k-Nearest Neighbors ($k=3$)** dengan Min-Max Scaling dan Euclidean Distance (`RENTAN_PRIORITAS`, `WASPADA`, `MANDIRI`).
   - **AI Surplus Prediction Engine** untuk mendeteksi luapan panen lebih awal agar surplus (misal *Kasus Beras +400 Kg* dan *Sayur +20 Kg*) disalurkan ke **Koperasi Produsen Kelurahan Yosomulyo** guna menekan *food loss*, serta **AI Food Matching 4 Parameter** (*Gizi, Harga, Jarak, Kesegaran*) dengan rotasi *Round-Robin* bagi keluarga rentan.

---

### 4. SKEMA EKONOMI: 0% FEE P2P WARGA & KEBERLANJUTAN KOPERASI
- **0% Fee Transaksi P2P Internal RT:** Seluruh pembayaran warga untuk jual-beli pangan di RT 13 diterima **100% oleh produsen** (*walletEarned*) tanpa potongan komisi platform.
- **Keberlanjutan Operasional Ekosistem:** Didukung melalui layanan kurir komunitas dan bagi hasil pengelolaan luapan surplus panen (*spillover*) oleh **Koperasi Produsen Kelurahan Yosomulyo** ke pasar eksternal serta kemitraan antarkelompok produsen.

---

### 5. PANDUAN RINGKAS DEMO 3 MENIT UNTUK DEWAN JURI

| Menit ke- | Tab / Modul | Fokus Demonstrasi |
| :---: | :--- | :--- |
| **00:00 – 00:40** | **1. Alur & Arsitektur** | Jelaskan benang merah *Demand-Driven Production* (mengetahui kebutuhan pasar dulu sebelum produksi & distribusi), 4 Pilar Ekosistem, serta skema 0% Fee P2P warga & peran Koperasi. |
| **00:40 – 01:25** | **2. Single Identity (SID)** | Tunjukkan tabel 40 KK ringkas yang dapat di-expand untuk melihat kebutuhan komoditas per bulan per SID (`Beras`, `Sayur`, `Telur`, `Ikan`, plus `Daging Ayam` & `Tempe/Tahu`), uji anti-duplikasi NIK, dan kalkulasi AI-DSS k-NN. |
| **01:25 – 02:15** | **5. Musyawarah & Pemasok → 3. Market** | Tunjukkan 10 KK yang kebutuhannya belum ada di Market otomatis ditarik AI ke Panel Pemasok; klik 1x Vote pada *Tepung & Gula* (9→10 suara) untuk menunjukkan item **`🔥 Hasil Voting Warga`** masuk antrean; klik **`Ambil Alih Kuota`** hingga produk muncul **`Tersedia`** di Tab 3 Market, lalu lakukan pembelian warga dan tunjukkan lognya langsung muncul di Linimasa Tab 5. |
| **02:15 – 03:00** | **4. Community AI & 6. Evaluasi Dampak** | Tunjukkan prediksi surplus (*spillover* ke Koperasi), Food Matching 4 parameter berkeadilan, grafik penyerapan & alokasi nilai transaksi, serta Buku Besar teraudit. |

---

### 6. STATUS KESIAPAN TEKNOLOGI
- **Status Purwarupa:** **Purwarupa Fungsional — Siap Validasi Lapangan**.
- **Target Validasi Berikutnya:** Pengujian lapangan bersama petani pekarangan, KWT, pelaku UMKM pangan, Koperasi Kelurahan Yosomulyo, dan rumah tangga RT 13 Kota Metro untuk mengukur efektivitas sistem secara empiris.

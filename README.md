# SI-PANGAN ID

> **Sistem Informasi Ketahanan Pangan Komprehensif Berbasis Komunitas (PKK Yosomulyo)**  
> *DeepTech for FoodTech Ecosystem: On-Device AI/Wasm OCR, Smart Supply Chain Aggregator, and Community Market.*

---

## 🚀 Ekosistem & Menjalankan Proyek (Bun)

Aplikasi ini menggunakan **[Bun](https://bun.sh/)** dan **[Vite](https://vitejs.dev/)** untuk pengalaman pengembangan yang sangat cepat dan siap dideploy langsung ke **[Vercel](https://vercel.com/)**.

### 1. Prasyarat
Pastikan Bun sudah terpasang di sistem Anda. Jika belum:
- **macOS/Linux**: `curl -fsSL https://bun.sh/install | bash`
- **Windows (PowerShell)**: `powershell -c "irm bun.sh/install.ps1 | iex"`

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Menjalankan Server Pengembangan (Dev)
```bash
bun run dev
```
Aplikasi akan otomatis berjalan di `http://localhost:3000`.

### 4. Build untuk Produksi
```bash
bun run build
```
Hasil build akan tersimpan di direktori `dist/`.

### 5. Preview Hasil Build
```bash
bun run preview
```

---

## 🌐 Panduan Deploy ke Vercel

Proyek ini telah dikonfigurasi dengan `vercel.json` dan Vite, sehingga dapat langsung dideploy ke Vercel dengan langkah:

1. **Import Repository** di dashboard [Vercel](https://vercel.com/new).
2. **Pengaturan Otomatis Terdeteksi**:
   - **Framework Preset**: Vite
   - **Build Command**: `bun run build` (atau `vite build`)
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`
3. Klik **Deploy**. Selesai!

---

## 🛠️ Arsitektur & Teknologi

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Frontend Core**: Vanilla JavaScript (Reactive State Architecture via `window.appState`)
- **Styling**: Tailwind CSS
- **Visualisasi & Analisis**: Chart.js
- **DeepTech On-Device AI**: Tesseract.js (WebAssembly Neural Engine untuk Optical Character Recognition nota belanja offline tanpa server eksternal)
- **Logika & Fitur**:
  - Tab 1: Input Konsumsi (Manual & OCR Struk Wasm)
  - Tab 2: Dashboard SID Warga & Analisis Komoditas (Piramida Kebutuhan, Detail Konsumsi per KK)
  - Tab 3: Papan Permintaan Komunitas (Marketplace Lokal & E-Voting Ambang Batas 10 Suara)
  - Tab 4: Pengiriman & Logistik (Track status pengiriman)
  - Tab 5: Musyawarah Pangan, Buku Besar Transparan & AI Demand Engine Pemasok (Ambil Alih Kuota)

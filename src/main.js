/**
 * @file src/main.js
 * @description Entry Point Utama Aplikasi SI-PANGAN ID (Modular Clean Code Architecture dengan Vite & Bun).
 */

import { initAppStateData } from './data/initialState.js';
import { initCoreAppController } from './controllers/coreAppController.js';
import { initPriceAdvisorEngine } from './ai/priceAdvisorEngine.js';
import { initAiForecastAndSurplusEngine } from './ai/aiForecastAndSurplus.js';
import { initReceiptPdfService } from './services/receiptPdfService.js';
import { initSupabaseAndStorageService } from './services/supabaseAndStorage.js';
import { initAuthAndRoleController } from './controllers/authAndRoleController.js';

// 1. Inisialisasi Master Data 40 KK & Katalog Komoditas
initAppStateData();

// 2. Registrasi Modul Core UI, AI/ML Engine, PDF Service, Supabase Database, & Auth/Role Controller
initCoreAppController();
initPriceAdvisorEngine();
initAiForecastAndSurplusEngine();
initReceiptPdfService();
initSupabaseAndStorageService();
initAuthAndRoleController();

// 3. Pastikan inisialisasi DOM berjalan baik jika dokumen sudah selesai dimuat sebelum module dieksekusi
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

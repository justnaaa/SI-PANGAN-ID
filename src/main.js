/**
 * @file src/main.js
 * @description Entry Point Utama Aplikasi SI-PANGAN ID (Modular Clean Code Architecture dengan Vite & Bun).
 */

import { initAppStateData } from './data/initialState.js';
import { initSharedFoundation } from './domain/sharedFoundation.js';
import { initCoreAppController } from './controllers/coreAppController.js';
import { initPriceAdvisorEngine } from './ai/priceAdvisorEngine.js';
import { initAiForecastAndSurplusEngine } from './ai/aiForecastAndSurplus.js';
import { initReceiptPdfService } from './services/receiptPdfService.js';
import { initSupabaseAndStorageService } from './services/supabaseAndStorage.js';
import { initAuthAndRoleController } from './controllers/authAndRoleController.js';

// 1. Inisialisasi Master Data 40 KK, Katalog Komoditas, & Fondasi Bersama (Fase 0)
initAppStateData();
initSharedFoundation();

// 2. Registrasi Modul Core UI, AI/ML Engine, PDF Service, Supabase Database, & Auth/Role Controller
initCoreAppController();
initPriceAdvisorEngine();
initAiForecastAndSurplusEngine();
initReceiptPdfService();
initSupabaseAndStorageService();
initAuthAndRoleController();

// 2b. Proyeksi Admin: satu sumber (mingguan per produsen); proyeksi 3 hari lama tidak lagi menimpa kartu
window.syncLiveSurplusData = function syncLiveSurplusData() {
    if (typeof window.renderPerProducerAiForecast === 'function') window.renderPerProducerAiForecast();
};

// 2c. Input PIN hanya menerima angka (ketik maupun tempel), maksimal 6 digit
document.addEventListener('DOMContentLoaded', () => {
    ['gateLoginPin', 'gateRegPin'].forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.dataset.pinBound) {
            el.dataset.pinBound = '1';
            el.setAttribute('inputmode', 'numeric');
            el.setAttribute('maxlength', '6');
            el.addEventListener('input', () => {
                const clean = window.SiPanganDomain.sanitizePinDigits(el.value);
                if (el.value !== clean) el.value = clean;
            });
        }
    });
});

// 3. Pastikan inisialisasi DOM berjalan baik jika dokumen sudah selesai dimuat sebelum module dieksekusi
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

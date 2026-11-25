import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SURPLUS_THRESHOLD_KG,
    VOTE_THRESHOLD,
    HARI_PER_BULAN,
    HARI_PER_MINGGU,
    sanitizeNikDigits,
    isValidNik16,
    getInvalidNikMembers,
    generateNextSid,
    generateUniqueTxId,
    can,
    checkPullSignalEligibility,
    auditAndFlagAppState,
    dedupeTransactionsById,
    getValidTransactions,
    calcTransactionAmounts,
    getProducerOrderSummary,
    getBeforeAfterSelfBuyingRecap,
    getFinancialReconciliation,
    kurangiStok,
    kembalikanStok,
    getInventorySummary,
    getBalanceStatus,
    bulananKeHarian,
    harianKeMingguan,
    bulananKeMingguan,
    calcFamilyNeedsTotal,
    getEffectiveMemberNeeds,
    getMemberConsistentMonthlyNeedKg,
    computeCommunityBaselineNeeds,
    getTrainingTransactions,
    closeMonthlyPeriod,
    isOrderPeriodClosed
} from '../src/domain/sharedFoundation.js';

test('2.1 calcFamilyNeedsTotal sums 6 items accurately and treats empty/NaN as 0', () => {
    // Contoh QA: 18 + 9 + 5 + 4 + 4 + 6 = 46 Kg
    assert.equal(
        calcFamilyNeedsTotal({ beras: 18, sayur: 9, telur: 5, ikan: 4, ayam: 4, tempe: 6 }),
        46
    );
    // Input kosong / undefined / NaN dihitung 0 (Pak Joko awal: 18 + 9 + 5 + 4 = 36 Kg)
    assert.equal(
        calcFamilyNeedsTotal({ beras: '18', sayur: '9', telur: 5, ikan: 4, ayam: '', tempe: undefined }),
        36
    );
});

test('1.6 NIK validation enforces exact 16 numeric digits and flags invalid existing records without mutating', () => {
    assert.equal(isValidNik16('1872011009810006'), true);
    assert.equal(isValidNik16('g69361'), false);
    assert.equal(isValidNik16('12345'), false);
    assert.equal(isValidNik16('187201100981000A'), false);
    assert.equal(sanitizeNikDigits('18a72-0110 09810006999'), '1872011009810006');

    const state = {
        members: [
            { sid: 'SID-RT13-006', name: 'Pak Joko', rawNik: '1872011009810006' },
            { sid: 'SID-RT13-041', name: 'Warga Uji QA', rawNik: 'g69361' }
        ],
        transactions: []
    };
    const report = auditAndFlagAppState(state);
    assert.equal(report.invalidNiks.length, 1);
    assert.equal(report.invalidNiks[0].sid, 'SID-RT13-041');
    // Pastikan rawNik tidak diubah diam-diam
    assert.equal(state.members[1].rawNik, 'g69361');
    assert.equal(state.members[1].hasInvalidNik, true);
    assert.equal(getInvalidNikMembers(state.members).length, 1);
});

test('2.2 & 1.4 Deduplication (TX-RT13-944) and Self-Buying exclusion (TX-RT13-798) preserve raw array', () => {
    const rawTxs = [
        { id: 'TX-RT13-912', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-023', quantityKg: 2, subtotal: 44000, type: 'JUAL_BELI_PASAR' },
        { id: 'TX-RT13-920', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-031', quantityKg: 3, subtotal: 66000, type: 'JUAL_BELI_PASAR' },
        { id: 'TX-RT13-928', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-039', quantityKg: 2, subtotal: 44000, type: 'JUAL_BELI_PASAR' },
        { id: 'TX-RT13-936', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-017', quantityKg: 4, subtotal: 88000, type: 'JUAL_BELI_PASAR' },
        { id: 'TX-RT13-944', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-025', quantityKg: 2, subtotal: 44000, type: 'JUAL_BELI_PASAR' },
        // Duplikat TX-RT13-944 (+2 Kg yang menyebabkan 15 Kg di QA)
        { id: 'TX-RT13-944', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-025', quantityKg: 2, subtotal: 44000, type: 'JUAL_BELI_PASAR' },
        // Self-buying TX-RT13-798 oleh Pak Joko sendiri
        { id: 'TX-RT13-798', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-006', quantityKg: 1, subtotal: 11500, type: 'JUAL_BELI_PASAR', orderStatus: 'MENUNGGU_KONFIRMASI' }
    ];

    const state = { members: [], transactions: rawTxs };
    auditAndFlagAppState(state);

    // Data asli tidak dihapus (masih 7 item di store)
    assert.equal(state.transactions.length, 7);
    assert.equal(state.transactions[5].isDuplicateId, true);
    assert.equal(state.transactions[6].isInvalidSelfBuying, true);

    // Dedupe menghilangkan ID ganda
    assert.equal(dedupeTransactionsById(state.transactions).length, 6);

    // Summary Pak Joko menampilkan tepat 5 pesanan dan 13 Kg (15 - 2 = 13, tanpa self-buying)
    const summary = getProducerOrderSummary(state.transactions, 'SID-RT13-006');
    assert.equal(summary.totalCount, 5);
    assert.equal(summary.totalKg, 13);
    assert.equal(summary.omzetProdukBersih, 286000);

    // Laporan sebelum vs sesudah self-buying
    const recap = getBeforeAfterSelfBuyingRecap(state.transactions);
    assert.equal(recap.before.count, 6);
    assert.equal(recap.before.totalKg, 14);
    assert.equal(recap.after.count, 5);
    assert.equal(recap.after.totalKg, 13);
});

test('2.3 Active order counter counts MENUNGGU_KONFIRMASI and SIAP_DIAMBIL, excluding SELESAI_LUNAS and DIBATALKAN', () => {
    const txs = [
        { id: 'TX-1', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-011', quantityKg: 2, subtotal: 44000, orderStatus: 'MENUNGGU_KONFIRMASI', type: 'JUAL_BELI_PASAR' },
        { id: 'TX-2', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-012', quantityKg: 3, subtotal: 66000, orderStatus: 'SIAP_DIAMBIL', type: 'JUAL_BELI_PASAR' },
        { id: 'TX-3', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-013', quantityKg: 2, subtotal: 44000, orderStatus: 'SELESAI_LUNAS', type: 'JUAL_BELI_PASAR' },
        { id: 'TX-4', producerSid: 'SID-RT13-006', consumerSid: 'SID-RT13-014', quantityKg: 1, subtotal: 22000, orderStatus: 'DIBATALKAN', type: 'JUAL_BELI_PASAR' }
    ];
    const sum = getProducerOrderSummary(txs, 'SID-RT13-006');
    assert.equal(sum.activeCount, 2); // TX-1 + TX-2
    assert.equal(sum.totalCount, 3);  // TX-1 + TX-2 + TX-3 (DIBATALKAN tidak dihitung)
    assert.equal(sum.totalKg, 7);
});

test('2.4 & 3.1 Stock deduction, MBG surplus subtraction (591 -> 574 Kg), and single-restore on cancel', () => {
    const appState = {
        listings: [
            { id: 'list-001', producerSid: 'SID-RT13-001', availableStockKg: 17, unabsorbedSurplusKg: 0, localAbsorbedKg: 63, initialHarvestKg: 80 },
            { id: 'list-002', producerSid: 'SID-RT13-003', availableStockKg: 174, unabsorbedSurplusKg: 400, localAbsorbedKg: 426, initialHarvestKg: 1000 }
        ]
    };

    const beforeInv = getInventorySummary(appState);
    assert.equal(beforeInv.totalStokPanenTersediaKg, 591); // 17 + 174 + 400 = 591 Kg

    // Salurkan 17 Kg Kangkung ke Dapur MBG -> harus TURUN 591 -> 574 Kg (bukan naik 608 Kg!)
    const deductRes = kurangiStok(appState.listings[0], 17, { trackB2bDispatched: true });
    assert.equal(deductRes.ok, true);
    assert.equal(appState.listings[0].availableStockKg, 0);

    const afterInv = getInventorySummary(appState);
    assert.equal(afterInv.totalStokPanenTersediaKg, 574);

    // Uji reservasi beli & pembatalan pesanan: kembali tepat sekali
    const tx = { id: 'TX-RT13-999', quantityKg: 4, stockDeducted: false };
    const buyRes = kurangiStok(appState.listings[1], 4);
    assert.equal(buyRes.ok, true);
    tx.stockDeducted = true;
    assert.equal(appState.listings[1].availableStockKg, 170);

    const restore1 = kembalikanStok(appState.listings[1], 4, tx);
    assert.equal(restore1.ok, true);
    assert.equal(appState.listings[1].availableStockKg, 174);

    // Panggilan kedua ditolak agar stok tidak bertambah dua kali
    const restore2 = kembalikanStok(appState.listings[1], 4, tx);
    assert.equal(restore2.ok, false);
    assert.equal(appState.listings[1].availableStockKg, 174);
});

test('2.8 & 2.9 Surplus threshold (5 Kg) and time unit conversions (30 days/month, 7 days/week)', () => {
    assert.equal(SURPLUS_THRESHOLD_KG, 5);
    assert.equal(HARI_PER_BULAN, 30);
    assert.equal(HARI_PER_MINGGU, 7);

    // +4 Kg (17 - 13) -> PAS / SEIMBANG
    assert.equal(getBalanceStatus(4).code, 'SEIMBANG');
    assert.equal(getBalanceStatus(5).code, 'SEIMBANG');
    // +6 Kg / +7 Kg -> LEBIH / SURPLUS
    assert.equal(getBalanceStatus(6).code, 'SURPLUS');
    assert.equal(getBalanceStatus(7).code, 'SURPLUS');
    // -1 Kg -> DEFISIT
    assert.equal(getBalanceStatus(-1).code, 'DEFISIT');

    // Konversi satuan waktu: 30 Kg/bln = 1 Kg/hari = 7 Kg/mgg
    assert.equal(bulananKeHarian(30), 1);
    assert.equal(harianKeMingguan(bulananKeHarian(30)), 7);
    assert.equal(bulananKeMingguan(30), 7);
});

test('2.10 & 2.11 Nominal transaction calculation (TX-RT13-467: 13.500 + 2.000 = 15.500) and Financial Reconciliation', () => {
    const tx467 = {
        id: 'TX-RT13-467',
        type: 'JUAL_BELI_PASAR',
        producerSid: 'SID-RT13-001',
        consumerSid: 'SID-RT13-011',
        quantityKg: 3,
        unitPrice: 4500,
        subtotal: 13500,
        deliveryFee: 2000
    };
    const amt = calcTransactionAmounts(tx467);
    assert.equal(amt.subtotalProduk, 13500);
    assert.equal(amt.biayaAntar, 2000);
    assert.equal(amt.total, 15500);
    assert.equal(amt.omzetBersihProdusen, 13500);

    const txMbg = {
        id: 'TX-RT13-MBG1',
        type: 'EKSPANSI_PASAR_LUAR',
        status: 'TERVERIFIKASI_MBG_KOPERASI',
        producerSid: 'SID-RT13-001',
        consumerSid: 'MBG_METRO',
        quantityKg: 17,
        unitPrice: 4500,
        subtotal: 76500,
        deliveryFee: 0
    };
    const recon = getFinancialReconciliation({ transactions: [tx467, txMbg], danaSosialInklusi: 1450000 });
    assert.equal(recon.omzetP2pProduk, 13500);
    assert.equal(recon.biayaJasaAntar, 2000);
    assert.equal(recon.penyaluranB2bKoperasi, 76500);
    assert.equal(recon.totalPerputaran, 90000); // 13.500 + 76.500
    assert.equal(recon.isMatched, true);
    assert.equal(recon.selisihKas, 0);
});

test('1.1 - 1.7 & 3.3 Section 3 Access Matrix and Period Lock guards', () => {
    const citizenOrder = {
        id: 'TX-RT13-912',
        producerSid: 'SID-RT13-006',
        consumerSid: 'SID-RT13-023',
        orderStatus: 'MENUNGGU_KONFIRMASI',
        timestamp: '27 Okt 2026, 09:00',
        period: '2026-10'
    };
    const coopOrder = {
        id: 'TX-COOP-001',
        producerSid: 'KOPERASI-RT13',
        producerName: 'Koperasi RT 13',
        consumerSid: 'SID-RT13-023',
        orderStatus: 'MENUNGGU_KONFIRMASI',
        period: '2026-10'
    };
    const jokoListing = { id: 'list-004', producerSid: 'SID-RT13-006', commodity: 'Ikan Lele Segar' };

    const adminState = { isAdminLoggedIn: true, activeRole: 'ADMIN', activeUserSid: 'ADMIN-RT13', closedPeriods: [], activePeriod: '2026-10' };
    const jokoProdState = { isAdminLoggedIn: false, activeRole: 'PRODUSEN', activeUserSid: 'SID-RT13-006', closedPeriods: [], activePeriod: '2026-10' };
    const jokoKonsState = { isAdminLoggedIn: false, activeRole: 'KONSUMEN', activeUserSid: 'SID-RT13-006', closedPeriods: [], activePeriod: '2026-10' };
    const buyerKonsState = { isAdminLoggedIn: false, activeRole: 'KONSUMEN', activeUserSid: 'SID-RT13-023', closedPeriods: [], activePeriod: '2026-10' };

    // 1.1 Admin tidak boleh ubah status pesanan warga, tapi boleh pesanan Koperasi
    assert.equal(can(adminState, 'UPDATE_ORDER_STATUS', citizenOrder, adminState), false);
    assert.equal(can(adminState, 'UPDATE_ORDER_STATUS', coopOrder, adminState), true);
    assert.equal(can(jokoProdState, 'UPDATE_ORDER_STATUS', citizenOrder, jokoProdState), true);

    // 1.2 & 1.3 Admin tidak boleh beli / edit / hapus produk warga, hanya moderasi
    assert.equal(can(adminState, 'BUY_PRODUCT', jokoListing, adminState), false);
    assert.equal(can(adminState, 'EDIT_PRODUCT', jokoListing, adminState), false);
    assert.equal(can(adminState, 'DELETE_PRODUCT', jokoListing, adminState), false);
    assert.equal(can(adminState, 'MODERATE_PRODUCT', jokoListing, adminState), true);

    // 1.4 Larang self-buying
    assert.equal(can(jokoKonsState, 'BUY_PRODUCT', jokoListing, jokoKonsState), false);
    assert.equal(can(buyerKonsState, 'BUY_PRODUCT', jokoListing, buyerKonsState), true);

    // 1.7 Aturan Tarik Sinyal Produksi
    const voting9 = { id: 'dem-005', name: 'Bawang Putih', category: 'Bumbu', votes: 9, targetVotes: VOTE_THRESHOLD, status: 'VOTING' };
    const sembako12 = { id: 'dem-002', name: 'Minyak Goreng Sawit Kemasan', category: 'Sembako Pokok', votes: 12, status: 'DEFISIT_LOKAL' };
    const suppliedEgg = { id: 'dem-001', name: 'Telur Ayam Ras Segar', category: 'Lauk & Protein', votes: 28, status: 'TERPENUHI_LOKAL', producerNotes: 'Tersedia di RT 13 (Ibu Dewi Lestari - SID-RT13-009)' };

    assert.equal(checkPullSignalEligibility(jokoProdState, voting9, jokoProdState).allowed, false);
    assert.equal(checkPullSignalEligibility(jokoProdState, sembako12, jokoProdState).allowed, false);
    assert.equal(checkPullSignalEligibility(adminState, sembako12, adminState).allowed, true);
    const conflictCheck = checkPullSignalEligibility(jokoProdState, suppliedEgg, { members: [{ sid: 'SID-RT13-009', name: 'Ibu Dewi Lestari' }] });
    assert.equal(conflictCheck.allowed, false);
    assert.equal(conflictCheck.label, 'Sudah dipasok warga lain');

    // 3.3 Tutup buku mengunci periode 2026-10 dan membuka 2026-11
    const periodState = { activePeriod: '2026-10', closedPeriods: [], transactions: [citizenOrder] };
    const closeRes = closeMonthlyPeriod(periodState);
    assert.equal(closeRes.ok, true);
    assert.equal(closeRes.nextPeriod, '2026-11');
    assert.equal(closeRes.nextLabel, 'November 2026');
    assert.equal(isOrderPeriodClosed(citizenOrder, periodState), true);
    assert.equal(can({ ...jokoProdState, ...periodState }, 'UPDATE_ORDER_STATUS', citizenOrder, periodState), false);
    assert.equal(can({ ...buyerKonsState, ...periodState }, 'CANCEL_ORDER', citizenOrder, periodState), false);
    // Tidak bisa ditutup dua kali untuk periode yang sama jika dikembalikan
    periodState.activePeriod = '2026-10';
    assert.equal(closeMonthlyPeriod(periodState).ok, false);
});

test('5.1 & 5.2 Dataset sanitizer separates channels, flags >3x median outliers, and re-computes KK baseline', () => {
    const txs = [
        { id: 'TX-1', commodity: 'Sayur Kangkung', quantityKg: 2, producerSid: 'SID-RT13-001', consumerSid: 'SID-RT13-011', type: 'JUAL_BELI_PASAR' },
        { id: 'TX-2', commodity: 'Sayur Kangkung', quantityKg: 2, producerSid: 'SID-RT13-001', consumerSid: 'SID-RT13-012', type: 'JUAL_BELI_PASAR' },
        { id: 'TX-3', commodity: 'Sayur Kangkung', quantityKg: 3, producerSid: 'SID-RT13-001', consumerSid: 'SID-RT13-013', type: 'JUAL_BELI_PASAR' },
        // Outlier eceran (> 3 x median 2 = > 6 Kg): ditandai, tidak dihapus
        { id: 'TX-4', commodity: 'Sayur Kangkung', quantityKg: 10, producerSid: 'SID-RT13-001', consumerSid: 'SID-RT13-014', type: 'JUAL_BELI_PASAR' },
        // Kanal koperasi_mbg: dikeluarkan dari dataset konsumsi eceran warga
        { id: 'TX-MBG', commodity: 'Sayur Kangkung (Surplus Panen)', quantityKg: 17, producerSid: 'SID-RT13-001', consumerSid: 'MBG_METRO', type: 'EKSPANSI_PASAR_LUAR' },
        // Self-buying & Dibatalkan: dikeluarkan
        { id: 'TX-SELF', commodity: 'Sayur Kangkung', quantityKg: 2, producerSid: 'SID-RT13-001', consumerSid: 'SID-RT13-001', type: 'JUAL_BELI_PASAR' },
        { id: 'TX-CANCEL', commodity: 'Sayur Kangkung', quantityKg: 2, producerSid: 'SID-RT13-001', consumerSid: 'SID-RT13-015', type: 'JUAL_BELI_PASAR', orderStatus: 'DIBATALKAN' }
    ];

    const training = getTrainingTransactions(txs);
    assert.equal(training.length, 4); // TX-1..TX-4 saja
    assert.equal(training.find(t => t.id === 'TX-4').isOutlier, true);
    assert.equal(training.find(t => t.id === 'TX-1').isOutlier, false);

    // Baseline KK bertambah otomatis saat KK baru disetujui
    const members40 = [{ sid: 'SID-RT13-001', familySize: 3, needs: { beras: 15, sayur: 9, telur: 3, ikan: 3, ayam: 3, tempe: 3 } }];
    const base1 = computeCommunityBaselineNeeds(members40);
    assert.equal(base1.kkCount, 1);
    assert.equal(base1.daily.sayurKg, 0.3);

    const nextSid = generateNextSid(members40);
    assert.equal(nextSid, 'SID-RT13-041');
    const uniqueTx = generateUniqueTxId(txs);
    assert.ok(uniqueTx.startsWith('TX-RT13-'));
});

test('3.2 & 5.1 Legacy Pak Joko needs loader (46 Kg) and idempotent auditAndFlagAppState (52 orders / 191 Kg -> 51 / 190 Kg)', () => {
    const jokoLegacy = {
        sid: 'SID-RT13-006',
        name: 'Pak Joko Susilo',
        monthlyFoodNeedKg: 36,
        needs: { beras: 18, sayur: 9, telur: 5, ikan: 4 }
    };
    const eff = getEffectiveMemberNeeds(jokoLegacy);
    assert.equal(eff.total, 46); // 18 + 9 + 5 + 4 + 4 + 6 = 46 Kg
    assert.equal(getMemberConsistentMonthlyNeedKg(jokoLegacy), 46);
    // Data asli tidak diubah diam-diam
    assert.equal(jokoLegacy.monthlyFoodNeedKg, 36);
    assert.equal(jokoLegacy.needs.ayam, undefined);

    // Jika user eksplisit mengubah ayam = 0 dan simpan, tetap 42 Kg
    const jokoSaved = {
        sid: 'SID-RT13-006',
        monthlyFoodNeedKg: 42,
        needs: { beras: 18, sayur: 9, telur: 5, ikan: 4, ayam: 0, tempe: 6 }
    };
    assert.equal(getMemberConsistentMonthlyNeedKg(jokoSaved), 42);

    // Simulasi 52 pesanan / 191 Kg (50 awal 187 Kg + TX-RT13-467 3 Kg + TX-RT13-798 self-buying 1 Kg)
    const qaTxs = [];
    for (let i = 1; i <= 50; i++) {
        qaTxs.push({
            id: `TX-RT13-${900 + i}`,
            producerSid: 'SID-RT13-001',
            consumerSid: 'SID-RT13-020',
            commodity: 'Sayur Kangkung',
            quantityKg: i <= 37 ? 4 : 3, // 37*4 + 13*3 = 148 + 39 = 187 Kg
            unitPrice: 4500,
            subtotal: (i <= 37 ? 4 : 3) * 4500,
            type: 'JUAL_BELI_PASAR'
        });
    }
    qaTxs.push({
        id: 'TX-RT13-467',
        producerSid: 'SID-RT13-001',
        consumerSid: 'SID-RT13-011',
        commodity: 'Sayur Kangkung',
        quantityKg: 3,
        unitPrice: 4500,
        subtotal: 13500,
        deliveryFee: 2000,
        type: 'JUAL_BELI_PASAR'
    });
    qaTxs.push({
        id: 'TX-RT13-798',
        producerSid: 'SID-RT13-006',
        consumerSid: 'SID-RT13-006',
        commodity: 'Tepung Terigu & Gula Pasir',
        quantityKg: 1,
        unitPrice: 11500,
        subtotal: 11500,
        type: 'JUAL_BELI_PASAR'
    });

    const qaState = { members: [jokoLegacy], transactions: qaTxs };
    const run1 = auditAndFlagAppState(qaState);
    const recap1 = getBeforeAfterSelfBuyingRecap(qaState.transactions);
    assert.equal(run1.selfBuyingTxIds.length, 1);
    assert.equal(recap1.before.count, 52);
    assert.equal(recap1.before.totalKg, 191);
    assert.equal(recap1.after.count, 51);
    assert.equal(recap1.after.totalKg, 190);
    assert.equal(qaState.transactions.length, 52); // Tidak terhapus!

    // Jalankan auditAndFlagAppState kedua kali -> idempoten, tidak menggandakan atau mengubah angka lagi
    const run2 = auditAndFlagAppState(qaState);
    const recap2 = getBeforeAfterSelfBuyingRecap(qaState.transactions);
    assert.equal(run2.selfBuyingTxIds.length, 1);
    assert.equal(recap2.before.count, 52);
    assert.equal(recap2.before.totalKg, 191);
    assert.equal(recap2.after.count, 51);
    assert.equal(recap2.after.totalKg, 190);
});

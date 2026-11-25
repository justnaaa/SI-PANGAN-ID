/**
 * @file src/services/cloudMapping.js
 * @description Pemetaan tunggal state aplikasi <-> baris tabel Supabase.
 *              Dipakai oleh supabaseAndStorage.js (runtime) DAN scripts/generate-seed.mjs (seed SQL),
 *              sehingga skema SQL, seed, dan kode selalu satu sumber.
 */

export const CLOUD_STATE_KEY = 'RT13_YOSOMULYO_MAIN';

export function toWargaRow(m) {
    return {
        sid: m.sid,
        name: m.name,
        public_name: m.publicName || m.name,
        nik_hash: m.nikHash || '',
        masked_nik: m.maskedNik || '',
        raw_nik: m.rawNik || '',
        // PIN selalu disimpan sebagai TEKS agar '0123' / '001234' tidak rusak
        pin_code: String(m.pinCode ?? '1234'),
        role: m.role || 'KONSUMEN',
        is_dual_role: Boolean(m.isDualRole || m.role === 'PRODUSEN'),
        producer_commodity: m.producerCommodity || '-',
        capacity_kg: Number(m.capacityKg || 0),
        harvest_cycle_weekly: m.harvestCycleWeekly || '-',
        family_size: Number(m.familySize || 4),
        monthly_income: Number(m.monthlyIncome || 2500000),
        monthly_food_need_kg: Number(m.monthlyFoodNeedKg || 35),
        needs: m.needs || {},
        social_tier: m.socialTier || 'MANDIRI',
        ai_score: Number(m.aiScore || 30),
        aid_received_this_month: Boolean(m.aidReceivedThisMonth),
        distance_km: Number(m.distanceKm || 0.2),
        wallet_earned: Number(m.walletEarned || 0),
        subsidy_received_kg: Number(m.subsidyReceivedKg || 0),
        address: m.address || 'RT 13 Yosomulyo',
        surplus_notified: Boolean(m.surplusNotified),
        surplus_notified_msg: m.surplusNotifiedMsg || ''
    };
}

export function toTransaksiRow(t) {
    return {
        id: t.id,
        timestamp: t.timestamp,
        type: t.type || 'JUAL_BELI_PASAR',
        producer_sid: t.producerSid || '-',
        producer_name: t.producerName || '-',
        consumer_sid: t.consumerSid || '-',
        consumer_name: t.consumerName || '-',
        commodity: t.commodity || '-',
        quantity_kg: Number(t.quantityKg || 1),
        unit_price: Number(t.unitPrice || 0),
        subtotal: Number(t.subtotal || 0),
        producer_net: Number(t.producerNet || 0),
        delivery_method: t.deliveryMethod || 'Ambil Sendiri',
        delivery_fee: Number(t.deliveryFee || 0),
        total_paid: Number(t.totalPaid || 0),
        status: t.status || 'TERVERIFIKASI_SINGLE_ID',
        period: t.period || null,
        channel: t.channel || 'eceran_warga',
        order_status: t.orderStatus || null,
        listing_id: t.listingId || null,
        is_invalid_self_buying: Boolean(t.isInvalidSelfBuying)
    };
}

/**
 * Baris tabel transaksi: ID ganda hanya dikirim sekali (upsert dengan ID kembar dalam
 * satu batch ditolak Postgres). Data asli di state TIDAK diubah/dihapus.
 */
export function toTransaksiRows(transactions = []) {
    const seen = new Set();
    const rows = [];
    (Array.isArray(transactions) ? transactions : []).forEach(t => {
        if (!t || !t.id || seen.has(t.id)) return;
        seen.add(t.id);
        rows.push(toTransaksiRow(t));
    });
    return rows;
}

export function buildStatePayload(appState = {}) {
    return {
        members: appState.members,
        listings: appState.listings,
        transactions: appState.transactions,
        demands: appState.demands,
        pendingNewKks: appState.pendingNewKks,
        pendingKkUpdates: appState.pendingKkUpdates,
        danaSosialInklusi: appState.danaSosialInklusi,
        activePeriod: appState.activePeriod || '2026-10',
        closedPeriods: appState.closedPeriods || [],
        lastClosedPeriod: appState.lastClosedPeriod || null,
        lastClosedAt: appState.lastClosedAt || '',
        moderationLogs: appState.moderationLogs || [],
        b2bSurplusHistory: appState.b2bSurplusHistory || [],
        inventoryAuditLogs: appState.inventoryAuditLogs || []
    };
}

/**
 * Terapkan field tambahan dari payload cloud ke appState.
 * Field yang belum ada (data cloud lama) dibiarkan: tidak error, nilai bawaan aman dipasang.
 * (flag per-transaksi/produk seperti isInvalidSelfBuying, isModerated, orderStatus, suara per SID
 * berada di dalam transactions/listings/demands, sehingga ikut otomatis.)
 */
export function applyCloudStateExtras(appState, p) {
    if (!appState || !p || typeof p !== 'object') return appState;
    if (Array.isArray(p.pendingKkUpdates)) appState.pendingKkUpdates = p.pendingKkUpdates;
    if (Number.isFinite(Number(p.danaSosialInklusi)) && p.danaSosialInklusi !== null && p.danaSosialInklusi !== undefined) {
        appState.danaSosialInklusi = Number(p.danaSosialInklusi);
    }
    if (typeof p.activePeriod === 'string' && /^\d{4}-\d{2}$/.test(p.activePeriod)) appState.activePeriod = p.activePeriod;
    if (Array.isArray(p.closedPeriods)) appState.closedPeriods = p.closedPeriods;
    if (p.lastClosedPeriod) {
        appState.lastClosedPeriod = p.lastClosedPeriod;
        appState.lastClosedAt = p.lastClosedAt || '';
    }
    if (Array.isArray(p.moderationLogs)) appState.moderationLogs = p.moderationLogs;
    if (Array.isArray(p.b2bSurplusHistory)) appState.b2bSurplusHistory = p.b2bSurplusHistory;
    if (Array.isArray(p.inventoryAuditLogs)) appState.inventoryAuditLogs = p.inventoryAuditLogs;
    // Nilai bawaan aman bila data cloud lama belum punya field-nya
    if (!appState.activePeriod) appState.activePeriod = '2026-10';
    if (!Array.isArray(appState.closedPeriods)) appState.closedPeriods = [];
    if (!Array.isArray(appState.moderationLogs)) appState.moderationLogs = [];
    if (!Array.isArray(appState.b2bSurplusHistory)) appState.b2bSurplusHistory = [];
    if (!Array.isArray(appState.inventoryAuditLogs)) appState.inventoryAuditLogs = [];
    return appState;
}

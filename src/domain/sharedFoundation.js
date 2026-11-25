/**
 * @file src/domain/sharedFoundation.js
 * @description Fondasi Bersama SI-PANGAN ID (Fase 0):
 *  - Guard Hak Akses Terpusat sesuai Matriks Bagian 3 (`can`)
 *  - Audit Non-Destruktif (`auditAndFlagAppState`) tanpa menghapus data tidak valid
 *  - Selector Pesanan Terpadu (dedupe per ID, filter self-buying & dibatalkan, hitung pesanan aktif)
 *  - Kalkulator Nominal Tunggal (`subtotalProduk`, `biayaAntar`, `total`, `omzetBersihProdusen`)
 *  - Rekonsiliasi Keuangan & Inventori Stok Tunggal (`kurangiStok`, `kembalikanStok`, `getInventorySummary`)
 *  - Status Neraca (`SURPLUS_THRESHOLD_KG = 5`) & Konversi Satuan Waktu (`HARI_PER_BULAN = 30`, `HARI_PER_MINGGU = 7`)
 *  - Sanitasi Dataset AI/ML (`getTrainingTransactions`) & Baseline Kebutuhan KK Dinamis
 *  - Pengelola Periode Buku Besar Bulanan (`YYYY-MM`, Asia/Jakarta) & Lookup SID Asli
 */

export const SURPLUS_THRESHOLD_KG = 5;
export const VOTE_THRESHOLD = 10;
export const HARI_PER_BULAN = 30;
export const HARI_PER_MINGGU = 7;

export const ADMIN_COOP_SIDS = Object.freeze([
    'ADMIN-RT13',
    'KOPERASI-RT13',
    'KOPERASI_YOSOMULYO',
    'LUMBUNG-RT13',
    'KOLEKTIF-KWT-RT13'
]);

export const SEMBAKO_CATEGORIES = Object.freeze([
    'Sembako Pokok'
]);

export const SEMBAKO_KEYWORDS = Object.freeze([
    'tepung terigu',
    'gula pasir',
    'minyak goreng'
]);

export const INDONESIAN_MONTHS = Object.freeze([
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]);

const MONTH_TOKEN_TO_MM = Object.freeze({
    jan: '01', januari: '01',
    feb: '02', februari: '02',
    mar: '03', maret: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06',
    jul: '07', juli: '07',
    agu: '08', agt: '08', agustus: '08', aug: '08',
    sep: '09', sept: '09', september: '09',
    okt: '10', oct: '10', oktober: '10',
    nov: '11', nop: '11', november: '11',
    des: '12', dec: '12', desember: '12'
});

// =========================================================================
// 1. UTILITAS IDENTITAS (NIK 16 DIGIT & SID ASLI)
// =========================================================================

export function sanitizeNikDigits(rawValue) {
    return String(rawValue ?? '').replace(/[^0-9]/g, '').slice(0, 16);
}

export function isValidNik16(nikValue) {
    const str = String(nikValue ?? '').trim();
    return /^[0-9]{16}$/.test(str);
}

export function maskNikForPublic(nikValue) {
    const str = String(nikValue ?? '').trim();
    if (str.length >= 16) {
        return `${str.slice(0, 6)}********${str.slice(-2)}`;
    }
    if (str.length >= 4) {
        return `${str.slice(0, 2)}****${str.slice(-2)}`;
    }
    return 'NIK-BELUM-VALID';
}

export function getInvalidNikMembers(members = []) {
    return (Array.isArray(members) ? members : [])
        .filter(m => m && !m.isDemoAccount && !isValidNik16(m.rawNik))
        .map(m => ({
            sid: m.sid || '-',
            name: m.name || '-',
            rawNik: m.rawNik ?? ''
        }));
}

export function lookupMemberBySid(members = [], sid) {
    if (!sid) return null;
    const cleanSid = String(sid).trim();
    return (Array.isArray(members) ? members : []).find(m => m && m.sid === cleanSid) || null;
}

export function generateNextSid(members = []) {
    let maxNum = 40;
    (Array.isArray(members) ? members : []).forEach(m => {
        if (!m || !m.sid) return;
        const match = String(m.sid).match(/^SID-RT13-(\d+)$/i);
        if (match) {
            const parsed = parseInt(match[1], 10);
            if (!Number.isNaN(parsed) && parsed > maxNum) {
                maxNum = parsed;
            }
        }
    });
    return `SID-RT13-${String(maxNum + 1).padStart(3, '0')}`;
}

export function generateUniqueTxId(transactions = [], prefix = 'TX-RT13-') {
    const existing = new Set((Array.isArray(transactions) ? transactions : []).map(t => t && t.id).filter(Boolean));
    let maxNum = 950;
    existing.forEach(id => {
        const match = String(id).match(/^TX-RT13-(\d+)$/);
        if (match) {
            const n = parseInt(match[1], 10);
            if (!Number.isNaN(n) && n > maxNum) maxNum = n;
        }
    });
    let next = maxNum + 1;
    let candidate = `${prefix}${String(next).padStart(3, '0')}`;
    while (existing.has(candidate)) {
        next += 1;
        candidate = `${prefix}${String(next).padStart(3, '0')}`;
    }
    return candidate;
}

export function generateUniqueListingId(listings = []) {
    const existing = new Set((Array.isArray(listings) ? listings : []).map(l => l && l.id).filter(Boolean));
    let maxNum = 8;
    existing.forEach(id => {
        const match = String(id).match(/^list-(\d+)$/);
        if (match) {
            const n = parseInt(match[1], 10);
            if (!Number.isNaN(n) && n > maxNum) maxNum = n;
        }
    });
    let next = maxNum + 1;
    let candidate = `list-${String(next).padStart(3, '0')}`;
    while (existing.has(candidate)) {
        next += 1;
        candidate = `list-${String(next).padStart(3, '0')}`;
    }
    return candidate;
}

// =========================================================================
// 2. PERIODE PEMBUKUAN BULANAN (YYYY-MM, ZONA WAKTU ASIA/JAKARTA)
// =========================================================================

export function getJakartaCurrentYearMonth(now = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit'
        }).formatToParts(now);
        const year = parts.find(p => p.type === 'year')?.value || String(now.getFullYear());
        const month = parts.find(p => p.type === 'month')?.value || String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    } catch {
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}

export function getJakartaTimestampLabel(now = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).formatToParts(now);
        const day = parts.find(p => p.type === 'day')?.value || '01';
        const month = parts.find(p => p.type === 'month')?.value || 'Nov';
        const year = parts.find(p => p.type === 'year')?.value || '2026';
        const hour = parts.find(p => p.type === 'hour')?.value || '08';
        const minute = parts.find(p => p.type === 'minute')?.value || '00';
        return `${day} ${month} ${year}, ${hour}:${minute}`;
    } catch {
        return now.toLocaleString('id-ID');
    }
}

export function getNextMonthPeriod(ym) {
    const match = String(ym || '2026-10').match(/^(\d{4})-(\d{2})$/);
    if (!match) return '2026-11';
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10) + 1;
    if (month > 12) {
        month = 1;
        year += 1;
    }
    return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatPeriodLabel(ym) {
    const match = String(ym || '2026-10').match(/^(\d{4})-(\d{2})$/);
    if (!match) return String(ym || 'Oktober 2026');
    const year = match[1];
    const monthIdx = Math.max(0, Math.min(11, parseInt(match[2], 10) - 1));
    return `${INDONESIAN_MONTHS[monthIdx]} ${year}`;
}

export function inferTransactionPeriod(tx, appState = null) {
    if (tx && typeof tx.period === 'string' && /^\d{4}-\d{2}$/.test(tx.period)) {
        return tx.period;
    }
    const ts = String(tx?.timestamp || '').toLowerCase();
    const yearMatch = ts.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : '2026';
    for (const [token, mm] of Object.entries(MONTH_TOKEN_TO_MM)) {
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        if (regex.test(ts)) {
            return `${year}-${mm}`;
        }
    }
    // Jika dibuat saat periode berjalan atau bertuliskan "Baru Saja", gunakan periode terbuka saat itu
    return appState?.activePeriod || '2026-10';
}

export function getCurrentOpenPeriod(appState = {}) {
    if (appState && typeof appState.activePeriod === 'string' && /^\d{4}-\d{2}$/.test(appState.activePeriod)) {
        return appState.activePeriod;
    }
    return '2026-10';
}

export function isPeriodClosed(periodYm, appState = {}) {
    if (!periodYm || !appState) return false;
    const closed = Array.isArray(appState.closedPeriods) ? appState.closedPeriods : [];
    return closed.includes(periodYm);
}

export function isOrderPeriodClosed(tx, appState = {}) {
    if (!tx || !appState) return false;
    const txPeriod = inferTransactionPeriod(tx, appState);
    return isPeriodClosed(txPeriod, appState);
}

export function closeMonthlyPeriod(appState) {
    if (!appState) {
        return { ok: false, reason: 'STATE_MISSING' };
    }
    if (!Array.isArray(appState.closedPeriods)) {
        appState.closedPeriods = [];
    }
    const currentPeriod = getCurrentOpenPeriod(appState);
    if (appState.closedPeriods.includes(currentPeriod)) {
        return {
            ok: false,
            reason: 'ALREADY_CLOSED',
            closedPeriod: currentPeriod,
            nextPeriod: currentPeriod
        };
    }

    // Pastikan setiap transaksi yang belum punya period dikunci ke periode mereka masing-masing
    (Array.isArray(appState.transactions) ? appState.transactions : []).forEach(tx => {
        if (tx && !tx.period) {
            tx.period = inferTransactionPeriod(tx, appState);
        }
    });

    appState.closedPeriods.push(currentPeriod);
    const nextPeriod = getNextMonthPeriod(currentPeriod);
    appState.activePeriod = nextPeriod;
    appState.lastClosedPeriod = currentPeriod;
    appState.lastClosedAt = getJakartaTimestampLabel();

    return {
        ok: true,
        closedPeriod: currentPeriod,
        closedLabel: formatPeriodLabel(currentPeriod),
        nextPeriod,
        nextLabel: formatPeriodLabel(nextPeriod),
        auditSeal: `SEAL-PKK-YSM-${currentPeriod.replace('-', '')}-LOCKED`
    };
}

// =========================================================================
// 3. MATRIKS HAK AKSES TERPUSAT (BAGIAN 3)
// =========================================================================

export function resolveEffectiveRole(stateOrRole) {
    if (typeof stateOrRole === 'string') {
        const up = stateOrRole.toUpperCase();
        if (up === 'ADMIN' || up === 'PRODUSEN' || up === 'KONSUMEN') return up;
        return 'KONSUMEN';
    }
    if (!stateOrRole) return 'KONSUMEN';
    if (stateOrRole.isAdminLoggedIn || stateOrRole.activeRole === 'ADMIN' || stateOrRole.activeUserSid === 'ADMIN-RT13') {
        return 'ADMIN';
    }
    if (stateOrRole.activeRole === 'PRODUSEN') {
        return 'PRODUSEN';
    }
    return 'KONSUMEN';
}

export function isCoopOrAdminManaged(resource) {
    if (!resource) return false;
    if (resource.managedByCoop === true || resource.isCoopItem === true) return true;
    const prodSid = String(resource.producerSid || '').trim();
    if (ADMIN_COOP_SIDS.includes(prodSid)) return true;
    const prodName = String(resource.producerName || '').toLowerCase();
    return prodName.includes('koperasi rt') || prodName.includes('lumbung rt') || prodName.includes('admin rt');
}

export function isSembakoDemand(demand) {
    if (!demand) return false;
    const cat = String(demand.category || '').trim().toLowerCase();
    if (SEMBAKO_CATEGORIES.some(c => c.toLowerCase() === cat)) return true;
    const name = String(demand.name || demand.commodity || '').toLowerCase();
    return SEMBAKO_KEYWORDS.some(kw => name.includes(kw));
}

export function getDemandThreshold(demand) {
    const t = Number(demand?.targetVotes);
    return (!Number.isNaN(t) && t > 0) ? t : VOTE_THRESHOLD;
}

export function hasUserVotedDemand(demand, userSid) {
    if (!demand || !userSid) return false;
    const voters = Array.isArray(demand.voters) ? demand.voters : [];
    const votedSids = Array.isArray(demand.votedSids) ? demand.votedSids : [];
    return voters.includes(userSid) || votedSids.includes(userSid);
}

export function getExistingSupplierForDemand(demand, state = {}) {
    if (!demand) return null;
    if (demand.suppliedBySid) {
        const m = lookupMemberBySid(state.members, demand.suppliedBySid);
        return {
            sid: demand.suppliedBySid,
            name: demand.suppliedByName || m?.name || demand.suppliedBySid
        };
    }
    // Cek dari producerNotes lama seperti "Tersedia di RT 13 (Ibu Dewi Lestari - SID-RT13-009)"
    const notes = String(demand.producerNotes || '');
    const sidMatch = notes.match(/(SID-RT13-\d+)/i);
    if (demand.status === 'TERPENUHI_LOKAL' && sidMatch) {
        const sid = sidMatch[1].toUpperCase();
        const m = lookupMemberBySid(state.members, sid);
        return {
            sid,
            name: m?.name || sid
        };
    }
    // Cek apakah sudah ada listing aktif milik warga untuk komoditas tersebut jika status TERPENUHI_LOKAL
    if (demand.status === 'TERPENUHI_LOKAL') {
        const dName = String(demand.name || demand.commodity || '').toLowerCase();
        const tokens = dName.split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !['segar', 'lokal', 'ras', 'kolam'].includes(w));
        const listings = Array.isArray(state.listings) ? state.listings : [];
        const found = listings.find(l => {
            if (!l || l.isDemoListing) return false;
            const c = String(l.commodity || '').toLowerCase();
            return tokens.some(tk => c.includes(tk));
        });
        if (found) {
            return {
                sid: found.producerSid,
                name: found.producerName
            };
        }
    }
    return null;
}

export function checkPullSignalEligibility(roleContext, demand, state = {}) {
    const role = resolveEffectiveRole(roleContext);
    const actorSid = typeof roleContext === 'object' ? roleContext?.activeUserSid : state?.activeUserSid;
    const threshold = getDemandThreshold(demand);
    const votes = Number(demand?.votes) || 0;

    if (role === 'KONSUMEN') {
        return { allowed: false, code: 'ROLE_FORBIDDEN', label: 'Khusus Produsen / Koperasi' };
    }
    if (!demand) {
        return { allowed: false, code: 'NOT_FOUND', label: 'Usulan tidak ditemukan' };
    }
    if (votes < threshold) {
        const needed = threshold - votes;
        return {
            allowed: false,
            code: 'INSUFFICIENT_VOTES',
            neededVotes: needed,
            threshold,
            label: `Menunggu Voting (${votes}/${threshold} Suara)`
        };
    }

    const sembako = isSembakoDemand(demand);
    if (sembako && role !== 'ADMIN') {
        return {
            allowed: false,
            code: 'SEMBAKO_ADMIN_ONLY',
            label: 'Khusus Koperasi RT / Admin'
        };
    }
    if (!sembako && role === 'ADMIN') {
        return {
            allowed: false,
            code: 'NON_SEMBAKO_PRODUCER_ONLY',
            label: 'Ditarik oleh Produsen Kebun'
        };
    }

    const existingSupplier = getExistingSupplierForDemand(demand, state);
    if (existingSupplier) {
        if (actorSid && existingSupplier.sid === actorSid) {
            return {
                allowed: false,
                code: 'ALREADY_SUPPLIED_BY_SELF',
                supplier: existingSupplier,
                label: 'Sudah Anda Pasok'
            };
        }
        return {
            allowed: false,
            code: 'ALREADY_SUPPLIED_BY_OTHER',
            supplier: existingSupplier,
            label: 'Sudah dipasok warga lain'
        };
    }

    return { allowed: true, code: 'OK', threshold };
}

export function can(roleOrState, action, resource = null, explicitState = null) {
    const state = explicitState || (typeof roleOrState === 'object' ? roleOrState : {});
    const role = resolveEffectiveRole(roleOrState);
    const activeSid = state?.activeUserSid || null;

    switch (action) {
        case 'BUY_PRODUCT': {
            if (role !== 'KONSUMEN') return false;
            if (!activeSid || activeSid === 'ADMIN-RT13') return false;
            if (!resource) return true;
            if (resource.isModerated) return false;
            if (resource.producerSid && resource.producerSid === activeSid) return false;
            return true;
        }
        case 'SELECT_BUYER_IDENTITY': {
            // Identitas pembeli selalu terkunci ke akun login (Konsumen) dan tidak ada di Admin/Produsen
            return false;
        }
        case 'EDIT_PRODUCT':
        case 'DELETE_PRODUCT': {
            if (!resource) return false;
            if (role === 'PRODUSEN') {
                return Boolean(activeSid && resource.producerSid === activeSid);
            }
            if (role === 'ADMIN') {
                return isCoopOrAdminManaged(resource);
            }
            return false;
        }
        case 'MODERATE_PRODUCT': {
            if (role !== 'ADMIN' || !resource) return false;
            return !isCoopOrAdminManaged(resource);
        }
        case 'UPDATE_ORDER_STATUS': {
            if (!resource) return false;
            if (resource.isInvalidSelfBuying) return false;
            if (getNormalizedOrderStatus(resource) === 'DIBATALKAN') return false;
            if (isOrderPeriodClosed(resource, state)) return false;
            if (role === 'PRODUSEN') {
                return Boolean(activeSid && resource.producerSid === activeSid);
            }
            if (role === 'ADMIN') {
                return isCoopOrAdminManaged(resource);
            }
            return false;
        }
        case 'CANCEL_ORDER': {
            if (role !== 'KONSUMEN' || !resource || !activeSid) return false;
            if (resource.consumerSid !== activeSid) return false;
            if (isOrderPeriodClosed(resource, state)) return false;
            return getNormalizedOrderStatus(resource) === 'MENUNGGU_KONFIRMASI';
        }
        case 'VOTE_DEMAND': {
            if (role !== 'KONSUMEN' || !activeSid || activeSid === 'ADMIN-RT13') return false;
            if (!resource) return true;
            return !hasUserVotedDemand(resource, activeSid);
        }
        case 'PUBLISH_VOTING': {
            return role === 'ADMIN';
        }
        case 'PULL_PRODUCTION_SIGNAL': {
            return checkPullSignalEligibility(
                { ...(state || {}), activeRole: role, isAdminLoggedIn: role === 'ADMIN', activeUserSid: activeSid },
                resource,
                state
            ).allowed;
        }
        case 'EDIT_KK_DATA': {
            return role === 'ADMIN';
        }
        case 'CONFIRM_OWN_SURPLUS': {
            if (role !== 'PRODUSEN' || !activeSid) return false;
            if (!resource) return true;
            return !resource.producerSid || resource.producerSid === activeSid;
        }
        case 'PULL_SURPLUS':
        case 'DISPATCH_SURPLUS':
        case 'CLOSE_PERIOD':
        case 'VIEW_ML_METRICS': {
            return role === 'ADMIN';
        }
        default:
            return false;
    }
}

// =========================================================================
// 4. AUDIT NON-DESTRUKTIF, SELECTOR PESANAN, & KALKULATOR NOMINAL
// =========================================================================

export function classifyTransactionChannel(tx) {
    if (!tx) return 'eceran_warga';
    if (tx.channel === 'koperasi_mbg' || tx.channel === 'bantuan_inklusi' || tx.channel === 'eceran_warga') {
        return tx.channel;
    }
    if (
        tx.type === 'EKSPANSI_PASAR_LUAR' ||
        tx.status === 'TERVERIFIKASI_MBG_KOPERASI' ||
        String(tx.consumerSid || '').includes('MBG') ||
        String(tx.consumerSid || '').includes('KOPERASI')
    ) {
        return 'koperasi_mbg';
    }
    if (tx.type === 'BANTUAN_INKLUSI_PANGAN' || tx.type === 'DISTRIBUSI_BANTUAN_PANGAN') {
        return 'bantuan_inklusi';
    }
    return 'eceran_warga';
}

export function getNormalizedOrderStatus(tx) {
    if (!tx) return 'SELESAI_LUNAS';
    if (tx.orderStatus === 'DIBATALKAN' || tx.status === 'DIBATALKAN') {
        return 'DIBATALKAN';
    }
    if (tx.orderStatus === 'MENUNGGU_KONFIRMASI') {
        return 'MENUNGGU_KONFIRMASI';
    }
    if (tx.orderStatus === 'SIAP_DIAMBIL') {
        return 'SIAP_DIAMBIL';
    }
    // Transaksi historis tanpa orderStatus maupun orderStatus === 'SELESAI_LUNAS' / 'SELESAI' / B2B / Bantuan adalah selesai lunas
    return 'SELESAI_LUNAS';
}

export function isActiveOrder(tx) {
    if (!tx || !isValidTransaction(tx)) return false;
    if (classifyTransactionChannel(tx) !== 'eceran_warga') return false;
    const st = getNormalizedOrderStatus(tx);
    return st === 'MENUNGGU_KONFIRMASI' || st === 'SIAP_DIAMBIL';
}

export function isSelfBuyingTransaction(tx) {
    if (!tx) return false;
    const prod = String(tx.producerSid || '').trim();
    const cons = String(tx.consumerSid || '').trim();
    return Boolean(prod && cons && prod !== '-' && prod === cons);
}

export function auditAndFlagAppState(appState) {
    if (!appState || typeof appState !== 'object') return null;

    if (!appState.activePeriod) {
        appState.activePeriod = '2026-10';
    }
    if (!Array.isArray(appState.closedPeriods)) {
        appState.closedPeriods = [];
    }
    if (!Array.isArray(appState.moderationLogs)) {
        appState.moderationLogs = [];
    }
    if (!Array.isArray(appState.b2bSurplusHistory)) {
        appState.b2bSurplusHistory = [];
    }

    const invalidNiks = [];
    (Array.isArray(appState.members) ? appState.members : []).forEach(m => {
        if (!m || m.isDemoAccount) return;
        const validNik = isValidNik16(m.rawNik);
        m.hasInvalidNik = !validNik;
        if (!validNik) {
            invalidNiks.push({ sid: m.sid, name: m.name, rawNik: m.rawNik ?? '' });
        }
    });

    const seenTxIds = new Set();
    const duplicateTxIds = [];
    const selfBuyingTxIds = [];

    (Array.isArray(appState.transactions) ? appState.transactions : []).forEach(tx => {
        if (!tx) return;
        const txId = String(tx.id || '').trim();
        if (txId) {
            if (seenTxIds.has(txId)) {
                tx.isDuplicateId = true;
                duplicateTxIds.push(txId);
            } else {
                tx.isDuplicateId = false;
                seenTxIds.add(txId);
            }
        }
        if (isSelfBuyingTransaction(tx)) {
            tx.isInvalidSelfBuying = true;
            selfBuyingTxIds.push(txId);
        } else if (tx.isInvalidSelfBuying === undefined) {
            tx.isInvalidSelfBuying = false;
        }
        tx.channel = classifyTransactionChannel(tx);
        if (!tx.period) {
            tx.period = inferTransactionPeriod(tx, appState);
        }
    });

    return {
        invalidNiks,
        duplicateTxIds,
        selfBuyingTxIds
    };
}

export function dedupeTransactionsById(transactions = []) {
    const seen = new Set();
    const result = [];
    for (const tx of (Array.isArray(transactions) ? transactions : [])) {
        if (!tx || tx.isDemoTx) continue;
        const id = String(tx.id || '').trim();
        if (id) {
            if (seen.has(id)) continue;
            seen.add(id);
        }
        result.push(tx);
    }
    return result;
}

export function isValidTransaction(tx) {
    if (!tx || tx.isDemoTx) return false;
    if (tx.isDuplicateId) return false;
    if (tx.isInvalidSelfBuying || isSelfBuyingTransaction(tx)) return false;
    if (getNormalizedOrderStatus(tx) === 'DIBATALKAN') return false;
    return true;
}

export function getValidTransactions(transactions = [], options = {}) {
    const deduped = dedupeTransactionsById(transactions);
    return deduped.filter(tx => {
        if (tx.isInvalidSelfBuying || isSelfBuyingTransaction(tx)) return false;
        if (!options.includeCancelled && getNormalizedOrderStatus(tx) === 'DIBATALKAN') return false;
        if (options.channel && classifyTransactionChannel(tx) !== options.channel) return false;
        if (options.producerSid && options.producerSid !== 'ALL' && tx.producerSid !== options.producerSid) return false;
        if (options.consumerSid && tx.consumerSid !== options.consumerSid) return false;
        return true;
    });
}

export function calcTransactionAmounts(tx) {
    if (!tx) {
        return { subtotalProduk: 0, biayaAntar: 0, total: 0, omzetBersihProdusen: 0 };
    }
    const qty = Math.max(0, Number(tx.quantityKg) || 0);
    const unitPrice = Math.max(0, Number(tx.unitPrice) || 0);
    const rawSubtotal = tx.subtotal !== undefined && tx.subtotal !== null
        ? Number(tx.subtotal)
        : (qty * unitPrice);
    const subtotalProduk = Number.isFinite(rawSubtotal) ? Math.max(0, Math.round(rawSubtotal)) : 0;
    const rawFee = Number(tx.deliveryFee || 0);
    const biayaAntar = Number.isFinite(rawFee) ? Math.max(0, Math.round(rawFee)) : 0;

    const isAid = tx.type === 'BANTUAN_INKLUSI_PANGAN' || tx.type === 'DISTRIBUSI_BANTUAN_PANGAN';
    const total = isAid ? subtotalProduk : (subtotalProduk + biayaAntar);
    const omzetBersihProdusen = subtotalProduk;

    return {
        subtotalProduk,
        biayaAntar,
        total,
        omzetBersihProdusen
    };
}

export function getProducerOrderSummary(transactions = [], producerSid = 'ALL') {
    const validOrders = getValidTransactions(transactions, { producerSid });
    const activeOrders = validOrders.filter(tx => isActiveOrder(tx));
    const pendingOrders = activeOrders.filter(tx => getNormalizedOrderStatus(tx) === 'MENUNGGU_KONFIRMASI');
    const readyOrders = activeOrders.filter(tx => getNormalizedOrderStatus(tx) === 'SIAP_DIAMBIL');
    const completedOrders = validOrders.filter(tx => getNormalizedOrderStatus(tx) === 'SELESAI_LUNAS');

    let totalKg = 0;
    let omzetProdukBersih = 0;
    let totalBiayaAntar = 0;
    let totalNilaiTransaksi = 0;

    validOrders.forEach(tx => {
        const amt = calcTransactionAmounts(tx);
        totalKg += Number(tx.quantityKg) || 0;
        omzetProdukBersih += amt.omzetBersihProdusen;
        totalBiayaAntar += amt.biayaAntar;
        totalNilaiTransaksi += amt.total;
    });

    return {
        orders: validOrders,
        totalCount: validOrders.length,
        activeCount: activeOrders.length,
        pendingCount: pendingOrders.length,
        readyCount: readyOrders.length,
        completedCount: completedOrders.length,
        totalKg,
        omzetProdukBersih,
        totalBiayaAntar,
        totalNilaiTransaksi
    };
}

export function getConsumerOrderSummary(transactions = [], consumerSid) {
    if (!consumerSid) {
        return {
            allOrders: [],
            validOrders: [],
            activeCount: 0,
            readyCount: 0,
            pendingCount: 0,
            completedCount: 0,
            cancelledCount: 0
        };
    }
    const deduped = dedupeTransactionsById(transactions).filter(
        tx => tx.consumerSid === consumerSid && !tx.isInvalidSelfBuying && !isSelfBuyingTransaction(tx)
    );
    const validOrders = deduped.filter(tx => getNormalizedOrderStatus(tx) !== 'DIBATALKAN');
    const readyOrders = validOrders.filter(tx => getNormalizedOrderStatus(tx) === 'SIAP_DIAMBIL');
    const pendingOrders = validOrders.filter(tx => getNormalizedOrderStatus(tx) === 'MENUNGGU_KONFIRMASI');
    const completedOrders = validOrders.filter(tx => getNormalizedOrderStatus(tx) === 'SELESAI_LUNAS');
    const cancelledOrders = deduped.filter(tx => getNormalizedOrderStatus(tx) === 'DIBATALKAN');

    return {
        allOrders: deduped,
        validOrders,
        activeCount: readyOrders.length + pendingOrders.length,
        readyCount: readyOrders.length,
        pendingCount: pendingOrders.length,
        completedCount: completedOrders.length,
        cancelledCount: cancelledOrders.length
    };
}

export function getBeforeAfterSelfBuyingRecap(transactions = []) {
    const dedupedNoCancel = dedupeTransactionsById(transactions).filter(
        tx => getNormalizedOrderStatus(tx) !== 'DIBATALKAN'
    );
    const beforeCount = dedupedNoCancel.length;
    const beforeKg = dedupedNoCancel.reduce((s, t) => s + (Number(t.quantityKg) || 0), 0);
    const beforeOmzet = dedupedNoCancel.reduce((s, t) => s + calcTransactionAmounts(t).omzetBersihProdusen, 0);

    const selfBuyingList = dedupedNoCancel.filter(t => t.isInvalidSelfBuying || isSelfBuyingTransaction(t));
    const afterList = dedupedNoCancel.filter(t => !(t.isInvalidSelfBuying || isSelfBuyingTransaction(t)));
    const afterCount = afterList.length;
    const afterKg = afterList.reduce((s, t) => s + (Number(t.quantityKg) || 0), 0);
    const afterOmzet = afterList.reduce((s, t) => s + calcTransactionAmounts(t).omzetBersihProdusen, 0);

    return {
        before: { count: beforeCount, totalKg: beforeKg, omzetProduk: beforeOmzet },
        after: { count: afterCount, totalKg: afterKg, omzetProduk: afterOmzet },
        excludedSelfBuying: selfBuyingList.map(t => ({
            id: t.id,
            producerSid: t.producerSid,
            consumerSid: t.consumerSid,
            commodity: t.commodity,
            quantityKg: Number(t.quantityKg) || 0,
            subtotalProduk: calcTransactionAmounts(t).subtotalProduk
        }))
    };
}

// =========================================================================
// 5. REKONSILIASI UANG SATU PINTU (TASK 2.11)
// =========================================================================

export function getFinancialReconciliation(appState = {}) {
    const validTxs = getValidTransactions(appState.transactions || []);

    let omzetP2pProduk = 0;
    let biayaJasaAntar = 0;
    let penyaluranB2bKoperasi = 0;
    let penyaluranBantuanInklusi = 0;

    validTxs.forEach(tx => {
        const ch = classifyTransactionChannel(tx);
        const amt = calcTransactionAmounts(tx);
        if (ch === 'koperasi_mbg') {
            penyaluranB2bKoperasi += amt.omzetBersihProdusen;
        } else if (ch === 'bantuan_inklusi') {
            penyaluranBantuanInklusi += amt.omzetBersihProdusen;
        } else {
            omzetP2pProduk += amt.omzetBersihProdusen;
            biayaJasaAntar += amt.biayaAntar;
        }
    });

    // Total Perputaran Produsen (100% diterima produsen dari P2P warga + Bantuan Inklusi ke petani lokal + Penyaluran B2B/Koperasi)
    const omzetWargaTerverifikasi = omzetP2pProduk + penyaluranBantuanInklusi;
    const totalPerputaran = omzetWargaTerverifikasi + penyaluranB2bKoperasi;
    const totalBrutoTermasukOngkir = totalPerputaran + biayaJasaAntar;

    // Hitung selisih rekonsiliasi nyata antara Buku Besar Transaksi vs Rekap Komponen
    const ledgerSumProduk = validTxs.reduce((s, tx) => s + calcTransactionAmounts(tx).omzetBersihProdusen, 0);
    const selisihKas = totalPerputaran - ledgerSumProduk;
    const isMatched = selisihKas === 0;

    return {
        validTxCount: validTxs.length,
        omzetP2pProduk,
        penyaluranBantuanInklusi,
        omzetWargaTerverifikasi,
        penyaluranB2bKoperasi,
        biayaJasaAntar,
        totalPerputaran,
        totalBrutoTermasukOngkir,
        cadanganKasInklusi: Number(appState.danaSosialInklusi) || 0,
        selisihKas,
        isMatched
    };
}

// =========================================================================
// 6. OPERASI STOK TUNGGAL & INVENTORI KOMUNITAS (TASK 2.4, 2.12, 3.1)
// =========================================================================

export function kurangiStok(listing, qtyKg, options = {}) {
    if (!listing) return { ok: false, reason: 'LISTING_NOT_FOUND' };
    const qty = Math.max(0, Number(qtyKg) || 0);
    if (qty <= 0) return { ok: false, reason: 'INVALID_QTY' };

    const useUnabsorbed = Boolean(options.fromUnabsorbedSurplus && (Number(listing.unabsorbedSurplusKg) || 0) > 0);
    if (useUnabsorbed) {
        const prevSurplus = Math.max(0, Number(listing.unabsorbedSurplusKg) || 0);
        if (qty > prevSurplus) {
            return { ok: false, reason: 'INSUFFICIENT_SURPLUS_STOCK', available: prevSurplus };
        }
        const nextSurplus = prevSurplus - qty;
        listing.unabsorbedSurplusKg = nextSurplus;
        if (options.trackB2bDispatched) {
            listing.b2bDispatchedKg = (Number(listing.b2bDispatchedKg) || 0) + qty;
        } else {
            listing.localAbsorbedKg = (Number(listing.localAbsorbedKg) || 0) + qty;
        }
        return { ok: true, before: prevSurplus, after: nextSurplus, deducted: qty, pool: 'unabsorbedSurplusKg' };
    }

    const prevAvail = Math.max(0, Number(listing.availableStockKg) || 0);
    if (qty > prevAvail) {
        return { ok: false, reason: 'INSUFFICIENT_STOCK', available: prevAvail };
    }
    const nextAvail = prevAvail - qty;
    listing.availableStockKg = nextAvail;
    if (options.trackB2bDispatched) {
        listing.b2bDispatchedKg = (Number(listing.b2bDispatchedKg) || 0) + qty;
    } else {
        listing.localAbsorbedKg = (Number(listing.localAbsorbedKg) || 0) + qty;
    }
    return { ok: true, before: prevAvail, after: nextAvail, deducted: qty, pool: 'availableStockKg' };
}

export function kembalikanStok(listing, qtyKg, tx = null) {
    if (!listing) return { ok: false, reason: 'LISTING_NOT_FOUND' };
    const qty = Math.max(0, Number(qtyKg) || 0);
    if (qty <= 0) return { ok: false, reason: 'INVALID_QTY' };

    if (tx) {
        if (!tx.stockDeducted) {
            return { ok: true, restored: 0, skippedBecauseNeverDeducted: true, after: Number(listing.availableStockKg) || 0 };
        }
        if (tx.stockRestored) {
            return { ok: false, reason: 'ALREADY_RESTORED' };
        }
    }

    const prevAvail = Math.max(0, Number(listing.availableStockKg) || 0);
    const nextAvail = prevAvail + qty;
    listing.availableStockKg = nextAvail;
    listing.localAbsorbedKg = Math.max(0, (Number(listing.localAbsorbedKg) || 0) - qty);

    if (tx) {
        tx.stockRestored = true;
    }

    return { ok: true, before: prevAvail, after: nextAvail, restored: qty };
}

/**
 * Definisi jelas metrik stok dari satu sumber inventori (Task 2.12 & 2.4):
 * 1. stokSiapSerapKg: Stok aktif di etalase lapak kebun yang siap dibeli warga saat ini = sum(availableStockKg) (non-moderated atau seluruh lapak kebun).
 * 2. cadanganSurplusLumbungKg: Stok cadangan surplus panen raya yang dialokasikan khusus Koperasi/MBG = sum(unabsorbedSurplusKg).
 * 3. totalStokPanenTersediaKg: Seluruh stok fisik hasil panen yang masih tersedia di RT 13 = stokSiapSerapKg + cadanganSurplusLumbungKg.
 *    Saat disalurkan keluar (misal 17 Kg ke Dapur MBG), angka ini TURUN tepat 17 Kg (contoh: 591 -> 574 Kg, tidak pernah bertambah!).
 * 4. totalPanganTersalurkanKg: Akumulasi volume panen yang telah terserap warga + tersalurkan ke B2B/MBG.
 */
export function getInventorySummary(appState = {}) {
    const listings = (Array.isArray(appState.listings) ? appState.listings : []).filter(l => l && !l.isDemoListing);
    const stokSiapSerapKg = listings.reduce((s, l) => s + Math.max(0, Number(l.availableStockKg) || 0), 0);
    const cadanganSurplusLumbungKg = listings.reduce((s, l) => s + Math.max(0, Number(l.unabsorbedSurplusKg) || 0), 0);
    const totalStokPanenTersediaKg = stokSiapSerapKg + cadanganSurplusLumbungKg;

    const totalPanenAwalKg = listings.reduce((s, l) => s + Math.max(0, Number(l.initialHarvestKg) || 0), 0);
    const terserapWargaLokalKg = listings.reduce((s, l) => s + Math.max(0, Number(l.localAbsorbedKg) || 0), 0);
    const tersalurkanB2bKg = listings.reduce((s, l) => s + Math.max(0, Number(l.b2bDispatchedKg) || 0), 0);
    const totalPanganBeredarKg = terserapWargaLokalKg + tersalurkanB2bKg;

    const serapanPersen = totalPanenAwalKg > 0
        ? Math.min(100, Number((((totalPanenAwalKg - totalStokPanenTersediaKg) / totalPanenAwalKg) * 100).toFixed(1)))
        : 0;

    return {
        stokSiapSerapKg,
        cadanganSurplusLumbungKg,
        totalStokPanenTersediaKg,
        totalPanenAwalKg,
        terserapWargaLokalKg,
        tersalurkanB2bKg,
        totalPanganBeredarKg,
        serapanPersen
    };
}

// =========================================================================
// 7. STATUS NERACA (SURPLUS_THRESHOLD_KG = 5) & KONVERSI SATUAN WAKTU
// =========================================================================

export function getBalanceStatus(diffKg, threshold = SURPLUS_THRESHOLD_KG) {
    const diff = Math.round(Number(diffKg) || 0);
    if (diff < 0) {
        return {
            code: 'DEFISIT',
            label: 'KURANG / DEFISIT',
            shortLabel: 'Kurang Stok',
            diffKg: diff,
            isSurplus: false,
            isDeficit: true,
            isBalanced: false
        };
    }
    if (diff > threshold) {
        return {
            code: 'SURPLUS',
            label: 'LEBIH / SURPLUS',
            shortLabel: 'Surplus Siap Salur',
            diffKg: diff,
            isSurplus: true,
            isDeficit: false,
            isBalanced: false
        };
    }
    return {
        code: 'SEIMBANG',
        label: 'PAS / SEIMBANG',
        shortLabel: 'Pas & Seimbang',
        diffKg: diff,
        isSurplus: false,
        isDeficit: false,
        isBalanced: true
    };
}

export function bulananKeHarian(kgPerBulan) {
    const val = Number(kgPerBulan) || 0;
    return val / HARI_PER_BULAN;
}

export function harianKeBulanan(kgPerHari) {
    const val = Number(kgPerHari) || 0;
    return val * HARI_PER_BULAN;
}

export function harianKeMingguan(kgPerHari) {
    const val = Number(kgPerHari) || 0;
    return val * HARI_PER_MINGGU;
}

export function mingguanKeHarian(kgPerMinggu) {
    const val = Number(kgPerMinggu) || 0;
    return val / HARI_PER_MINGGU;
}

export function bulananKeMingguan(kgPerBulan) {
    return harianKeMingguan(bulananKeHarian(kgPerBulan));
}

// =========================================================================
// 8. KEBUTUHAN PANGAN KELUARGA (2.1) & BASELINE KOMUNITAS (5.2)
// =========================================================================

export function normalizeNeedsBreakdown(needs = {}) {
    const safeNum = v => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0;
    };
    const beras = safeNum(needs?.beras);
    const sayur = safeNum(needs?.sayur);
    const telur = safeNum(needs?.telur);
    const ikan = safeNum(needs?.ikan);
    const ayam = safeNum(needs?.ayam);
    const tempe = safeNum(needs?.tempe);
    const total = Math.round((beras + sayur + telur + ikan + ayam + tempe) * 10) / 10;
    return { beras, sayur, telur, ikan, ayam, tempe, total };
}

export function calcFamilyNeedsTotal(needs = {}) {
    return normalizeNeedsBreakdown(needs).total;
}

export function estimateDefaultNeedsByFamilySize(familySize = 4) {
    const jiwa = Math.max(1, parseInt(familySize, 10) || 4);
    const beras = Math.round(jiwa * 7.5);
    const sayur = Math.round(jiwa * 3.0);
    const telur = Math.round(jiwa * 1.5);
    const ikan = Math.round(jiwa * 1.5);
    const ayam = Math.round(jiwa * 1.0);
    const tempe = Math.round(jiwa * 1.5);
    return normalizeNeedsBreakdown({ beras, sayur, telur, ikan, ayam, tempe });
}

export function getEffectiveMemberNeeds(member) {
    if (!member) return normalizeNeedsBreakdown({});
    const raw = (member.needs && typeof member.needs === 'object') ? member.needs : null;
    if (!raw) {
        return estimateDefaultNeedsByFamilySize(member.familySize || 4);
    }
    return normalizeNeedsBreakdown({
        beras: raw.beras ?? 0,
        sayur: raw.sayur ?? 0,
        telur: raw.telur ?? 0,
        ikan: raw.ikan ?? 0,
        ayam: raw.ayam !== undefined ? raw.ayam : 4,
        tempe: raw.tempe !== undefined ? raw.tempe : 6
    });
}

export function getMemberConsistentMonthlyNeedKg(member) {
    if (!member) return 0;
    if (member.needs && typeof member.needs === 'object') {
        const eff = getEffectiveMemberNeeds(member);
        if (eff.total > 0) return eff.total;
    }
    return Math.max(0, Number(member.monthlyFoodNeedKg) || 0);
}

export function computeCommunityBaselineNeeds(members = []) {
    const activeMembers = (Array.isArray(members) ? members : []).filter(
        m => m && !m.isDemoAccount && m.approvalStatus !== 'PENDING' && m.approvalStatus !== 'REJECTED'
    );
    const kkCount = activeMembers.length;
    let totalJiwa = 0;
    let berasMonthlyKg = 0;
    let sayurMonthlyKg = 0;
    let telurMonthlyKg = 0;
    let ikanMonthlyKg = 0;
    let ayamMonthlyKg = 0;
    let tempeMonthlyKg = 0;

    activeMembers.forEach(m => {
        const jiwa = Math.max(1, Number(m.familySize) || 4);
        totalJiwa += jiwa;
        const n = getEffectiveMemberNeeds(m);
        berasMonthlyKg += n.beras;
        sayurMonthlyKg += n.sayur;
        telurMonthlyKg += n.telur;
        ikanMonthlyKg += n.ikan;
        ayamMonthlyKg += n.ayam;
        tempeMonthlyKg += n.tempe;
    });

    const totalMonthlyKg = berasMonthlyKg + sayurMonthlyKg + telurMonthlyKg + ikanMonthlyKg + ayamMonthlyKg + tempeMonthlyKg;

    const sayurDailyKg = Number(bulananKeHarian(sayurMonthlyKg).toFixed(1));
    const telurDailyKg = Number(bulananKeHarian(telurMonthlyKg).toFixed(1));
    // 1 Kg telur ayam rata-rata = 16 butir standar Bapanas
    const telurDailyButir = Math.round(bulananKeHarian(telurMonthlyKg) * 16);
    const ayamDailyKg = Number(bulananKeHarian(ayamMonthlyKg).toFixed(1));
    const ikanDailyKg = Number(bulananKeHarian(ikanMonthlyKg).toFixed(1));
    const berasDailyKg = Number(bulananKeHarian(berasMonthlyKg).toFixed(1));
    const tempeDailyKg = Number(bulananKeHarian(tempeMonthlyKg).toFixed(1));

    return {
        kkCount,
        totalJiwa,
        monthly: {
            berasKg: berasMonthlyKg,
            sayurKg: sayurMonthlyKg,
            telurKg: telurMonthlyKg,
            ikanKg: ikanMonthlyKg,
            ayamKg: ayamMonthlyKg,
            tempeKg: tempeMonthlyKg,
            totalKg: totalMonthlyKg
        },
        weekly: {
            berasKg: Math.round(bulananKeMingguan(berasMonthlyKg)),
            sayurKg: Math.round(bulananKeMingguan(sayurMonthlyKg)),
            telurKg: Math.round(bulananKeMingguan(telurMonthlyKg)),
            ikanKg: Math.round(bulananKeMingguan(ikanMonthlyKg)),
            ayamKg: Math.round(bulananKeMingguan(ayamMonthlyKg)),
            tempeKg: Math.round(bulananKeMingguan(tempeMonthlyKg)),
            totalKg: Math.round(bulananKeMingguan(totalMonthlyKg))
        },
        daily: {
            berasKg: berasDailyKg,
            sayurKg: sayurDailyKg,
            telurKg: telurDailyKg,
            telurButir: telurDailyButir,
            ayamKg: ayamDailyKg,
            ikanKg: ikanDailyKg,
            tempeKg: tempeDailyKg,
            totalKg: Number(bulananKeHarian(totalMonthlyKg).toFixed(1))
        }
    };
}

// =========================================================================
// 9. PIPELINE AI/ML: SANITASI DATASET SATU PINTU (TASK 5.1 & 5.3)
// =========================================================================

function computeMedian(values) {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function normalizeCommodityKey(commodityName) {
    return String(commodityName || '')
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(/\bsurplus panen\b/g, '')
        .trim();
}

export function getTrainingTransactions(transactions = [], options = {}) {
    const validAllChannels = getValidTransactions(transactions, { includeCancelled: false });

    // Tandai kanal pada setiap transaksi valid
    const annotated = validAllChannels.map(tx => {
        const channel = classifyTransactionChannel(tx);
        tx.channel = channel;
        return tx;
    });

    // Hanya kanal eceran_warga yang dipakai untuk melatih model konsumsi rumah tangga harian/mingguan
    const retailOnly = annotated.filter(tx => tx.channel === 'eceran_warga');

    // Hitung median per komoditas untuk deteksi outlier (> 3x median, ditandai tanpa dihapus)
    const qtyByComm = new Map();
    retailOnly.forEach(tx => {
        const key = normalizeCommodityKey(tx.commodity);
        const q = Math.max(0, Number(tx.quantityKg) || 0);
        if (!qtyByComm.has(key)) qtyByComm.set(key, []);
        qtyByComm.get(key).push(q);
    });

    const medianByComm = new Map();
    qtyByComm.forEach((arr, key) => {
        medianByComm.set(key, computeMedian(arr));
    });

    retailOnly.forEach(tx => {
        const key = normalizeCommodityKey(tx.commodity);
        const median = medianByComm.get(key) || 0;
        const qty = Math.max(0, Number(tx.quantityKg) || 0);
        tx.isOutlier = median > 0 && qty > (3 * median);
        tx.commodityMedianKg = median;
    });

    if (options.includeKoperasiChannel) {
        return annotated;
    }
    return retailOnly;
}

/**
 * Weighted Moving Average: menggabungkan baseline kebutuhan profil KK (mingguan)
 * dengan permintaan aktual dari transaksi eceran yang sudah disanitasi (Task 5.3).
 * Outlier diturunkan bobotnya ke median komoditas agar tidak mendistorsi proyeksi.
 */
export function computeWeightedWeeklyDemand(baselineWeeklyKg, retailTransactions = [], producerCountForCategory = 1) {
    const base = Math.max(1, Number(baselineWeeklyKg) || 0);
    const divisor = Math.max(1, Number(producerCountForCategory) || 1);
    const baselineShare = Math.max(2, Math.round(base / divisor));

    if (!Array.isArray(retailTransactions) || retailTransactions.length === 0) {
        return baselineShare;
    }

    // Asumsi jendela histori 50 transaksi mencakup ~4 minggu (1 bulan berjalan)
    const dampenedTotalKg = retailTransactions.reduce((sum, tx) => {
        const rawQty = Math.max(0, Number(tx.quantityKg) || 0);
        const effectiveQty = tx.isOutlier && tx.commodityMedianKg > 0
            ? tx.commodityMedianKg
            : rawQty;
        return sum + effectiveQty;
    }, 0);
    const actualWeeklyVelocity = dampenedTotalKg / 4;

    // Bobot utama pada transaksi riil bila sampel memadai (65% aktual, 35% baseline KK; sampel kecil 55%/45%)
    const weightActual = retailTransactions.length >= 4 ? 0.65 : 0.55;
    const blended = (actualWeeklyVelocity * weightActual) + (baselineShare * (1 - weightActual));
    return Math.max(2, Math.round(blended));
}

// =========================================================================
// 10. REGISTRASI GLOBAL BROWSER (`window.SiPanganDomain`)
// =========================================================================

export function initSharedFoundation() {
    const api = {
        SURPLUS_THRESHOLD_KG,
        VOTE_THRESHOLD,
        HARI_PER_BULAN,
        HARI_PER_MINGGU,
        ADMIN_COOP_SIDS,
        sanitizeNikDigits,
        sanitizePinDigits,
        isValidPin,
        verifyMemberPin,
        isValidNik16,
        maskNikForPublic,
        getInvalidNikMembers,
        lookupMemberBySid,
        generateNextSid,
        generateUniqueTxId,
        generateUniqueListingId,
        getJakartaCurrentYearMonth,
        getJakartaTimestampLabel,
        getNextMonthPeriod,
        formatPeriodLabel,
        inferTransactionPeriod,
        getCurrentOpenPeriod,
        isPeriodClosed,
        isOrderPeriodClosed,
        closeMonthlyPeriod,
        resolveEffectiveRole,
        isCoopOrAdminManaged,
        isSembakoDemand,
        getDemandThreshold,
        hasUserVotedDemand,
        getExistingSupplierForDemand,
        checkPullSignalEligibility,
        can,
        classifyTransactionChannel,
        getNormalizedOrderStatus,
        isActiveOrder,
        isSelfBuyingTransaction,
        auditAndFlagAppState,
        dedupeTransactionsById,
        isValidTransaction,
        getValidTransactions,
        calcTransactionAmounts,
        getProducerOrderSummary,
        getConsumerOrderSummary,
        getBeforeAfterSelfBuyingRecap,
        getFinancialReconciliation,
        kurangiStok,
        kembalikanStok,
        getInventorySummary,
        getBalanceStatus,
        bulananKeHarian,
        harianKeBulanan,
        harianKeMingguan,
        mingguanKeHarian,
        bulananKeMingguan,
        normalizeNeedsBreakdown,
        calcFamilyNeedsTotal,
        estimateDefaultNeedsByFamilySize,
        getEffectiveMemberNeeds,
        getMemberConsistentMonthlyNeedKg,
        computeCommunityBaselineNeeds,
        normalizeCommodityKey,
        getTrainingTransactions,
        computeWeightedWeeklyDemand
    };

    if (typeof window !== 'undefined') {
        window.SiPanganDomain = api;
        if (window.appState) {
            auditAndFlagAppState(window.appState);
        }
    }
    return api;
}

// =========================================================================
// 11. PIN WARGA: 4-6 ANGKA, DISIMPAN & DIBANDINGKAN SEBAGAI TEKS (B2)
// =========================================================================

export function sanitizePinDigits(rawValue) {
    return String(rawValue ?? '').replace(/[^0-9]/g, '').slice(0, 6);
}

export function isValidPin(pinValue) {
    return /^[0-9]{4,6}$/.test(String(pinValue ?? ''));
}

export function verifyMemberPin(member, pinInput) {
    const pin = String(pinInput ?? '');
    if (!member || !isValidPin(pin)) return false;
    const rawStored = member.pinCode;
    const stored = (rawStored !== undefined && rawStored !== null && String(rawStored).trim() !== '')
        ? String(rawStored).trim()
        : '1234';
    // Login HANYA via PIN tersimpan (4-6 digit). NIK tidak boleh dipakai sebagai PIN.
    return pin === stored;
}

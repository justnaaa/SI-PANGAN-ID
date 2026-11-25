// Membangkitkan supabase/seed.sql dari data awal kode (bukan diketik tangan). Tanpa dependensi baru.
// Jalankan: node scripts/generate-seed.mjs   (tidak menyentuh Supabase)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = globalThis;
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };

const { initAppStateData } = await import('../src/data/initialState.js');
const { initSharedFoundation } = await import('../src/domain/sharedFoundation.js');
const { initSupabaseAndStorageService } = await import('../src/services/supabaseAndStorage.js');
const { toWargaRow, toTransaksiRows, buildStatePayload, CLOUD_STATE_KEY } = await import('../src/services/cloudMapping.js');

initAppStateData();
initSharedFoundation();
initSupabaseAndStorageService();
let coreOk = true;
try {
    const { initCoreAppController } = await import('../src/controllers/coreAppController.js');
    initCoreAppController(); // hanya IIFE awal (skor AI & sidShort) yang kita butuhkan
} catch (e) { coreOk = false; }
window.initFiftyTransactionsAndDualRoles();

const D = window.SiPanganDomain;
const st = window.appState;
D.auditAndFlagAppState(st);

const q = v => v === null || v === undefined ? 'NULL' : typeof v === 'boolean' ? String(v) : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const val = (k, v) => (k === 'needs') ? `$j$${JSON.stringify(v)}$j$::jsonb` : q(v);
function insert(table, rows, conflict) {
    const cols = Object.keys(rows[0]);
    const lines = rows.map(r => '    (' + cols.map(c => val(c, r[c])).join(', ') + ')');
    return `INSERT INTO public.${table} (${cols.map(c => c === 'timestamp' ? '"timestamp"' : c).join(', ')}) VALUES\n${lines.join(',\n')}\nON CONFLICT (${conflict}) DO NOTHING;\n`;
}

const warga = st.members.map(toWargaRow);
const tx = toTransaksiRows(st.transactions);
const payload = buildStatePayload(st);
const recon = D.getFinancialReconciliation(st);
const pinOk = warga.every(w => /^[0-9]{4,6}$/.test(w.pin_code));
const nikOk = warga.every(w => /^[0-9]{16}$/.test(w.raw_nik));
const txIds = new Set(tx.map(t => t.id));

const out = `-- =========================================================================
-- SI-PANGAN ID - DATA AWAL BERSIH (dibangkitkan skrip scripts/generate-seed.mjs dari kode)
-- Tabel: warga_kk (${warga.length} KK), transaksi_pangan (${tx.length} transaksi), sipangan_cloud_state (1 snapshot)
-- Aman dijalankan ulang: ON CONFLICT DO NOTHING. JALANKAN SETELAH schema.sql.
-- Total omzet dasar: Rp ${recon.totalPerputaran.toLocaleString('id-ID')} (P2P Rp ${recon.omzetP2pProduk.toLocaleString('id-ID')} + bantuan Rp ${recon.penyaluranBantuanInklusi.toLocaleString('id-ID')})
-- =========================================================================

${insert('warga_kk', warga, 'sid')}
${insert('transaksi_pangan', tx, 'id')}
INSERT INTO public.sipangan_cloud_state (state_key, payload) VALUES
    (${q(CLOUD_STATE_KEY)}, $j$${JSON.stringify(payload)}$j$::jsonb)
ON CONFLICT (state_key) DO NOTHING;
`;
fs.mkdirSync(path.join(root, 'supabase'), { recursive: true });
fs.writeFileSync(path.join(root, 'supabase', 'seed.sql'), out);

const summary = {
    warga_kk: warga.length,
    transaksi_pangan: tx.length,
    txIdRange: `${tx[0].id}..${tx[tx.length - 1].id}`,
    listings: payload.listings.length,
    demands: payload.demands.length,
    omzetP2pProduk: recon.omzetP2pProduk,
    penyaluranBantuanInklusi: recon.penyaluranBantuanInklusi,
    totalPerputaran: recon.totalPerputaran,
    allPin4to6: pinOk,
    allNik16: nikOk,
    uniqueTxIds: txIds.size === tx.length,
    coreInitOk: coreOk
};
console.log(JSON.stringify(summary, null, 2));
const bad = [];
if (warga.length !== 40) bad.push('KK != 40');
if (tx.length !== 50) bad.push('transaksi != 50');
if (recon.totalPerputaran !== 3064000) bad.push('omzet != 3.064.000');
if (recon.omzetP2pProduk !== 2914000) bad.push('P2P != 2.914.000');
if (recon.penyaluranBantuanInklusi !== 150000) bad.push('bantuan != 150.000');
if (!pinOk) bad.push('PIN tidak 4-6 digit');
if (bad.length) { console.error('SEED TIDAK COCOK:', bad.join('; ')); process.exit(1); }
console.log('Seed OK ->', path.join('supabase', 'seed.sql'));

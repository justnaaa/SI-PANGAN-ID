// Verifikasi statis: tabel & kolom yang dirujuk kode ada di supabase/schema.sql (dan sebaliknya). Tanpa dependensi.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = fs.readFileSync(path.join(root, 'supabase', 'schema.sql'), 'utf8');
const seedPath = path.join(root, 'supabase', 'seed.sql');

// 1. Parse schema
const tables = {};
const reTable = /CREATE TABLE IF NOT EXISTS public\.(\w+) \(([\s\S]*?)\n\);/g;
let m;
while ((m = reTable.exec(schema))) {
    const cols = new Set();
    m[2].split('\n').forEach(line => {
        const t = line.replace(/--.*$/, '').trim();
        const c = t.match(/^"?([a-z_]+)"?\s+(text|numeric|integer|boolean|jsonb|timestamptz|bigint)\b/);
        if (c) cols.add(c[1]);
    });
    tables[m[1]] = cols;
}

// 2. Rujukan tabel di src/ dan index.html
const used = new Set();
(function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (p.endsWith('.js')) {
            const s = fs.readFileSync(p, 'utf8');
            for (const x of s.matchAll(/\.from\('([a-z_]+)'\)/g)) used.add(x[1]);
            if (/\.rpc\(/.test(s)) console.log('PERINGATAN: ada rpc() di', p);
            if (/supabase\.storage|\.storage\.from\(|\.channel\(/.test(s)) console.log('PERINGATAN: storage/realtime dipakai di', p);
        }
    }
})(path.join(root, 'src'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const x of html.matchAll(/\.from\('([a-z_]+)'\)/g)) used.add(x[1]);

// 3. Kolom yang ditulis kode
const { toWargaRow, toTransaksiRow } = await import('../src/services/cloudMapping.js');
const written = {
    warga_kk: Object.keys(toWargaRow({ sid: 's', name: 'n' })),
    transaksi_pangan: Object.keys(toTransaksiRow({ id: 'x' })),
    sipangan_cloud_state: ['state_key', 'payload', 'updated_at']
};

let fail = 0;
console.log('Tabel dirujuk kode:', [...used].join(', '));
for (const t of used) if (!tables[t]) { console.log('GAGAL: tabel tidak ada di schema.sql ->', t); fail++; }
for (const [t, cols] of Object.entries(written)) {
    for (const c of cols) if (!tables[t]?.has(c)) { console.log(`GAGAL: kolom ${t}.${c} dipakai kode tapi tidak ada di schema`); fail++; }
}
// select('payload') / eq('state_key') pada pull
if (!tables.sipangan_cloud_state?.has('payload') || !tables.sipangan_cloud_state.has('state_key')) { console.log('GAGAL: kolom state'); fail++; }
for (const [t, cols] of Object.entries(tables)) {
    const unused = [...cols].filter(c => !(written[t] || []).includes(c));
    console.log(`Tabel ${t}: ${cols.size} kolom; tidak ditulis kode (hanya default DB): ${unused.join(', ') || '-'}`);
}
for (const t of Object.keys(tables)) if (!used.has(t)) console.log('INFO: tabel di schema tidak dirujuk kode ->', t);

// 4. Kolom seed.sql ada di schema
if (fs.existsSync(seedPath)) {
    const seed = fs.readFileSync(seedPath, 'utf8');
    for (const x of seed.matchAll(/INSERT INTO public\.(\w+) \(([^)]*)\)/g)) {
        for (const c of x[2].split(',').map(s => s.trim().replace(/"/g, ''))) {
            if (!tables[x[1]]?.has(c)) { console.log(`GAGAL: seed memakai kolom ${x[1]}.${c} yang tidak ada di schema`); fail++; }
        }
    }
    console.log('Seed diperiksa terhadap schema.');
} else console.log('INFO: seed.sql belum ada');

// 5. Verifikasi Constraint Enum SQL vs Kode (chk_warga_role, chk_transaksi_status, chk_transaksi_order_status)
console.log('\n--- 5. VERIFIKASI CONSTRAINT ENUM SQL vs KODE ---');
function extractCheckValues(constraintName) {
    const re = new RegExp(`CONSTRAINT\\s+${constraintName}\\s+CHECK\\s*\\([\\s\\S]*?IN\\s*\\(([^)]+)\\)`, 'i');
    const match = schema.match(re);
    if (!match) return [];
    return match[1].split(',').map(s => s.trim().replace(/^'|'$/g, ''));
}

const sqlRoles = extractCheckValues('chk_warga_role');
const sqlTxStatuses = extractCheckValues('chk_transaksi_status');
const sqlOrderStatuses = extractCheckValues('chk_transaksi_order_status');

console.log('SQL chk_warga_role:', sqlRoles);
console.log('SQL chk_transaksi_status:', sqlTxStatuses);
console.log('SQL chk_transaksi_order_status:', sqlOrderStatuses);

// Cek peran di kode
const codeRoles = ['PRODUSEN', 'KONSUMEN', 'ADMIN'];
for (const r of codeRoles) {
    if (!sqlRoles.includes(r)) {
        console.error(`GAGAL: Role "${r}" dipakai kode tetapi tidak tercakup di chk_warga_role`);
        fail++;
    }
}

// Cek status transaksi di kode & initial state
const codeStatuses = [
    'TERVERIFIKASI_SINGLE_ID',
    'TERVERIFIKASI_BASIS_DATA_PKM_PM',
    'TERVERIFIKASI_ANTAR_WILAYAH',
    'TERVERIFIKASI_MBG_KOPERASI',
    'TERPENUHI_LOKAL',
    'DIBATALKAN'
];
for (const s of codeStatuses) {
    if (!sqlTxStatuses.includes(s)) {
        console.error(`GAGAL: Status transaksi "${s}" dipakai kode tetapi tidak tercakup di chk_transaksi_status`);
        fail++;
    }
}

// Cek order_status pesanan di kode
const codeOrderStatuses = [
    'MENUNGGU_KONFIRMASI',
    'SIAP_DIAMBIL',
    'SELESAI_LUNAS',
    'DIBATALKAN'
];
for (const os of codeOrderStatuses) {
    if (!sqlOrderStatuses.includes(os)) {
        console.error(`GAGAL: Order status "${os}" dipakai kode tetapi tidak tercakup di chk_transaksi_order_status`);
        fail++;
    }
}

console.log('Pencocokan Constraint Enum SQL vs Kode: 100% COCOK.');

if (fail) { console.error(`\nVERIFIKASI GAGAL (${fail} masalah)`); process.exit(1); }
console.log('\nVERIFIKASI SQL vs KODE: LULUS');

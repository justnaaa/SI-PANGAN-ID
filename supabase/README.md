# Supabase SI-PANGAN ID: skema, seed, dan cara memakainya

Semua file di folder ini **hanya file**. Tidak ada yang dijalankan ke Supabase oleh pengembang. Anda yang mengunggah.
Dibangkitkan dari kode final (`src/services/cloudMapping.js`). Jika kode berubah, jalankan ulang
`node scripts/generate-seed.mjs` dan `node scripts/verify-sql-vs-code.mjs`, lalu perbarui isi folder ini.

## Urutan unggah
1. Buka proyek Supabase **uji** dulu (bukan yang utama) > SQL Editor > New query.
2. Tempel dan jalankan `schema.sql`.
3. Tempel dan jalankan `seed.sql`.
4. Periksa jumlah baris (query di bawah).

```sql
SELECT 'warga_kk' AS tabel, count(*) FROM public.warga_kk            -- harus 40
UNION ALL SELECT 'transaksi_pangan', count(*) FROM public.transaksi_pangan   -- harus 50
UNION ALL SELECT 'sipangan_cloud_state', count(*) FROM public.sipangan_cloud_state; -- harus 1

SELECT sum(subtotal) AS omzet_dasar_produk
FROM public.transaksi_pangan;  -- 3.064.000 (P2P 2.914.000 + bantuan 150.000)

SELECT id FROM public.transaksi_pangan WHERE id NOT BETWEEN 'TX-RT13-901' AND 'TX-RT13-950'; -- harus kosong
```

## Isi
| Tabel | Isi | Baris seed |
|---|---|---|
| `warga_kk` | direktori 40 KK (NIK teks, PIN teks) | 40 |
| `transaksi_pangan` | buku besar, `id` = PRIMARY KEY (duplikasi `TX-RT13-944` mustahil) | 50 (TX-RT13-901..950) |
| `sipangan_cloud_state` | snapshot JSON: 10 listing (`list-001..010`), 5 usulan/voting, periode & tutup buku, moderasi, arsip B2B | 1 |

Kode **tidak** memakai Storage, Realtime, maupun `rpc`.
Kolom PIN bertipe **text** dengan CHECK 4-6 angka (`chk_warga_pin_format`).
Constraint enum `chk_warga_role` membatasi peran (`PRODUSEN`, `KONSUMEN`, `ADMIN`).
Constraint `chk_transaksi_status` membatasi status audit transaksi, dan `chk_transaksi_order_status` membatasi workflow pesanan (`MENUNGGU_KONFIRMASI`, `SIAP_DIAMBIL`, `SELESAI_LUNAS`, `DIBATALKAN`).
NIK bertipe text tanpa CHECK 16 digit, karena data lama yang NIK-nya tidak valid hanya diberi flag oleh aplikasi dan CHECK akan menggagalkan seluruh batch upsert.

## Cara membatalkan bila salah (hanya untuk proyek uji, tindakan Anda sendiri)
```sql
DROP TABLE IF EXISTS public.transaksi_pangan, public.warga_kk, public.sipangan_cloud_state;
```
lalu ulangi dari langkah 2.

## RISIKO KEAMANAN (baca sebelum produksi)
Aplikasi memakai kunci publik (anon) dari browser tanpa Supabase Auth. Agar aplikasi berfungsi persis seperti sekarang,
`schema.sql` membuka baca-tulis penuh untuk `anon`. Akibatnya:
- **Siapa pun yang punya URL + kunci anon (kunci itu ada di kode frontend) bisa membaca semua PIN warga, NIK mentah,
  dan menulis/menghapus data**. PIN tersimpan teks biasa di `warga_kk.pin_code` dan juga di
  `sipangan_cloud_state.payload.members[].pinCode`.
- Login dilakukan di browser (PIN Admin juga tertulis di kode), jadi database tidak bisa membedakan Admin dan warga.

Pilihan perbaikan (keputusan di Anda, desain login belum diubah):
1. **Hash PIN + verifikasi di fungsi database** (`SECURITY DEFINER` RPC `login(nik_atau_nama, pin)`), kolom PIN tidak boleh dibaca anon.
2. **Batasi kolom yang bisa dibaca**: buat VIEW publik tanpa `pin_code`/`raw_nik` dan cabut SELECT tabel dasar dari anon.
3. **Pakai Supabase Auth** (email/telepon + RLS per `auth.uid()` dan peran Admin) agar tulis/hapus dibatasi.
4. Minimal: keluarkan `pinCode`/`rawNik` dari `payload` snapshot dan jangan simpan PIN mentah.

## Pengujian eksekusi
`schema.sql` dan `seed.sql` **belum bisa diuji eksekusi** di mesin ini (tidak ada Postgres lokal). Yang sudah diuji:
`scripts/verify-sql-vs-code.mjs` (statis: tiap tabel/kolom yang ditulis kode dan kolom seed ada di skema).
Cobalah dulu di proyek Supabase uji sebelum yang utama.

> File `supabase_schema.sql` di root proyek adalah versi lama (memuat tabel `produk_pasar` dan `musyawarah_voting`
> yang tidak pernah dipakai kode). Gunakan folder `supabase/` ini sebagai gantinya.

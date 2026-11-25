-- =========================================================================
-- SI-PANGAN ID (RT 13 Yosomulyo, Kota Metro) - SKEMA SUPABASE (dari kode FINAL)
-- Dibuat dari: src/services/cloudMapping.js + src/services/supabaseAndStorage.js
-- HANYA FILE. Jalankan sendiri di Supabase SQL Editor (urutan: schema.sql -> seed.sql).
-- Aman dijalankan ulang (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- =========================================================================

-- 1. Direktori warga (1 baris per KK). Dipakai: upsert onConflict 'sid'.
CREATE TABLE IF NOT EXISTS public.warga_kk (
    sid                     text PRIMARY KEY,
    name                    text NOT NULL,
    public_name             text,
    nik_hash                text,
    masked_nik              text,
    raw_nik                 text,                       -- NIK sebagai TEKS (bukan angka)
    pin_code                text NOT NULL,              -- PIN sebagai TEKS (4-6 angka) agar '0123' tidak rusak
    role                    text DEFAULT 'KONSUMEN',
    is_dual_role            boolean DEFAULT false,
    producer_commodity      text DEFAULT '-',
    capacity_kg             numeric DEFAULT 0,
    harvest_cycle_weekly    text DEFAULT '-',
    family_size             integer DEFAULT 4,
    monthly_income          numeric DEFAULT 2500000,
    monthly_food_need_kg    numeric DEFAULT 35,
    needs                   jsonb DEFAULT '{}'::jsonb,
    social_tier             text DEFAULT 'MANDIRI',
    ai_score                numeric DEFAULT 30,
    aid_received_this_month boolean DEFAULT false,
    distance_km             numeric DEFAULT 0.2,
    wallet_earned           numeric DEFAULT 0,
    subsidy_received_kg     numeric DEFAULT 0,
    address                 text DEFAULT 'RT 13 Yosomulyo',
    surplus_notified        boolean DEFAULT false,
    surplus_notified_msg    text DEFAULT '',
    updated_at              timestamptz DEFAULT now(),
    -- Peran warga: PRODUSEN, KONSUMEN, ADMIN. Dual-role dicatat pada kolom is_dual_role.
    CONSTRAINT chk_warga_role CHECK (role IN ('PRODUSEN', 'KONSUMEN', 'ADMIN')),
    -- PIN warga: 4-6 angka. Seed memenuhi; kode juga memvalidasi di UI dan handler.
    CONSTRAINT chk_warga_pin_format CHECK (pin_code ~ '^[0-9]{4,6}$')
    -- CATATAN: sengaja TIDAK ada CHECK 16 digit pada raw_nik. Data lama yang NIK-nya tidak valid
    -- hanya diberi flag oleh aplikasi (tidak dihapus); constraint akan menggagalkan seluruh batch upsert.
);

-- 2. Buku besar transaksi. ID TRANSAKSI UNIK (primary key) -> duplikasi seperti TX-RT13-944 tidak mungkin di database.
CREATE TABLE IF NOT EXISTS public.transaksi_pangan (
    id                      text PRIMARY KEY,
    "timestamp"             text,
    type                    text DEFAULT 'JUAL_BELI_PASAR',
    producer_sid            text,
    producer_name           text,
    consumer_sid            text,
    consumer_name           text,
    commodity               text,
    quantity_kg             numeric DEFAULT 1,
    unit_price              numeric DEFAULT 0,
    subtotal                numeric DEFAULT 0,
    producer_net            numeric DEFAULT 0,
    delivery_method         text DEFAULT 'Ambil Sendiri',
    delivery_fee            numeric DEFAULT 0,
    total_paid              numeric DEFAULT 0,
    status                  text DEFAULT 'TERVERIFIKASI_SINGLE_ID',
    period                  text,
    channel                 text DEFAULT 'eceran_warga',
    order_status            text,
    listing_id              text,
    is_invalid_self_buying  boolean DEFAULT false,
    created_at              timestamptz DEFAULT now(),
    -- Status audit verifikasi transaksi pangan
    CONSTRAINT chk_transaksi_status CHECK (status IN (
        'TERVERIFIKASI_SINGLE_ID',
        'TERVERIFIKASI_BASIS_DATA_PKM_PM',
        'TERVERIFIKASI_ANTAR_WILAYAH',
        'TERVERIFIKASI_MBG_KOPERASI',
        'TERPENUHI_LOKAL',
        'DIBATALKAN'
    )),
    -- Status pemrosesan alur pesanan (workflow dinamis)
    CONSTRAINT chk_transaksi_order_status CHECK (order_status IS NULL OR order_status IN (
        'MENUNGGU_KONFIRMASI',
        'SIAP_DIAMBIL',
        'SELESAI_LUNAS',
        'DIBATALKAN'
    ))
);

-- 3. Snapshot state terpadu (produk/listing, usulan+suara, periode & tutup buku, moderasi, arsip B2B, dll).
--    Kunci tunggal: state_key = 'RT13_YOSOMULYO_MAIN'. Dipakai: upsert onConflict 'state_key' dan select payload.
CREATE TABLE IF NOT EXISTS public.sipangan_cloud_state (
    state_key   text PRIMARY KEY,
    payload     jsonb NOT NULL,
    updated_at  timestamptz DEFAULT now()
);

-- =========================================================================
-- RLS (Row Level Security)
-- Aplikasi memakai kunci publik (anon) langsung dari browser, TANPA Supabase Auth.
-- Agar aplikasi berfungsi SAMA seperti perilaku kode saat ini, kebijakan di bawah mengizinkan
-- baca/tulis penuh untuk anon. LIHAT RISIKO KEAMANAN di supabase/README.md (PIN terbaca publik).
-- =========================================================================
ALTER TABLE public.warga_kk            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_pangan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sipangan_cloud_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_full_access_warga_kk" ON public.warga_kk;
CREATE POLICY "app_full_access_warga_kk" ON public.warga_kk
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "app_full_access_transaksi_pangan" ON public.transaksi_pangan;
CREATE POLICY "app_full_access_transaksi_pangan" ON public.transaksi_pangan
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "app_full_access_sipangan_cloud_state" ON public.sipangan_cloud_state;
CREATE POLICY "app_full_access_sipangan_cloud_state" ON public.sipangan_cloud_state
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage bucket: TIDAK dipakai kode (tidak ada supabase.storage). Realtime/RPC: TIDAK dipakai.

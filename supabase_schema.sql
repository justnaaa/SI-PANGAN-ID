-- =========================================================================
-- SI-PANGAN ID (RT 13 KELURAHAN YOSOMULYO - KOTA METRO)
-- SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Project URL: https://kspiocqtljlsdrxkxbtt.supabase.co
-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> New Query
-- =========================================================================

-- 1. Tabel Direktori Warga & Produsen (Single Identity - 40+ KK)
CREATE TABLE IF NOT EXISTS public.warga_kk (
    sid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    public_name TEXT,
    nik_hash TEXT,
    masked_nik TEXT,
    raw_nik TEXT,
    role TEXT DEFAULT 'KONSUMEN',
    is_dual_role BOOLEAN DEFAULT FALSE,
    producer_commodity TEXT DEFAULT '-',
    capacity_kg NUMERIC DEFAULT 0,
    harvest_cycle_weekly TEXT DEFAULT 'Setiap Minggu',
    family_size INTEGER DEFAULT 4,
    monthly_income BIGINT DEFAULT 2500000,
    monthly_food_need_kg NUMERIC DEFAULT 35,
    needs JSONB DEFAULT '{"beras": 18, "sayur": 9, "telur": 4, "ikan": 4, "ayam": 0, "tempe": 0}'::jsonb,
    social_tier TEXT DEFAULT 'MANDIRI',
    ai_score NUMERIC DEFAULT 30,
    aid_received_this_month BOOLEAN DEFAULT FALSE,
    distance_km NUMERIC DEFAULT 0.2,
    wallet_earned BIGINT DEFAULT 0,
    subsidy_received_kg NUMERIC DEFAULT 0,
    address TEXT DEFAULT 'RT 13 Kelurahan Yosomulyo',
    pin_code TEXT DEFAULT '1234',
    surplus_notified BOOLEAN DEFAULT FALSE,
    surplus_notified_msg TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Etalase Pasar & Stok Panen Produsen
CREATE TABLE IF NOT EXISTS public.produk_pasar (
    id TEXT PRIMARY KEY,
    producer_sid TEXT,
    producer_name TEXT,
    commodity TEXT NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'Kg',
    plant_date TEXT,
    harvest_date TEXT,
    initial_harvest_kg NUMERIC DEFAULT 0,
    local_absorbed_kg NUMERIC DEFAULT 0,
    available_stock_kg NUMERIC DEFAULT 0,
    unabsorbed_surplus_kg NUMERIC DEFAULT 0,
    pengepul_price BIGINT DEFAULT 0,
    tengkulak_price BIGINT DEFAULT 0,
    market_price BIGINT DEFAULT 0,
    fair_price BIGINT DEFAULT 0,
    freshness_window TEXT DEFAULT '2 Hari',
    freshness_days_remaining INTEGER DEFAULT 2,
    location TEXT,
    distance_km NUMERIC DEFAULT 0.2,
    description TEXT,
    icon TEXT DEFAULT 'fa-leaf',
    surplus_notified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Buku Besar Transaksi (50+ Transaksi Terverifikasi)
CREATE TABLE IF NOT EXISTS public.transaksi_pangan (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT DEFAULT 'JUAL_BELI_PASAR',
    producer_sid TEXT,
    producer_name TEXT,
    consumer_sid TEXT,
    consumer_name TEXT,
    commodity TEXT,
    quantity_kg NUMERIC DEFAULT 1,
    unit_price BIGINT DEFAULT 0,
    subtotal BIGINT DEFAULT 0,
    producer_net BIGINT DEFAULT 0,
    delivery_method TEXT DEFAULT 'Ambil Sendiri (Rp 0)',
    delivery_fee BIGINT DEFAULT 0,
    total_paid BIGINT DEFAULT 0,
    status TEXT DEFAULT 'TERVERIFIKASI_SINGLE_ID'
);

-- 4. Tabel Musyawarah E-Voting Permintaan Warga
CREATE TABLE IF NOT EXISTS public.musyawarah_voting (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    target_price_max BIGINT DEFAULT 15000,
    votes INTEGER DEFAULT 1,
    base_demand_kg NUMERIC DEFAULT 15,
    total_demand_kg NUMERIC DEFAULT 18,
    status TEXT DEFAULT 'VOTING',
    producer_notes TEXT,
    voters JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Sinkronisasi State Terpadu (Antrean Verifikasi Admin & Log Surplus MBG/Koperasi)
CREATE TABLE IF NOT EXISTS public.sipangan_cloud_state (
    state_key TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS) dengan Akses Publik Terkontrol untuk Aplikasi Lapangan
ALTER TABLE public.warga_kk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk_pasar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_pangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musyawarah_voting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sipangan_cloud_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public CRUD warga_kk" ON public.warga_kk;
CREATE POLICY "Public CRUD warga_kk" ON public.warga_kk FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public CRUD produk_pasar" ON public.produk_pasar;
CREATE POLICY "Public CRUD produk_pasar" ON public.produk_pasar FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public CRUD transaksi_pangan" ON public.transaksi_pangan;
CREATE POLICY "Public CRUD transaksi_pangan" ON public.transaksi_pangan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public CRUD musyawarah_voting" ON public.musyawarah_voting;
CREATE POLICY "Public CRUD musyawarah_voting" ON public.musyawarah_voting FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public CRUD sipangan_cloud_state" ON public.sipangan_cloud_state;
CREATE POLICY "Public CRUD sipangan_cloud_state" ON public.sipangan_cloud_state FOR ALL USING (true) WITH CHECK (true);

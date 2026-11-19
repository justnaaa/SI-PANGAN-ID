/**
 * @file src/ai/priceAdvisorEngine.js
 * @description Modul Kalibrasi Harga Adil (Fair Price) Berbasis Standar Bapanas & PIHPS Lampung
 *              serta Grafik Proyeksi Tren Harga 3 Hari ke Depan.
 */

export function initPriceAdvisorEngine() {
        window.LAMPUNG_MARKET_INTELLIGENCE = {
            "Sayur Kangkung (KWT Pekarangan)": {
                category: "Sayur Pekarangan",
                unit: "Kg",
                pengepulPrice: 2500,
                tengkulakPrice: 2500,
                marketLampungPrice: 6000,
                safeMin: 3500,
                safeMax: 5000,
                recommendedPrice: 4500,
                freshnessDays: 2,
                dataSource: "Kebun KWT RT 13 & Pasar Tradisional Metro",
                description: "Sayur kangkung hijau segar petik subuh bebas pestisida sintetis binaan KWT RT 13 Yosomulyo."
            },
            "Sayur Bayam Hijau (KWT Pekarangan)": {
                category: "Sayur Pekarangan",
                unit: "Kg",
                pengepulPrice: 3000,
                tengkulakPrice: 3000,
                marketLampungPrice: 7000,
                safeMin: 4000,
                safeMax: 6000,
                recommendedPrice: 5000,
                freshnessDays: 2,
                dataSource: "Kebun Dasawisma KWT & Pasar Cendrawasih Metro",
                description: "Bayam cabut segar petik subuh bebas kimia, kaya zat besi untuk pemenuhan gizi keluarga & balita."
            },
            "Cabai Rawit Merah (Pekarangan KWT)": {
                category: "Sayur Pekarangan",
                unit: "Kg",
                pengepulPrice: 35000,
                tengkulakPrice: 35000,
                marketLampungPrice: 55000,
                safeMin: 40000,
                safeMax: 50000,
                recommendedPrice: 45000,
                freshnessDays: 5,
                dataSource: "Pekarangan KWT RT 13 & PIHPS Metro",
                description: "Cabai rawit merah petik pohon segar dari pekarangan dasawisma KWT, pedas mantap alami."
            },
            "Sawi Hijau / Caisim (KWT Pekarangan)": {
                category: "Sayur Pekarangan",
                unit: "Kg",
                pengepulPrice: 3000,
                tengkulakPrice: 3000,
                marketLampungPrice: 7000,
                safeMin: 4000,
                safeMax: 6000,
                recommendedPrice: 5000,
                freshnessDays: 3,
                dataSource: "Pekarangan KWT RT 13 & Pasar Kopindo",
                description: "Sawi hijau caisim segar renyah budidaya pekarangan organik ramah lingkungan."
            },
            "Daun Bawang Segar (KWT Pekarangan)": {
                category: "Sayur Pekarangan",
                unit: "Kg",
                pengepulPrice: 8000,
                tengkulakPrice: 8000,
                marketLampungPrice: 16000,
                safeMin: 10000,
                safeMax: 14000,
                recommendedPrice: 12000,
                freshnessDays: 4,
                dataSource: "Kebun KWT RT 13 & Pasar Tejoagung",
                description: "Daun bawang segar aroma kuat bebas residu kimia pekarangan KWT."
            },
            "Ikan Lele Segar (Bioflok Kolam RT 13)": {
                category: "Lauk & Protein",
                unit: "Kg",
                pengepulPrice: 18000,
                tengkulakPrice: 18000,
                marketLampungPrice: 26000,
                safeMin: 20000,
                safeMax: 24000,
                recommendedPrice: 22000,
                freshnessDays: 1,
                dataSource: "Kolam Bioflok RT 13 & Pasar Tradisional Metro",
                description: "Ikan lele budidaya bioflok air bersih tanpa pakan limbah, higienis, daging kenyal gurih."
            },
            "Ikan Nila Air Tawar (Kolam Pekarangan RT 13)": {
                category: "Lauk & Protein",
                unit: "Kg",
                pengepulPrice: 24000,
                tengkulakPrice: 24000,
                marketLampungPrice: 35000,
                safeMin: 27000,
                safeMax: 32000,
                recommendedPrice: 29000,
                freshnessDays: 1,
                dataSource: "Kolam Air Mengalir RT 13 & Sentra Ikan Metro",
                description: "Ikan nila merah air tawar segar pekarangan, daging manis tebal kaya protein hewani."
            },
            "Telur Ayam Pekarangan (Ternak Warga RT 13)": {
                category: "Lauk & Protein",
                unit: "Kg",
                pengepulPrice: 22000,
                tengkulakPrice: 22000,
                marketLampungPrice: 30000,
                safeMin: 24000,
                safeMax: 28000,
                recommendedPrice: 26000,
                freshnessDays: 14,
                dataSource: "Ternak Unggas Pekarangan RT 13 & PIHPS Metro",
                description: "Telur ayam segar pekarangan warga RT 13, kuning telur oranye alami kaya omega-3."
            },
            "Ayam Pekarangan (Unggas Rakyat RT 13)": {
                category: "Lauk & Protein",
                unit: "Kg",
                pengepulPrice: 30000,
                tengkulakPrice: 30000,
                marketLampungPrice: 45000,
                safeMin: 35000,
                safeMax: 42000,
                recommendedPrice: 38000,
                freshnessDays: 2,
                dataSource: "Ternak Rakyat RT 13 & Pasar Ayam Metro",
                description: "Ayam kampung sehat pekarangan, pakan alami dedak dan jagung, daging gurih padat."
            },
            "Telur Bebek Segar (Ternak Pekarangan RT 13)": {
                category: "Lauk & Protein",
                unit: "Kg",
                pengepulPrice: 24000,
                tengkulakPrice: 24000,
                marketLampungPrice: 35000,
                safeMin: 26000,
                safeMax: 32000,
                recommendedPrice: 28000,
                freshnessDays: 14,
                dataSource: "Peternak Bebek RT 13 & Sentra Telur Metro",
                description: "Telur bebek segar pekarangan, kuning telur pekat gurih berminyak alami."
            },
            "Beras Premium Ciherang (Poktan RT 13)": {
                category: "Beras & Padi",
                unit: "Kg",
                pengepulPrice: 11500,
                tengkulakPrice: 11500,
                marketLampungPrice: 15500,
                safeMin: 12500,
                safeMax: 15000,
                recommendedPrice: 13500,
                freshnessDays: 90,
                dataSource: "PIHPS & Lumbung Poktan Metro",
                description: "Beras pulen Ciherang panen lumbung mandiri RT 13, kadar air 14% standar lumbung pangan."
            }
        };

        // Aliases for compatibility
        LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Lokal (Ciherang/IR64)"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Beras Putih Pulen Panen Lokal (1 Ton)"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Beras Premium (Lumbung RT 13)"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Beras Premium"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam & Sayuran Hijau"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Sayur Mayur (Bayam/Kangkung Hidroponik)"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Kangkung (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Sayur Mayur"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Kangkung (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Cabut & Tahu"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Cabut Segar"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Cabai Rawit & Tomat Pekarangan"] = LAMPUNG_MARKET_INTELLIGENCE["Cabai Rawit Merah (Pekarangan KWT)"];
        LAMPUNG_MARKET_INTELLIGENCE["Cabai Merah Keriting (Pekarangan)"] = LAMPUNG_MARKET_INTELLIGENCE["Cabai Rawit Merah (Pekarangan KWT)"];
        LAMPUNG_MARKET_INTELLIGENCE["Ikan Lele Segar & Kangkung Air Bioflok"] = LAMPUNG_MARKET_INTELLIGENCE["Ikan Lele Segar (Bioflok Kolam RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Ikan Lele Segar Kolam Bioflok"] = LAMPUNG_MARKET_INTELLIGENCE["Ikan Lele Segar (Bioflok Kolam RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Ikan Gurame Segar (Kolam Bioflok)"] = LAMPUNG_MARKET_INTELLIGENCE["Ikan Nila Air Tawar (Kolam Pekarangan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Telur Asin & Unggas Pekarangan"] = LAMPUNG_MARKET_INTELLIGENCE["Telur Bebek Segar (Ternak Pekarangan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Telur Ayam Ras Segar (Kandang RT 13)"] = LAMPUNG_MARKET_INTELLIGENCE["Telur Ayam Pekarangan (Ternak Warga RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Tempe Daun & Katering Gizi Balita"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Tempe Daun & Tahu Segar Tanpa Pengawet"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Singkong / Ubi Kayu (Panen Lokal)"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Singkong / Ubi Kayu"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Keripik Pisang & Olahan Singkong"] = LAMPUNG_MARKET_INTELLIGENCE["Beras Premium Ciherang (Poktan RT 13)"];
        LAMPUNG_MARKET_INTELLIGENCE["Jagung Manis (Pekarangan)"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Kangkung (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Jagung Manis"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Kangkung (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Jagung Manis & Kacang Panjang"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Kangkung (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Jamur Tiram Putih Segar Kumbung"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];
        LAMPUNG_MARKET_INTELLIGENCE["Jamu Tradisional & Rimpang Toga"] = LAMPUNG_MARKET_INTELLIGENCE["Sayur Bayam Hijau (KWT Pekarangan)"];

        // =========================================================================
        // DATA HISTORIS & PREDIKSI HARGA (AI FLUCTUATION & FORECASTER)
        // 11 Komoditas Strategis Pekarangan KWT, Perikanan Bioflok, Unggas Rakyat & Poktan RT 13
        // =========================================================================
        window.FLUCTUATION_DATA = {
            "Sayur Kangkung (KWT Pekarangan)": {
                shortName: "Sayur Kangkung KWT",
                category: "Sayur Pekarangan",
                btnId: "btnFluct-Kangkung",
                historical: [5500, 5600, 5800, 5900, 6000, 6000, 5900, 6000],
                prediction: [null, null, null, null, null, null, null, 6000, 5800, 5600, 5400],
                pengepulPrice: 2500,
                marketPrice: 6000,
                predictionH3: 5400,
                deltaText: "-Rp 600 (-10.0%)",
                trendType: "DOWN",
                trendBadgeText: "Panen Serentak (Surplus)",
                trendBadgeClass: "bg-amber-100 text-amber-800 border-amber-200",
                volatilityText: "Panen Serentak KWT",
                volatilityClass: "bg-amber-100 text-amber-800",
                producerAdvisory: "Proyeksi 3 Hari ke Depan: RT 13 diperkirakan mengalami kelebihan pasokan (Surplus) +20 Kg Sayur Kangkung dari panen serentak anggota KWT. Tindakan Sistem: Otomatis mengalihkan 20 Kg ke Koperasi Produsen Kelurahan Yosomulyo agar sayuran tidak layu/busuk (susut pangan < 5%) dan harga petani tetap stabil.",
                consumerAdvisory: "Pasokan sayur kangkung KWT segar melimpah dipetik subuh. Rekomendasi Konsumen: Waktu terbaik membeli sayuran segar pekarangan dengan harga hemat komunitas."
            },
            "Sayur Bayam Hijau (KWT Pekarangan)": {
                shortName: "Sayur Bayam KWT",
                category: "Sayur Pekarangan",
                btnId: "btnFluct-Bayam",
                historical: [6500, 6600, 6800, 7000, 7000, 6900, 7000, 7000],
                prediction: [null, null, null, null, null, null, null, 7000, 6800, 6700, 6500],
                pengepulPrice: 3000,
                marketPrice: 7000,
                predictionH3: 6500,
                deltaText: "-Rp 500 (-7.1%)",
                trendType: "DOWN",
                trendBadgeText: "Pasokan Melimpah",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Panen Dasawisma",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Panen bayam hijau pekarangan KWT mencukupi kebutuhan 40 KK. Alirkan panen harian langsung ke dapur warga rentan dan posyandu balita.",
                consumerAdvisory: "Bayam hijau cabut bebas kimia sintetis. Waktu ideal membeli untuk mencukupi asupan zat besi keluarga."
            },
            "Cabai Rawit Merah (Pekarangan KWT)": {
                shortName: "Cabai Rawit",
                category: "Sayur Pekarangan",
                btnId: "btnFluct-Cabai",
                historical: [50000, 52000, 51000, 53000, 54000, 53500, 55000, 55000],
                prediction: [null, null, null, null, null, null, null, 55000, 56000, 57000, 58000],
                pengepulPrice: 35000,
                marketPrice: 55000,
                predictionH3: 58000,
                deltaText: "+Rp 3.000 (+5.5%)",
                trendType: "UP",
                trendBadgeText: "Tren Naik (+5.5%)",
                trendBadgeClass: "bg-rose-100 text-rose-800 border-rose-200",
                volatilityText: "Volatilitas Pasar Sedang",
                volatilityClass: "bg-amber-100 text-amber-800",
                producerAdvisory: "Harga cabai di pasar induk Metro bergerak naik. Rekomendasi Produsen: Petik cabai pekarangan KWT saat masak pohon untuk memperoleh nilai jual optimal.",
                consumerAdvisory: "Harga pasar luar mengalami lonjakan. Rekomendasi Konsumen: Beli cabai segar KWT RT 13 untuk berhemat hingga Rp 10.000/kg."
            },
            "Sawi Hijau / Caisim (KWT Pekarangan)": {
                shortName: "Sawi Caisim",
                category: "Sayur Pekarangan",
                btnId: "btnFluct-Sawi",
                historical: [6200, 6300, 6500, 6800, 6900, 7000, 7000, 7000],
                prediction: [null, null, null, null, null, null, null, 7000, 6900, 6700, 6600],
                pengepulPrice: 3000,
                marketPrice: 7000,
                predictionH3: 6600,
                deltaText: "-Rp 400 (-5.7%)",
                trendType: "DOWN",
                trendBadgeText: "Pasokan Stabil",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Volatilitas Rendah",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Pasokan sawi pekarangan KWT stabil. Distribusikan bertahap ke warga dan pengolah kuliner lokal RT 13.",
                consumerAdvisory: "Sawi hijau caisim segar petik pagi, renyah dan sehat bebas residu pestisida sintetis."
            },
            "Daun Bawang Segar (KWT Pekarangan)": {
                shortName: "Daun Bawang",
                category: "Sayur Pekarangan",
                btnId: "btnFluct-Bawang",
                historical: [14000, 14500, 15000, 15000, 15500, 15800, 16000, 16000],
                prediction: [null, null, null, null, null, null, null, 16000, 16200, 16500, 16800],
                pengepulPrice: 8000,
                marketPrice: 16000,
                predictionH3: 16800,
                deltaText: "+Rp 800 (+5.0%)",
                trendType: "UP",
                trendBadgeText: "Permintaan Naik",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Volatilitas Sedang",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Kebutuhan bumbu dapur segar warga tinggi. Petik daun bawang berkualitas prima dari polybag pekarangan.",
                consumerAdvisory: "Daun bawang segar beraroma kuat langsung dari kebun tetangga dengan harga hemat komunitas."
            },
            "Ikan Lele Segar (Bioflok Kolam RT 13)": {
                shortName: "Ikan Lele",
                category: "Lauk & Protein",
                btnId: "btnFluct-Lele",
                historical: [25000, 25200, 25400, 25500, 25800, 26000, 26000, 26000],
                prediction: [null, null, null, null, null, null, null, 26000, 26200, 26400, 26500],
                pengepulPrice: 18000,
                marketPrice: 26000,
                predictionH3: 26500,
                deltaText: "+Rp 500 (+1.9%)",
                trendType: "UP",
                trendBadgeText: "Tren Stabil (+1.9%)",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Volatilitas Rendah",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Permintaan ikan lele bioflok stabil tinggi. Rekomendasi Produsen: Lakukan panen bertahap sesuai pesanan konsumsi dapur 40 KK RT 13.",
                consumerAdvisory: "Ikan lele kolam bioflok RT 13 dibudidayakan air bersih higienis tanpa limbah, kaya asam lemak esensial untuk nutrisi balita."
            },
            "Ikan Nila Air Tawar (Kolam Pekarangan RT 13)": {
                shortName: "Ikan Nila",
                category: "Lauk & Protein",
                btnId: "btnFluct-Nila",
                historical: [32000, 32500, 33000, 33500, 34000, 34500, 35000, 35000],
                prediction: [null, null, null, null, null, null, null, 35000, 35200, 35500, 35800],
                pengepulPrice: 24000,
                marketPrice: 35000,
                predictionH3: 35800,
                deltaText: "+Rp 800 (+2.3%)",
                trendType: "UP",
                trendBadgeText: "Permintaan Tinggi",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Volatilitas Terkendali",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Ikan nila pekarangan digemari konsumen keluarga. Jaga sirkulasi kolam dan beri pakan teratur menjelang panen.",
                producerAdvisory: "Proyeksi 3 Hari ke Depan: Kebutuhan konsumsi warga RT 13 diperkirakan kekurangan (Defisit) -30 Butir Telur Ayam. Tindakan Sistem: Memprioritaskan hasil ternak unggas warga RT 13 untuk memenuhi kebutuhan dapur tetangga terdekat.",
                consumerAdvisory: "Kebutuhan telur ayam dapur warga sedang tinggi. Rekomendasi Konsumen: Amankan asupan protein keluarga langsung dari peternak pekarangan tetangga."
            },
            "Ayam Pekarangan (Unggas Rakyat RT 13)": {
                shortName: "Daging Ayam",
                category: "Lauk & Protein",
                btnId: "btnFluct-Ayam",
                historical: [38000, 38500, 39000, 39200, 39500, 39800, 40000, 40000],
                prediction: [null, null, null, null, null, null, null, 40000, 40500, 41000, 41500],
                pengepulPrice: 28000,
                marketPrice: 40000,
                predictionH3: 41500,
                deltaText: "+Rp 1.500 (+3.8%)",
                trendType: "UP",
                trendBadgeText: "Kebutuhan Tinggi",
                trendBadgeClass: "bg-amber-100 text-amber-800 border-amber-200",
                volatilityText: "Volatilitas Normal",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Ayam kampung pekarangan siap panen bobot 1.2 - 1.5 kg. Siap diserap konsumsi warga RT 13 dan katering lokal.",
                consumerAdvisory: "Daging ayam sehat pekarangan tanpa suntik hormon, cita rasa gurih alami untuk sop dan olahan keluarga."
            },
            "Telur Bebek Segar (Ternak Pekarangan RT 13)": {
                shortName: "Telur Bebek",
                category: "Lauk & Protein",
                btnId: "btnFluct-Bebek",
                historical: [30000, 30500, 31000, 31500, 32000, 32000, 32500, 33000],
                prediction: [null, null, null, null, null, null, null, 33000, 33300, 33600, 34000],
                pengepulPrice: 24000,
                marketPrice: 33000,
                predictionH3: 34000,
                deltaText: "+Rp 1.000 (+3.0%)",
                trendType: "UP",
                trendBadgeText: "Tren Stabil (+3.0%)",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Volatilitas Rendah",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Produksi telur bebek pekarangan konsisten. Cocok untuk konsumsi segar maupun pasokan pengrajin telur asin RT 13.",
                consumerAdvisory: "Telur bebek segar kaya nutrisi, cangkang biru bersih dan kuning telur merah oranye alami."
            },
            "Beras Premium Ciherang (Poktan RT 13)": {
                shortName: "Beras Ciherang",
                category: "Beras & Padi",
                btnId: "btnFluct-Beras",
                historical: [15000, 15100, 15100, 15200, 15300, 15400, 15400, 15500],
                prediction: [null, null, null, null, null, null, null, 15500, 15650, 15750, 15850],
                pengepulPrice: 11500,
                marketPrice: 15500,
                predictionH3: 15850,
                deltaText: "+Rp 350 (+2.3%)",
                trendType: "UP",
                trendBadgeText: "Tren Naik (+2.3%)",
                trendBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                volatilityText: "Volatilitas Rendah (±1.2%)",
                volatilityClass: "bg-emerald-100 text-emerald-800",
                producerAdvisory: "Proyeksi 3 Hari ke Depan: Panen sawah Bapak A menghasilkan 1.000 Kg Beras Ciherang. Kebutuhan 40 KK adalah 600 Kg, sehingga surplus +400 Kg dialihkan ke Koperasi Produsen Kelurahan Yosomulyo.",
                consumerAdvisory: "Beras Ciherang lumbung mandiri RT 13 terjamin pulen alami tanpa pemutih kimia. Amankan stok kebutuhan pokok keluarga tanpa perantara pihak ketiga."
            }
        };

        // Aliases for FLUCTUATION_DATA
        FLUCTUATION_DATA["Beras Premium Lokal (Ciherang/IR64)"] = FLUCTUATION_DATA["Beras Premium Ciherang (Poktan RT 13)"];
        FLUCTUATION_DATA["Singkong / Ubi Kayu (Panen Lokal)"] = FLUCTUATION_DATA["Beras Premium Ciherang (Poktan RT 13)"];
        FLUCTUATION_DATA["Jagung Manis (Pekarangan)"] = FLUCTUATION_DATA["Sayur Kangkung (KWT Pekarangan)"];
        FLUCTUATION_DATA["Sayur Bayam & Sayuran Hijau"] = FLUCTUATION_DATA["Sayur Bayam Hijau (KWT Pekarangan)"];

        window.currentFluctuationCommodity = "Sayur Kangkung (KWT Pekarangan)";
        window.fluctuationChartInstance = null;

        window.changeFluctuationCommodity = function changeFluctuationCommodity(commodityKey) {
            if (!FLUCTUATION_DATA[commodityKey]) return;
            currentFluctuationCommodity = commodityKey;

            // Update status tombol aktif
            document.querySelectorAll('.fluct-tab-btn').forEach(btn => {
                btn.className = "fluct-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-stone-600 hover:text-stone-900 hover:bg-white cursor-pointer";
                btn.className = "fluct-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-stone-600 hover:text-stone-900 hover:bg-white cursor-pointer";
            });
            const activeBtn = document.getElementById(FLUCTUATION_DATA[commodityKey].btnId);
            if (activeBtn) {
                activeBtn.className = "fluct-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 bg-emerald-600 text-white shadow-xs cursor-pointer";
            }

            renderFluctuationChart(commodityKey);
        }

        window.renderFluctuationChart = function renderFluctuationChart(commodityKey) {
            const dataObj = FLUCTUATION_DATA[commodityKey] || FLUCTUATION_DATA["Beras Premium Lokal (Ciherang/IR64)"];
            if (!dataObj) return;

            // 1. Perbarui teks info harga & kotak advisory
            const titleEl = document.getElementById('fluctCommodityTitle');
            const trendBadge = document.getElementById('fluctTrendBadge');
            const pengepulDisplay = document.getElementById('fluctPengepulDisplay');
            const marketDisplay = document.getElementById('fluctMarketDisplay');
            const predictionDisplay = document.getElementById('fluctPredictionDisplay');
            const deltaDisplay = document.getElementById('fluctPredictionDelta');
            const volatilityBadge = document.getElementById('fluctVolatilityBadge');
            const producerAdv = document.getElementById('fluctProducerAdvisory');
            const consumerAdv = document.getElementById('fluctConsumerAdvisory');

            if (titleEl) titleEl.textContent = commodityKey;
            if (trendBadge) {
                trendBadge.className = `px-2 py-0.5 rounded-full text-[10px] font-bold border ${dataObj.trendBadgeClass}`;
                const icon = dataObj.trendType === 'UP' ? 'fa-arrow-trend-up' : (dataObj.trendType === 'DOWN' ? 'fa-arrow-trend-down' : 'fa-equals');
                trendBadge.innerHTML = `<i class="fa-solid ${icon} mr-1"></i> ${dataObj.trendBadgeText}`;
            }
            if (pengepulDisplay) pengepulDisplay.textContent = formatRupiah(dataObj.pengepulPrice);
            if (marketDisplay) marketDisplay.textContent = formatRupiah(dataObj.marketPrice);
            if (predictionDisplay) predictionDisplay.textContent = formatRupiah(dataObj.predictionH3);
            if (deltaDisplay) deltaDisplay.textContent = dataObj.deltaText;
            if (volatilityBadge) {
                volatilityBadge.className = `text-[10px] font-bold px-2 py-0.5 rounded-full ${dataObj.volatilityClass}`;
                volatilityBadge.textContent = dataObj.volatilityText;
            }
            if (producerAdv) producerAdv.textContent = dataObj.producerAdvisory;
            if (consumerAdv) consumerAdv.textContent = dataObj.consumerAdvisory;

            // 2. Render Chart.js Line Chart
            const canvas = document.getElementById('chartMarketFluctuation');
            if (!canvas) return;

            if (fluctuationChartInstance) {
                fluctuationChartInstance.destroy();
                fluctuationChartInstance = null;
            }

            const labels = ['H-7', 'H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini', 'H+1 (Prediksi)', 'H+2 (Prediksi)', 'H+3 (Prediksi)'];

            const ctx = canvas.getContext('2d');
            fluctuationChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Historis Riil Pasar Metro',
                            data: dataObj.historical,
                            borderColor: '#059669',
                            backgroundColor: 'rgba(5, 150, 105, 0.08)',
                            fill: true,
                            tension: 0.25,
                            borderWidth: 2.5,
                            pointBackgroundColor: '#059669',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 1.5,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Proyeksi Prediksi AI',
                            data: dataObj.prediction,
                            borderColor: '#d97706',
                            borderDash: [6, 5],
                            backgroundColor: 'rgba(217, 119, 6, 0.08)',
                            fill: true,
                            tension: 0.25,
                            borderWidth: 2.5,
                            pointBackgroundColor: '#d97706',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 1.5,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                boxWidth: 12,
                                font: { size: 11, family: 'Inter, sans-serif', weight: '600' },
                                color: '#44403c'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    if (context.parsed.y === null || context.parsed.y === undefined) return '';
                                    return `${context.dataset.label}: Rp ${Number(context.parsed.y).toLocaleString('id-ID')}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 10, family: 'Inter, sans-serif' },
                                color: '#78716c'
                            }
                        },
                        y: {
                            grid: { color: 'rgba(0, 0, 0, 0.05)' },
                            ticks: {
                                callback: function (value) {
                                    return 'Rp ' + Number(value).toLocaleString('id-ID');
                                },
                                font: { size: 10, family: 'monospace' },
                                color: '#78716c'
                            }
                        }
                    }
                }
            });
        }

        window.findMarketIntel = function findMarketIntel(commodityName) {
            if (!commodityName) return Object.values(LAMPUNG_MARKET_INTELLIGENCE)[0];
            if (LAMPUNG_MARKET_INTELLIGENCE[commodityName]) return LAMPUNG_MARKET_INTELLIGENCE[commodityName];
            const clean = commodityName.toLowerCase().trim();
            for (const [key, val] of Object.entries(LAMPUNG_MARKET_INTELLIGENCE)) {
                const keyClean = key.toLowerCase();
                if (keyClean.includes(clean) || clean.includes(keyClean)) return val;
                const words = clean.split(/[\s,()/-]+/).filter(w => w.length >= 4);
                for (const w of words) {
                    if (keyClean.includes(w)) return val;
                }
            }
            return Object.values(LAMPUNG_MARKET_INTELLIGENCE)[0];
        }

        window.handleCommodityChange = function handleCommodityChange() {
            const selectEl = document.getElementById('newListingName');
            if (!selectEl) return;
            const commodityName = selectEl.value;
            const intel = findMarketIntel(commodityName);

            const tengkulakInput = document.getElementById('newListingTengkulakPrice');
            const marketInput = document.getElementById('newListingMarketPrice');
            const priceInput = document.getElementById('newListingPrice');
            const catSelect = document.getElementById('newListingCategory');
            const freshnessInput = document.getElementById('newListingFreshness');

            const tengkulakDisplay = document.getElementById('intelTengkulakDisplay');
            const safeRangeDisplay = document.getElementById('intelSafeRangeDisplay');
            const marketDisplay = document.getElementById('intelMarketDisplay');
            const sourceDisplay = document.getElementById('intelSourceDisplay');
            const statusPill = document.getElementById('intelStatusPill');
            const labelMin = document.getElementById('gaugeLabelMin');
            const labelMid = document.getElementById('gaugeLabelMid');
            const labelMax = document.getElementById('gaugeLabelMax');
            const labelTengkulakMode = document.getElementById('labelTengkulakMode');
            const labelMarketMode = document.getElementById('labelMarketMode');

            if (catSelect && intel.category) catSelect.value = intel.category;
            if (freshnessInput && intel.freshnessDays) freshnessInput.value = intel.freshnessDays;

            // KUNCI PERMANEN: Input selalu readonly dan background abu-abu slate-100
            const lockIconTengkulak = document.getElementById('lockIconTengkulak');
            const lockIconMarket = document.getElementById('lockIconMarket');

            const pPrice = intel.pengepulPrice !== undefined ? intel.pengepulPrice : intel.tengkulakPrice;
            const mPrice = intel.marketLampungPrice !== undefined ? intel.marketLampungPrice : 10000;
            const recPrice = intel.recommendedPrice !== undefined ? intel.recommendedPrice : Math.round((pPrice + mPrice) / 2);

            if (tengkulakInput) {
                tengkulakInput.readOnly = true;
                tengkulakInput.className = "w-full h-10 pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-slate-100 text-stone-600 mono-num focus:outline-none cursor-not-allowed text-xs font-semibold";
                tengkulakInput.value = pPrice;
                if (lockIconTengkulak) lockIconTengkulak.innerHTML = '<i class="fa-solid fa-lock text-stone-400"></i>';
            }

            if (marketInput) {
                marketInput.readOnly = true;
                marketInput.className = "w-full h-10 pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-slate-100 text-stone-600 mono-num focus:outline-none cursor-not-allowed text-xs font-semibold";
                marketInput.value = mPrice;
                if (lockIconMarket) lockIconMarket.innerHTML = '<i class="fa-solid fa-lock text-stone-400"></i>';
            }

            if (priceInput) priceInput.value = recPrice;

            // Update Panel AI Market Intelligence
            if (tengkulakDisplay) tengkulakDisplay.textContent = formatRupiah(pPrice);
            if (safeRangeDisplay) safeRangeDisplay.textContent = `${formatRupiah(intel.safeMin || pPrice + 1000)} - ${formatRupiah(intel.safeMax || mPrice - 1000)}`;
            if (marketDisplay) marketDisplay.textContent = formatRupiah(mPrice);
            if (sourceDisplay) sourceDisplay.textContent = `Sumber: ${intel.dataSource || 'PIHPS & Pasar Kota Metro'}`;
            if (statusPill) {
                statusPill.textContent = "Data Faktual Terverifikasi";
                statusPill.className = "px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700";
            }

            if (labelMin) labelMin.textContent = formatRupiah(pPrice);
            if (labelMid) labelMid.textContent = `Optimal: ${formatRupiah(recPrice)}`;
            if (labelMax) labelMax.textContent = formatRupiah(mPrice);

            if (labelTengkulakMode) labelTengkulakMode.textContent = "Bawah (Kunci)";
            if (labelMarketMode) labelMarketMode.textContent = "Atas (Kunci)";

            // Jalankan validasi dynamic pricing
            validateDynamicPricing();
        }

        window.validateDynamicPricing = function validateDynamicPricing() {
            const selectEl = document.getElementById('newListingName');
            const priceInput = document.getElementById('newListingPrice');
            const submitBtn = document.getElementById('btnSubmitNewListing');
            const feedbackText = document.getElementById('pricingFeedbackText');
            const feedbackIcon = document.getElementById('pricingFeedbackIcon');
            const feedbackMsg = document.getElementById('pricingFeedbackMsg');
            const markerPin = document.getElementById('gaugePriceMarker');
            const tengkulakInput = document.getElementById('newListingTengkulakPrice');
            const marketInput = document.getElementById('newListingMarketPrice');

            if (!priceInput || !selectEl) return false;

            const tengkulak = Number(tengkulakInput?.value || 0);
            const marketLampung = Number(marketInput?.value || 0);
            const price = Number(priceInput.value || 0);

            // Hitung posisi visual gauge marker (0% - 100%)
            if (markerPin && tengkulak > 0 && marketLampung > tengkulak) {
                let markerPct = 50;
                if (price <= tengkulak) {
                    markerPct = Math.max(5, (price / Math.max(1, tengkulak)) * 20);
                } else if (price >= marketLampung) {
                    markerPct = Math.min(95, 80 + ((price - marketLampung) / (marketLampung * 0.2 || 1)) * 15);
                } else {
                    const span = Math.max(1, marketLampung - tengkulak);
                    markerPct = 20 + ((price - tengkulak) / span) * 60;
                }
                markerPin.style.left = `${markerPct}%`;
            }

            // Jika Harga Adil belum diisi
            if (price <= 0) {
                priceInput.className = "w-full px-3 py-2 rounded-lg border border-stone-300 mono-num focus:outline-none bg-white text-stone-900 text-xs font-bold";
                if (feedbackText) feedbackText.className = "text-[10px] text-stone-500 font-medium leading-tight flex items-start gap-1";
                if (feedbackIcon) feedbackIcon.className = "fa-solid fa-pen text-stone-400 mt-0.5 shrink-0";
                if (feedbackMsg) feedbackMsg.textContent = "Ketik harga adil penjualan yang Anda inginkan.";
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.className = "px-5 py-2 rounded-lg bg-stone-300 text-stone-500 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-not-allowed";
                }
                return false;
            }

            // ATURAN VALIDASI HARGA ADIL (STRICT):
            // 1. Jika Harga Adil <= Pengepul: Munculkan teks merah dan disable tombol Submit.
            if (price <= tengkulak) {
                priceInput.className = "w-full px-3 py-2 rounded-lg border border-rose-500 ring-1 ring-rose-400 mono-num focus:outline-none bg-rose-50/50 text-rose-900 transition-all text-xs font-bold";
                if (feedbackText) feedbackText.className = "text-[10px] text-rose-600 font-bold leading-tight flex items-start gap-1";
                if (feedbackIcon) feedbackIcon.className = "fa-solid fa-circle-xmark text-rose-500 mt-0.5 shrink-0";
                if (feedbackMsg) feedbackMsg.textContent = "Harga terlalu murah! Anda merugi di bawah batas harga pengepul.";
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.className = "px-5 py-2 rounded-lg bg-stone-300 text-stone-500 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-not-allowed";
                }
                return false;
            }

            // 2. Jika Harga Adil >= Pasar Lampung: Munculkan teks merah dan disable tombol Submit.
            if (price >= marketLampung) {
                priceInput.className = "w-full px-3 py-2 rounded-lg border border-rose-500 ring-1 ring-rose-400 mono-num focus:outline-none bg-rose-50/50 text-rose-900 transition-all text-xs font-bold";
                if (feedbackText) feedbackText.className = "text-[10px] text-rose-600 font-bold leading-tight flex items-start gap-1";
                if (feedbackIcon) feedbackIcon.className = "fa-solid fa-circle-xmark text-rose-500 mt-0.5 shrink-0";
                if (feedbackMsg) feedbackMsg.textContent = "Harga melebihi rata-rata pasar. Sistem menolak inflasi!";
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.className = "px-5 py-2 rounded-lg bg-stone-300 text-stone-500 text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-not-allowed";
                }
                return false;
            }

            // 3. Jika di antara batas (Harga Adil > Pengepul dan < Pasar): Lolos validasi koridor adil
            priceInput.className = "w-full px-3 py-2 rounded-lg border border-emerald-600 ring-1 ring-emerald-400/40 mono-num focus:outline-none bg-white text-stone-900 transition-all text-xs font-bold";
            if (feedbackText) feedbackText.className = "text-[10px] text-emerald-700 font-medium leading-tight flex items-start gap-1";
            if (feedbackIcon) feedbackIcon.className = "fa-solid fa-circle-check text-emerald-600 mt-0.5 shrink-0";
            if (feedbackMsg) feedbackMsg.textContent = "Harga Inklusif! Menguntungkan Anda & hemat bagi warga";
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.className = "px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer";
            }
            return true;
        }

        // Alias compatibility
        window.calculateRecommendedFairPrice = function calculateRecommendedFairPrice() {
            validateDynamicPricing();
        }

        window.initAiMarketIntelligence = function initAiMarketIntelligence() {
            handleCommodityChange();
        }

        window.handleCreateListing = function handleCreateListing(e) {
            e.preventDefault();
            const producerSid = document.getElementById('newListingProducerSid').value;
            const producer = window.appState.members.find(m => m.sid === producerSid);

            const name = (document.getElementById('newListingName')?.value || '').trim();
            if (!name || name === '') {
                showToast("Komoditas Belum Ada", "Belum ada komoditas kebun yang dipilih. Silakan tambahkan komoditas di Profil terlebih dahulu.", "warning");
                return;
            }

            // Validasi Ketat: Pastikan komoditas benar-benar ada di daftar kebun yang dihasilkan oleh produsen ini
            let myValidComms = [];
            if (Array.isArray(producer?.registeredCommodities)) {
                producer.registeredCommodities.forEach(c => {
                    const cName = typeof c === 'string' ? c : c.name;
                    if (cName) myValidComms.push(cName.toLowerCase().trim());
                });
            }
            if (producer?.producerCommodity && producer.producerCommodity !== '-') {
                producer.producerCommodity.split(',').forEach(c => {
                    if (c.trim()) myValidComms.push(c.toLowerCase().trim());
                });
            }
            (window.appState.listings || []).filter(l => l.producerSid === producerSid).forEach(l => {
                if (l.commodity) myValidComms.push(l.commodity.toLowerCase().trim());
            });

            if (myValidComms.length > 0 && !myValidComms.includes(name.toLowerCase())) {
                showToast("Komoditas Tidak Terdaftar", `Komoditas "${name}" tidak ada dalam daftar kebun yang dihasilkan oleh ${producer?.name || 'produsen'}. Tambahkan di Profil terlebih dahulu.`, "error");
                return;
            }

            const category = document.getElementById('newListingCategory').value;
            const qty = Number(document.getElementById('newListingQtyKg').value);
            const price = Number(document.getElementById('newListingPrice').value);
            const tengkulak = Number(document.getElementById('newListingTengkulakPrice')?.value || 0);
            const marketLampung = Number(document.getElementById('newListingMarketPrice')?.value || 999999);

            const intel = LAMPUNG_MARKET_INTELLIGENCE[name];

            // Validasi Dynamic Pricing Constraint Real-Time
            if (price <= tengkulak) {
                showToast("Validasi Harga Ditolak", "Harga terlalu murah! Anda merugi di bawah harga pengepul.", "error");
                return;
            }
            if (price >= marketLampung) {
                showToast("Validasi Harga Ditolak", "Harga melebihi rata-rata pasar. Sistem menolak inflasi!", "error");
                return;
            }

            const freshness = Number(document.getElementById('newListingFreshness').value || (intel ? intel.freshnessDays : 3));
            const loc = document.getElementById('newListingLocation').value;
            const desc = document.getElementById('newListingDesc').value;
            const plantDateVal = document.getElementById('newListingPlantDate')?.value || '';
            const harvestDateVal = document.getElementById('newListingHarvestDate')?.value || 'Hari Ini';
            const unit = name.toLowerCase().includes('telur') ? 'Butir' : 'Kg';

            const newListing = {
                id: `list-${String(window.appState.listings.length + 1).padStart(3, '0')}`,
                producerSid: producerSid,
                producerName: producer ? producer.name : 'Produsen RT 13 & KWT',
                commodity: name,
                category: category,
                unit: unit,
                plantDate: plantDateVal,
                harvestDate: harvestDateVal,
                initialHarvestKg: qty,
                localAbsorbedKg: 0,
                availableStockKg: qty,
                tengkulakPrice: tengkulak,
                fairPrice: price,
                freshnessWindow: `${freshness} Hari`,
                freshnessDaysRemaining: freshness,
                location: loc,
                distanceKm: producer ? producer.distanceKm : 0.08,
                isSpecialCase: false,
                caseTag: `Panen Baru (${producerSid})`,
                description: desc || (intel ? intel.description : 'Panen segar pekarangan binaan RT 13 & KWT.'),
                icon: category === 'Beras & Padi' ? 'fa-wheat-awn' : category === 'Lauk & Protein' ? (name.toLowerCase().includes('telur') ? 'fa-egg' : 'fa-fish') : 'fa-leaf'
            };

            window.appState.listings.unshift(newListing);
            document.getElementById('formNewListing').reset();
            closeModal('modalNewListing');
            renderMarketListings();
            showToast("Produk Panen Diterbitkan!", `${name} (${qty} ${unit}) siap dibeli warga RT 13 dengan harga adil ${formatRupiah(price)} / ${unit}.`, "success");
        }

        window.handleAddListing = handleCreateListing;


}

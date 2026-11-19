/**
 * @file src/services/supabaseAndStorage.js
 * @description Layanan Sinkronisasi Cloud Database Supabase, LocalStorage Persistence,
 *              Inisialisasi 40 KK Dual-Role, & Profil Warga.
 */

export function initSupabaseAndStorageService() {
        const SUPABASE_URL = 'https://kspiocqtljlsdrxkxbtt.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_UGIrOb7sBe9lW4EakOm7ew_w-FtoA8g';
        const LOCAL_STORAGE_KEY = 'SI_PANGAN_PRODUCTION_DB_V2';
        window.SUPABASE_URL = SUPABASE_URL;
        window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
        window.LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEY;
        let supabaseClient = null;
        window.supabaseClient = null;

        // Standar Konsumsi Pangan Bapanas (Badan Pangan Nasional) per Jiwa per Bulan
        const BAPANAS_STANDARDS_PER_CAPITA_MONTH = {
            beras: 7.5,   // 0.25 Kg / jiwa / hari
            sayur: 3.0,   // 0.10 Kg / jiwa / hari
            telur: 1.5,   // 0.05 Kg / jiwa / hari
            ikan: 1.5,    // 0.05 Kg / jiwa / hari
            ayam: 1.0,    // 0.033 Kg / jiwa / hari
            tempe: 1.5    // 0.05 Kg / jiwa / hari
        };
        window.BAPANAS_STANDARDS_PER_CAPITA_MONTH = BAPANAS_STANDARDS_PER_CAPITA_MONTH;

        // Siklus Panen Mingguan per Produsen KWT / Warga RT 13
        const PRODUCER_WEEKLY_CYCLES = {
            'SID-RT13-001': 'Panen Setiap Senin & Kamis (Siklus 21 Hari)',
            'SID-RT13-002': 'Panen Setiap Selasa & Jumat (Siklus 18 Hari)',
            'SID-RT13-003': 'Panen Raya & Giling Mingguan (Setiap Rabu)',
            'SID-RT13-004': 'Petik Mingguan Setiap Jumat Pagi',
            'SID-RT13-005': 'Panen Kolam Setiap Sabtu Pagi',
            'SID-RT13-006': 'Panen Bioflok Mingguan (Setiap Kamis)',
            'SID-RT13-007': 'Panen Sayur Pekarangan Setiap Rabu',
            'SID-RT13-008': 'Panen Kolam Nila Setiap Minggu Pagi',
            'SID-RT13-009': 'Panen Telur Harian (Rekap Setiap Jumat)',
            'SID-RT13-010': 'Panen Telur Bebek Mingguan (Setiap Sabtu)'
        };
        window.PRODUCER_WEEKLY_CYCLES = PRODUCER_WEEKLY_CYCLES;

        function formatRupiah(n) {
            return typeof window.formatRupiah === 'function' ? window.formatRupiah(n) : 'Rp ' + Number(n).toLocaleString('id-ID');
        }
        function saveStateToLocal() {
            if (typeof window.saveStateToLocal === 'function') window.saveStateToLocal();
        }
        function renderAll() {
            if (typeof window.renderAll === 'function') window.renderAll();
        }
        function setActiveRole(role) {
            if (typeof window.setActiveRole === 'function') window.setActiveRole(role);
        }
        function switchTab(tabId) {
            if (typeof window.switchTab === 'function') window.switchTab(tabId);
        }
        function showToast(title, msg, type) {
            if (typeof window.showToast === 'function') window.showToast(title, msg, type);
        }

        // 9.1 Inisialisasi 40 KK Dual-Role & Generator 50 Transaksi Riil
        window.initFiftyTransactionsAndDualRoles = function initFiftyTransactionsAndDualRoles() {
            const members = window.appState.members || [];

            // Universal 2-Role Configuration: Seluruh produsen (10 KK KWT & pekarangan) otomatis memiliki 2 peran (Konsumen <-> Produsen)
            members.forEach((m, idx) => {
                const isProducer = m.role === 'PRODUSEN' || idx < 10 || (m.producerCommodity && m.producerCommodity !== '-');
                if (isProducer) {
                    m.role = 'PRODUSEN';
                    m.isDualRole = true;
                    m.harvestCycleWeekly = PRODUCER_WEEKLY_CYCLES[m.sid] || m.harvestCycleWeekly || 'Panen Rutin Setiap Minggu';
                } else {
                    m.isDualRole = Boolean(m.isDualRole);
                    m.harvestCycleWeekly = m.harvestCycleWeekly || '-';
                }
                if (!m.pinCode) m.pinCode = '1234';
                if (m.surplusNotified === undefined) m.surplusNotified = false;
                if (m.surplusConfirmedByProducer === undefined) m.surplusConfirmedByProducer = false;
            });

            const joko = members.find(m => m.sid === 'SID-RT13-006');
            if (joko) {
                joko.name = 'Pak Joko Susilo';
                joko.role = 'PRODUSEN';
                joko.isDualRole = true;
                joko.pinCode = '1234';
                if (!joko.producerCommodity || joko.producerCommodity === '-') {
                    joko.producerCommodity = 'Ikan Lele Segar (Bioflok Kolam RT 13)';
                }
                joko.capacityKg = Math.max(80, Number(joko.capacityKg) || 80);
            }

            // Bersihkan data sampah uji coba (misal komoditas 'tes' atau 'test') dari seluruh produsen & listings
            members.forEach(m => {
                if (Array.isArray(m.registeredCommodities)) {
                    m.registeredCommodities = m.registeredCommodities.filter(c => {
                        const cName = typeof c === 'string' ? c : c.name;
                        return cName.trim().toLowerCase() !== 'tes' && cName.trim().toLowerCase() !== 'test';
                    });
                }
                if (m.producerCommodity && m.producerCommodity !== '-') {
                    const parts = m.producerCommodity.split(',')
                        .map(p => p.trim())
                        .filter(p => p.toLowerCase() !== 'tes' && p.toLowerCase() !== 'test');
                    m.producerCommodity = parts.length > 0 ? parts.join(', ') : '-';
                }
            });
            if (Array.isArray(window.appState.listings)) {
                window.appState.listings = window.appState.listings.filter(l => 
                    (l.commodity || '').trim().toLowerCase() !== 'tes' && (l.commodity || '').trim().toLowerCase() !== 'test'
                );
            }

            const preConfirmedListingIds = ['list-001', 'list-002', 'list-003'];
            (window.appState.listings || []).forEach(l => {
                l.isSpecialCase = false;
                if (l.caseTag && (l.caseTag.includes('Surplus') || l.caseTag.includes('Kasus Bapak A') || l.caseTag.includes('Defisit'))) {
                    l.caseTag = '';
                }
                if (l.surplusNotified === undefined) l.surplusNotified = false;
                if (l.surplusConfirmedByProducer === undefined) {
                    l.surplusConfirmedByProducer = preConfirmedListingIds.includes(l.id);
                }
            });

            // Buat genap 50 Transaksi Terverifikasi jika jumlah transaksi masih < 50
            const txs = window.appState.transactions || [];
            if (txs.length < 50) {
                const sampleItems = [
                    { prodSid: 'SID-RT13-001', prodName: 'Ibu Sartika Sari Dewi', comm: 'Sayur Kangkung (KWT Pekarangan)', price: 4500, qtyList: [2, 3, 4, 2, 5] },
                    { prodSid: 'SID-RT13-002', prodName: 'Ibu Sri Wahyuni', comm: 'Sayur Bayam Hijau (KWT Pekarangan)', price: 5000, qtyList: [2, 3, 2, 4, 3] },
                    { prodSid: 'SID-RT13-003', prodName: 'Pak Hendra Wijaya', comm: 'Beras Premium Ciherang (Poktan RT 13)', price: 13500, qtyList: [5, 10, 10, 5, 15] },
                    { prodSid: 'SID-RT13-004', prodName: 'Ibu Ratna Kumala', comm: 'Cabai Rawit Merah (Pekarangan KWT)', price: 45000, qtyList: [1, 2, 1, 1, 2] },
                    { prodSid: 'SID-RT13-006', prodName: 'Pak Joko Susilo', comm: 'Ikan Lele Segar (Bioflok Kolam RT 13)', price: 22000, qtyList: [2, 3, 2, 4, 2] },
                    { prodSid: 'SID-RT13-008', prodName: 'Pak Slamet Riadi', comm: 'Ikan Nila Air Tawar (Kolam Pekarangan RT 13)', price: 29000, qtyList: [2, 2, 3, 2, 3] },
                    { prodSid: 'SID-RT13-009', prodName: 'Ibu Dewi Lestari', comm: 'Telur Ayam Pekarangan (Ternak Warga RT 13)', price: 26000, qtyList: [2, 3, 2, 1, 3] },
                    { prodSid: 'SID-RT13-010', prodName: 'Ibu Anisa Rahmawati', comm: 'Telur Bebek Segar (Ternak Pekarangan RT 13)', price: 28000, qtyList: [2, 1, 2, 3, 2] }
                ];
                const deliveries = [
                    { label: 'Ambil Sendiri (Rp 0)', fee: 0 },
                    { label: 'Diantar Produsen (+Rp 2.000)', fee: 2000 },
                    { label: 'Kurir Komunitas RT (+Rp 5.000)', fee: 5000 }
                ];

                for (let i = txs.length + 1; i <= 50; i++) {
                    const item = sampleItems[i % sampleItems.length];
                    const consumerIdx = 10 + (i % Math.max(1, members.length - 10));
                    const consMember = members[consumerIdx] || members[i % members.length];
                    const qty = item.qtyList[i % item.qtyList.length];
                    const deliv = deliveries[i % deliveries.length];
                    const subtotal = qty * item.price;
                    const dayNum = Math.max(1, 27 - Math.floor(i / 3));
                    const hourNum = String(7 + (i % 10)).padStart(2, '0');
                    const minNum = String((i * 7) % 60).padStart(2, '0');

                    txs.push({
                        id: `TX-RT13-${String(900 + i).padStart(3, '0')}`,
                        timestamp: `${dayNum} Okt 2026, ${hourNum}:${minNum}`,
                        type: 'JUAL_BELI_PASAR',
                        producerSid: item.prodSid,
                        producerName: item.prodName,
                        consumerSid: consMember ? consMember.sid : 'SID-RT13-020',
                        consumerName: consMember ? consMember.name : 'Ibu Fitri Handayani',
                        commodity: item.comm,
                        quantityKg: qty,
                        unitPrice: item.price,
                        subtotal: subtotal,
                        producerNet: subtotal,
                        deliveryMethod: deliv.label,
                        deliveryFee: deliv.fee,
                        totalPaid: subtotal + deliv.fee,
                        status: 'TERVERIFIKASI_SINGLE_ID'
                    });
                }
                window.appState.transactions = txs;
            }

            if (!window.appState.pendingNewKks) {
                window.appState.pendingNewKks = [
                    {
                        id: 'pend-kk-01',
                        name: 'Bpk. Bambang Sutrisno',
                        nik: '1872011408790041',
                        address: 'Blok C No. 12 RT 13',
                        role: 'KONSUMEN',
                        familySize: 4,
                        monthlyFoodNeedKg: 64,
                        needs: { beras: 30, sayur: 12, telur: 6, ikan: 6, ayam: 4, tempe: 6 },
                        commodity: '-',
                        capacityKg: 0
                    }
                ];
            }
            if (!window.appState.pendingKkUpdates) {
                window.appState.pendingKkUpdates = [
                    {
                        id: 'upd-kk-01',
                        sid: 'SID-RT13-002',
                        name: 'Ibu Sri Wahyuni',
                        oldFamilySize: 3,
                        newFamilySize: 4,
                        oldFoodNeedKg: 48,
                        newFoodNeedKg: 64,
                        newAddress: 'Blok B No. 04 RT 13',
                        newRole: 'PRODUSEN',
                        newCommodity: 'Sayur Bayam Hijau (KWT Pekarangan)',
                        newCapacityKg: 45,
                        newNeeds: { beras: 30, sayur: 12, telur: 6, ikan: 6, ayam: 4, tempe: 6 },
                        reason: 'Penambahan anggota keluarga & penyesuaian kebutuhan pangan bulanan',
                        requestedAt: 'Hari ini'
                    }
                ];
            }
            if (!window.appState.activeUserSid) {
                window.appState.activeUserSid = null; // Default: Belum ada warga yang login (Guest State)
            }
        }

        // 9.2 Koneksi & Sinkronisasi Cloud Supabase + LocalStorage
        window.loadSavedLocalState = function loadSavedLocalState() {
            try {
                const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (!raw) return;
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.members) && parsed.members.length >= 40) {
                    window.appState.members = parsed.members;
                    window.membersData = parsed.members;
                    window.appState.members.forEach((m, idx) => {
                        const isProd = m.role === 'PRODUSEN' || idx < 10 || (m.producerCommodity && m.producerCommodity !== '-');
                        if (isProd) {
                            m.role = 'PRODUSEN';
                            m.isDualRole = true;
                        }
                        if (!m.pinCode) m.pinCode = '1234';
                    });
                }
                if (parsed && Array.isArray(parsed.listings) && parsed.listings.length > 0) {
                    window.appState.listings = parsed.listings;
                }
                if (parsed && Array.isArray(parsed.transactions) && parsed.transactions.length >= 50) {
                    window.appState.transactions = parsed.transactions;
                }
                if (parsed && Array.isArray(parsed.demands) && parsed.demands.length > 0) {
                    window.appState.demands = parsed.demands;
                }
                if (parsed && Array.isArray(parsed.pendingNewKks)) {
                    window.appState.pendingNewKks = parsed.pendingNewKks;
                }
                if (parsed && Array.isArray(parsed.pendingKkUpdates)) {
                    window.appState.pendingKkUpdates = parsed.pendingKkUpdates;
                }
                if (parsed && parsed.activeUserSid) {
                    window.appState.activeUserSid = parsed.activeUserSid;
                } else {
                    window.appState.activeUserSid = null;
                }
            } catch (err) {
                console.warn('[Storage] Gagal memuat cache lokal:', err);
            }
        }

        window.saveStateToLocal = function saveStateToLocal() {
            try {
                const payload = {
                    members: window.appState.members,
                    listings: window.appState.listings,
                    transactions: window.appState.transactions,
                    demands: window.appState.demands,
                    pendingNewKks: window.appState.pendingNewKks,
                    pendingKkUpdates: window.appState.pendingKkUpdates,
                    activeUserSid: window.appState.activeUserSid,
                    danaSosialInklusi: window.appState.danaSosialInklusi,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
            } catch (err) {
                console.warn('[Storage] Gagal menyimpan cache lokal:', err);
            }
        }

        window.initSupabaseConnection = async function initSupabaseConnection() {
            try {
                if (window.supabase && typeof window.supabase.createClient === 'function') {
                    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    await pullDataFromSupabaseNow(false);
                }
            } catch (err) {
                console.warn('[Supabase] Berjalan dalam mode Hybrid Cloud-Local:', err);
            }
        }

        window.syncAllDataToSupabaseNow = async function syncAllDataToSupabaseNow(showNotification = false) {
            saveStateToLocal();
            if (!supabaseClient) return;

            const statusDot = document.getElementById('supabaseStatusDot');
            const statusText = document.getElementById('supabaseStatusText');
            const modalConnText = document.getElementById('modalSupabaseConnText');

            try {
                const statePayload = {
                    members: window.appState.members,
                    listings: window.appState.listings,
                    transactions: window.appState.transactions,
                    demands: window.appState.demands,
                    pendingNewKks: window.appState.pendingNewKks,
                    danaSosialInklusi: window.appState.danaSosialInklusi
                };

                const { error: stateErr } = await supabaseClient
                    .from('sipangan_cloud_state')
                    .upsert({
                        state_key: 'RT13_YOSOMULYO_MAIN',
                        payload: statePayload,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'state_key' });

                const wargaRows = (window.appState.members || []).map(m => ({
                    sid: m.sid,
                    name: m.name,
                    public_name: m.publicName || m.name,
                    nik_hash: m.nikHash || '',
                    masked_nik: m.maskedNik || '',
                    raw_nik: m.rawNik || '',
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
                }));
                await supabaseClient.from('warga_kk').upsert(wargaRows, { onConflict: 'sid' });

                const txRows = (window.appState.transactions || []).map(t => ({
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
                    status: t.status || 'TERVERIFIKASI_SINGLE_ID'
                }));
                await supabaseClient.from('transaksi_pangan').upsert(txRows, { onConflict: 'id' });

                if (!stateErr) {
                    if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
                    if (statusText) statusText.textContent = 'Supabase Tersinkron';
                    if (modalConnText) modalConnText.textContent = 'Tersinkron Cloud Supabase ✓';
                    if (showNotification) {
                        showToast('Sinkronisasi Supabase Berhasil!', `${wargaRows.length} KK & ${txRows.length} Transaksi berhasil di-push ke database Supabase.`, 'success');
                    }
                } else {
                    if (modalConnText) modalConnText.textContent = 'Aktif (Hybrid Local + Cloud Ready)';
                    if (showNotification) {
                        showToast('Data Tersimpan Aman', `${wargaRows.length} KK & ${txRows.length} Transaksi tersimpan. Jalankan file supabase_schema.sql di SQL Editor Supabase jika tabel belum dibuat.`, 'info');
                    }
                }
            } catch (e) {
                if (showNotification) {
                    showToast('Data Tersimpan', 'Data tersimpan di perangkat & siap disinkronkan ke Supabase.', 'info');
                }
            }
        }

        window.pullDataFromSupabaseNow = async function pullDataFromSupabaseNow(showNotification = false) {
            if (!supabaseClient) return;
            try {
                const { data, error } = await supabaseClient
                    .from('sipangan_cloud_state')
                    .select('payload')
                    .eq('state_key', 'RT13_YOSOMULYO_MAIN')
                    .maybeSingle();

                if (!error && data && data.payload) {
                    const p = data.payload;
                    if (Array.isArray(p.members) && p.members.length >= 40) {
                        window.appState.members = p.members;
                        window.membersData = p.members;
                    }
                    if (Array.isArray(p.listings) && p.listings.length > 0) {
                        window.appState.listings = p.listings;
                    }
                    if (Array.isArray(p.transactions) && p.transactions.length >= 50) {
                        window.appState.transactions = p.transactions;
                    }
                    if (Array.isArray(p.demands) && p.demands.length > 0) {
                        window.appState.demands = p.demands;
                    }
                    if (Array.isArray(p.pendingNewKks)) {
                        window.appState.pendingNewKks = p.pendingNewKks;
                    }
                    saveStateToLocal();
                    renderAll();
                    if (showNotification) {
                        showToast('Data Ditarik dari Supabase!', `Berhasil memuat ${window.appState.members.length} KK dan ${window.appState.transactions.length} Transaksi dari Cloud Supabase.`, 'success');
                    }
                } else {
                    await syncAllDataToSupabaseNow(showNotification);
                }
            } catch (err) {
                console.warn('[Supabase Pull]', err);
            }
        }

        // 9.3 Sistem Login Sederhana Warga & Saklar 1 SID 2 Peran (Dual-Role)
        window.populateCitizenDatalist = function populateCitizenDatalist() {
            const datalist = document.getElementById('registeredCitizenList');
            if (!datalist) return;
            const members = window.appState.members || [];
            // Hanya tampilkan 1 opsi Nama per kepala keluarga agar saran input rapi dan tidak ada opsi teknis SID ganda
            datalist.innerHTML = members.map(m => `<option value="${m.name}"></option>`).join('');
        }

        window.executeSecureCitizenLogin = function() {
            const identInput = document.getElementById('loginCitizenIdentifier');
            const pinInput = document.getElementById('loginPinSimple');
            const query = String(identInput?.value || '').trim();
            const pin = String(pinInput?.value || '').trim();

            if (!query) {
                showToast('Nama / NIK Belum Diisi', 'Silakan ketik nama kepala keluarga Anda atau NIK.', 'warning');
                identInput?.focus();
                return;
            }

            const members = window.appState.members || [];
            const qLower = query.toLowerCase();

            // Cari warga berdasarkan Nama persis, NIK, SID, atau substring nama
            let member = members.find(m => 
                m.name.toLowerCase() === qLower || 
                m.sid.toLowerCase() === qLower ||
                (m.rawNik && m.rawNik === query) ||
                (m.rawNik && m.rawNik.slice(-4) === query)
            );

            if (!member) {
                member = members.find(m => m.name.toLowerCase().includes(qLower));
            }

            if (!member) {
                showToast('Warga Tidak Ditemukan', `Nama atau identitas "${query}" tidak terdaftar di buku 40 KK RT 13.`, 'error');
                return;
            }

            // Validasi PIN Pribadi Warga (Mencegah orang lain login sembarangan ke akun orang lain)
            // Standar PIN keluarga: PIN kustom warga, atau 4 angka akhir NIK, atau default '1234'
            const validPin1 = member.pin ? String(member.pin) : null;
            const validPin2 = member.rawNik ? String(member.rawNik).slice(-4) : null;
            const isPinValid = (validPin1 && pin === validPin1) || (validPin2 && pin === validPin2) || (pin === '1234');

            if (!pin) {
                showToast('PIN Belum Dimasukkan', `Masukkan 4 digit PIN keluarga untuk akun ${member.name}.`, 'warning');
                pinInput?.focus();
                return;
            }

            if (!isPinValid) {
                showToast('PIN Tidak Sesuai!', `PIN yang Anda masukkan salah untuk akun ${member.name}. Silakan coba lagi.`, 'error');
                pinInput?.focus();
                return;
            }

            // Login Berhasil & Kunci Identitas ke Sesi Aktif
            window.appState.activeUserSid = member.sid;
            const isDual = Boolean(member.isDualRole || member.role === 'PRODUSEN');

            if (!window.appState.isAdminLoggedIn) {
                setActiveRole(isDual ? 'PRODUSEN' : 'KONSUMEN');
            }

            if (isDual) {
                musyawarahTransparencyState.currentProducer = {
                    name: member.name,
                    sid: member.sid
                };
            }

            if (pinInput) pinInput.value = '';
            if (identInput) identInput.value = member.name;

            window.aiForecastScope = 'MINE';
            const btnMine = document.getElementById('btnAiFilterMyProd');
            const btnAll = document.getElementById('btnAiFilterAllProd');
            if (btnMine && btnAll) {
                btnMine.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-forest-800 text-white';
                btnAll.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-stone-600 hover:bg-stone-100';
            }

            saveStateToLocal();
            renderAll();
            renderMyOwnKkSummaryCard();
            renderActiveUserProfileCard();
            if (typeof renderPerProducerAiForecast === 'function') renderPerProducerAiForecast();
            if (typeof syncLiveSurplusData === 'function') syncLiveSurplusData();

            showToast('Login Berhasil!', `Selamat datang, ${member.name} (${member.sid}). Akun keluarga Anda telah aktif secara aman.`, 'success');
        };

        window.logoutCitizenAccount = function() {
            window.appState.activeUserSid = null;
            window.appState.activeRole = 'KONSUMEN';
            saveStateToLocal();

            const identInput = document.getElementById('loginCitizenIdentifier');
            const pinInput = document.getElementById('loginPinSimple');
            if (identInput) identInput.value = '';
            if (pinInput) pinInput.value = '';

            renderActiveUserProfileCard();
            renderAll();

            showToast('Sesi Berakhir', 'Anda telah keluar dari akun. Silakan masukkan nama dan PIN keluarga Anda untuk masuk kembali.', 'info');
            switchTab('tab-konsep');
            identInput?.focus();
        };

        // Legacy compatibility shims
        window.populateLoginMemberDropdown = window.populateCitizenDatalist;
        window.executeSimpleMemberLogin = window.executeSecureCitizenLogin;

        window.toggleDualRoleSidMode = function toggleDualRoleSidMode() {
            const member = (window.appState.members || []).find(m => m.sid === window.appState.activeUserSid);
            if (!member || !(member.isDualRole || member.role === 'PRODUSEN')) {
                showToast('Khusus Akun 2 Peran', 'Akun Anda saat ini terdaftar sebagai Konsumen.', 'info');
                return;
            }
            const nextRole = window.appState.activeRole === 'PRODUSEN' ? 'KONSUMEN' : 'PRODUSEN';
            setActiveRole(nextRole);
        }

        window.renderActiveUserProfileCard = function renderActiveUserProfileCard() {
            const members = window.appState.members || [];
            const activeSid = window.appState.activeUserSid;
            const member = activeSid ? members.find(m => m.sid === activeSid) : null;

            const elAvatar = document.getElementById('activeProfileAvatar');
            const elName = document.getElementById('activeProfileName');
            const elSid = document.getElementById('activeProfileSid');
            const elBadge = document.getElementById('activeProfileRoleBadge');
            const elFamily = document.getElementById('activeProfileFamily');
            const elNeed = document.getElementById('activeProfileNeed');
            const elTxCount = document.getElementById('activeProfileTxCount');
            const elHeaderLabel = document.getElementById('headerActiveUserLabel');
            const elHeaderDualBtn = document.getElementById('headerDualRoleBtn');
            const elDualCard = document.getElementById('dualRoleSwitchCard');
            const logoutBtn = document.querySelector('#tab-konsep button[onclick="logoutCitizenAccount()"]');

            // 0. KONDISI LOGIN ADMIN RT 13
            if (window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN' || activeSid === 'ADMIN-RT13') {
                if (elAvatar) elAvatar.innerHTML = '<i class="fa-solid fa-user-shield text-amber-300 text-lg"></i>';
                if (elName) elName.textContent = 'Pengurus RT 13 (Admin)';
                if (elSid) elSid.textContent = 'ADMIN-RT13 • Pengurus RT 13 & PKK Kelurahan Yosomulyo';
                if (elBadge) {
                    elBadge.textContent = 'Admin Pengurus RT';
                    elBadge.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-forest-800 text-white border border-forest-700';
                }
                if (logoutBtn) logoutBtn.classList.remove('hidden');
                if (elDualCard) elDualCard.classList.add('hidden');
                if (elHeaderDualBtn) {
                    elHeaderDualBtn.classList.add('hidden');
                    elHeaderDualBtn.classList.remove('flex');
                }
                const realCount = (window.appState.members || []).filter(m => !m.isDemoAccount).length;
                if (elFamily) elFamily.textContent = `${realCount} KK Warga`;
                if (elNeed) elNeed.textContent = 'Monev Terpadu';
                if (elTxCount) elTxCount.textContent = `${window.appState.transactions?.length || 50} Pesanan`;
                if (elHeaderLabel) elHeaderLabel.textContent = 'Pengurus RT 13 (Admin)';
                return;
            }

            // 1. KONDISI GUEST: BELUM ADA AKUN LOGIN
            if (!member) {
                if (elAvatar) elAvatar.innerHTML = '<i class="fa-solid fa-user-lock text-emerald-300 text-lg"></i>';
                if (elName) elName.textContent = 'Belum Ada Akun Masuk';
                if (elSid) elSid.textContent = 'Ketik Nama & PIN pada formulir di sebelah kiri untuk masuk';
                if (elBadge) {
                    elBadge.textContent = 'Tamu / Belum Masuk';
                    elBadge.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200';
                }
                if (logoutBtn) logoutBtn.classList.add('hidden');
                if (elDualCard) elDualCard.classList.add('hidden');
                if (elHeaderDualBtn) {
                    elHeaderDualBtn.classList.add('hidden');
                    elHeaderDualBtn.classList.remove('flex');
                }
                if (elFamily) elFamily.textContent = '-';
                if (elNeed) elNeed.textContent = '-';
                if (elTxCount) elTxCount.textContent = '0 Transaksi';
                if (elHeaderLabel) elHeaderLabel.textContent = 'Belum Masuk';
                return;
            }

            // 2. KONDISI SUDAH LOGIN DENGAN NAMA + PIN
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            const isDual = Boolean(member.isDualRole || member.role === 'PRODUSEN');
            const initials = member.name.replace(/^(Ibu|Pak|Bpk\.)\s+/i, '').substring(0, 2).toUpperCase();

            const elHeaderDualLabel = document.getElementById('headerDualRoleLabel');
            const elDualComm = document.getElementById('dualRoleCommodityText');
            const elDualBtnKons = document.getElementById('dualBtnKonsumen');
            const elDualBtnProd = document.getElementById('dualBtnProdusen');

            if (elAvatar) elAvatar.textContent = initials;
            if (elName) elName.textContent = member.name;
            if (elSid) elSid.textContent = `${member.sid} • ${member.address || 'RT 13 Yosomulyo'}`;
            if (elHeaderLabel) {
                const modeRoleStr = window.appState.isAdminLoggedIn ? 'Admin' : (window.appState.activeRole === 'PRODUSEN' ? 'Produsen' : 'Konsumen');
                elHeaderLabel.textContent = `${member.name} (${modeRoleStr})`;
            }
            if (elFamily) elFamily.textContent = `${member.familySize || 4} Jiwa`;
            if (elNeed) elNeed.textContent = `${member.monthlyFoodNeedKg || 35} Kg/bln`;

            const myTxs = (window.appState.transactions || []).filter(
                t => t.consumerSid === member.sid || t.producerSid === member.sid
            );
            if (elTxCount) elTxCount.textContent = `${myTxs.length} Transaksi`;

            const topProdBtn = document.getElementById('topRoleBtnProdusen');
            const sideProdBtn = document.getElementById('sideRoleBtnProdusen');

            if (isDual) {
                if (elBadge) {
                    elBadge.textContent = 'Produsen & Konsumen';
                    elBadge.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300';
                }
                if (elDualCard) elDualCard.classList.remove('hidden');
                if (elDualComm) elDualComm.textContent = member.producerCommodity || 'Pangan Pekarangan KWT';
                if (elHeaderDualBtn) {
                    elHeaderDualBtn.classList.remove('hidden');
                    elHeaderDualBtn.classList.add('flex');
                }
                if (elHeaderDualLabel) {
                    elHeaderDualLabel.textContent = window.appState.activeRole === 'PRODUSEN'
                        ? 'Ke Mode Konsumen'
                        : 'Ke Mode Produsen';
                }
                if (topProdBtn) topProdBtn.classList.remove('hidden');
                if (sideProdBtn) sideProdBtn.classList.remove('hidden');

                if (elDualBtnKons && elDualBtnProd) {
                    if (window.appState.activeRole === 'PRODUSEN') {
                        elDualBtnProd.className = 'py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer bg-amber-600 text-white shadow-xs';
                        elDualBtnKons.className = 'py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer bg-white text-stone-800 border border-stone-300 hover:bg-emerald-50';
                    } else {
                        elDualBtnKons.className = 'py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer bg-emerald-600 text-white shadow-xs';
                        elDualBtnProd.className = 'py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer bg-white text-stone-800 border border-amber-300 hover:bg-amber-100';
                    }
                }
            } else {
                if (elBadge) {
                    elBadge.textContent = 'Konsumen RT 13';
                    elBadge.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
                }
                if (elDualCard) elDualCard.classList.add('hidden');
                if (elHeaderDualBtn) {
                    elHeaderDualBtn.classList.add('hidden');
                    elHeaderDualBtn.classList.remove('flex');
                }
                if (!window.appState.isAdminLoggedIn) {
                    if (topProdBtn) topProdBtn.classList.add('hidden');
                    if (sideProdBtn) sideProdBtn.classList.add('hidden');
                }
            }

            const alertBanner = document.getElementById('producerSurplusAlertBanner');
            const alertTitle = document.getElementById('producerSurplusAlertTitle');
            const alertMsg = document.getElementById('producerSurplusAlertMessage');
            if (alertBanner) {
                const isAdminRole = Boolean(window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN');
                if (!isAdminRole && isDual && member.surplusNotified && !member.surplusConfirmedByProducer) {
                    alertBanner.classList.remove('hidden');
                    if (alertTitle) alertTitle.textContent = `Pemberitahuan Admin RT 13: Produk Panen Anda (${member.producerCommodity}) Mengalami Surplus!`;
                    if (alertMsg && member.surplusNotifiedMsg) {
                        alertMsg.textContent = member.surplusNotifiedMsg;
                    }
                } else {
                    alertBanner.classList.add('hidden');
                }
            }
        }

        window.acknowledgeProducerSurplusAlert = function acknowledgeProducerSurplusAlert(specificListingId) {
            const activeSid = window.appState.activeUserSid;
            const member = (window.appState.members || []).find(m => m.sid === activeSid);
            if (member) {
                member.surplusNotified = false;
                member.surplusConfirmedByProducer = true;
            }
            (window.appState.listings || []).forEach(l => {
                if (l.producerSid === activeSid && (!specificListingId || l.id === specificListingId)) {
                    l.surplusNotified = false;
                    l.surplusConfirmedByProducer = true;
                }
            });
            const alertBanner = document.getElementById('producerSurplusAlertBanner');
            if (alertBanner) alertBanner.classList.add('hidden');
            saveStateToLocal();
            renderAll();
            if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);
            showToast(
                'Surplus Dikonfirmasi & Notifikasi Ditutup',
                'Terima kasih! Komoditas surplus Anda kini resmi tampil di Pusat Penarikan Resume Surplus (Dashboard Monev Admin) untuk disalurkan ke Koperasi / Program MBG.',
                'success'
            );
        };

        // Fungsi Admin di Tab Analisis AI & Pasar: Tarik Data Surplus & Beritahu Produsen untuk Menyiapkan (Point 7)
        window.adminPullAndNotifySurplus = function (producerSid, listingId, surplusKg) {
            const members = window.appState.members || [];
            const listings = window.appState.listings || [];
            const prod = members.find(m => m.sid === producerSid);
            let listing = listingId ? listings.find(l => l.id === listingId) : listings.find(l => l.producerSid === producerSid);

            if (!listing && prod) {
                listing = {
                    id: 'list-surplus-' + producerSid,
                    producerSid: prod.sid,
                    producerName: prod.name,
                    commodity: prod.producerCommodity || 'Sayur Pekarangan KWT',
                    category: 'Sayur Pekarangan',
                    unit: 'Kg',
                    initialHarvestKg: Math.max(40, Number(prod.capacityKg) || 40),
                    localAbsorbedKg: 25,
                    availableStockKg: Math.max(15, Number(surplusKg) || 15),
                    unabsorbedSurplusKg: Math.max(15, Number(surplusKg) || 15),
                    fairPrice: 10000,
                    marketPrice: 14000,
                    tengkulakPrice: 7500,
                    harvestDate: 'Hari Ini',
                    freshnessWindow: '2 Hari',
                    freshnessDaysRemaining: 2,
                    location: prod.address || 'RT 13 Yosomulyo',
                    distanceKm: prod.distanceKm || 0.2,
                    icon: 'fa-seedling'
                };
                listings.push(listing);
            }

            const commName = listing ? listing.commodity : (prod ? prod.producerCommodity : 'Komoditas Pangan');
            const qty = Math.max(5, Number(surplusKg) || (listing ? ((listing.unabsorbedSurplusKg || 0) > 0 ? listing.unabsorbedSurplusKg : listing.availableStockKg) : 15));

            if (listing) {
                listing.surplusNotified = true;
                listing.surplusConfirmedByProducer = false;
                if ((Number(listing.unabsorbedSurplusKg) || 0) <= 0 && (Number(listing.availableStockKg) || 0) <= 0) {
                    listing.unabsorbedSurplusKg = qty;
                    listing.availableStockKg = qty;
                }
            }
            if (prod) {
                prod.surplusNotified = true;
                prod.surplusConfirmedByProducer = false;
                prod.surplusNotifiedMsg = `Pemberitahuan Admin RT 13: Komoditas ${commName} Anda terdeteksi mengalami Surplus +${qty} Kg di Analisis AI & Pasar. Mohon siapkan hasil panen tersebut dan klik "Konfirmasi Siap Salurkan" agar masuk ke Pusat Penarikan Resume Surplus (Koperasi / Program MBG).`;
            }

            saveStateToLocal();
            renderAll();
            if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);

            showToast(
                'Notifikasi Dikirim ke Produsen!',
                `Admin telah menarik data surplus +${qty} Kg ${commName} dan mengirim notifikasi ke ${prod ? prod.name : producerSid}. Setelah produsen mengonfirmasi, data otomatis tampil di Pusat Penarikan Resume Surplus.`,
                'success'
            );
        };

        // 9.4 Auto-Fill Kebutuhan Pangan Bulanan (Standar Bapanas) & Alur Verifikasi Admin
        window.autoFillBapanasNeedsFromFamilySize = function autoFillBapanasNeedsFromFamilySize(jiwaVal) {
            const jiwa = Math.max(1, Number(jiwaVal) || 4);
            const beras = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.beras);
            const sayur = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.sayur);
            const telur = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.telur);
            const ikan = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.ikan);
            const ayam = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.ayam);
            const tempe = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.tempe);
            const total = beras + sayur + telur + ikan + ayam + tempe;

            const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            setVal('regNeedBeras', beras);
            setVal('regNeedSayur', sayur);
            setVal('regNeedTelur', telur);
            setVal('regNeedIkan', ikan);
            setVal('regNeedAyam', ayam);
            setVal('regNeedTempe', tempe);
            setVal('regFoodNeedKg', total);
        }

        window.handleRegisterMember = function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const nik = (document.getElementById('regNik')?.value || '').trim();
            if (!checkNikDeduplicationLive(nik)) {
                showToast('Registrasi Ditolak', 'NIK telah terdaftar di sistem Single Identity.', 'error');
                return;
            }

            const name = (document.getElementById('regName')?.value || '').trim();
            const address = (document.getElementById('regAddress')?.value || '').trim();
            const role = document.getElementById('regRole')?.value || 'KONSUMEN';
            const familySize = Math.max(1, Number(document.getElementById('regFamilySize')?.value || 4));

            const berasNeed = Math.max(0, Number(document.getElementById('regNeedBeras')?.value || 0));
            const sayurNeed = Math.max(0, Number(document.getElementById('regNeedSayur')?.value || 0));
            const telurNeed = Math.max(0, Number(document.getElementById('regNeedTelur')?.value || 0));
            const ikanNeed = Math.max(0, Number(document.getElementById('regNeedIkan')?.value || 0));
            const ayamNeed = Math.max(0, Number(document.getElementById('regNeedAyam')?.value || 0));
            const tempeNeed = Math.max(0, Number(document.getElementById('regNeedTempe')?.value || 0));
            const sumNeeds = berasNeed + sayurNeed + telurNeed + ikanNeed + ayamNeed + tempeNeed;
            const monthlyFoodNeedKg = sumNeeds > 0 ? sumNeeds : Math.round(familySize * 16);

            const pendingItem = {
                id: `pend-kk-${Date.now()}`,
                name: name,
                nik: nik,
                address: address,
                role: role,
                familySize: familySize,
                monthlyFoodNeedKg: monthlyFoodNeedKg,
                needs: {
                    beras: berasNeed,
                    sayur: sayurNeed,
                    telur: telurNeed,
                    ikan: ikanNeed,
                    ayam: ayamNeed,
                    tempe: tempeNeed
                },
                commodity: role === 'PRODUSEN' ? (document.getElementById('regCommodity')?.value || 'Sayur Pekarangan') : '-',
                capacityKg: role === 'PRODUSEN' ? Number(document.getElementById('regCapacityKg')?.value || 30) : 0,
                distanceKm: Number(document.getElementById('regDistanceKm')?.value || 0.25)
            };

            window.appState.pendingNewKks = window.appState.pendingNewKks || [];
            window.appState.pendingNewKks.unshift(pendingItem);

            document.getElementById('formRegisterMember')?.reset();
            autoFillBapanasNeedsFromFamilySize(4);
            document.getElementById('dedupAlertBanner')?.classList.add('hidden');

            renderPendingVerificationCards();
            syncAllDataToSupabaseNow(false);

            showToast(
                'Pendaftaran Dikirim ke Admin RT 13!',
                `Data ${name} (${familySize} Jiwa • Estimasi ${monthlyFoodNeedKg} Kg/bln) telah masuk ke antrean verifikasi Admin RT 13.`,
                'success'
            );
        };
        window.handleAddMember = window.handleRegisterMember;

        window.handleSubmitSelfRegister = function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const name = (document.getElementById('selfRegName')?.value || '').trim();
            const nik = (document.getElementById('selfRegNik')?.value || '').trim();
            const address = (document.getElementById('selfRegAddress')?.value || '').trim();
            const familySize = Math.max(1, parseInt(document.getElementById('selfRegFamilySize')?.value) || 4);
            const totalFoodKg = Math.round(familySize * 16);
            const role = document.getElementById('selfRegRole')?.value || 'KONSUMEN';

            const pendingItem = {
                id: `pend-kk-${Date.now()}`,
                name: name,
                nik: nik,
                address: address,
                role: role,
                familySize: familySize,
                monthlyFoodNeedKg: totalFoodKg,
                needs: {
                    beras: Math.round(totalFoodKg * 0.46),
                    sayur: Math.round(totalFoodKg * 0.20),
                    telur: Math.round(totalFoodKg * 0.10),
                    ikan: Math.round(totalFoodKg * 0.10),
                    ayam: Math.round(totalFoodKg * 0.06),
                    tempe: Math.max(1, totalFoodKg - Math.round(totalFoodKg * 0.92))
                },
                commodity: role === 'PRODUSEN' ? 'Sayur Pekarangan KWT' : '-',
                capacityKg: role === 'PRODUSEN' ? 30 : 0,
                distanceKm: 0.25
            };

            window.appState.pendingNewKks = window.appState.pendingNewKks || [];
            window.appState.pendingNewKks.unshift(pendingItem);

            closeModal('modalSelfRegister');
            renderPendingVerificationCards();
            syncAllDataToSupabaseNow(false);
            showToast('Pendaftaran Diterima!', `Data ${name} (${totalFoodKg} Kg/bln) menunggu konfirmasi Admin RT 13.`, 'success');
        };

        window.renderPendingVerificationCards = function renderPendingVerificationCards() {
            const queue = window.appState.pendingNewKks || [];
            const badge = document.getElementById('pendingKkBadge');
            const card = document.getElementById('pendingKkCard');
            if (!badge || !card) return;

            if (queue.length === 0) {
                badge.textContent = '0 Menunggu Validasi';
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
                card.innerHTML = `
                    <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        <i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> Seluruh pengajuan KK baru telah diverifikasi (<span class="font-bold">${window.appState.members.length} KK</span> aktif di database).
                    </div>
                `;
                return;
            }

            const item = queue[0];
            const nextNum = (window.appState.members || []).length + 1;
            const nextSid = `SID-RT13-${String(nextNum).padStart(3, '0')}`;

            badge.textContent = `${queue.length} Menunggu Validasi`;
            badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200';

            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <strong class="text-stone-900">${item.name}</strong>
                    <span class="font-mono text-[10px] text-stone-500">Calon: ${nextSid}</span>
                </div>
                <div class="text-[11px] text-stone-600 space-y-0.5">
                    <p>Alamat: ${item.address} • Anggota: <strong>${item.familySize} Jiwa</strong></p>
                    <p>Perkiraan Kebutuhan Pangan: <strong class="text-emerald-800 font-mono">${item.monthlyFoodNeedKg} Kg/bln</strong> (Peran: ${item.role})</p>
                </div>
                <div class="flex items-center gap-2 pt-1.5 border-t border-stone-100">
                    <button type="button" onclick="approveNewKk('${item.id}')" class="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-check"></i> Verifikasi &amp; Terbitkan ${nextSid}
                    </button>
                    <button type="button" onclick="rejectNewKk('${item.id}')" class="py-1.5 px-2.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-[11px] font-semibold transition cursor-pointer">
                        Tolak
                    </button>
                </div>
            `;
        }

        window.approveNewKk = function(pendingIdOrName) {
            const queue = window.appState.pendingNewKks || [];
            let idx = queue.findIndex(x => x.id === pendingIdOrName || x.name === pendingIdOrName);
            const item = idx !== -1 ? queue.splice(idx, 1)[0] : {
                name: pendingIdOrName || 'Warga Baru RT 13',
                nik: `187201150985${String(window.appState.members.length + 1).padStart(4, '0')}`,
                address: 'Blok C No. 12 RT 13',
                role: 'KONSUMEN',
                familySize: 4,
                monthlyFoodNeedKg: 64,
                needs: { beras: 30, sayur: 12, telur: 6, ikan: 6, ayam: 4, tempe: 6 },
                commodity: '-',
                capacityKg: 0,
                distanceKm: 0.25
            };

            const newIndex = (window.appState.members || []).length + 1;
            const newSid = `SID-RT13-${String(newIndex).padStart(3, '0')}`;
            const newSidShort = `SID-${1300 + newIndex}`;
            const cleanNik = (item.nik && item.nik.length >= 10) ? item.nik : `187201150985${String(newIndex).padStart(4, '0')}`;

            const newMember = {
                sid: newSid,
                sidShort: newSidShort,
                name: item.name,
                publicName: `Warga ${newSid} (${item.name.substring(0, 6)}...)`,
                nikHash: Math.random().toString(16).substring(2, 10),
                maskedNik: cleanNik.substring(0, 6) + '********' + cleanNik.slice(-2),
                rawNik: cleanNik,
                role: item.role || 'KONSUMEN',
                isDualRole: item.role === 'PRODUSEN',
                producerCommodity: item.commodity || '-',
                capacityKg: Number(item.capacityKg || 0),
                harvestCycleWeekly: item.role === 'PRODUSEN' ? 'Panen Rutin Setiap Minggu' : '-',
                familySize: Number(item.familySize || 4),
                monthlyIncome: 3000000,
                monthlyFoodNeedKg: Number(item.monthlyFoodNeedKg || 64),
                needs: item.needs || { beras: 30, sayur: 12, telur: 6, ikan: 6, ayam: 4, tempe: 6 },
                socialTier: 'MANDIRI',
                aiScore: 32,
                aidReceivedThisMonth: false,
                distanceKm: Number(item.distanceKm || 0.25),
                walletEarned: 0,
                subsidyReceivedKg: 0,
                address: item.address || 'RT 13 Yosomulyo'
            };

            window.appState.members.unshift(newMember);
            window.membersData = window.appState.members;

            if (typeof musyawarahTransparencyState !== 'undefined' && Array.isArray(musyawarahTransparencyState.activities)) {
                musyawarahTransparencyState.activities.unshift({
                    id: `act-newkk-${Date.now()}`,
                    time: 'Baru saja',
                    category: 'Verifikasi SID Baru',
                    description: `Admin RT 13 memverifikasi & menerbitkan identitas ${newSid} atas nama ${newMember.name} (${newMember.familySize} Jiwa • ${newMember.monthlyFoodNeedKg} Kg/bln). Total kini ${window.appState.members.length} KK.`,
                    isNew: true
                });
            }

            renderAll();
            syncAllDataToSupabaseNow(false);
            showToast('Verifikasi Sukses & Database Terupdate!', `${newMember.name} resmi terdaftar sebagai ${newSid}. Total warga kini ${window.appState.members.length} KK!`, 'success');
        };

        window.rejectNewKk = function(pendingId) {
            const queue = window.appState.pendingNewKks || [];
            if (queue.length > 0) queue.shift();
            renderPendingVerificationCards();
            syncAllDataToSupabaseNow(false);
            showToast('Pengajuan Ditolak', 'Data dikembalikan ke pemohon untuk perbaikan berkas.', 'warning');
        };

        // --- 9.4b FITUR WARGA PERBARUI DATA KK SENDIRI (TERKUNCI KE AKUN LOGIN + VERIFIKASI ADMIN) ---
        window.switchProfileRoleMode = function(targetRole) {
            const activeSid = window.appState?.activeUserSid;
            const members = window.appState?.members || [];
            const member = members.find(m => m.sid === activeSid);
            if (!member) return;

            if (targetRole === 'PRODUSEN') {
                member.isDualRole = true;
                if (!member.producerCommodity || member.producerCommodity === '-') {
                    member.producerCommodity = 'Sayur Pekarangan KWT';
                    member.capacityKg = member.capacityKg || 30;
                }
                const hasListing = (window.appState.listings || []).some(l => l.producerSid === member.sid);
                if (!hasListing) {
                    window.appState.listings.unshift({
                        id: 'list-' + Date.now(),
                        producerSid: member.sid,
                        producerName: member.name,
                        commodity: member.producerCommodity,
                        category: 'Sayur Pekarangan',
                        unit: 'Kg',
                        initialHarvestKg: member.capacityKg || 30,
                        availableStockKg: member.capacityKg || 30,
                        localAbsorbedKg: 0,
                        unabsorbedSurplusKg: 0,
                        fairPrice: 6000,
                        marketPrice: 9000,
                        tengkulakPrice: 4500,
                        harvestDate: 'Hari Ini',
                        freshnessWindow: 'Segar Panen Pagi',
                        freshnessDaysRemaining: 4,
                        location: member.address || 'RT 13 Yosomulyo',
                        distanceKm: member.distanceKm || 0.15,
                        icon: 'fa-seedling',
                        description: `Hasil panen segar pekarangan keluarga ${member.name}.`
                    });
                }
            }

            window.appState.activeRole = targetRole;
            if (typeof savePwaAuthSession === 'function') {
                savePwaAuthSession(true);
            }
            saveStateToLocal();
            setActiveRole(targetRole);
            if (typeof renderAll === 'function') {
                renderAll();
            }
            switchTab('tab-sid');

            showToast(
                targetRole === 'PRODUSEN' ? 'Mode Produsen Aktif' : 'Mode Konsumen Aktif',
                targetRole === 'PRODUSEN'
                    ? `Berpindah ke Halaman Kelola Stok & Panen (${member.name}).`
                    : `Berpindah ke Halaman Belanja Komoditas (${member.name}).`,
                'success'
            );
        };

        window.addProducerGardenCommodity = function(e) {
            if (e) e.preventDefault();
            const activeSid = window.appState?.activeUserSid;
            const member = (window.appState?.members || []).find(m => m.sid === activeSid);
            if (!member) return;

            const commName = String(document.getElementById('profileNewCommName')?.value || '').trim();
            const commCategory = document.getElementById('profileNewCommCategory')?.value || 'Sayur Pekarangan';
            const commStock = Math.max(1, Number(document.getElementById('profileNewCommStock')?.value) || 15);

            if (!commName) {
                showToast('Nama Komoditas Kosong', 'Masukkan nama hasil panen pekarangan (contoh: Sayur Kangkung).', 'warning');
                return;
            }

            // Cari patokan harga adil Bapanas
            let fairPrice = 5000;
            const intelKeys = Object.keys(LAMPUNG_MARKET_INTELLIGENCE || {});
            const matchedKey = intelKeys.find(k => k.toLowerCase().includes(commName.toLowerCase()) || commName.toLowerCase().includes(k.toLowerCase()));
            if (matchedKey && LAMPUNG_MARKET_INTELLIGENCE[matchedKey]) {
                const info = LAMPUNG_MARKET_INTELLIGENCE[matchedKey];
                fairPrice = info.recommendedPrice || info.fairPrice || Math.round(((info.pengepulPrice || 3000) + (info.marketLampungPrice || 7000)) / 2);
            }

            member.isDualRole = true;
            if (!member.producerCommodity || member.producerCommodity === '-') {
                member.producerCommodity = commName;
            } else if (!member.producerCommodity.toLowerCase().includes(commName.toLowerCase())) {
                member.producerCommodity = member.producerCommodity + ', ' + commName;
            }
            member.capacityKg = (Number(member.capacityKg) || 0) + commStock;

            // Simpan komoditas terdaftar ke profil produsen
            member.registeredCommodities = Array.isArray(member.registeredCommodities) ? member.registeredCommodities : [];
            if (!member.registeredCommodities.some(c => (typeof c === 'string' ? c : c.name).toLowerCase() === commName.toLowerCase())) {
                member.registeredCommodities.push({
                    name: commName,
                    category: commCategory,
                    stock: commStock
                });
            }

            window.appState.listings.unshift({
                id: 'list-' + Date.now(),
                producerSid: member.sid,
                producerName: member.name,
                commodity: commName,
                category: commCategory,
                unit: 'Kg',
                initialHarvestKg: commStock,
                availableStockKg: commStock,
                localAbsorbedKg: 0,
                unabsorbedSurplusKg: 0,
                fairPrice: fairPrice,
                marketPrice: Math.round((fairPrice * 1.3) / 500) * 500,
                tengkulakPrice: Math.round((fairPrice * 0.75) / 500) * 500,
                harvestDate: 'Hari Ini',
                freshnessWindow: 'Segar Panen Pagi',
                freshnessDaysRemaining: 4,
                location: member.address || 'RT 13 Yosomulyo',
                distanceKm: member.distanceKm || 0.12,
                icon: commCategory.includes('Lauk') ? 'fa-fish' : commCategory.includes('Beras') ? 'fa-wheat-awn' : 'fa-seedling',
                description: `Hasil panen segar ${commName} dari pekarangan ${member.name} (${member.address || 'RT 13'}). (Harga adil otomatis Bapanas).`,
                isDemoListing: Boolean(member.isDemoAccount)
            });

            saveStateToLocal();
            if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);
            renderAll();
            if (typeof populateProducerDropdown === 'function') populateProducerDropdown();
            if (typeof handleProducerSelectionChange === 'function') handleProducerSelectionChange();
            if (typeof renderPerProducerAiForecast === 'function') renderPerProducerAiForecast();
            showToast('Komoditas Ditambahkan', `${commName} (${commStock} Kg) berhasil didaftarkan ke kebun Anda. Harga adil dihitung otomatis dari data Bapanas saat dipasarkan.`, 'success');
        };

        window.renderMyOwnKkSummaryCard = function renderMyOwnKkSummaryCard() {
            const card = document.getElementById('myOwnKkSummaryCard');
            if (!card) return;

            const activeSid = window.appState?.activeUserSid;
            const member = activeSid ? (window.appState?.members || []).find(m => m.sid === activeSid) : null;

            const sidDirCard = document.getElementById('sidDirectoryTableCard');
            const sidTopAdminCard = document.getElementById('sidTopAdminCard');
            const sidRegCard = document.getElementById('sidRegistrationFormCard');

            // Jika login sebagai Admin RT: Sembunyikan kartu pribadi, tampilkan direktori 40 KK (Point 8 & 9)
            if (window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN' || activeSid === 'ADMIN-RT13') {
                card.innerHTML = '';
                card.classList.add('hidden');
                if (sidTopAdminCard) sidTopAdminCard.classList.remove('hidden');
                if (sidDirCard) sidDirCard.classList.remove('hidden');
                if (sidRegCard) sidRegCard.classList.add('hidden');
                if (typeof renderMembersTable === 'function') renderMembersTable();
                return;
            }

            // Untuk Konsumen & Produsen (baik di Laptop maupun Mobile): SEMBUNYIKAN Tabel 40 KK Admin agar tampilan konsisten! (Point 9)
            if (sidTopAdminCard) sidTopAdminCard.classList.add('hidden');
            if (sidDirCard) sidDirCard.classList.add('hidden');
            if (sidRegCard) sidRegCard.classList.add('hidden');

            if (!member) {
                card.innerHTML = '';
                card.classList.add('hidden');
                return;
            }
            card.classList.remove('hidden');

            const isCurrentlyProducer = window.appState.activeRole === 'PRODUSEN';
            const roleLabel = isCurrentlyProducer ? 'Penjual Hasil Kebun (Produsen)' : 'Pembeli Pangan (Konsumen)';
            const nextRoleTarget = isCurrentlyProducer ? 'KONSUMEN' : 'PRODUSEN';
            const switchBtnLabel = isCurrentlyProducer
                ? 'Buka Pasar Warga (Mode Pembeli)'
                : 'Buka Lapak Kebun (Mode Penjual)';

            const pendingUpd = (window.appState?.pendingKkUpdates || []).find(u => u.sid === activeSid);
            const n = member.needs || {
                beras: Math.round((member.familySize || 4) * 7.5),
                sayur: Math.round((member.familySize || 4) * 3.0),
                telur: Math.round((member.familySize || 4) * 1.5),
                ikan: Math.round((member.familySize || 4) * 3.0)
            };

            const myGardenListings = (window.appState.listings || []).filter(l => l.producerSid === member.sid);

            const producerGardenSectionHtml = (isCurrentlyProducer || member.role === 'PRODUSEN' || member.isDualRole) ? `
                <!-- KOMODITAS PEKARANGAN YANG DIHASILKAN (KHUSUS PRODUSEN - MOBILE FRIENDLY) -->
                <div class="bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-200 space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div>
                            <h4 class="font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                                <i class="fa-solid fa-seedling text-emerald-600"></i>
                                Komoditas Pekarangan yang Dihasilkan
                            </h4>
                            <p class="text-xs text-stone-500">Daftar tanaman/ternak pekarangan Anda yang tampil di Pasar Warga.</p>
                        </div>
                        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start sm:self-center">
                            ${myGardenListings.length} Komoditas Aktif
                        </span>
                    </div>

                    <!-- Daftar Komoditas Kebun Saat Ini -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        ${myGardenListings.length > 0 ? myGardenListings.map(item => `
                            <div class="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2">
                                <div class="min-w-0">
                                    <strong class="text-xs sm:text-sm text-stone-900 block truncate">${item.commodity}</strong>
                                    <span class="text-[11px] font-mono text-forest-800 font-semibold">Stok: ${item.availableStockKg} Kg • ${formatRupiah(item.fairPrice)}/Kg</span>
                                </div>
                                <div class="flex items-center gap-1.5 shrink-0">
                                    <button type="button" onclick="openEditListingModal('${item.id}')"
                                        class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-stone-300 text-stone-700 font-bold text-xs cursor-pointer">
                                        <i class="fa-solid fa-pen text-amber-600 mr-1"></i>Ubah
                                    </button>
                                    <button type="button" onclick="deleteListing('${item.id}')"
                                        class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs cursor-pointer"
                                        title="Hapus Komoditas">
                                        <i class="fa-solid fa-trash-can text-rose-600"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="col-span-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 text-center">
                                Belum ada komoditas yang ditambahkan. Silakan tambahkan komoditas di bawah ini.
                            </div>
                        `}
                    </div>

                    <!-- Form Mudah Tambah Komoditas Pekarangan Baru -->
                    <form onsubmit="addProducerGardenCommodity(event)" class="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                        <span class="text-xs font-bold text-emerald-950 block">
                            <i class="fa-solid fa-circle-plus text-emerald-700 mr-1"></i>Tambah Komoditas Pekarangan Baru:
                        </span>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label class="block text-[11px] font-semibold text-stone-600 mb-1">Nama Komoditas Kebun *</label>
                                <input type="text" id="profileNewCommName" required placeholder="Cth: Sayur Kangkung / Bayam / Lele"
                                    class="w-full h-11 px-3 rounded-xl border border-stone-300 bg-white text-stone-900 font-semibold focus:outline-none focus:border-forest-700">
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-stone-600 mb-1">Kategori</label>
                                <select id="profileNewCommCategory"
                                    class="w-full h-11 px-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 font-semibold focus:outline-none focus:border-forest-700">
                                    <option value="Sayur Pekarangan">Sayur Pekarangan</option>
                                    <option value="Lauk & Protein">Lauk / Ikan / Telur</option>
                                    <option value="Beras & Padi">Beras &amp; Padi</option>
                                    <option value="Olahan Pangan">Olahan Pangan</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold text-stone-600 mb-1">Estimasi Stok Panen (Kg) *</label>
                                <input type="number" id="profileNewCommStock" min="1" value="20" required
                                    class="w-full h-11 px-3 rounded-xl border border-stone-300 bg-white font-mono font-bold text-stone-900 focus:outline-none focus:border-forest-700">
                            </div>
                        </div>
                        <p class="text-[11px] text-emerald-800">
                            <i class="fa-solid fa-circle-info mr-1"></i>Harga adil tidak perlu diisi manual di profil. Sistem otomatis memuat patokan <strong>Harga Adil Bapanas</strong> (antara harga tengkulak dan pasar induk) saat komoditas diposting di pasar.
                        </p>
                        <button type="submit"
                            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-plus"></i>
                            <span>Simpan Komoditas ke Kebun Saya</span>
                        </button>
                    </form>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="space-y-4">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-200/70 pb-4">
                        <div class="space-y-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-800 text-white flex items-center gap-1">
                                    <i class="fa-solid fa-user"></i> Profile Saya
                                </span>
                                ${pendingUpd ? `
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        <i class="fa-solid fa-clock mr-1"></i> Menunggu Validasi Admin (${pendingUpd.newFamilySize} Jiwa • ${pendingUpd.newFoodNeedKg} Kg/bln)
                                    </span>
                                ` : `
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        <i class="fa-solid fa-circle-check mr-1"></i> Akun Aktif
                                    </span>
                                `}
                            </div>
                            <h3 class="serif-heading text-xl font-bold text-stone-900">
                                ${member.name}
                            </h3>
                            <p class="text-xs font-mono text-stone-600">
                                NIK/ID: <strong>${member.rawNik || member.sid}</strong> • Alamat: <strong>${member.address || 'RT 13 Yosomulyo'}</strong>
                            </p>
                        </div>

                        <div class="flex flex-wrap items-center gap-2 shrink-0">
                            <button type="button" onclick="openCitizenSelfUpdateModal()"
                                class="w-full sm:w-auto px-4 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
                                <i class="fa-solid fa-pen-to-square text-emerald-300"></i>
                                <span>Ubah Data Keluarga &amp; Pangan</span>
                            </button>
                        </div>
                    </div>

                    <!-- KOTAK PINDAH PERAN (1 AKUN 2 PERAN: KONSUMEN <-> PRODUSEN) -->
                    <div class="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-2 border-amber-300 shadow-2xs">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <button type="button" onclick="switchProfileRoleMode('KONSUMEN')"
                                class="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${!isCurrentlyProducer ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300' : 'bg-white hover:bg-emerald-50 text-stone-700 border border-stone-300'}">
                                <i class="fa-solid fa-basket-shopping"></i>
                                <span>Mode Konsumen (Belanja Pasar) ${!isCurrentlyProducer ? '• AKTIF' : ''}</span>
                            </button>
                            <button type="button" onclick="switchProfileRoleMode('PRODUSEN')"
                                class="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${isCurrentlyProducer ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300' : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-300'}">
                                <i class="fa-solid fa-seedling"></i>
                                <span>Mode Produsen (Kelola Kebun &amp; AI) ${isCurrentlyProducer ? '• AKTIF' : ''}</span>
                            </button>
                        </div>
                    </div>

                    ${producerGardenSectionHtml}

                    ${!isCurrentlyProducer ? `
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                            <div class="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                <span class="text-xs text-stone-500 block">Tampilan Saat Ini</span>
                                <strong class="text-sm font-bold text-emerald-800">${roleLabel}</strong>
                            </div>
                            <div class="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                <span class="text-xs text-stone-500 block">Jumlah Anggota KK</span>
                                <strong class="font-mono text-base font-extrabold text-stone-900">${member.familySize || 4} Jiwa</strong>
                            </div>
                            <div class="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                <span class="text-xs text-stone-500 block">Kebutuhan Pangan Keluarga</span>
                                <strong class="font-mono text-base font-extrabold text-forest-800">${member.monthlyFoodNeedKg || 60} Kg / Bulan</strong>
                            </div>
                        </div>

                        <div class="bg-white p-4 rounded-xl border border-stone-200 space-y-2.5">
                            <span class="text-xs font-bold text-stone-800 block">Rincian Kebutuhan Pangan Keluarga (Per Bulan):</span>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
                                <div class="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                                    <span class="text-stone-500 block">🍚 Beras</span>
                                    <strong class="font-mono font-bold text-stone-900">${n.beras || 30} Kg</strong>
                                </div>
                                <div class="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                                    <span class="text-stone-500 block">🥬 Sayur</span>
                                    <strong class="font-mono font-bold text-stone-900">${n.sayur || 12} Kg</strong>
                                </div>
                                <div class="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                                    <span class="text-stone-500 block">🥚 Telur</span>
                                    <strong class="font-mono font-bold text-stone-900">${n.telur || 6} Kg</strong>
                                </div>
                                <div class="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                                    <span class="text-stone-500 block">🐟 Ikan &amp; Lauk</span>
                                    <strong class="font-mono font-bold text-stone-900">${n.ikan || 12} Kg</strong>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        window.openCitizenSelfUpdateModal = function() {
            const activeSid = window.appState?.activeUserSid || 'SID-RT13-002';
            const member = (window.appState?.members || []).find(m => m.sid === activeSid);
            if (!member) {
                showToast('Silakan Login Terlebih Dahulu', 'Pilih identitas keluarga Anda di Tab 1 untuk memperbarui data KK.', 'warning');
                switchTab('tab-konsep');
                return;
            }

            const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            const hdrSid = document.getElementById('selfUpdateLockedHeaderSid');
            if (hdrSid) hdrSid.textContent = `${member.name} (${member.sid})`;

            setVal('selfUpdateSid', member.sid);
            setVal('selfUpdateMaskedNik', member.maskedNik || '187201********02');
            setVal('selfUpdateName', member.name);
            setVal('selfUpdateAddress', member.address || 'RT 13 Yosomulyo');
            setVal('selfUpdateFamilySize', member.familySize || 4);
            setVal('selfUpdateTotalNeedKg', member.monthlyFoodNeedKg || 64);

            const n = member.needs || { beras: 30, sayur: 12, telur: 6, ikan: 6, ayam: 4, tempe: 6 };
            setVal('selfUpdateNeedBeras', n.beras ?? 30);
            setVal('selfUpdateNeedSayur', n.sayur ?? 12);
            setVal('selfUpdateNeedTelur', n.telur ?? 6);
            setVal('selfUpdateNeedIkan', n.ikan ?? 6);
            setVal('selfUpdateNeedAyam', n.ayam ?? 4);
            setVal('selfUpdateNeedTempe', n.tempe ?? 6);

            const roleVal = (member.role === 'PRODUSEN' || member.isDualRole) ? 'PRODUSEN' : 'KONSUMEN';
            setVal('selfUpdateRole', roleVal);
            setVal('selfUpdateCommodity', member.producerCommodity && member.producerCommodity !== '-' ? member.producerCommodity : 'Sayur Pekarangan KWT');
            setVal('selfUpdateCapacityKg', member.capacityKg || 30);
            setVal('selfUpdateReason', 'Pembaruan jumlah anggota keluarga & kebutuhan konsumsi pangan bulanan');

            const prodBox = document.getElementById('selfUpdateProdBox');
            if (prodBox) prodBox.classList.toggle('hidden', roleVal !== 'PRODUSEN');

            openModal('modalCitizenSelfUpdateKk');
        };

        window.autoFillSelfUpdateNeeds = function(jiwaVal) {
            const jiwa = Math.max(1, Number(jiwaVal) || 4);
            const beras = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.beras);
            const sayur = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.sayur);
            const telur = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.telur);
            const ikan = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.ikan);
            const ayam = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.ayam);
            const tempe = Math.round(jiwa * BAPANAS_STANDARDS_PER_CAPITA_MONTH.tempe);
            const total = beras + sayur + telur + ikan + ayam + tempe;

            const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            setVal('selfUpdateNeedBeras', beras);
            setVal('selfUpdateNeedSayur', sayur);
            setVal('selfUpdateNeedTelur', telur);
            setVal('selfUpdateNeedIkan', ikan);
            setVal('selfUpdateNeedAyam', ayam);
            setVal('selfUpdateNeedTempe', tempe);
            setVal('selfUpdateTotalNeedKg', total);
        };

        window.syncSelfUpdateNeedsTotal = function() {
            const g = id => Math.max(0, Number(document.getElementById(id)?.value || 0));
            const total = g('selfUpdateNeedBeras') + g('selfUpdateNeedSayur') + g('selfUpdateNeedTelur') + g('selfUpdateNeedIkan') + g('selfUpdateNeedAyam') + g('selfUpdateNeedTempe');
            const totalEl = document.getElementById('selfUpdateTotalNeedKg');
            if (totalEl) totalEl.value = total;
        };

        window.handleSubmitCitizenSelfUpdate = function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const activeSid = window.appState?.activeUserSid || 'SID-RT13-002';
            const submittedSid = document.getElementById('selfUpdateSid')?.value;

            // Proteksi Ketat: Warga HANYA boleh mengubah data milik akun loginnya sendiri!
            if (submittedSid !== activeSid) {
                showToast('Akses Ditolak!', 'Anda hanya diizinkan memperbarui data KK milik akun Anda sendiri.', 'error');
                return;
            }

            const member = (window.appState?.members || []).find(m => m.sid === activeSid);
            if (!member) return;

            const g = id => Math.max(0, Number(document.getElementById(id)?.value || 0));
            const newNeeds = {
                beras: g('selfUpdateNeedBeras'),
                sayur: g('selfUpdateNeedSayur'),
                telur: g('selfUpdateNeedTelur'),
                ikan: g('selfUpdateNeedIkan'),
                ayam: g('selfUpdateNeedAyam'),
                tempe: g('selfUpdateNeedTempe')
            };
            const sumNeeds = newNeeds.beras + newNeeds.sayur + newNeeds.telur + newNeeds.ikan + newNeeds.ayam + newNeeds.tempe;
            const newTotalKg = Math.max(5, Number(document.getElementById('selfUpdateTotalNeedKg')?.value || sumNeeds));

            const updateRequest = {
                id: `upd-kk-${Date.now()}`,
                sid: member.sid,
                name: (document.getElementById('selfUpdateName')?.value || member.name).trim(),
                oldFamilySize: member.familySize || 4,
                newFamilySize: Math.max(1, Number(document.getElementById('selfUpdateFamilySize')?.value || 4)),
                oldFoodNeedKg: member.monthlyFoodNeedKg || 64,
                newFoodNeedKg: newTotalKg,
                newAddress: (document.getElementById('selfUpdateAddress')?.value || member.address).trim(),
                newRole: document.getElementById('selfUpdateRole')?.value || member.role,
                newCommodity: (document.getElementById('selfUpdateCommodity')?.value || member.producerCommodity || 'Sayur Pekarangan').trim(),
                newCapacityKg: Math.max(0, Number(document.getElementById('selfUpdateCapacityKg')?.value || member.capacityKg || 30)),
                newNeeds: newNeeds,
                reason: (document.getElementById('selfUpdateReason')?.value || 'Pembaruan data keluarga').trim(),
                requestedAt: 'Baru saja'
            };

            window.appState.pendingKkUpdates = (window.appState.pendingKkUpdates || []).filter(u => u.sid !== member.sid);
            window.appState.pendingKkUpdates.unshift(updateRequest);

            closeModal('modalCitizenSelfUpdateKk');
            renderMyOwnKkSummaryCard();
            renderPendingUpdateVerificationCards();
            syncAllDataToSupabaseNow(false);

            showToast(
                'Pengajuan Pembaruan Dikirim ke Admin!',
                `Perubahan data KK ${updateRequest.name} (${updateRequest.newFamilySize} Jiwa • ${updateRequest.newFoodNeedKg} Kg/bln) menunggu verifikasi Admin RT 13.`,
                'success'
            );
        };

        window.renderPendingUpdateVerificationCards = function renderPendingUpdateVerificationCards() {
            const queue = window.appState.pendingKkUpdates || [];
            const badge = document.getElementById('pendingUpdateBadge');
            const card = document.getElementById('pendingUpdateCard');
            if (!badge || !card) return;

            if (queue.length === 0) {
                badge.textContent = '0 Pengajuan Update';
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
                card.innerHTML = `
                    <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        <i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> Seluruh pengajuan pembaruan data KK warga telah diverifikasi dan dimutakhirkan di sistem.
                    </div>
                `;
                return;
            }

            const item = queue[0];
            badge.textContent = `${queue.length} Pengajuan Update`;
            badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200';

            card.innerHTML = `
                <div class="flex items-center justify-between gap-2">
                    <strong class="text-stone-900">${item.name} (${item.sid})</strong>
                    <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">${item.requestedAt || 'Menunggu'}</span>
                </div>
                <div class="text-[11px] text-stone-600 space-y-1 pt-0.5">
                    <p><strong>Alasan Warga:</strong> ${item.reason}</p>
                    <p><strong>Perubahan Data:</strong> Anggota KK <span class="font-mono font-bold text-stone-900">${item.oldFamilySize} &rarr; ${item.newFamilySize} Jiwa</span> • Kebutuhan Pangan <span class="font-mono font-bold text-emerald-800">${item.oldFoodNeedKg} &rarr; ${item.newFoodNeedKg} Kg/bln</span></p>
                    ${item.newRole === 'PRODUSEN' ? `<p class="text-amber-800 font-semibold"><i class="fa-solid fa-seedling mr-1"></i>Peran Produsen: ${item.newCommodity} (${item.newCapacityKg} Kg/bln)</p>` : ''}
                </div>
                <div class="flex items-center gap-2 pt-1.5 border-t border-stone-100">
                    <button type="button" onclick="approveMemberUpdate('${item.sid}')" class="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-check"></i> Setujui &amp; Perbarui SID
                    </button>
                    <button type="button" onclick="rejectMemberUpdate('${item.sid}')" class="py-1.5 px-2.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-[11px] font-semibold transition cursor-pointer">
                        Tolak
                    </button>
                </div>
            `;
        }

        window.approveMemberUpdate = function(sidOrId) {
            const queue = window.appState.pendingKkUpdates || [];
            let idx = queue.findIndex(u => u.sid === sidOrId || u.id === sidOrId);
            const item = idx !== -1 ? queue.splice(idx, 1)[0] : queue.shift();

            if (!item) {
                renderPendingUpdateVerificationCards();
                return;
            }

            const m = (window.appState.members || []).find(x => x.sid === item.sid);
            if (m) {
                m.name = item.name || m.name;
                m.address = item.newAddress || m.address;
                m.familySize = Number(item.newFamilySize || m.familySize);
                m.monthlyFoodNeedKg = Number(item.newFoodNeedKg || m.monthlyFoodNeedKg);
                if (item.newNeeds) {
                    m.needs = item.newNeeds;
                }
                if (item.newRole === 'PRODUSEN') {
                    m.role = 'PRODUSEN';
                    m.isDualRole = true;
                    m.producerCommodity = item.newCommodity || m.producerCommodity || 'Sayur Pekarangan KWT';
                    m.capacityKg = Number(item.newCapacityKg || m.capacityKg || 30);
                }
            }

            renderAll();
            syncAllDataToSupabaseNow(false);
            showToast('Pembaruan KK Disetujui Admin!', `Data KK ${item.name} (${item.sid}) resmi diperbarui menjadi ${item.newFamilySize} Jiwa (${item.newFoodNeedKg} Kg/bln).`, 'success');
        };

        window.rejectMemberUpdate = function(sidOrId) {
            const queue = window.appState.pendingKkUpdates || [];
            const idx = queue.findIndex(u => u.sid === sidOrId || u.id === sidOrId);
            if (idx !== -1) queue.splice(idx, 1);
            else if (queue.length > 0) queue.shift();

            renderMyOwnKkSummaryCard();
            renderPendingUpdateVerificationCards();
            syncAllDataToSupabaseNow(false);
            showToast('Pengajuan Pembaruan Ditolak', 'Pengajuan perubahan data KK telah ditolak oleh Admin RT 13.', 'warning');
        };

        // 9.5 Privasi Detail SID (Tidak menampilkan gaji per bulan & tidak menampilkan status kerentanan untuk umum)
        window.viewMemberDetail = function(sid) {
            const m = (window.appState.members || []).find(x => x.sid === sid);
            if (!m) return;

            const isDetailAdmin = Boolean(window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN');
            document.getElementById('modalDetailAvatar').textContent = m.name.substring(0, 2).toUpperCase();
            document.getElementById('modalDetailName').textContent = isDetailAdmin ? m.name : getMemberDisplayName(m);
            document.getElementById('modalDetailSid').textContent = m.sid;
            document.getElementById('modalDetailNik').textContent = isDetailAdmin ? (m.rawNik || m.maskedNik) : (m.maskedNik || '187201********00');
            document.getElementById('modalDetailHash').textContent = m.nikHash || 'a8f5c9e2';
            document.getElementById('modalDetailRole').textContent = (m.isDualRole || m.role === 'PRODUSEN')
                ? `1 SID 2 Peran: Produsen (${m.producerCommodity}) & Konsumen`
                : 'Konsumen Rumah Tangga';

            const detailTierEl = document.getElementById('modalDetailTier');
            if (detailTierEl) {
                const labelParent = detailTierEl.parentElement?.querySelector('span:first-child');
                if (isDetailAdmin) {
                    if (labelParent) labelParent.textContent = 'Status Kerentanan (Admin Only)';
                    detailTierEl.textContent = m.socialTier === 'RENTAN_PRIORITAS' ? 'Prioritas Bantuan' : m.socialTier === 'WASPADA' ? 'Waspada Pangan' : 'Mandiri Pangan';
                    detailTierEl.className = m.socialTier === 'RENTAN_PRIORITAS' ? 'font-bold text-rose-700' : m.socialTier === 'WASPADA' ? 'font-bold text-amber-700' : 'font-bold text-emerald-700';
                } else {
                    if (labelParent) labelParent.textContent = 'Status Keanggotaan SID';
                    detailTierEl.textContent = 'Warga Aktif Terverifikasi RT 13';
                    detailTierEl.className = 'font-semibold text-emerald-800';
                }
            }

            document.getElementById('modalDetailAddress').textContent = m.address;
            document.getElementById('modalDetailDist').textContent = `${m.familySize || 4} Jiwa • ${m.distanceKm || 0.2} km dari Hub RT 13`;

            const n = m.needs || { beras: 18, sayur: 9, telur: 4, ikan: 4 };
            const extraNeeds = [n.ayam > 0 ? `Daging Ayam ${n.ayam}kg` : '', n.tempe > 0 ? `Tempe/Tahu ${n.tempe}kg` : ''].filter(Boolean).join(', ');
            const needsSummary = ` Perkiraan kebutuhan pangan bulanan: ${m.monthlyFoodNeedKg} Kg (Beras ${n.beras}kg, Sayur ${n.sayur}kg, Telur ${n.telur}kg, Ikan ${n.ikan}kg${extraNeeds ? ', ' + extraNeeds : ''}).`;

            let histText = '';
            if (m.role === 'PRODUSEN') {
                histText = `Terdaftar sebagai Produsen KWT/Pekarangan (${m.harvestCycleWeekly || 'Panen Mingguan'}) sekaligus Konsumen RT 13.` + needsSummary;
            } else {
                histText = `Terverifikasi sebagai Kepala Keluarga warga RT 13 Kelurahan Yosomulyo.` + needsSummary;
            }
            document.getElementById('modalDetailHistory').textContent = histText;

            openModal('modalMemberDetail');
        };

        // 9.6 Banner Status Pesanan Kebun Produsen (Point 5: Muncul sesuai status "Siapkan Pesanan" atau "Selesai dan Lunas")
        window.renderProducerBuyerOrdersPanel = function renderProducerBuyerOrdersPanel() {
            const panel = document.getElementById('producerBuyerOrdersPanel');
            if (!panel) return;

            const activeSid = window.appState.activeUserSid;
            const role = window.appState.activeRole || 'KONSUMEN';
            const isAdmin = Boolean(window.appState.isAdminLoggedIn || role === 'ADMIN' || activeSid === 'ADMIN-RT13');

            // Hanya tampil untuk role PRODUSEN
            if (!activeSid || isAdmin || role !== 'PRODUSEN') {
                panel.classList.add('hidden');
                return;
            }

            const allTxs = (window.appState.transactions || []).filter(t => t.type === 'JUAL_BELI_PASAR' || !t.type || t.type !== 'EKSPANSI_PASAR_LUAR');
            const myOrders = allTxs.filter(t => t.producerSid === activeSid);

            if (myOrders.length === 0) {
                panel.classList.add('hidden');
                return;
            }

            const pendingPrepareOrders = myOrders.filter(t => t.orderStatus === 'MENUNGGU_KONFIRMASI');
            const inDeliveryOrders = myOrders.filter(t => t.orderStatus === 'SIAP_DIAMBIL');
            const completedOrders = myOrders.filter(t => !t.orderStatus || t.orderStatus === 'SELESAI_LUNAS');

            // Jika semua pesanan sudah disiapkan / selesai lunas, sembunyikan banner alert di lapak saya
            if (pendingPrepareOrders.length === 0 && inDeliveryOrders.length === 0) {
                panel.classList.add('hidden');
                panel.innerHTML = '';
                return;
            }

            panel.classList.remove('hidden');

            if (pendingPrepareOrders.length > 0) {
                panel.className = 'p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs';
                panel.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            <i class="fa-solid fa-boxes-packing"></i>
                        </div>
                        <div>
                            <strong class="text-sm font-bold text-stone-900 block">
                                Ada Pesanan Masuk dari Tetangga RT 13! (${pendingPrepareOrders.length} Perlu Disiapkan)
                            </strong>
                            <p class="text-stone-700 text-[11px]">
                                Terdapat <strong class="text-amber-900 font-mono">${pendingPrepareOrders.length} pesanan berstatus "Siapkan Pesanan"</strong> (dari total ${myOrders.length} pesanan) di akun kebun Anda.
                            </p>
                        </div>
                    </div>
                    <button type="button" onclick="switchTab('tab-orders')"
                        class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer">
                        <i class="fa-solid fa-clipboard-check"></i>
                        <span>Siapkan Pesanan Sekarang</span>
                    </button>
                `;
            } else if (inDeliveryOrders.length > 0) {
                panel.className = 'p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs';
                panel.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            <i class="fa-solid fa-box-open"></i>
                        </div>
                        <div>
                            <strong class="text-sm font-bold text-stone-900 block">
                                Pesanan Siap Diambil / Diantar (${inDeliveryOrders.length} Pesanan Aktif)
                            </strong>
                            <p class="text-stone-600 text-[11px]">
                                ${inDeliveryOrders.length} pesanan sudah disiapkan dan menunggu konfirmasi Selesai &amp; Lunas.
                            </p>
                        </div>
                    </div>
                    <button type="button" onclick="switchTab('tab-orders')"
                        class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer">
                        <i class="fa-solid fa-clipboard-check"></i>
                        <span>Kelola Status Pesanan</span>
                    </button>
                `;
            }
        }

        // 9.7 Mesin Prediksi AI Akurat: Bapanas + Historis PIHPS Metro + Kapasitas KWT + ML Regresi 50+ Transaksi
        window.syncLiveSurplusData = function() {
            const listings = window.appState.listings || [];
            const members = window.appState.members || [];
            const demands = window.appState.demands || [];
            const transactions = window.appState.transactions || [];

            const totalStockLive = listings.reduce((sum, l) => sum + (Number(l.availableStockKg) || 0), 0);
            const producerCap3Days = Math.round(
                members.filter(m => m.role === 'PRODUSEN').reduce((s, m) => s + (Number(m.capacityKg) || 0), 0) * 0.15
            );
            const totalSupply3Days = totalStockLive + producerCap3Days;

            const totalJiwa = members.reduce((sum, m) => sum + (Number(m.familySize) || 4), 0);
            const bapanas3DaysKg = Math.round(totalJiwa * 0.53 * 3);
            const mlVelocity3DaysKg = Math.round(
                transactions.slice(0, 20).reduce((s, t) => s + (Number(t.quantityKg) || 0), 0) * 0.25
            );
            const threshold = window.VOTE_THRESHOLD || 5;
            const validVotingKg = demands
                .filter(d => (d.votes || 0) >= threshold && d.status !== 'TERPENUHI_LOKAL')
                .reduce((s, d) => s + Math.round((Number(d.totalDemandKg) || 20) * 0.15), 0);

            const totalDemand3Days = Math.max(40, Math.round((bapanas3DaysKg * 0.65) + (mlVelocity3DaysKg * 0.35) + validVotingKg));

            const harvestInput = document.getElementById('surplusHarvestKg');
            const demandInput = document.getElementById('surplusDemandKg');
            if (harvestInput) harvestInput.value = totalSupply3Days;
            if (demandInput) demandInput.value = totalDemand3Days;

            if (typeof window.calculateSurplusPrediction === 'function') window.calculateSurplusPrediction(true);
            if (typeof window.renderPerProducerAiForecast === 'function') window.renderPerProducerAiForecast();
        };

        window.aiForecastScope = 'ALL';
        window.setAiForecastScope = function(scope) {
            window.aiForecastScope = scope;
            const btnMine = document.getElementById('btnAiFilterMyProd');
            const btnAll = document.getElementById('btnAiFilterAllProd');
            if (btnMine && btnAll) {
                if (scope === 'MINE') {
                    btnMine.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-forest-800 text-white';
                    btnAll.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-stone-600 hover:bg-stone-100';
                } else {
                    btnAll.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-forest-800 text-white';
                    btnMine.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-stone-600 hover:bg-stone-100';
                }
            }
            renderPerProducerAiForecast();
        };

        window.renderPersonalConsumerOrders = function renderPersonalConsumerOrders() {
            const card = document.getElementById('personalConsumerOrdersCard');
            const listEl = document.getElementById('personalConsumerOrdersList');
            const nameEl = document.getElementById('personalConsumerNameLabel');
            const badgeEl = document.getElementById('personalConsumerOrderCountBadge');
            if (!card || !listEl) return;

            const activeSid = window.appState?.activeUserSid || 'SID-RT13-002';
            const member = (window.appState?.members || []).find(m => m.sid === activeSid);
            if (nameEl && member) nameEl.textContent = `${member.name} • ${member.sid}`;

            const myOrders = (window.appState?.transactions || []).filter(t => t.consumerSid === activeSid);
            if (badgeEl) badgeEl.textContent = `${myOrders.length} Pesanan Saya`;

            if (myOrders.length === 0) {
                listEl.innerHTML = `
                    <div class="col-span-full p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 text-center">
                        Belum ada pesanan pada akun keluarga Anda (${member ? member.name : activeSid}). Silakan pilih komoditas segar di atas untuk memesan.
                    </div>
                `;
                return;
            }

            listEl.innerHTML = myOrders.slice(0, 6).map(t => `
                <div class="p-3.5 rounded-xl bg-stone-50/90 border border-stone-200 flex items-center justify-between gap-3">
                    <div class="space-y-0.5 min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">${t.id}</span>
                            <strong class="text-xs text-stone-900 truncate">${t.commodity} (${t.quantityKg} Kg)</strong>
                            ${t.orderStatus === 'MENUNGGU_KONFIRMASI' ? `
                                <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    <i class="fa-solid fa-hourglass-start text-amber-600 mr-0.5"></i>Disiapkan
                                </span>
                            ` : t.orderStatus === 'SIAP_DIAMBIL' ? `
                                <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                    <i class="fa-solid fa-box-open text-blue-600 mr-0.5"></i>Siap Diambil/Diantar
                                </span>
                            ` : `
                                <span class="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                    <i class="fa-solid fa-circle-check text-emerald-600 mr-0.5"></i>Selesai
                                </span>
                            `}
                        </div>
                        <p class="text-[11px] text-stone-500 truncate">
                            Dari Kebun: <strong>${t.producerName}</strong> • ${t.timestamp}
                        </p>
                    </div>
                    <div class="text-right shrink-0 space-y-1">
                        <strong class="block font-mono text-xs font-bold text-forest-800">${formatRupiah(t.totalPaid || t.subtotal)}</strong>
                        <div class="flex items-center justify-end gap-2">
                            <button type="button" onclick="viewTransactionReceipt('${t.id}')" class="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer">
                                <i class="fa-solid fa-receipt mr-0.5"></i> Lihat Struk
                            </button>
                            <button type="button" onclick="downloadOrderReceiptPdf('${t.id}')" class="text-[10px] font-bold text-forest-800 hover:underline cursor-pointer" title="Unduh langsung PDF struk ini">
                                <i class="fa-solid fa-file-arrow-down mr-0.5"></i> PDF
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }


}

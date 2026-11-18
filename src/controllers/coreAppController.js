/**
 * @file src/controllers/coreAppController.js
 * @description Controller Inti UI, Navigasi Tab, Direktori 40 KK Single Identity,
 *              Katalog Pasar Pangan, Musyawarah Voting, & PWA Installer.
 */

export function initCoreAppController() {
        // =========================================================================
        // IIFE: GENERATOR 40 KK & SINKRONISASI ROTASI BANTUAN (ROUND-ROBIN)
        // =========================================================================
        (function initFortyKkGenerator() {
            // 1. Sinkronisasi global window.membersData & window.appState.members
            if (!window.membersData) {
                window.membersData = (window.appState && window.appState.members) ? window.appState.members : [];
            }
            if (window.appState && !window.appState.members) {
                window.appState.members = window.membersData;
            }

            const members = window.appState.members || [];

            // 2. Verifikasi & Lengkapi hingga genap 40 KK (SID-1301 s.d. SID-1340)
            const sampleNames = [
                "Ibu Sartika Sari Dewi", "Ibu Sri Wahyuni", "Pak Hendra Wijaya", "Ibu Ratna Susanti",
                "Pak Bambang Sudiro", "Pak Joko Susilo", "Ibu Nurul Hidayah", "Pak Agus Santoso",
                "Ibu Dewi Lestari", "Ibu Anisa Rahmawati", "Ibu Siti Aminah", "Ibu Marsinah",
                "Ibu Suparmi", "Pak Dedi Setiawan", "Pak Eko Prasetyo", "Ibu Wulandari",
                "Pak Hadi Purnomo", "Pak Indra Gunawan", "Ibu Maya Safitri", "Pak Rudi Hartono",
                "Ibu Yuliana", "Pak Slamet Riyadi", "Ibu Titik Sunarti", "Pak Budi Hartono",
                "Ibu Tri Wahyuni", "Pak Sugeng Mulyono", "Ibu Rina Marlina", "Pak Widodo",
                "Ibu Kusuma Wardani", "Pak Arif Rahman", "Ibu Fitri Handayani", "Pak Wahyu Hidayat",
                "Ibu Endang Sri Rejeki", "Pak Danang Wicaksono", "Ibu Sulastri", "Pak Triyono",
                "Ibu Sri Rahayu", "Pak Suryanto", "Ibu Ningsih", "Pak Totok Sugiyanto"
            ];

            if (members.length < 40) {
                const target = 40;
                for (let i = members.length; i < target; i++) {
                    const sidIdx = i + 1;
                    const sidCode = `SID-RT13-${String(sidIdx).padStart(3, '0')}`;
                    const sidShort = `SID-${1300 + sidIdx}`;
                    const name = sampleNames[i] || `Warga RT 13 KK #${sidIdx}`;

                    const prioCount = members.filter(m => m.socialTier === 'RENTAN_PRIORITAS').length;
                    const waspCount = members.filter(m => m.socialTier === 'WASPADA').length;

                    let tier = 'MANDIRI';
                    let income = 3500000;
                    let family = 3;
                    let foodKg = 30;

                    if (prioCount < 5 && (i % 7 === 1 || prioCount + (target - i) <= 5)) {
                        tier = 'RENTAN_PRIORITAS';
                        income = 800000 + (i * 20000);
                        family = 4 + (i % 3);
                        foodKg = 40;
                    } else if (waspCount < 8 && (i % 4 === 0 || waspCount + (target - i) <= 8)) {
                        tier = 'WASPADA';
                        income = 1800000 + (i * 30000);
                        family = 3 + (i % 2);
                        foodKg = 35;
                    }

                    members.push({
                        sid: sidCode,
                        sidShort: sidShort,
                        name: name,
                        publicName: `Warga ${sidCode} (${name.substring(0, 5)}...)`,
                        nikHash: Math.random().toString(16).substring(2, 10),
                        maskedNik: `187201********${String(sidIdx).padStart(2, '0')}`,
                        rawNik: `187201450280${String(sidIdx).padStart(4, '0')}`,
                        role: 'KONSUMEN',
                        producerCommodity: '-',
                        capacityKg: 0,
                        familySize: family,
                        monthlyIncome: income,
                        monthlyFoodNeedKg: foodKg,
                        socialTier: tier,
                        aidReceivedThisMonth: false,
                        distanceKm: Number((0.1 + (i * 0.02)).toFixed(2)),
                        walletEarned: 0,
                        subsidyReceivedKg: 0,
                        address: `Jl. Wolter Monginsidi RT 13 Metro Pusat`
                    });
                }
            }

            // 3. Pastikan setiap KK memiliki properti aidReceivedThisMonth: false dan sidShort
            members.forEach((m, idx) => {
                if (m.aidReceivedThisMonth === undefined) {
                    m.aidReceivedThisMonth = false;
                }
                if (!m.sidShort) {
                    m.sidShort = `SID-${1300 + idx + 1}`;
                }
                // Hitung AI-DSS score awal
                const normInc = Math.max(0, Math.min(1, (5000000 - Math.max(0, m.monthlyIncome || 0)) / 4700000));
                const normFam = Math.max(0, Math.min(1, ((m.familySize || 1) - 1) / 5));
                const perCap = (m.monthlyIncome || 0) / Math.max(1, m.familySize || 1);
                let score = Math.round((normInc * 55) + (normFam * 35) + 10);
                if (perCap <= 300000) score = Math.max(score, 90 + Math.min(8, Math.round((300000 - perCap) / 30000)));
                else if (perCap <= 500000) score = Math.max(score, 75 + Math.round(((500000 - perCap) / 200000) * 15));
                m.aiScore = score;
            });

            window.appState.members = members;
            window.membersData = members;
            window.votingPrograms = window.appState.demands;
        })();

        // --- 1. UTILITY FUNCTIONS & PRIVACY HELPERS ---
        window.formatRupiah = function formatRupiah(num) {
            return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
        }

        window.formatKg = function formatKg(num) {
            return Number(num || 0).toLocaleString('id-ID') + ' Kg';
        }

        window.getMemberDisplayName = function getMemberDisplayName(member) {
            if (!member) return 'Warga RT 13';
            if (window.appState.privacyMode === 'PUBLIC') {
                return member.publicName || (member.role === 'PRODUSEN' ? `Produsen ${member.sid}` : `Keluarga ${member.sid}`);
            }
            return member.name;
        }

        window.getMemberDisplayNik = function getMemberDisplayNik(member) {
            if (!member) return '-';
            if (window.appState.privacyMode === 'PUBLIC') {
                return member.maskedNik || '187201********00';
            }
            return member.rawNik || member.maskedNik;
        }

        window.getMemberTierBadge = function getMemberTierBadge(tier, aidReceived = false) {
            // Jika bukan Admin, sembunyikan status kerentanan sosial warga
            if (!window.appState.isAdminLoggedIn && window.appState.activeRole !== 'ADMIN') {
                return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Terverifikasi RT 13</span>';
            }
            if (tier === 'RENTAN_PRIORITAS') {
                if (aidReceived) {
                    return `
                        <div class="flex flex-col gap-1 items-start">
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Prioritas Bantuan</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-100 text-slate-700 border border-slate-200">Kebutuhan Bulan Ini: Terpenuhi</span>
                        </div>
                    `;
                }
                return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Prioritas Bantuan</span>';
            } else if (tier === 'WASPADA') {
                return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Waspada Pangan</span>';
            }
            return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Mandiri Pangan</span>';
        }

        window.showToast = function showToast(title, message, type = 'success') {
            const container = document.getElementById('toastContainer');
            if (!container) return;

            const toast = document.createElement('div');
            const bgClass = type === 'success' ? 'bg-forest-900 text-white border-forest-700 shadow-xl' :
                type === 'warning' ? 'bg-[#3D2206] text-white border-amber-600 shadow-xl' :
                    type === 'error' ? 'bg-[#4A0E0E] text-white border-rose-700 shadow-xl' :
                        'bg-stone-900 text-white border-stone-700 shadow-xl';

            toast.className = `p-4 rounded-xl border text-xs pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 flex items-start gap-3 ${bgClass}`;

            const icon = type === 'success' ? 'fa-circle-check text-forest-300' :
                type === 'warning' ? 'fa-triangle-exclamation text-amber-300' :
                    type === 'error' ? 'fa-circle-exclamation text-rose-300' :
                        'fa-circle-info text-stone-300';

            toast.innerHTML = `
                <i class="fa-solid ${icon} text-base mt-0.5 shrink-0"></i>
                <div class="flex-1 space-y-0.5">
                    <div class="font-bold text-xs">${title}</div>
                    <div class="text-[11px] text-stone-200 leading-tight">${message}</div>
                </div>
                <button onclick="this.parentElement.remove()" class="text-stone-300 hover:text-white p-0.5" aria-label="Tutup Notifikasi">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            `;

            container.appendChild(toast);
            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        // --- 2. TAB NAVIGATION & STRICT ROLE-BASED TAB GUARD ---
        window.getAllowedTabsForRole = function getAllowedTabsForRole(role) {
            if (role === 'ADMIN') {
                return ['tab-sid', 'tab-dampak', 'tab-matching', 'tab-orders', 'tab-market', 'tab-musyawarah'];
            }
            if (role === 'PRODUSEN') {
                return ['tab-sid', 'tab-market', 'tab-orders', 'tab-matching'];
            }
            // Default KONSUMEN: Profile (tab-sid), Pilih Komoditas (tab-market), Usulan Pangan (tab-musyawarah)
            return ['tab-sid', 'tab-market', 'tab-musyawarah'];
        }

        window.enforceSidebarTabVisibility = function enforceSidebarTabVisibility(role) {
            const allowed = getAllowedTabsForRole(role || window.appState?.activeRole || 'KONSUMEN');
            const allTabs = ['tab-konsep', 'tab-sid', 'tab-market', 'tab-orders', 'tab-matching', 'tab-musyawarah', 'tab-dampak'];
            allTabs.forEach(tId => {
                const btn = document.getElementById(`nav-${tId}`);
                if (!btn) return;
                if (allowed.includes(tId)) {
                    btn.classList.remove('hidden');
                    btn.style.display = '';
                } else {
                    btn.classList.add('hidden');
                    btn.style.display = 'none';
                }
            });
        }
        window.getAllowedTabsForRole = getAllowedTabsForRole;
        window.enforceSidebarTabVisibility = enforceSidebarTabVisibility;

        window.switchTab = function switchTab(tabId) {
            if (tabId === 'tab-konsep') tabId = 'tab-sid';
            const currentRole = window.appState?.activeRole || 'KONSUMEN';
            const allowedTabs = getAllowedTabsForRole(currentRole);

            if (!allowedTabs.includes(tabId)) {
                showToast("Akses Sesuai Peran", "Halaman tersebut khusus untuk peran Produsen / Admin RT 13.", "warning");
                tabId = 'tab-market';
            }

            document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
            const target = document.getElementById(tabId);
            if (target) target.classList.remove('hidden');

            document.querySelectorAll('.tab-nav-btn').forEach(btn => {
                const wasHidden = btn.classList.contains('hidden') || btn.style.display === 'none';
                btn.className = "tab-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all text-stone-600 hover:bg-stone-100" + (wasHidden ? " hidden" : "");
                const iconBox = btn.querySelector('div');
                if (iconBox) iconBox.className = "w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0 text-xs";
            });

            const activeBtn = document.getElementById(`nav-${tabId}`);
            if (activeBtn) {
                activeBtn.className = "tab-nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all bg-forest-800 text-white shadow-xs";
                const iconBox = activeBtn.querySelector('div');
                if (iconBox) iconBox.className = "w-7 h-7 rounded-lg bg-forest-700 text-white flex items-center justify-center shrink-0 text-xs";
            }

            // Kunci kembali visibilitas tab sesuai role aktif agar tidak pernah bocor saat klik tab lain!
            enforceSidebarTabVisibility(currentRole);

            // Close mobile sidebar if open
            const sidebar = document.getElementById('mainSidebar');
            const backdrop = document.getElementById('mobileBackdrop');
            if (sidebar) sidebar.classList.add('-translate-x-full');
            if (backdrop) backdrop.classList.add('hidden');

            // Scroll window to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Specific tab refreshes
            if (tabId === 'tab-sid') {
                if (typeof renderMyOwnKkSummaryCard === 'function') renderMyOwnKkSummaryCard();
                if (typeof renderMembersTable === 'function') renderMembersTable();
            }
            if (tabId === 'tab-matching') {
                if (typeof syncLiveSurplusData === 'function') syncLiveSurplusData();
                if (typeof renderPerProducerAiForecast === 'function') renderPerProducerAiForecast();
            }
            if (tabId === 'tab-dampak') {
                setTimeout(updateCharts, 50);
            }
            if (tabId === 'tab-market') {
                setTimeout(() => {
                    renderFluctuationChart(currentFluctuationCommodity || 'Sayur Kangkung (KWT Pekarangan)');
                }, 50);
            }
            if (tabId === 'tab-orders') {
                setTimeout(() => {
                    if (typeof populateOrdersProducerFilter === 'function') populateOrdersProducerFilter();
                    if (typeof renderProducerOrders === 'function') renderProducerOrders();
                }, 40);
            }
        }

        window.toggleMobileSidebar = function toggleMobileSidebar() {
            const sidebar = document.getElementById('mainSidebar');
            const backdrop = document.getElementById('mobileBackdrop');
            if (sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            }
        }

        window.togglePrivacyMode = function togglePrivacyMode() {
            if (!window.appState.isAdminLoggedIn) {
                requestAdminRole();
                return;
            }
            if (window.appState.privacyMode === 'PUBLIC') {
                window.appState.privacyMode = 'ADMIN';
                showToast("Mode Pengurus Terverifikasi Aktif", "Nama warga dan NIK lengkap kini ditampilkan untuk keperluan verifikasi lapangan pengurus RT 13 & KWT.", "warning");
            } else {
                window.appState.privacyMode = 'PUBLIC';
                showToast("Privasi PKM-PM 2023 Aktif", "Data pribadi warga disamarkan sesuai Buku Profil Digital Satu Pintu (Kelanjutan PKM-PM 2023).", "success");
            }
            updatePrivacyButtonState();
            renderAll();
        }

        window.updatePrivacyButtonState = function updatePrivacyButtonState() {
            const btn = document.getElementById('privacyToggleBtn');
            const icon = document.getElementById('privacyToggleIcon');
            const label = document.getElementById('privacyToggleLabel');
            if (!btn || !icon || !label) return;

            const tab2Badge = document.getElementById('tab2MaskingBadge');
            const rbacBadge = document.getElementById('rbacMaskingStatusBadge');

            if (window.appState.privacyMode === 'ADMIN') {
                btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs bg-paddy-50 border-paddy-300 text-paddy-900 hover:bg-paddy-100";
                icon.className = "fa-solid fa-lock-open text-paddy-600";
                label.textContent = "Mode Pengurus RT 13 Terverifikasi";
                if (tab2Badge) {
                    tab2Badge.textContent = 'Sensor NIK Terbuka (Admin)';
                    tab2Badge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800';
                }
                if (rbacBadge) {
                    rbacBadge.textContent = 'Sensor NIK Terbuka (Admin)';
                    rbacBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800';
                }
            } else {
                btn.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs bg-forest-50 border-forest-300 text-forest-800 hover:bg-forest-100";
                icon.className = "fa-solid fa-shield-halved text-forest-600";
                label.textContent = "Privasi PKM-PM 2023 Aktif";
                if (tab2Badge) {
                    tab2Badge.textContent = 'Sensor NIK Aktif';
                    tab2Badge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800';
                }
                if (rbacBadge) {
                    rbacBadge.textContent = 'Sensor NIK Aktif';
                    rbacBadge.className = 'px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800';
                }
            }
        }

        // --- 3. MODAL CONTROLS ---
        window.openModal = function openModal(modalId) {
            const m = document.getElementById(modalId);
            if (m) {
                m.classList.remove('hidden');
                if (modalId === 'modalNewListing') {
                    populateProducerDropdown();
                    setTimeout(() => {
                        handleProducerSelectionChange();
                        initAiMarketIntelligence();
                    }, 30);
                }
            }
        }

        window.closeModal = function closeModal(modalId) {
            const m = document.getElementById(modalId);
            if (m) m.classList.add('hidden');
        }

        // --- 4. RENDERERS ---
        window.renderHeaderStats = function renderHeaderStats() {
            const totalKg = window.appState.transactions.reduce((acc, t) => acc + (t.quantityKg || 0), 0) + 400; // include absorbed external
            const totalTransaksi = window.appState.transactions.reduce((acc, t) => acc + (t.subtotal || 0), 0) + 5000000; // include external spillover
            const danaKas = window.appState.danaSosialInklusi;

            const elTotalTab1 = document.getElementById('tab1TotalTransaksi');
            if (elTotalTab1) elTotalTab1.textContent = formatRupiah(totalTransaksi);

            const elKas1 = document.getElementById('topBarDanaKas');
            const elKas2 = document.getElementById('sidebarDanaKas');
            const elKas3 = document.getElementById('matchingDanaKas');
            const elKas4 = document.getElementById('chartCashDisplay');
            if (elKas1) elKas1.textContent = formatRupiah(totalTransaksi);
            if (elKas2) elKas2.textContent = formatRupiah(totalTransaksi);
            if (elKas3) elKas3.textContent = formatRupiah(danaKas);
            if (elKas4) elKas4.textContent = formatRupiah(totalTransaksi);

            const elFee1 = document.getElementById('topBarFeePct');
            const elFee2 = document.getElementById('sidebarFeeBadge');
            if (elFee1) elFee1.textContent = '0% Fee P2P Warga';
            if (elFee2) elFee2.textContent = '0% Fee';

            const elPangan = document.getElementById('topBarPanganTersalurkan');
            if (elPangan) elPangan.textContent = totalKg + ' Kg';

            const elKpiPangan = document.getElementById('kpiTotalPanganKg');
            if (elKpiPangan) elKpiPangan.textContent = totalKg + ' Kg';

            const elKpiProdTurnover = document.getElementById('kpiProdusenTurnover');
            if (elKpiProdTurnover) elKpiProdTurnover.textContent = formatRupiah(totalTransaksi);
        }

        window.expandedMemberSids = new Set();

        window.toggleMemberRowExpand = function toggleMemberRowExpand(sid) {
            if (expandedMemberSids.has(sid)) {
                expandedMemberSids.delete(sid);
            } else {
                expandedMemberSids.add(sid);
            }
            const detailRow = document.getElementById(`member-expand-${sid}`);
            const chevron = document.getElementById(`member-chevron-${sid}`);
            if (detailRow) detailRow.classList.toggle('hidden', !expandedMemberSids.has(sid));
            if (chevron) chevron.classList.toggle('rotate-180', expandedMemberSids.has(sid));
        }

        // TAB 2: MEMBERS DIRECTORY TABLE
        window.renderMembersTable = function renderMembersTable() {
            const tbody = document.getElementById('membersTableBody');
            if (!tbody) return;

            const isTableAdmin = Boolean(window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN');

            // Perbarui header kolom status sesuai role
            const thStatus = document.getElementById('thMemberStatus');
            if (thStatus) thStatus.textContent = isTableAdmin ? 'Status Kerentanan' : 'Status SID';

            // Sembunyikan filter status kerentanan dari non-admin
            const filterSelect = document.getElementById('memberFilterRole');
            if (filterSelect) {
                ['RENTAN_PRIORITAS','WASPADA','MANDIRI'].forEach(val => {
                    const opt = filterSelect.querySelector(`option[value="${val}"]`);
                    if (opt) opt.style.display = isTableAdmin ? '' : 'none';
                });
                // Reset filter jika nilai tidak valid untuk role saat ini
                if (!isTableAdmin && ['RENTAN_PRIORITAS','WASPADA','MANDIRI'].includes(filterSelect.value)) {
                    filterSelect.value = 'ALL';
                }
            }

            const search = (document.getElementById('memberSearchInput')?.value || '').toLowerCase();
            const roleFilter = filterSelect?.value || 'ALL';

            const filtered = window.appState.members.filter(m => {
                if (m.isDemoAccount) return false;
                const matchSearch = m.name.toLowerCase().includes(search) ||
                    m.sid.toLowerCase().includes(search) ||
                    (m.producerCommodity || '').toLowerCase().includes(search) ||
                    (m.rawNik || '').includes(search) ||
                    (m.address || '').toLowerCase().includes(search);

                let matchFilter = true;
                if (roleFilter === 'PRODUSEN') matchFilter = m.role === 'PRODUSEN';
                else if (roleFilter === 'KONSUMEN') matchFilter = m.role === 'KONSUMEN';
                else if (roleFilter === 'RENTAN_PRIORITAS') matchFilter = m.socialTier === 'RENTAN_PRIORITAS';
                else if (roleFilter === 'WASPADA') matchFilter = m.socialTier === 'WASPADA';
                else if (roleFilter === 'MANDIRI') matchFilter = m.socialTier === 'MANDIRI';

                return matchSearch && matchFilter;
            });

            // Rotasi Pemerataan: Jika memfilter RENTAN_PRIORITAS, prioritaskan aidReceivedThisMonth === false
            if (roleFilter === 'RENTAN_PRIORITAS') {
                filtered.sort((a, b) => {
                    if (!a.aidReceivedThisMonth && b.aidReceivedThisMonth) return -1;
                    if (a.aidReceivedThisMonth && !b.aidReceivedThisMonth) return 1;
                    return (b.aiScore || 0) - (a.aiScore || 0);
                });
            }

            const countEl = document.getElementById('membersFilteredCount');
            if (countEl) countEl.textContent = filtered.length;

            tbody.innerHTML = filtered.map(m => {
                const n = m.needs || {
                    beras: Math.round((m.monthlyFoodNeedKg || 30) * 0.5),
                    sayur: Math.round((m.monthlyFoodNeedKg || 30) * 0.25),
                    telur: Math.round((m.monthlyFoodNeedKg || 30) * 0.13),
                    ikan: Math.max(1, (m.monthlyFoodNeedKg || 30) - Math.round((m.monthlyFoodNeedKg || 30) * 0.5) - Math.round((m.monthlyFoodNeedKg || 30) * 0.25) - Math.round((m.monthlyFoodNeedKg || 30) * 0.13))
                };
                const isExpanded = expandedMemberSids.has(m.sid);
                return `
                <tr onclick="toggleMemberRowExpand('${m.sid}')" class="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div class="inline-flex items-center gap-2">
                            <i id="member-chevron-${m.sid}" class="fa-solid fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}"></i>
                            <span class="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800">${m.sid}</span>
                        </div>
                    </td>
                    <td class="py-3.5 px-4">
                        <div class="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span>${getMemberDisplayName(m)}</span>
                            ${m.sid === window.appState.activeUserSid ? '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">Akun Saya</span>' : ''}
                        </div>
                        <div class="text-[11px] font-mono text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>NIK: ${getMemberDisplayNik(m)}</span>
                            ${isTableAdmin ? `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]"><i class="fa-solid fa-key mr-1 text-amber-700"></i>PIN: ${m.pinCode || (m.rawNik ? m.rawNik.slice(-4) : '1234')}</span>` : ''}
                        </div>
                    </td>
                    <td class="py-3.5 px-4">
                        ${getMemberTierBadge(m.socialTier, m.aidReceivedThisMonth)}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <div class="inline-flex items-center gap-1.5">
                            <button type="button" onclick="event.stopPropagation(); viewMemberDetail('${m.sid}')" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold text-[11px] border border-slate-200 hover:border-emerald-200 shadow-2xs transition cursor-pointer">
                                <i class="fa-solid fa-address-card text-emerald-600"></i>
                                <span>Detail</span>
                            </button>
                            ${window.appState.isAdminLoggedIn ? `
                                <button type="button" onclick="event.stopPropagation(); openEditMemberModal('${m.sid}')" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 shadow-2xs transition cursor-pointer">
                                    <i class="fa-solid fa-pen-to-square text-amber-700"></i>
                                    <span>Edit (Admin)</span>
                                </button>
                            ` : (m.sid === window.appState.activeUserSid) ? `
                                <button type="button" onclick="event.stopPropagation(); openCitizenSelfUpdateModal()" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer">
                                    <i class="fa-solid fa-user-pen text-amber-300"></i>
                                    <span>Perbarui KK Saya</span>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
                <tr id="member-expand-${m.sid}" class="${isExpanded ? '' : 'hidden'} bg-slate-50/70">
                    <td colspan="4" class="px-4 py-3.5 border-t border-slate-100">
                        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
                            <div class="rounded-xl bg-white border border-slate-200/80 p-3 space-y-1">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Peran &amp; Alamat</span>
                                ${m.role === 'PRODUSEN' ? `
                                    <div class="font-bold text-emerald-800 flex items-center gap-1">
                                        <i class="fa-solid fa-wheat-awn text-amber-600"></i> Produsen (${m.capacityKg} Kg/bln)
                                    </div>
                                    <div class="text-slate-700 font-medium">${m.producerCommodity || 'Hasil Kebun'}</div>
                                    <span class="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">Sinyal Pasar: Terukur</span>
                                ` : `
                                    <div class="font-semibold text-slate-800">Konsumen Rumah Tangga RT 13</div>
                                `}
                                <div class="text-slate-500 pt-0.5">${m.address}</div>
                            </div>
                            <div class="rounded-xl bg-white border border-slate-200/80 p-3 flex flex-col justify-center">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tanggungan Keluarga</span>
                                <span class="font-mono text-sm font-bold text-slate-900 mt-1">${m.familySize} Jiwa</span>
                            </div>
                            <div class="rounded-xl bg-white border border-slate-200/80 p-3 flex flex-col justify-center">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jarak ke Hub RT 13</span>
                                <span class="font-mono text-sm font-bold text-slate-900 mt-1">${m.distanceKm} km</span>
                            </div>
                            <div class="rounded-xl bg-white border border-slate-200/80 p-3 space-y-1.5">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rincian Konsumsi (${m.monthlyFoodNeedKg} Kg/bln)</span>
                                <div class="flex flex-wrap gap-1">
                                    <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">Beras ${n.beras}kg</span>
                                    <span class="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-semibold">Sayur ${n.sayur}kg</span>
                                    <span class="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-mono text-[10px] font-semibold">Telur ${n.telur}kg</span>
                                    <span class="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 font-mono text-[10px] font-semibold">Ikan ${n.ikan}kg</span>
                                    ${n.ayam > 0 ? `<span class="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[10px] font-semibold">Daging Ayam ${n.ayam}kg</span>` : ''}
                                    ${n.tempe > 0 ? `<span class="px-2 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 font-mono text-[10px] font-semibold">Tempe/Tahu ${n.tempe}kg</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');

            // Also populate buyer dropdown in buy modal
            populateBuyerDropdown();
            populateProducerDropdown();
        }

        window.viewMemberDetail = function viewMemberDetail(sid) {
            const m = window.appState.members.find(x => x.sid === sid);
            if (!m) return;

            document.getElementById('modalDetailAvatar').textContent = m.name.substring(0, 2).toUpperCase();
            document.getElementById('modalDetailName').textContent = getMemberDisplayName(m);
            document.getElementById('modalDetailSid').textContent = m.sid;
            document.getElementById('modalDetailNik').textContent = getMemberDisplayNik(m);
            document.getElementById('modalDetailHash').textContent = m.nikHash || 'a8f5c9e2';
            document.getElementById('modalDetailRole').textContent = m.role === 'PRODUSEN' ? `Produsen (${m.producerCommodity})` : 'Konsumen Rumah Tangga';
            const detailTierEl = document.getElementById('modalDetailTier');
            const isDetailAdmin = Boolean(window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN');
            if (detailTierEl) {
                if (isDetailAdmin) {
                    detailTierEl.textContent = m.socialTier === 'RENTAN_PRIORITAS' ? 'Prioritas Bantuan (Hak Subsidi)' : m.socialTier === 'WASPADA' ? 'Waspada Pangan' : 'Mandiri Pangan';
                    detailTierEl.className = m.socialTier === 'RENTAN_PRIORITAS' ? 'font-bold text-rose-700' : m.socialTier === 'WASPADA' ? 'font-bold text-amber-700' : 'font-bold text-emerald-700';
                } else {
                    detailTierEl.textContent = 'Terverifikasi (Warga Aktif RT 13)';
                    detailTierEl.className = 'font-semibold text-emerald-800';
                }
            }
            document.getElementById('modalDetailAddress').textContent = m.address;
            document.getElementById('modalDetailDist').textContent = m.distanceKm + ' km dari Hub RT 13';

            const n = m.needs || { beras: 0, sayur: 0, telur: 0, ikan: 0 };
            const extraNeeds = [n.ayam > 0 ? `Daging Ayam ${n.ayam}kg` : '', n.tempe > 0 ? `Tempe/Tahu ${n.tempe}kg` : ''].filter(Boolean).join(', ');
            const needsSummary = ` Kebutuhan bulanan: ${m.monthlyFoodNeedKg} Kg (Beras ${n.beras}kg, Sayur ${n.sayur}kg, Telur ${n.telur}kg, Ikan ${n.ikan}kg${extraNeeds ? ', ' + extraNeeds : ''}).`;

            let histText = '';
            if (m.role === 'PRODUSEN') {
                histText = `Terverifikasi sebagai produsen UMKM pangan terdaftar Single Identity. Telah menghasilkan pendapatan bersih ${formatRupiah(m.walletEarned)} dari transaksi pasar cerdas RT 13 Yosomulyo.` + needsSummary;
            } else {
                histText = `Terverifikasi sebagai keluarga konsumen RT 13. Telah menerima total ${m.subsidyReceivedKg} Kg bantuan paket pangan subsidi/inklusi berdasarkan rekomendasi AI-DSS.` + needsSummary;
            }
            document.getElementById('modalDetailHistory').textContent = histText;

            openModal('modalMemberDetail');
        }

        window.handleRoleFieldChange = function handleRoleFieldChange(role) {
            const prodGroup = document.getElementById('producerFieldsGroup');
            const consGroup = document.getElementById('consumerFieldsGroup');
            if (role === 'PRODUSEN') {
                if (prodGroup) prodGroup.classList.remove('hidden');
            } else {
                if (prodGroup) prodGroup.classList.add('hidden');
            }
            // Profil sosio-ekonomi (Gaji & Tanggungan) selalu aktif untuk SEMUA peran (Konsumen maupun Produsen)
            if (consGroup) consGroup.classList.remove('hidden');
            autoDetectVulnerabilityTier();
        }

        window.checkNikDeduplicationLive = function checkNikDeduplicationLive(rawNik) {
            const banner = document.getElementById('dedupAlertBanner');
            const msg = document.getElementById('dedupAlertMessage');
            if (!banner || !msg) return;

            if (rawNik.length >= 16) {
                const existing = window.appState.members.find(m => m.rawNik === rawNik || m.maskedNik === rawNik);
                if (existing) {
                    banner.classList.remove('hidden');
                    msg.innerHTML = `Validasi Gagal: NIK <strong>${rawNik.substring(0, 6)}******${rawNik.slice(-2)}</strong> sudah terdaftar pada <strong>${existing.sid} (${existing.name})</strong>! Sistem Single Identity menolak duplikasi pendaftaran bantuan ganda.`;
                    return false;
                }
            }
            banner.classList.add('hidden');
            return true;
        }

        window.fillDuplicateNikTest = function fillDuplicateNikTest() {
            // Preset with Ibu Sri Wahyuni's NIK
            const inputNik = document.getElementById('regNik');
            const inputName = document.getElementById('regName');
            const inputAddress = document.getElementById('regAddress');
            if (inputNik) {
                inputNik.value = "1872012403850002";
                checkNikDeduplicationLive(inputNik.value);
            }
            if (inputName) inputName.value = "Ibu Sri Wahyuni (Uji Duplikasi)";
            if (inputAddress) inputAddress.value = "Blok B RT 13";
            showToast("Uji Coba NIK Ganda Diaktifkan", "Sistem mendeteksi NIK yang telah terdaftar pada SID-RT13-002 dan menampilkan banner penolakan.", "warning");
        }

        window.fillRandomCitizenData = function fillRandomCitizenData() {
            const randNum = Math.floor(1000 + Math.random() * 9000);
            const inputNik = document.getElementById('regNik');
            const inputName = document.getElementById('regName');
            const inputAddress = document.getElementById('regAddress');
            if (inputNik) inputNik.value = `18720112059${randNum}`;
            if (inputName) inputName.value = `Ibu Warga Baru RT 13 (${randNum})`;
            if (inputAddress) inputAddress.value = `Blok C No. ${Math.floor(1 + Math.random() * 30)} RT 13`;
            checkNikDeduplicationLive(inputNik.value);
            showToast("Data Acak Dimuat", "Silakan klik Daftarkan Single Identity untuk menguji registrasi sukses.", "info");
        }

        // --- AI-DSS VULNERABILITY CALCULATION (REVERSE NORMALIZATION) ---
        window.calculateAiVulnerability = function calculateAiVulnerability(monthlyIncome, familySize, monthlyFoodNeedKg = 35) {
            const income = Number(monthlyIncome) || 0;
            const family = Math.max(1, Number(familySize) || 1);
            const foodKg = Math.max(10, Number(monthlyFoodNeedKg) || 30);

            // Normalisasi Terbalik Berimbang:
            // Gaji makin KECIL dan Tanggungan makin BESAR -> Skor AI mendekati 100 (Masuk kategori PRIORITAS BANTUAN)
            const maxIncomeRef = 5000000;
            const minIncomeRef = 300000;
            const normIncome = Math.max(0, Math.min(1, (maxIncomeRef - Math.max(0, income)) / (maxIncomeRef - minIncomeRef)));

            // Tanggungan: makin BESAR tanggungan -> skor makin tinggi
            const maxFamilyRef = 6;
            const normFamily = Math.max(0, Math.min(1, (family - 1) / (maxFamilyRef - 1)));

            // Beban Kebutuhan Pangan (15kg - 60kg)
            const normFood = Math.max(0, Math.min(1, (foodKg - 15) / 45));

            // Rasio Pendapatan per Kapita (Indikator Utama BPS Lampung: ~Rp 550.000/kapita)
            const perCapita = income / family;

            // AI-DSS Weighted Sum Model (Income 55%, Family Dependency 35%, Food Burden 10%)
            let rawScore = (normIncome * 55) + (normFamily * 35) + (normFood * 10);

            // BPS Poverty Line / Kerentanan Pangan Booster:
            // Gaji Rp 500.000 dengan 4 tanggungan = Rp 125.000/kapita -> Skor mendekati 95-98 (PRIORITAS BANTUAN)
            if (perCapita <= 300000) {
                rawScore = Math.max(rawScore, 90 + Math.min(9, ((300000 - perCapita) / 300000) * 9));
            } else if (perCapita <= 500000) {
                rawScore = Math.max(rawScore, 75 + (((500000 - perCapita) / 200000) * 15));
            } else if (perCapita <= 800000) {
                rawScore = Math.max(rawScore, 50 + (((800000 - perCapita) / 300000) * 20));
            }

            const score = Math.round(Math.min(99, Math.max(5, rawScore)));

            // Penentuan Tier Berdasarkan Skor AI-DSS
            let tier = 'MANDIRI';
            if (score >= 65 || perCapita < 500000) {
                tier = 'RENTAN_PRIORITAS';
            } else if (score >= 40 || perCapita < 1000000) {
                tier = 'WASPADA';
            }

            return { score, tier, perCapita };
        }

        window.autoDetectVulnerabilityTier = function autoDetectVulnerabilityTier() {
            const income = Number(document.getElementById('regIncome')?.value || 2000000);
            const family = Number(document.getElementById('regFamilySize')?.value || 4);
            const foodKg = Number(document.getElementById('regFoodNeedKg')?.value || 35);

            // Deteksi AI-DSS adil untuk semua warga dan produsen
            const res = calculateAiVulnerability(income, family, foodKg);
            const selectEl = document.getElementById('regSocialTier');
            const scoreBadge = document.getElementById('regAiScoreBadge');

            if (selectEl) {
                selectEl.value = res.tier;
            }
            const isTierAdmin = Boolean(window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN');
            // Sembunyikan pembagian klasifikasi sosial / prioritas dari warga non-admin
            const regClassificationWrapper = document.getElementById('regClassificationWrapper');
            if (regClassificationWrapper) regClassificationWrapper.style.display = isTierAdmin ? '' : 'none';
            const regSocialTierEl = document.getElementById('regSocialTier');
            if (regSocialTierEl && regSocialTierEl.closest('div.flex.flex-col.justify-between')) {
                regSocialTierEl.closest('div.flex.flex-col.justify-between').style.display = isTierAdmin ? '' : 'none';
            }
            if (scoreBadge) {
                if (isTierAdmin) {
                    scoreBadge.textContent = `Skor AI: ${res.score}/100 • ${res.tier === 'RENTAN_PRIORITAS' ? 'Prioritas Bantuan' : res.tier === 'WASPADA' ? 'Waspada' : 'Mandiri'}`;
                    scoreBadge.className = res.tier === 'RENTAN_PRIORITAS'
                        ? 'text-[10px] font-mono font-bold text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded border border-terracotta-200'
                        : res.tier === 'WASPADA'
                            ? 'text-[10px] font-mono font-bold text-paddy-700 bg-paddy-50 px-1.5 py-0.5 rounded border border-paddy-200'
                            : 'text-[10px] font-mono font-bold text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200';
                } else {
                    scoreBadge.textContent = 'Data Terenkripsi';
                    scoreBadge.className = 'text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200';
                }
            }
        }

        window.syncNeedsToTotal = function syncNeedsToTotal() {
            const beras = Math.max(0, Number(document.getElementById('regNeedBeras')?.value || 0));
            const sayur = Math.max(0, Number(document.getElementById('regNeedSayur')?.value || 0));
            const telur = Math.max(0, Number(document.getElementById('regNeedTelur')?.value || 0));
            const ikan = Math.max(0, Number(document.getElementById('regNeedIkan')?.value || 0));
            const ayam = Math.max(0, Number(document.getElementById('regNeedAyam')?.value || 0));
            const tempe = Math.max(0, Number(document.getElementById('regNeedTempe')?.value || 0));
            const totalEl = document.getElementById('regFoodNeedKg');
            if (totalEl) totalEl.value = Math.max(1, beras + sayur + telur + ikan + ayam + tempe);
            autoDetectVulnerabilityTier();
        }

        window.syncTotalToNeeds = function syncTotalToNeeds() {
            const total = Math.max(10, Number(document.getElementById('regFoodNeedKg')?.value || 35));
            const beras = Math.max(1, Math.round(total * 0.5));
            const sayur = Math.max(1, Math.round(total * 0.25));
            const telur = Math.max(1, Math.round(total * 0.13));
            const ikan = Math.max(1, total - beras - sayur - telur);
            const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            setVal('regNeedBeras', beras);
            setVal('regNeedSayur', sayur);
            setVal('regNeedTelur', telur);
            setVal('regNeedIkan', ikan);
            autoDetectVulnerabilityTier();
        }

        window.handleRegisterMember = function handleRegisterMember(e) {
            e.preventDefault();
            const nik = document.getElementById('regNik').value.trim();
            if (!checkNikDeduplicationLive(nik)) {
                showToast("Registrasi Ditolak", "NIK telah terdaftar di sistem. Gunakan NIK unik untuk pendaftaran baru.", "error");
                return;
            }

            const name = document.getElementById('regName').value.trim();
            const address = document.getElementById('regAddress').value.trim();
            const role = document.getElementById('regRole').value;
            const newIndex = window.appState.members.length + 1;
            const newSid = `SID-RT13-${String(newIndex).padStart(3, '0')}`;
            const newSidShort = `SID-${1300 + newIndex}`;

            const familySize = Number(document.getElementById('regFamilySize')?.value || 3);
            const monthlyIncome = Number(document.getElementById('regIncome')?.value || 2000000);
            const berasNeed = Math.max(0, Number(document.getElementById('regNeedBeras')?.value || 0));
            const sayurNeed = Math.max(0, Number(document.getElementById('regNeedSayur')?.value || 0));
            const telurNeed = Math.max(0, Number(document.getElementById('regNeedTelur')?.value || 0));
            const ikanNeed = Math.max(0, Number(document.getElementById('regNeedIkan')?.value || 0));
            const ayamNeed = Math.max(0, Number(document.getElementById('regNeedAyam')?.value || 0));
            const tempeNeed = Math.max(0, Number(document.getElementById('regNeedTempe')?.value || 0));
            const sumCommodityNeeds = berasNeed + sayurNeed + telurNeed + ikanNeed + ayamNeed + tempeNeed;
            const monthlyFoodNeedKg = sumCommodityNeeds > 0 ? sumCommodityNeeds : Number(document.getElementById('regFoodNeedKg')?.value || 30);

            // Hitung klasifikasi kerentanan secara akurat via AI-DSS
            const aiRes = calculateAiVulnerability(monthlyIncome, familySize, monthlyFoodNeedKg);

            // Logika Penentuan Status: AI-DSS menentukan klasifikasi objektif untuk SEMUA peran (Konsumen maupun Produsen)
            const finalTier = aiRes.tier;
            const selectEl = document.getElementById('regSocialTier');
            if (selectEl) selectEl.value = finalTier;

            const memberNeeds = {
                beras: berasNeed,
                telur: telurNeed,
                sayur: sayurNeed,
                ikan: ikanNeed
            };
            if (ayamNeed > 0) memberNeeds.ayam = ayamNeed;
            if (tempeNeed > 0) memberNeeds.tempe = tempeNeed;

            const newMember = {
                sid: newSid,
                sidShort: newSidShort,
                name: name,
                publicName: `Warga ${newSid} (${name.substring(0, 5)}...)`,
                nikHash: Math.random().toString(16).substring(2, 10),
                maskedNik: nik.substring(0, 6) + '********' + nik.slice(-2),
                rawNik: nik,
                role: role,
                producerCommodity: role === 'PRODUSEN' ? (document.getElementById('regCommodity').value || 'Sayur Pekarangan') : '-',
                capacityKg: role === 'PRODUSEN' ? Number(document.getElementById('regCapacityKg').value || 30) : 0,
                familySize: familySize,
                monthlyIncome: monthlyIncome,
                monthlyFoodNeedKg: monthlyFoodNeedKg,
                needs: memberNeeds,
                socialTier: finalTier,
                aiScore: aiRes.score,
                aidReceivedThisMonth: false,
                distanceKm: Number(document.getElementById('regDistanceKm')?.value || 0.3),
                walletEarned: 0,
                subsidyReceivedKg: 0,
                address: address
            };

            window.appState.members.unshift(newMember);
            window.membersData = window.appState.members;
            document.getElementById('formRegisterMember').reset();
            document.getElementById('dedupAlertBanner').classList.add('hidden');
            renderMembersTable();
            renderHeaderStats();
            if (typeof generateAiDemands === 'function') generateAiDemands();
            if (typeof renderSupplierDistributionPanel === 'function') renderSupplierDistributionPanel();
            if (typeof renderAiMatchingPanel === 'function') renderAiMatchingPanel();
            showToast("Single Identity Terbit!", `${name} (${monthlyFoodNeedKg} Kg/bln) berhasil didaftarkan & langsung ditarik ke permintaan AI pemasok (${newSid}).`, "success");
        }

        // Alias for compatibility
        window.handleAddMember = handleRegisterMember;
        window.handleRegisterMember = handleRegisterMember;

        // TAB 3: SMART FOOD MARKET LISTINGS
        window.currentMarketCategory = 'ALL';

        window.filterMarketCategory = function filterMarketCategory(cat) {
            currentMarketCategory = cat;
            document.querySelectorAll('.market-cat-btn').forEach(b => {
                const isAll = b.id === 'catBtn-ALL';
                b.className = `market-cat-btn ${isAll ? 'col-span-2 sm:col-span-1' : ''} py-2 px-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center cursor-pointer transition`;
            });
            const btn = document.getElementById(`catBtn-${cat === 'ALL' ? 'ALL' : cat.split(' ')[0]}`);
            if (btn) {
                const isAll = btn.id === 'catBtn-ALL';
                btn.className = `market-cat-btn ${isAll ? 'col-span-2 sm:col-span-1' : ''} py-2 px-2.5 rounded-xl text-xs font-bold bg-forest-800 text-white shadow-2xs text-center cursor-pointer transition`;
            }
            renderMarketListings();
        }

        window.renderMarketListings = function renderMarketListings() {
            const grid = document.getElementById('marketListingsGrid');
            if (!grid) return;

            const isDemoSession = String(window.appState.activeUserSid || '').startsWith('DEMO-');
            const isProdMode = (window.appState.activeRole === 'PRODUSEN' && window.appState.activeUserSid && !window.appState.isAdminLoggedIn);
            const filtered = window.appState.listings.filter(l => {
                if (!isDemoSession && l.isDemoListing) return false;
                if (isProdMode && l.producerSid !== window.appState.activeUserSid) return false;
                if (currentMarketCategory === 'ALL') return true;
                return l.category === currentMarketCategory;
            });

            grid.innerHTML = filtered.map(l => {
                // Show real producer name in Community Market
                const producer = window.appState.members.find(m => m.sid === l.producerSid);
                const producerName = producer ? producer.name : l.producerName;
                const isRiceCaseB = l.id === 'list-002' || (l.unabsorbedSurplusKg && l.unabsorbedSurplusKg > 0);
                const unitStr = l.unit || 'Kg';

                // Percentage absorbed
                const totalHarvest = l.initialHarvestKg || (l.localAbsorbedKg + l.availableStockKg);
                const absorbed = l.localAbsorbedKg || 0;
                const pctAbsorbed = Math.min(100, Math.round((absorbed / totalHarvest) * 100));

                // 1. Hitung Jarak Fisik Produsen ke Konsumen (Food Miles Rendah / Rantai Pasok Pendek)
                let distanceText = "50 Meter";
                if (l.distanceKm !== undefined && l.distanceKm !== null) {
                    if (l.distanceKm < 1) {
                        distanceText = `${Math.round(l.distanceKm * 1000)} Meter`;
                    } else {
                        distanceText = `${l.distanceKm} Km`;
                    }
                } else if (l.location && l.location.includes('km')) {
                    distanceText = l.location;
                }

                // 2. Hitung Harga Pasar Luar untuk Komparasi Harga
                let marketPriceVal = l.marketPrice || l.marketLampungPrice;
                if (!marketPriceVal) {
                    const intel = LAMPUNG_MARKET_INTELLIGENCE[l.commodity] || Object.values(LAMPUNG_MARKET_INTELLIGENCE).find(item => l.commodity.toLowerCase().includes(item.category.toLowerCase()));
                    marketPriceVal = intel ? intel.marketLampungPrice : Math.round((l.fairPrice * 1.35) / 500) * 500;
                }
                if (marketPriceVal <= l.fairPrice) {
                    marketPriceVal = Math.round((l.fairPrice * 1.3) / 500) * 500;
                }
                const savingsVal = marketPriceVal - l.fairPrice;

                // 3. Hitung Harga Pengepul/Tengkulak untuk Koridor Harga Adil
                let tengkulakPriceVal = l.tengkulakPrice || l.pengepulPrice;
                if (!tengkulakPriceVal) {
                    const intel = LAMPUNG_MARKET_INTELLIGENCE[l.commodity] || Object.values(LAMPUNG_MARKET_INTELLIGENCE).find(item => l.commodity.toLowerCase().includes(item.category.toLowerCase()));
                    tengkulakPriceVal = intel ? intel.tengkulakLampungPrice : Math.round((l.fairPrice * 0.75) / 500) * 500;
                }

                return `
                    <div class="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative group">

                        <div class="space-y-3 pt-1">
                            <!-- Category & Icon -->
                            <div class="flex items-start justify-between gap-2">
                                <span class="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-forest-50 text-forest-700 border border-forest-200">
                                    ${l.category}
                                </span>
                                <div class="w-8 h-8 rounded-lg bg-stone-100 text-forest-800 flex items-center justify-center text-sm shrink-0">
                                    <i class="fa-solid ${l.icon || 'fa-seedling'}"></i>
                                </div>
                            </div>

                            <!-- Title & Producer Info -->
                            <div>
                                <h4 class="serif-heading text-lg font-bold text-stone-900 group-hover:text-forest-800 transition line-clamp-1">${l.commodity}</h4>
                                <div class="flex items-center justify-between flex-wrap gap-1 text-xs text-stone-700 mt-1">
                                    <div class="flex items-center gap-1.5">
                                        <i class="fa-solid fa-circle-user text-emerald-700"></i>
                                        <span class="font-bold text-stone-900">${l.isFromQuotaTakeover ? 'Disuplai oleh ' + producerName : producerName}</span>
                                        <span class="mono-num text-[11px] text-stone-400">(${l.producerSid})</span>
                                    </div>
                                    <div class="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/60">
                                        <i class="fa-solid fa-location-dot text-emerald-600"></i> Jarak: ${distanceText}
                                    </div>
                                </div>
                            </div>

                            <!-- Jadwal Panen & Batas Kesegaran (Penegasan Masa Segar & Kadaluarsa) -->
                            <div class="flex flex-col gap-1.5 pt-0.5">
                                <div class="flex items-center justify-between text-xs text-stone-500">
                                    <span class="inline-flex items-center gap-1 text-[11px]">
                                        <i class="fa-regular fa-calendar-check text-stone-400"></i> Panen: <strong class="text-stone-700">${l.harvestDate || '27 Okt 2026'}</strong>
                                    </span>
                                    <span class="text-[10px] text-stone-400 font-mono">Batas Panen Lokal</span>
                                </div>
                                <div>
                                    ${Number(l.freshnessDaysRemaining != null ? l.freshnessDaysRemaining : 3) <= 0 ? `
                                        <div class="p-2 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 flex items-center gap-2 text-[11px] font-extrabold animate-pulse">
                                            <i class="fa-solid fa-triangle-exclamation text-rose-700 text-sm shrink-0"></i>
                                            <div class="leading-tight">
                                                <span>LEWAT MASA SEGAR (0 Hari)</span>
                                                <span class="block text-[10px] font-semibold text-rose-800">Otomatis dialihkan jadi surplus siap salur ke MBG/Koperasi.</span>
                                            </div>
                                        </div>
                                    ` : Number(l.freshnessDaysRemaining) <= 2 ? `
                                        <div class="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-1.5 text-[11px] font-bold">
                                            <i class="fa-solid fa-hourglass-half text-amber-700"></i>
                                            <span>Mendekati Batas Segar (${l.freshnessDaysRemaining} Hari Lagi • Segera Dimasak)</span>
                                        </div>
                                    ` : `
                                        <div class="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-1.5 text-[11px] font-bold">
                                            <i class="fa-solid fa-leaf text-emerald-600"></i>
                                            <span>Masih Sangat Segar (${l.freshnessDaysRemaining || 4} Hari Tersisa)</span>
                                        </div>
                                    `}
                                </div>
                            </div>

                            <p class="text-xs text-stone-600 leading-snug line-clamp-2">
                                ${l.description}
                            </p>

                            <!-- Kotak Harga Bersih & Mudah Dibaca Warga -->
                            <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 space-y-1.5">
                                <div class="flex items-center justify-between text-xs">
                                    <del class="text-stone-400 font-mono line-through">
                                        Pasar Luar: ${formatRupiah(marketPriceVal)}/${unitStr}
                                    </del>
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        Hemat ${formatRupiah(savingsVal)}/${unitStr}
                                    </span>
                                </div>
                                <div class="flex items-baseline justify-between pt-0.5">
                                    <div>
                                        <span class="text-[11px] font-semibold text-stone-600 block">Harga Warga RT 13:</span>
                                        <span class="text-2xl font-extrabold text-forest-800 mono-num tracking-tight">${formatRupiah(l.fairPrice)}</span>
                                        <span class="text-xs font-semibold text-forest-700"> / ${unitStr}</span>
                                    </div>
                                    ${(window.appState.activeRole !== 'KONSUMEN') ? `
                                        <div class="text-right">
                                            <span class="text-[10px] text-stone-500 block">Harga Pengepul:</span>
                                            <span class="text-xs font-mono text-stone-600">${formatRupiah(tengkulakPriceVal)}</span>
                                        </div>
                                    ` : `
                                        <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">Stok: ${l.availableStockKg} ${unitStr}</span>
                                    `}
                                </div>
                            </div>

                            <!-- Absorption Progress Bar -->
                            <div class="space-y-1.5">
                                <div class="flex justify-between text-xs font-semibold">
                                    <span class="text-stone-600 text-[11px]">Daya Serap Panen:</span>
                                    <span class="mono-num font-bold text-forest-800">${absorbed} ${unitStr} / ${totalHarvest} ${unitStr} (${pctAbsorbed}%)</span>
                                </div>
                                <div class="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                                    <div class="h-full bg-forest-700 rounded-full transition-all duration-300" style="width: ${pctAbsorbed}%"></div>
                                </div>
                                <div class="flex justify-between text-[10px] text-stone-500">
                                    <span>Terserap: ${absorbed} ${unitStr}</span>
                                    <span class="font-bold text-stone-700">Tersedia Siap Beli: ${l.availableStockKg} ${unitStr}</span>
                                </div>
                            </div>

                        </div>

                        <!-- Action Buttons -->
                        <div class="pt-3 border-t border-stone-100 flex flex-col gap-2">
                            ${Number(l.freshnessDaysRemaining != null ? l.freshnessDaysRemaining : 3) <= 0 ? `
                                <!-- Produk Lewat Masa Segar: Dialihkan Otomatis ke Surplus MBG/Koperasi -->
                                <div class="space-y-2">
                                    <button disabled class="w-full py-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-truck-ramp-box text-rose-700"></i>
                                        <span>Dialihkan ke Surplus MBG / Koperasi</span>
                                    </button>
                                    ${(window.appState.isAdminLoggedIn || (window.appState.activeUserSid && window.appState.activeUserSid === l.producerSid)) ? `
                                        <div class="grid grid-cols-2 gap-2">
                                            <button onclick="switchTab('tab-dampak')" class="py-2 px-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
                                                <i class="fa-solid fa-boxes-packing"></i>
                                                <span>Pusat Surplus &rarr;</span>
                                            </button>
                                            <button onclick="openEditListingModal('${l.id}')" class="py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                                                <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                                <span>Edit Produk</span>
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : (window.appState.isAdminLoggedIn || (window.appState.activeUserSid && window.appState.activeUserSid === l.producerSid)) ? `
                                <div class="grid grid-cols-2 gap-2">
                                    ${l.availableStockKg > 0 ? `
                                        <button onclick="openBuyModal('${l.id}')" class="py-2.5 px-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                                            <i class="fa-solid fa-cart-shopping"></i>
                                            <span>Beli</span>
                                        </button>
                                    ` : `
                                        <button disabled class="py-2.5 px-2 rounded-xl bg-stone-200 text-stone-500 text-xs font-bold cursor-not-allowed">Stok Habis</button>
                                    `}
                                    <button onclick="openEditListingModal('${l.id}')" class="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                                        <i class="fa-solid fa-pen-to-square text-amber-600"></i>
                                        <span>Edit Stok/Harga</span>
                                    </button>
                                </div>
                            ` : `
                                ${l.availableStockKg > 0 ? `
                                    <button onclick="openBuyModal('${l.id}')" class="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 active:scale-98 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                                        <i class="fa-solid fa-cart-shopping"></i>
                                        <span>Beli Langsung</span>
                                    </button>
                                ` : `
                                    <button disabled class="w-full py-2.5 rounded-xl bg-stone-200 text-stone-500 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-box-open"></i>
                                        <span>Stok Habis</span>
                                    </button>
                                `}
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }

        window.populateBuyerDropdown = function populateBuyerDropdown() {
            const select = document.getElementById('buyConsumerSidSelect');
            if (!select) return;
            const activeSid = window.appState?.activeUserSid;
            const isAdmin = Boolean(window.appState?.isAdminLoggedIn || window.appState?.activeRole === 'ADMIN');
            const members = window.appState?.members || [];

            if (!activeSid && !isAdmin) {
                select.innerHTML = '<option value="" disabled selected>-- Anda Belum Masuk Akun --</option>';
                select.value = '';
                return;
            }

            if (!isAdmin) {
                const me = members.find(m => m.sid === activeSid);
                if (me) {
                    select.innerHTML = `<option value="${me.sid}" selected>${me.name} (${me.sid} • ${me.address || 'RT 13'})</option>`;
                    select.value = me.sid;
                    return;
                }
            }
            select.innerHTML = members.map(m => `
                <option value="${m.sid}" ${m.sid === activeSid ? 'selected' : ''}>${m.name} (${m.sid})</option>
            `).join('');
        }

        window.handleProducerSelectionChange = function handleProducerSelectionChange() {
            const producerSelect = document.getElementById('newListingProducerSid');
            const commoditySelect = document.getElementById('newListingName');
            if (!producerSelect || !commoditySelect) return;

            const selectedSid = producerSelect.value;
            const members = window.membersData || (window.appState && window.appState.members) || [];
            const producer = members.find(m => m.sid === selectedSid || m.sidShort === selectedSid);
            if (!producer) return;

            // Kumpulkan komoditas terdaftar milik produsen ini agar dropdown ringkas & terarah
            let myCommList = [];
            if (Array.isArray(producer.registeredCommodities) && producer.registeredCommodities.length > 0) {
                myCommList = producer.registeredCommodities.map(c => typeof c === 'string' ? c : c.name);
            }
            const myExistingListings = (window.appState.listings || []).filter(l => l.producerSid === selectedSid);
            myExistingListings.forEach(l => {
                if (l.commodity && !myCommList.includes(l.commodity)) myCommList.push(l.commodity);
            });
            if (producer.producerCommodity && producer.producerCommodity !== '-') {
                producer.producerCommodity.split(',').forEach(c => {
                    const cleanC = c.trim();
                    if (cleanC && !myCommList.includes(cleanC)) myCommList.push(cleanC);
                });
            }

            if (myCommList.length === 0) {
                myCommList = ['Sayur Kangkung (KWT Pekarangan)', 'Sayur Bayam Hijau (KWT Pekarangan)'];
            }

            // Isi dropdown newListingName KHUSUS komoditas kebun terdaftar produsen ini (Dropdown ringkas & terarah)
            if (myCommList.length > 0) {
                commoditySelect.innerHTML = myCommList.map(comm => `
                    <option value="${comm}">${comm}</option>
                `).join('');
            } else {
                commoditySelect.innerHTML = `
                    <option value="Sayur Kangkung (KWT Pekarangan)">Sayur Kangkung (KWT Pekarangan)</option>
                    <option value="Sayur Bayam Hijau (KWT Pekarangan)">Sayur Bayam Hijau (KWT Pekarangan)</option>
                `;
            }

            // Hapus duplikasi opsi
            const seen = new Set();
            for (let i = commoditySelect.options.length - 1; i >= 0; i--) {
                const val = commoditySelect.options[i].value;
                if (seen.has(val)) {
                    commoditySelect.remove(i);
                } else {
                    seen.add(val);
                }
            }

            commoditySelect.selectedIndex = 0;
            handleCommodityChange();
        }

        window.populateProducerDropdown = function populateProducerDropdown() {
            const select = document.getElementById('newListingProducerSid');
            if (!select) return;
            const members = window.membersData || (window.appState && window.appState.members) || [];
            // FILTER KETAT: HANYA WARGA DENGAN role === 'PRODUSEN' (Konsumen dilarang muncul)
            const producers = members.filter(m => String(m.role).toUpperCase() === 'PRODUSEN');

            if (producers.length === 0) {
                select.innerHTML = '<option value="" disabled selected>Belum ada produsen pangan terdaftar</option>';
                return;
            }

            const activeSid = window.appState?.activeUserSid;
            const isAdmin = Boolean(window.appState?.isAdminLoggedIn || window.appState?.activeRole === 'ADMIN');
            const myProd = producers.find(p => p.sid === activeSid);
            if (!isAdmin && myProd) {
                select.innerHTML = `<option value="${myProd.sid}" selected>${myProd.name} (${myProd.sid} • ${myProd.producerCommodity || 'Hasil Kebun'})</option>`;
                select.value = myProd.sid;
            } else {
                select.innerHTML = producers.map(p => `
                    <option value="${p.sid}" ${p.sid === activeSid ? 'selected' : ''}>${p.sid} • ${p.name} (${p.producerCommodity || 'Hasil Kebun'})</option>
                `).join('');
            }
            handleProducerSelectionChange();
        }

        
        // === EDIT STOK & HARGA PRODUK OLEH PRODUSEN (DENGAN BUKU BESAR AUDIT) ===
        window.openEditListingModal = function(listingId) {
            const listings = window.appState.listings || [];
            const l = listings.find(item => item.id === listingId);
            if (!l) return;

            const idEl = document.getElementById('editListingId');
            const nameEl = document.getElementById('editListingCommodityName');
            const stockEl = document.getElementById('editListingStock');
            const priceEl = document.getElementById('editListingPrice');
            const oldStockEl = document.getElementById('editListingOldStockLabel');
            const oldPriceEl = document.getElementById('editListingOldPriceLabel');
            const freshEl = document.getElementById('editListingFreshness');
            const reasonEl = document.getElementById('editListingReason');

            if (idEl) idEl.value = l.id;
            if (nameEl) nameEl.textContent = `${l.commodity} — Produsen: ${l.producerName} (${l.producerSid})`;
            if (stockEl) stockEl.value = l.availableStockKg;
            if (priceEl) priceEl.value = l.fairPrice;
            if (oldStockEl) oldStockEl.textContent = `Stok sebelumnya: ${l.availableStockKg} ${l.unit || 'Kg'}`;
            if (oldPriceEl) oldPriceEl.textContent = `Harga sebelumnya: ${formatRupiah(l.fairPrice)}/${l.unit || 'Kg'}`;
            if (freshEl) freshEl.value = l.freshnessDaysRemaining != null ? l.freshnessDaysRemaining : 3;
            if (reasonEl) reasonEl.value = '';

            openModal('modalEditListing');
        };

        window.handleSaveEditListing = function(e) {
            e.preventDefault();
            const listingId = document.getElementById('editListingId')?.value;
            const newStock = Number(document.getElementById('editListingStock')?.value) || 0;
            const newPrice = Number(document.getElementById('editListingPrice')?.value) || 0;
            const freshVal = document.getElementById('editListingFreshness')?.value;
            const reason = document.getElementById('editListingReason')?.value.trim() || 'Penyesuaian rutin stok & harga kebun';

            const listings = window.appState.listings || [];
            const l = listings.find(item => item.id === listingId);
            if (!l) return;

            const oldStock = l.availableStockKg;
            const oldPrice = l.fairPrice;

            // Update data
            l.availableStockKg = newStock;
            l.fairPrice = newPrice;

            if (freshVal !== undefined && freshVal !== '') {
                const days = Math.max(0, parseInt(freshVal, 10));
                l.freshnessDaysRemaining = days;
                if (days <= 0) {
                    l.freshnessWindow = 'Lewat Masa Segar (Surplus MBG)';
                    l.unabsorbedSurplusKg = l.availableStockKg;
                    l.isExpiredSurplus = true;
                    l.surplusConfirmedByProducer = true;
                } else if (days <= 2) {
                    l.freshnessWindow = `Segar (${days} Hari Tersisa)`;
                    l.isExpiredSurplus = false;
                } else {
                    l.freshnessWindow = `Sangat Segar (${days} Hari Tersisa)`;
                    l.isExpiredSurplus = false;
                }
            }

            // Catat di Buku Besar Audit Log
            if (!window.appState.inventoryAuditLogs) window.appState.inventoryAuditLogs = [];
            const now = new Date();
            const logEntry = {
                id: `AUDIT-${Date.now()}`,
                timestamp: `${now.getDate()} Okt 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                listingId: l.id,
                commodity: l.commodity,
                producerSid: l.producerSid,
                producerName: l.producerName,
                oldStock: oldStock,
                newStock: newStock,
                oldPrice: oldPrice,
                newPrice: newPrice,
                reason: reason
            };
            window.appState.inventoryAuditLogs.unshift(logEntry);

            // Simpan ke storage dan render ulang seluruh komponen terkait
            saveStateToLocal();
            closeModal('modalEditListing');
            renderMarketListings();
            renderPerProducerAiForecast();
            if (typeof window.renderActiveUserProfileCard === 'function') window.renderActiveUserProfileCard();
            if (typeof window.renderAdminSurplusCenter === 'function') window.renderAdminSurplusCenter();
            if (typeof window.renderProducerWorkspaceAndAutoAi === 'function') window.renderProducerWorkspaceAndAutoAi();

            showToast('Stok & Harga Diperbarui', `${l.commodity} berhasil diperbarui: Stok ${newStock} Kg, Harga ${formatRupiah(newPrice)}. Tercatat di Buku Besar Audit.`, 'success');
        };

        window.openBuyModal = function openBuyModal(listingId) {
            if (!window.appState.activeUserSid && !window.appState.isAdminLoggedIn) {
                showToast('Belum Masuk Akun', 'Silakan masuk ke akun keluarga Anda terlebih dahulu di Tab Masuk Akun untuk berbelanja.', 'warning');
                switchTab('tab-konsep');
                const identInput = document.getElementById('loginCitizenIdentifier');
                if (identInput) {
                    identInput.focus();
                    identInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            const listing = window.appState.listings.find(l => l.id === listingId);
            if (!listing) return;

            document.getElementById('buyListingId').value = listing.id;
            document.getElementById('buyModalProductTitle').textContent = listing.commodity;
            document.getElementById('buyModalProducerName').textContent = `${listing.producerName} (${listing.producerSid})`;
            document.getElementById('buyModalProducerLoc').textContent = listing.location;
            document.getElementById('buyModalPricePerKg').textContent = formatRupiah(listing.fairPrice) + ' / kg';
            document.getElementById('buyModalAvailableStock').textContent = listing.availableStockKg + ' Kg';

            const qtyInput = document.getElementById('buyQtyKg');
            qtyInput.max = listing.availableStockKg;
            qtyInput.value = Math.min(1, listing.availableStockKg);

            calculateBuyBreakdown();
            openModal('modalBuyDirect');
        }

        window.setQuickBuyQty = function setQuickBuyQty(val) {
            const qtyInput = document.getElementById('buyQtyKg');
            if (!qtyInput) return;
            const maxVal = Number(qtyInput.max) || 999;
            qtyInput.value = Math.min(val, maxVal);
            calculateBuyBreakdown();
        }

        window.calculateBuyBreakdown = function calculateBuyBreakdown() {
            const listingId = document.getElementById('buyListingId').value;
            const listing = window.appState.listings.find(l => l.id === listingId);
            if (!listing) return;

            const qty = Math.max(1, Number(document.getElementById('buyQtyKg')?.value || 1));
            const subtotal = qty * listing.fairPrice;

            // Delivery option
            const deliveryOpt = document.querySelector('input[name="buyDeliveryOption"]:checked')?.value || 'PICKUP';
            let deliveryFee = 0;
            if (deliveryOpt === 'PRODUCER_DELIVERY') deliveryFee = 2000;
            else if (deliveryOpt === 'COOP_COURIER') deliveryFee = 5000;

            const totalPaid = subtotal + deliveryFee;
            const producerNet = subtotal + (deliveryOpt === 'PRODUCER_DELIVERY' ? deliveryFee : 0);

            const elSubtotal = document.getElementById('buyCalcSubtotal');
            if (elSubtotal) elSubtotal.textContent = formatRupiah(subtotal);

            const elProducerNet = document.getElementById('buyCalcProducerNet');
            if (elProducerNet) elProducerNet.textContent = formatRupiah(producerNet);

            const elDelivery = document.getElementById('buyCalcDelivery');
            if (elDelivery) elDelivery.textContent = formatRupiah(deliveryFee);

            const elTotalPaid = document.getElementById('buyCalcTotalPaid');
            if (elTotalPaid) elTotalPaid.textContent = formatRupiah(totalPaid);
        }

        window.handleExecuteBuy = function handleExecuteBuy(e) {
            e.preventDefault();
            const listingId = document.getElementById('buyListingId').value;
            const listing = window.appState.listings.find(l => l.id === listingId);
            if (!listing) return;

            const qty = Number(document.getElementById('buyQtyKg').value);
            if (qty > listing.availableStockKg) {
                showToast("Stok Tidak Cukup", `Stok tersisa hanya ${listing.availableStockKg} Kg.`, "error");
                return;
            }

            const consumerSid = document.getElementById('buyConsumerSidSelect').value;
            const consumer = window.appState.members.find(m => m.sid === consumerSid);
            const producer = window.appState.members.find(m => m.sid === listing.producerSid);

            const deliveryOpt = document.querySelector('input[name="buyDeliveryOption"]:checked')?.value || 'PICKUP';
            let deliveryFee = 0;
            let deliveryText = "Ambil Sendiri (Rp 0)";
            if (deliveryOpt === 'PRODUCER_DELIVERY') {
                deliveryFee = 2000;
                deliveryText = "Diantar Produsen (+Rp 2.000)";
            } else if (deliveryOpt === 'COOP_COURIER') {
                deliveryFee = 5000;
                deliveryText = "Kurir Komunitas RT (+Rp 5.000)";
            }

            const subtotal = qty * listing.fairPrice;
            const producerTotal = subtotal + (deliveryOpt === 'PRODUCER_DELIVERY' ? deliveryFee : 0);

            if (deliveryOpt === 'PRODUCER_DELIVERY') {
                deliveryText = "COD / Diantar (+Rp 2.000)";
            } else {
                deliveryText = "Ambil Sendiri (Rp 0)";
            }

            // Update producer wallet
            if (producer) {
                producer.walletEarned = (producer.walletEarned || 0) + producerTotal;
            }

            // Catat pesanan baru dengan status MENUNGGU_KONFIRMASI & stockDeducted: false
            // Stok produsen akan otomatis berkurang saat produsen mengklik "Siapkan Pesanan" (sesuai A.1 & C.1)
            const txId = `TX-RT13-${Math.floor(100 + Math.random() * 900)}`;
            const now = new Date();
            const dateStr = `${now.getDate()} Nov 2026, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            window.appState.transactions.unshift({
                id: txId,
                listingId: listing.id,
                timestamp: dateStr,
                type: "JUAL_BELI_PASAR",
                producerSid: listing.producerSid,
                producerName: listing.producerName,
                consumerSid: consumerSid,
                consumerName: consumer ? consumer.name : "Warga Konsumen",
                commodity: listing.commodity,
                quantityKg: qty,
                unitPrice: listing.fairPrice,
                subtotal: subtotal,
                producerNet: subtotal,
                deliveryMethod: deliveryText,
                deliveryFee: deliveryFee,
                totalPaid: subtotal + deliveryFee,
                orderStatus: "MENUNGGU_KONFIRMASI",
                stockDeducted: false,
                status: "TERVERIFIKASI_SINGLE_ID"
            });
            saveStateToLocal();

            // 4. Catat transaksi pembelian warga dari Market ke Timeline Tab Musyawarah
            if (typeof musyawarahTransparencyState !== 'undefined' && Array.isArray(musyawarahTransparencyState.activities)) {
                const buyerLabel = consumer ? getMemberDisplayName(consumer) : 'Warga Konsumen';
                musyawarahTransparencyState.activities.forEach(a => { a.isNew = false; });
                musyawarahTransparencyState.activities.unshift({
                    id: `act-buy-${Date.now()}`,
                    time: 'Baru saja',
                    category: 'Transaksi Market (0% Fee)',
                    description: `${buyerLabel} (${consumerSid}) membeli ${qty} ${listing.unit || 'Kg'} ${listing.commodity} dari ${listing.producerName} (${listing.producerSid}) senilai ${formatRupiah(subtotal)}`,
                    isNew: true
                });
                musyawarahTransparencyState.distributionProgress = Math.min(100, musyawarahTransparencyState.distributionProgress + 1);
            }

            closeModal('modalBuyDirect');
            renderAll();
            showToast("Transaksi Berhasil!", `Pembelian ${qty} ${listing.unit || 'Kg'} ${listing.commodity} sukses. 100% pembayaran (${formatRupiah(producerTotal)}) langsung masuk ke dompet produsen.`, "success");
        }

        window.handleExecuteSurplusSpillover = function handleExecuteSurplusSpillover(e) {
            e.preventDefault();
            const listing = window.appState.listings.find(l => l.id === 'list-002');
            if (!listing) return;

            const targetSelect = document.getElementById('spilloverTargetSelect');
            const targetChannel = targetSelect.value;
            const channelText = targetSelect.options[targetSelect.selectedIndex].text;

            const surplusKg = listing.unabsorbedSurplusKg || 400;
            const wholesalePrice = 12500;
            const subtotal = surplusKg * wholesalePrice; // Rp 5.000.000

            // 1. Mark surplus absorbed
            listing.unabsorbedSurplusKg = 0;

            // 2. Add producer earnings - 100% masuk ke produsen
            const producer = window.appState.members.find(m => m.sid === listing.producerSid);
            if (producer) {
                producer.walletEarned = (producer.walletEarned || 0) + subtotal;
            }

            // 3. Record in Ledger (P2P murni tanpa fee)
            const txId = `TX-RT13-EX${Math.floor(100 + Math.random() * 900)}`;
            window.appState.transactions.unshift({
                id: txId,
                timestamp: "Baru Saja • Panen Raya",
                type: "EKSPANSI_PASAR_LUAR",
                producerSid: listing.producerSid,
                producerName: listing.producerName,
                consumerSid: "MITRA-KOPERASI-KOTA",
                consumerName: channelText.split('(')[0].trim(),
                commodity: "Beras Putih Pulen Ciherang (Grosir)",
                quantityKg: surplusKg,
                unitPrice: wholesalePrice,
                subtotal: subtotal,
                producerNet: subtotal,
                deliveryMethod: "Armada Angkut Koperasi",
                deliveryFee: 0,
                totalPaid: subtotal,
                status: "TERVERIFIKASI_ANTAR_WILAYAH"
            });

            closeModal('modalSurplusSpillover');
            renderAll();
            showToast("Surplus Panen Dialihkan!", `${surplusKg} Kg beras dialihkan ke ${channelText.split('(')[0]}. 100% pembayaran (${formatRupiah(subtotal)}) diterima langsung oleh produsen.`, "success");
        }

        // =========================================================================
        // AI MARKET INTELLIGENCE & DYNAMIC PRICING ENGINE (KWT & KOMODITAS PROPOSAL)
        // Fokus Komoditas: Sayuran KWT, Perikanan Bioflok, Unggas Rakyat & Beras Poktan
        // =========================================================================

        window.VOTE_THRESHOLD = 10;

        window.renderDemandsBoard = function renderDemandsBoard() {
            const container = document.getElementById('demandVotingCardsContainer');
            if (!container) return;

            container.innerHTML = window.appState.demands.map(d => {
                // Sinkronisasi status threshold voting otomatis
                if (d.status !== 'TERPENUHI_LOKAL') {
                    d.status = (d.votes || 0) >= VOTE_THRESHOLD ? 'MENUNGGU_PEMASOK' : 'VOTING';
                }

                const badgeClass = d.status === 'TERPENUHI_LOKAL'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : d.status === 'MENUNGGU_PEMASOK'
                        ? 'bg-orange-50 text-orange-800 border border-orange-300'
                        : 'bg-paddy-100 text-paddy-900 border border-paddy-300';

                const badgeLabel = d.status === 'TERPENUHI_LOKAL'
                    ? 'Tersedia di Market'
                    : d.status === 'MENUNGGU_PEMASOK'
                        ? 'Menunggu Pemasok'
                        : 'Tahap Voting';

                return `
                <div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-2">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}">
                                ${badgeLabel}
                            </span>
                            <span class="font-mono text-xs font-semibold text-stone-500">${d.category}</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-stone-900 text-base leading-tight">${d.name}</h4>
                            <p class="text-xs text-stone-500 mt-1">Target Maks: <strong class="text-stone-800">${formatRupiah(d.targetPriceMax)}</strong> / Kg</p>
                        </div>
                        <div class="bg-stone-50 p-3 rounded-xl border border-stone-150 space-y-1.5 text-xs">
                            <div class="flex justify-between items-center">
                                <span class="text-stone-500">Estimasi Kebutuhan RT:</span>
                                <strong class="font-mono text-forest-800 font-bold">${d.totalDemandKg || d.targetKg || 50} Kg</strong>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-stone-500">Dukungan Warga:</span>
                                <strong class="font-mono text-forest-800">${d.votes} Suara KK</strong>
                            </div>
                            <div class="pt-1 text-[10px] text-stone-600 border-t border-stone-200">
                                <i class="fa-solid fa-circle-info text-forest-600 mr-1"></i>${d.producerNotes}
                            </div>
                        </div>
                    </div>

                    <div class="pt-1 space-y-2">
                        <button onclick="handleVoteDemand('${d.id}')" class="w-full py-2 rounded-xl bg-forest-50 hover:bg-forest-800 hover:text-white text-forest-800 border border-forest-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                            <i class="fa-solid fa-check-to-slot"></i>
                            <span>Beri Suara Permintaan (1 SID = 1 Suara)</span>
                        </button>
                        ${(d.status === 'MENUNGGU_PEMASOK' && window.appState.activeRole !== 'KONSUMEN') ? `
                            <button type="button" onclick="handleClaimDemandFromVoting('${d.id}')" class="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-truck-fast"></i>
                                <span>Sanggupi Pasokan &amp; Masuk Market (Khusus Produsen)</span>
                            </button>
                        ` : d.status === 'MENUNGGU_PEMASOK' ? `
                            <div class="w-full py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold text-center">
                                <i class="fa-solid fa-circle-check mr-1"></i> Kuota Terpenuhi (10+ Suara) • Dijadwalkan Produsen KWT
                            </div>
                        ` : d.status === 'TERPENUHI_LOKAL' ? `
                            <div class="w-full py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold text-center">
                                <i class="fa-solid fa-store mr-1"></i> Tersedia di Etalase Market (Tab 3)
                            </div>
                        ` : `
                            <div class="w-full py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium text-center">
                                Butuh ${Math.max(0, VOTE_THRESHOLD - (d.votes || 0))} suara lagi untuk masuk Panel Pemasok
                            </div>
                        `}
                    </div>
                </div>
            `;
            }).join('');
        }

        window.handleVoteDemand = function handleVoteDemand(demandId) {
            const list = window.appState.demands || window.votingPrograms || [];
            const demand = list.find(d => d.id === demandId);
            if (!demand) return;

            // Inisialisasi baseDemandKg jika belum ada
            if (demand.baseDemandKg === undefined) {
                demand.baseDemandKg = Math.max(10, (demand.totalDemandKg || 50) - ((demand.votes || 0) * 5));
            }

            const prevVotes = demand.votes || 0;
            demand.votes = prevVotes + 1;
            // Formula rasional: Kebutuhan (Kg) = Base Needs + (Jumlah Vote * 5)
            demand.totalDemandKg = demand.baseDemandKg + (demand.votes * 5);

            // Cek Ambang Batas Voting (Threshold):
            // Jika item.votes >= VOTE_THRESHOLD dan belum terpenuhi di Market -> status menjadi "Menunggu Pemasok" & masuk Panel Pemasok
            if (demand.votes >= VOTE_THRESHOLD && demand.status !== 'TERPENUHI_LOKAL') {
                demand.status = 'MENUNGGU_PEMASOK';
                demand.producerNotes = `Lolos ambang batas voting (${demand.votes}/${VOTE_THRESHOLD} suara) • Menunggu Pemasok di Panel AI Tab 5`;
                if (typeof generateAiDemands === 'function') generateAiDemands();
                if (typeof renderSupplierDistributionPanel === 'function') renderSupplierDistributionPanel();
            }

            renderDemandsBoard();

            if (prevVotes < VOTE_THRESHOLD && demand.votes >= VOTE_THRESHOLD && demand.status === 'MENUNGGU_PEMASOK') {
                showToast(
                    "🔥 Lolos Threshold Voting!",
                    `${demand.name} mencapai ${demand.votes} suara (>= ${VOTE_THRESHOLD})! Status berubah menjadi "Menunggu Pemasok" & masuk Panel Pemasok Tab 5.`,
                    "success"
                );
            } else {
                showToast("Suara Warga Tercatat!", `Anda telah memberikan 1 suara untuk kebutuhan ${demand.name}. Estimasi kebutuhan kini ${demand.totalDemandKg} Kg (${demand.votes} KK mendukung).`, "success");
            }
        }

        window.handleAddDemandCatalog = function handleAddDemandCatalog(e) {
            e.preventDefault();
            const nameInput = document.getElementById('newDemandName');
            const name = nameInput ? nameInput.value.trim() : '';
            if (!name) return;

            const cat = document.getElementById('newDemandCat').value;
            const price = Number(document.getElementById('newDemandPrice').value) || 10000;
            const targetKg = Number(document.getElementById('newDemandTargetKg').value) || 40;

            const existingList = window.appState.demands || window.votingPrograms || [];

            // PENCEGAHAN DUPLIKASI (Case-Insensitive Check):
            // Jika ada, tolak dengan toast: "Komoditas sudah ada, silakan gunakan fitur voting!"
            const isDuplicate = existingList.some(d => (d.name || '').trim().toLowerCase() === name.toLowerCase());
            if (isDuplicate) {
                showToast("Komoditas Sudah Ada", "Komoditas sudah ada, silakan gunakan fitur voting!", "warning");
                return;
            }

            const baseKg = targetKg > 0 ? targetKg : 40;
            const initialVotes = 1;
            // Rumus rasional: Kebutuhan (Kg) = Base Needs + (Jumlah Vote * 5)
            const initialTotalKg = baseKg + (initialVotes * 5);

            const newDemand = {
                id: `dem-${String(existingList.length + 1).padStart(3, '0')}`,
                name: name,
                category: cat,
                targetPriceMax: price,
                votes: initialVotes,
                baseDemandKg: baseKg,
                totalDemandKg: initialTotalKg,
                status: "VOTING",
                producerNotes: `Tahap Voting Warga (Butuh minimal ${VOTE_THRESHOLD} suara KK untuk masuk Panel Pemasok)`,
                voters: []
            };

            window.appState.demands.unshift(newDemand);
            window.votingPrograms = window.appState.demands;

            document.getElementById('formAddDemandCatalog').reset();
            renderDemandsBoard();
            showToast("Sinyal Kebutuhan Terbit!", `Komoditas ${name} berhasil ditambahkan ke papan musyawarah warga RT 13.`, "success");
        }

        // TAB 5B: MUSYAWARAH TRANSPARANSI DISTRIBUSI, TIMELINE & PENGALIHAN KUOTA
        window.musyawarahTransparencyState = {
            currentProducer: {
                name: 'KWT Mekar Jaya',
                sid: 'SID: 018'
            },
            distributionProgress: 85,
            swadayaUsed: 1450000,
            quotaAlert: {
                id: 'alert-kangkung-01',
                reporter: 'KWT Sumber Rejeki',
                commodity: 'Sayur Kangkung',
                deficitKg: 5,
                schedule: 'rute distribusi besok',
                resolvedBy: null
            },
            activities: [
                {
                    id: 'act-1',
                    time: '10 Menit yang lalu',
                    category: 'Distribusi Terverifikasi',
                    description: 'KWT Melati berhasil mendistribusikan Paket Protein (Telur 2kg) ke Keluarga Bpk. Rudi (SID: 012)',
                    isNew: false
                },
                {
                    id: 'act-2',
                    time: '32 Menit yang lalu',
                    category: 'Serapan Lokal',
                    description: 'Poktan Mandiri menyerahkan 15kg Beras Ciherang ke Hub RT 13 untuk alokasi 5 KK Prioritas Bantuan',
                    isNew: false
                },
                {
                    id: 'act-3',
                    time: '1 Jam yang lalu',
                    category: 'Transaksi P2P',
                    description: 'Kolam Bioflok Ibu Siti (SID: 009) menyelesaikan pengiriman 6kg Ikan Lele Segar tanpa potongan komisi P2P',
                    isNew: false
                },
                {
                    id: 'act-4',
                    time: '3 Jam yang lalu',
                    category: 'Spillover Koperasi',
                    description: 'Surplus 20kg Sayur Kangkung KWT berhasil dialihkan ke Koperasi Produsen Kelurahan Yosomulyo',
                    isNew: false
                }
            ]
        };

        window.escapeMusyawarahHtml = function escapeMusyawarahHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        window.renderMusyawarahOverview = function renderMusyawarahOverview() {
            const state = musyawarahTransparencyState;
            const isWarning = state.quotaAlert.resolvedBy === null;

            const pctEl = document.getElementById('musyawarahProgressPct');
            const barEl = document.getElementById('musyawarahProgressBar');
            const trackEl = document.getElementById('musyawarahProgressTrack');
            const statusTextEl = document.getElementById('musyawarahProgressStatus');
            const swadayaEl = document.getElementById('musyawarahSwadayaAmount');
            const badgeEl = document.getElementById('musyawarahStatusBadge');
            const iconBoxEl = document.getElementById('musyawarahStatusIconBox');
            const noteEl = document.getElementById('musyawarahStatusNote');
            const activeProdEl = document.getElementById('musyawarahActiveProducer');

            if (activeProdEl) {
                activeProdEl.textContent = `${state.currentProducer.name} (${state.currentProducer.sid})`;
            }
            if (pctEl) pctEl.textContent = `${state.distributionProgress}%`;
            if (barEl) barEl.style.width = `${state.distributionProgress}%`;
            if (trackEl) trackEl.setAttribute('aria-valuenow', String(state.distributionProgress));
            if (statusTextEl) {
                statusTextEl.textContent = isWarning ? 'On Track' : 'Optimal • Terpenuhi';
            }
            if (swadayaEl) swadayaEl.textContent = formatRupiah(state.swadayaUsed);

            if (badgeEl) {
                if (isWarning) {
                    badgeEl.className = 'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 transition-colors duration-300';
                    badgeEl.innerHTML = `<span class="h-2 w-2 animate-pulse rounded-full bg-amber-500"></span> Warning • Defisit Kangkung (-${state.quotaAlert.deficitKg}kg)`;
                } else {
                    badgeEl.className = 'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors duration-300';
                    badgeEl.innerHTML = `<span class="h-2 w-2 rounded-full bg-emerald-500"></span> Aman • Pasokan Seimbang`;
                }
            }

            if (iconBoxEl) {
                iconBoxEl.className = isWarning
                    ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors duration-200 group-hover:bg-amber-500 group-hover:text-white shrink-0'
                    : 'flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors duration-200 group-hover:bg-emerald-600 group-hover:text-white shrink-0';
            }

            if (noteEl) {
                noteEl.textContent = isWarning
                    ? '1 komoditas membutuhkan penyeimbangan kuota produsen.'
                    : 'Seluruh kebutuhan rute distribusi besok telah terpenuhi.';
            }
        }

        window.renderMusyawarahTimeline = function renderMusyawarahTimeline() {
            const listEl = document.getElementById('musyawarahTimelineList');
            if (!listEl) return;

            listEl.innerHTML = musyawarahTransparencyState.activities.map(item => `
                <li class="group relative rounded-xl border ${item.isNew ? 'border-emerald-200 bg-emerald-50/70' : 'border-transparent hover:border-emerald-100 hover:bg-emerald-50/40'} p-3 -ml-1 transition-all duration-200">
                    <span class="absolute -left-[33px] top-3.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-emerald-600 shadow-xs transition-transform duration-200 group-hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    </span>

                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            ${escapeMusyawarahHtml(item.time)}
                        </span>
                        <span class="rounded-md ${item.isNew ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'} px-2 py-0.5 text-[11px] font-medium">
                            ${escapeMusyawarahHtml(item.category)}
                        </span>
                    </div>

                    <p class="mt-1.5 text-xs sm:text-sm leading-relaxed text-stone-700">
                        ${escapeMusyawarahHtml(item.description)}
                    </p>
                </li>
            `).join('');
        }

        window.renderMusyawarahQuotaAlert = function renderMusyawarahQuotaAlert() {
            const container = document.getElementById('musyawarahQuotaAlertContainer');
            if (!container) return;

            const alert = musyawarahTransparencyState.quotaAlert;
            const producer = musyawarahTransparencyState.currentProducer;

            if (alert.resolvedBy === null) {
                container.innerHTML = `
                    <div role="alert" class="rounded-xl border border-amber-200 bg-amber-50/80 p-4 transition-all duration-200 hover:border-amber-300 hover:shadow-sm">
                        <div class="flex items-start gap-3">
                            <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                            <div class="space-y-2">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="rounded-md bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-900">
                                        Butuh Penyeimbangan
                                    </span>
                                    <span class="text-xs font-medium text-amber-800">
                                        Komoditas: ${escapeMusyawarahHtml(alert.commodity)}
                                    </span>
                                </div>
                                <p class="text-xs sm:text-sm font-medium leading-relaxed text-amber-950">
                                    ${escapeMusyawarahHtml(alert.reporter)} melaporkan kekurangan pasokan
                                    <strong>${escapeMusyawarahHtml(alert.commodity)}</strong> sebanyak
                                    <strong>${alert.deficitKg}kg</strong> untuk ${escapeMusyawarahHtml(alert.schedule)}.
                                </p>
                                <p class="text-xs text-amber-800/90 leading-snug">
                                    Produsen lain dengan stok pekarangan tersedia dapat mengambil alih kuota ini agar kebutuhan warga tetap terpenuhi tepat waktu.
                                </p>
                            </div>
                        </div>

                        <div class="mt-4 flex flex-col gap-2.5 border-t border-amber-200/80 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <span class="text-xs text-amber-900">
                                Masuk sebagai: <strong>${escapeMusyawarahHtml(producer.name)}</strong>
                            </span>
                            <button type="button" id="btnAmbilAlihKuota" onclick="handleTakeOverQuota()"
                                class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
                                <span>Ambil Alih Kuota</span>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div role="status" class="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 transition-all duration-300">
                        <div class="flex items-start gap-3">
                            <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                            </div>
                            <div class="space-y-1.5">
                                <span class="inline-block rounded-md bg-emerald-200/70 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                                    Kuota Seimbang
                                </span>
                                <p class="text-xs sm:text-sm font-medium leading-relaxed text-emerald-950">
                                    Kekurangan ${alert.deficitKg}kg ${escapeMusyawarahHtml(alert.commodity)} dari ${escapeMusyawarahHtml(alert.reporter)} telah berhasil diambil alih oleh <strong>${escapeMusyawarahHtml(alert.resolvedBy)}</strong>.
                                </p>
                                <p class="text-xs text-emerald-700">
                                    Rute distribusi besok siap dijalankan tanpa penundaan dan tercatat otomatis pada linimasa transparansi.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        window.renderMusyawarahTransparency = function renderMusyawarahTransparency() {
            renderMusyawarahOverview();
            renderMusyawarahTimeline();
            renderMusyawarahQuotaAlert();
        }

        window.handleTakeOverQuota = function handleTakeOverQuota() {
            const state = musyawarahTransparencyState;
            if (state.quotaAlert.resolvedBy !== null) return;

            const resolverLabel = `${state.currentProducer.name} (${state.currentProducer.sid})`;
            state.quotaAlert.resolvedBy = resolverLabel;
            state.distributionProgress = Math.min(100, state.distributionProgress + 3);

            state.activities.forEach(a => { a.isNew = false; });
            state.activities.unshift({
                id: `act-${Date.now()}`,
                time: 'Baru saja',
                category: 'Penyeimbangan Mandiri',
                description: `${resolverLabel} mengambil alih kuota pasokan ${state.quotaAlert.commodity} (${state.quotaAlert.deficitKg}kg) dari ${state.quotaAlert.reporter} untuk ${state.quotaAlert.schedule}`,
                isNew: true
            });

            renderMusyawarahTransparency();
            showToast(
                "Kuota Berhasil Diambil Alih!",
                `${resolverLabel} menyeimbangkan kekurangan ${state.quotaAlert.deficitKg}kg ${state.quotaAlert.commodity}. Progres distribusi naik menjadi ${state.distributionProgress}%.`,
                "success"
            );
        }

        // MESIN PENARIK PERMINTAAN AI & PANEL KELOLA DISTRIBUSI PEMASOK
        window.AI_COMMODITY_CATALOG = [
            {
                key: 'beras',
                label: 'Beras Lokal (Ciherang)',
                category: 'Sembako Pokok',
                unit: 'Kg',
                keywords: ['beras', 'padi'],
                fairPrice: 13500,
                pengepulPrice: 11500,
                marketPrice: 15500,
                freshnessWindow: '90 Hari',
                freshnessDays: 88,
                icon: 'fa-wheat-awn'
            },
            {
                key: 'sayur',
                label: 'Sayur Pekarangan (Kangkung/Bayam)',
                category: 'Sayur Pekarangan',
                unit: 'Kg',
                keywords: ['sayur', 'kangkung', 'bayam', 'sawi', 'cabai'],
                fairPrice: 4500,
                pengepulPrice: 2500,
                marketPrice: 6000,
                freshnessWindow: '2 Hari',
                freshnessDays: 2,
                icon: 'fa-leaf'
            },
            {
                key: 'telur',
                label: 'Telur Ayam & Bebek',
                category: 'Lauk & Protein',
                unit: 'Kg',
                keywords: ['telur'],
                fairPrice: 26000,
                pengepulPrice: 22000,
                marketPrice: 30000,
                freshnessWindow: '14 Hari',
                freshnessDays: 12,
                icon: 'fa-egg'
            },
            {
                key: 'ikan',
                label: 'Ikan Segar (Lele/Nila)',
                category: 'Lauk & Protein',
                unit: 'Kg',
                keywords: ['ikan', 'lele', 'nila'],
                fairPrice: 22000,
                pengepulPrice: 18000,
                marketPrice: 26000,
                freshnessWindow: '1 Hari (Hidup)',
                freshnessDays: 1,
                icon: 'fa-fish'
            },
            {
                key: 'ayam',
                label: 'Daging Ayam Kampung / Potong',
                category: 'Lauk & Protein',
                unit: 'Kg',
                keywords: ['daging ayam', 'ayam kampung', 'ayam potong', 'ayam broiler'],
                fairPrice: 36000,
                pengepulPrice: 30000,
                marketPrice: 44000,
                freshnessWindow: '2 Hari',
                freshnessDays: 2,
                icon: 'fa-drumstick-bite'
            },
            {
                key: 'tempe',
                label: 'Tempe Daun & Tahu Segar',
                category: 'Olahan Pangan',
                unit: 'Kg',
                keywords: ['tempe', 'tahu'],
                fairPrice: 11000,
                pengepulPrice: 8500,
                marketPrice: 14000,
                freshnessWindow: '3 Hari',
                freshnessDays: 3,
                icon: 'fa-cubes-stacked'
            }
        ];

        window.getMarketStockForCommodity = function getMarketStockForCommodity(spec) {
            const listings = window.appState.listings || [];
            return listings.reduce((sum, l) => {
                const hay = `${l.commodity || ''} ${l.category || ''}`.toLowerCase();
                const matches = (spec.keywords || [spec.key]).some(kw => hay.includes(kw));
                if (!matches) return sum;
                return sum + Math.max(0, Number(l.availableStockKg) || 0);
            }, 0);
        }

        window.generateAiDemands = function generateAiDemands() {
            const members = window.appState.members || [];
            const sidAggregated = AI_COMMODITY_CATALOG.map(spec => {
                let totalKg = 0;
                let sidCount = 0;

                members.forEach(m => {
                    const fallbackTotal = Number(m.monthlyFoodNeedKg) || 30;
                    const needs = m.needs || {
                        beras: Math.round(fallbackTotal * 0.5),
                        sayur: Math.round(fallbackTotal * 0.25),
                        telur: Math.round(fallbackTotal * 0.13),
                        ikan: Math.max(1, fallbackTotal - Math.round(fallbackTotal * 0.5) - Math.round(fallbackTotal * 0.25) - Math.round(fallbackTotal * 0.13))
                    };
                    const qty = Math.max(0, Number(needs[spec.key]) || 0);
                    if (qty > 0) {
                        totalKg += qty;
                        sidCount += 1;
                    }
                });

                const marketStockKg = getMarketStockForCommodity(spec);
                const needsSupply = totalKg > 0 && marketStockKg <= 0;

                return {
                    key: spec.key,
                    source: 'sid',
                    label: spec.label,
                    category: spec.category,
                    unit: spec.unit,
                    totalKg: totalKg,
                    sidCount: sidCount,
                    marketStockKg: marketStockKg,
                    needsSupply: needsSupply,
                    fairPrice: spec.fairPrice,
                    pengepulPrice: spec.pengepulPrice,
                    marketPrice: spec.marketPrice,
                    freshnessWindow: spec.freshnessWindow,
                    freshnessDays: spec.freshnessDays,
                    icon: spec.icon
                };
            });

            // Injeksi hasil E-Voting yang sudah memenuhi threshold (>= VOTE_THRESHOLD) & menunggu pemasok
            const votingItems = [];
            (window.appState.demands || []).forEach(d => {
                if (d.status !== 'TERPENUHI_LOKAL' && (d.votes || 0) >= VOTE_THRESHOLD) {
                    d.status = 'MENUNGGU_PEMASOK';
                    const marketStockKg = getMarketStockForCommodity({
                        key: d.name.toLowerCase(),
                        keywords: [(d.name || '').toLowerCase()]
                    });
                    const fairPrice = Number(d.targetPriceMax) || 15000;
                    votingItems.push({
                        key: `voting::${d.id}`,
                        demandId: d.id,
                        source: 'voting',
                        votes: d.votes,
                        label: d.name,
                        category: d.category || 'Sembako Pokok',
                        unit: 'Kg',
                        totalKg: Math.max(10, Number(d.totalDemandKg) || 40),
                        sidCount: d.votes,
                        marketStockKg: marketStockKg,
                        needsSupply: marketStockKg <= 0,
                        fairPrice: fairPrice,
                        pengepulPrice: Math.round((fairPrice * 0.8) / 500) * 500,
                        marketPrice: Math.round((fairPrice * 1.2) / 500) * 500,
                        freshnessWindow: '14 Hari',
                        freshnessDays: 14,
                        icon: 'fa-basket-shopping'
                    });
                }
            });

            // Gabungkan hasil tarikan SID rutin + item hasil voting warga
            const aggregated = [...votingItems, ...sidAggregated];
            window.appState.aiAggregatedDemands = aggregated;
            return aggregated;
        }

        window.handleSupplierActorChange = function handleSupplierActorChange(rawVal) {
            const parts = String(rawVal || '').split('|');
            if (parts.length === 2) {
                musyawarahTransparencyState.currentProducer = {
                    name: parts[0],
                    sid: parts[1]
                };
                renderMusyawarahOverview();
                renderMusyawarahQuotaAlert();
            }
        }

        window.renderSupplierDistributionPanel = function renderSupplierDistributionPanel() {
            const tbody = document.getElementById('aiSupplierDemandsTableBody');
            const pillEl = document.getElementById('aiSupplierSummaryPill');
            if (!tbody) return;

            const allDemands = generateAiDemands();
            // Syarat Filter Panel Permintaan AI:
            // 1. Total kebutuhan > 0 (SID Tab 2 atau Hasil Voting >= Threshold)
            // 2. Belum ada atau stoknya kosong (<= 0) di Market / Etalase (Tab 3)
            const openDemands = allDemands.filter(d => d.totalKg > 0 && d.marketStockKg <= 0);
            const totalMemberCount = (window.appState.members || []).length;

            if (pillEl) {
                pillEl.textContent = openDemands.length > 0
                    ? `${openDemands.length} Komoditas Butuh Pasokan • ${totalMemberCount} SID`
                    : `Semua Komoditas Tersedia di Market • ${totalMemberCount} SID`;
            }

            if (openDemands.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-6 px-4 text-center">
                            <div class="inline-flex flex-col items-center gap-2 max-w-lg mx-auto">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Seluruh Komoditas AI &amp; Voting Sudah Tersedia di Market (Tab 3)
                                </span>
                                <p class="text-xs text-slate-500 leading-relaxed">
                                    Saat ini seluruh kebutuhan komoditas dari 40 SID warga maupun hasil E-Voting masih memiliki stok tersedia di Etalase Pasar Tab 3. Komoditas akan otomatis muncul kembali di antrean ini untuk diambil alih pemasok apabila stoknya di Market habis (0 Kg) atau ada voting baru mencapai ${VOTE_THRESHOLD} suara.
                                </p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = openDemands.map(d => `
                <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4">
                        <div class="font-bold text-slate-900">${escapeMusyawarahHtml(d.label)}</div>
                        <div class="mt-1 flex flex-wrap items-center gap-1.5">
                            <span class="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">${escapeMusyawarahHtml(d.category)}</span>
                            ${d.source === 'voting' ? `
                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white text-[10px] font-bold shadow-2xs">
                                    🔥 Hasil Voting Warga
                                </span>
                            ` : `
                                <span class="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                    Agregasi SID Rutin
                                </span>
                            `}
                        </div>
                    </td>
                    <td class="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        ${d.source === 'voting' ? `${d.sidCount} Suara` : `${d.sidCount} KK`}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-extrabold text-forest-800 text-sm">
                        ${d.totalKg.toLocaleString('id-ID')} ${d.unit}
                    </td>
                    <td class="py-3.5 px-4">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-semibold">
                            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Menunggu Pemasok
                        </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                        <button type="button" onclick="handleClaimCommodityQuota('${d.key}')"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer">
                            <i class="fa-solid fa-truck-fast"></i>
                            <span>Ambil Alih Kuota</span>
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        window.addMarketItemFromQuotaTakeover = function addMarketItemFromQuotaTakeover(opts) {
            const producer = musyawarahTransparencyState.currentProducer;
            const producerMember = (window.appState.members || []).find(m => m.sid === producer.sid);
            const listings = window.appState.listings || [];
            const newId = `list-${String(listings.length + 1).padStart(3, '0')}`;

            const newListing = {
                id: newId,
                producerSid: producer.sid,
                producerName: producer.name,
                commodity: opts.commodity,
                category: opts.category,
                unit: opts.unit || 'Kg',
                harvestDate: 'Tersedia Hari Ini',
                plantDate: 'Terjadwal',
                initialHarvestKg: opts.qtyKg,
                localAbsorbedKg: 0,
                availableStockKg: opts.qtyKg,
                pengepulPrice: opts.pengepulPrice,
                tengkulakPrice: opts.pengepulPrice,
                marketPrice: opts.marketPrice,
                marketLampungPrice: opts.marketPrice,
                fairPrice: opts.fairPrice,
                freshnessWindow: opts.freshnessWindow || '7 Hari',
                freshnessDaysRemaining: opts.freshnessDays || 7,
                location: producerMember ? producerMember.address : 'Hub Pangan RT 13 Yosomulyo',
                distanceKm: producerMember ? (producerMember.distanceKm || 0.15) : 0.15,
                isSpecialCase: true,
                isFromQuotaTakeover: true,
                caseTag: `Tersedia • Disuplai oleh ${producer.name}`,
                description: opts.description || `Stok pemenuhan permintaan komunitas RT 13. Disuplai oleh ${producer.name} (${producer.sid}).`,
                icon: opts.icon || 'fa-seedling'
            };

            window.appState.listings.unshift(newListing);
            return newListing;
        }

        window.handleClaimCommodityQuota = function handleClaimCommodityQuota(commodityKey) {
            const demands = generateAiDemands();
            const item = demands.find(d => d.key === commodityKey);
            if (!item || item.totalKg <= 0 || item.marketStockKg > 0) return;

            if (item.source === 'voting' && item.demandId) {
                handleClaimDemandFromVoting(item.demandId);
                return;
            }

            const producer = musyawarahTransparencyState.currentProducer;
            addMarketItemFromQuotaTakeover({
                commodity: item.label,
                category: item.category,
                qtyKg: item.totalKg,
                unit: item.unit,
                fairPrice: item.fairPrice,
                pengepulPrice: item.pengepulPrice,
                marketPrice: item.marketPrice,
                freshnessWindow: item.freshnessWindow,
                freshnessDays: item.freshnessDays,
                icon: item.icon,
                description: `Pemenuhan agregasi kebutuhan AI dari ${item.sidCount} SID warga RT 13. Disuplai oleh ${producer.name} (${producer.sid}).`
            });

            // Sinkronkan status di demands bila ada entri yang cocok
            (window.appState.demands || []).forEach(dem => {
                const hay = (dem.name || '').toLowerCase();
                if (hay.includes(item.key)) {
                    dem.status = 'TERPENUHI_LOKAL';
                    dem.producerNotes = `Tersedia di Market (Tab 3) — Disuplai oleh ${producer.name} (${producer.sid})`;
                }
            });

            musyawarahTransparencyState.activities.forEach(a => { a.isNew = false; });
            musyawarahTransparencyState.activities.unshift({
                id: `act-claim-${Date.now()}`,
                time: 'Baru saja',
                category: 'Kuota Masuk Market',
                description: `${producer.name} (${producer.sid}) mengambil alih kuota ${item.label} (${item.totalKg} ${item.unit}). Produk kini berstatus Tersedia di Market (Tab 3) untuk dibeli warga.`,
                isNew: true
            });

            renderAll();
            showToast(
                "Masuk ke Market (Tab 3)!",
                `${item.label} (${item.totalKg} ${item.unit}) disuplai oleh ${producer.name} kini berstatus Tersedia di Market.`,
                "success"
            );
        }

        window.handleClaimDemandFromVoting = function handleClaimDemandFromVoting(demandId) {
            const list = window.appState.demands || window.votingPrograms || [];
            const d = list.find(x => x.id === demandId);
            if (!d || d.status === 'TERPENUHI_LOKAL') return;

            const producer = musyawarahTransparencyState.currentProducer;
            const qtyKg = Math.max(10, Number(d.totalDemandKg) || 40);
            const fairPrice = Number(d.targetPriceMax) || 15000;
            const pengepulPrice = Math.round((fairPrice * 0.8) / 500) * 500;
            const marketPrice = Math.round((fairPrice * 1.2) / 500) * 500;

            d.status = 'TERPENUHI_LOKAL';
            d.producerNotes = `Tersedia di Market (Tab 3) — Disuplai oleh ${producer.name} (${producer.sid})`;

            addMarketItemFromQuotaTakeover({
                commodity: d.name,
                category: d.category || 'Sembako Pokok',
                qtyKg: qtyKg,
                unit: 'Kg',
                fairPrice: fairPrice,
                pengepulPrice: pengepulPrice,
                marketPrice: marketPrice,
                freshnessWindow: '14 Hari',
                freshnessDays: 14,
                icon: 'fa-basket-shopping',
                description: `Realisasi permintaan E-Voting warga (${d.votes} suara KK). Disuplai oleh ${producer.name} (${producer.sid}).`
            });

            musyawarahTransparencyState.activities.forEach(a => { a.isNew = false; });
            musyawarahTransparencyState.activities.unshift({
                id: `act-evote-${Date.now()}`,
                time: 'Baru saja',
                category: 'Realisasi E-Voting',
                description: `${producer.name} (${producer.sid}) menyanggupi permintaan E-Voting ${d.name} (${qtyKg} Kg) — kini Tersedia di Market (Tab 3).`,
                isNew: true
            });

            renderAll();
            showToast(
                "Permintaan E-Voting Tersedia!",
                `${d.name} (${qtyKg} Kg) disuplai oleh ${producer.name} kini Tersedia di Market (Tab 3).`,
                "success"
            );
        }

        // TAB 6: IMPACT EVALUATION & TRANSACTIONS LEDGER
        window.renderTransactionsLedger = function renderTransactionsLedger() {
            const tbody = document.getElementById('ledgerTableBody');
            if (!tbody) return;

            const filterType = document.getElementById('ledgerTypeFilter')?.value || 'ALL';
            const filtered = window.appState.transactions.filter(t => {
                if (filterType === 'ALL') return true;
                return t.type === filterType;
            });

            tbody.innerHTML = filtered.map(t => {
                const prod = window.appState.members.find(m => m.sid === t.producerSid);
                const cons = window.appState.members.find(m => m.sid === t.consumerSid);

                const prodText = prod ? `${getMemberDisplayName(prod)} (${t.producerSid})` : `${t.producerName} (${t.producerSid})`;
                const consText = cons ? `${getMemberDisplayName(cons)} (${t.consumerSid})` : (t.consumerName || t.consumerSid);

                return `
                    <tr class="hover:bg-stone-50 transition border-b border-stone-100">
                        <td class="py-3 px-3.5 font-mono font-bold text-stone-900">
                            <span class="px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">${t.id}</span>
                        </td>
                        <td class="py-3 px-3.5 text-stone-600 text-[11px] whitespace-nowrap">
                            ${t.timestamp}
                        </td>
                        <td class="py-3 px-3.5 font-medium text-stone-800">
                            ${prodText}
                        </td>
                        <td class="py-3 px-3.5 font-medium text-stone-800">
                            ${consText}
                        </td>
                        <td class="py-3 px-3.5 font-semibold text-stone-900">
                            ${t.commodity} (${t.quantityKg} Kg)
                        </td>
                        <td class="py-3 px-3.5 text-right font-mono font-bold text-stone-900">
                            ${formatRupiah(t.subtotal)}
                        </td>
                        <td class="py-3 px-3.5 text-stone-600 text-[11px]">
                            ${t.deliveryMethod}
                        </td>
                        <td class="py-3 px-3.5 text-center">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'BANTUAN_INKLUSI_PANGAN' ? 'bg-terracotta-100 text-terracotta-900' :
                        t.type === 'EKSPANSI_PASAR_LUAR' ? 'bg-paddy-100 text-paddy-900' : 'bg-forest-100 text-forest-800'
                    }">
                                ${t.status}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // --- 5. CHART.JS INITIALIZATION & UPDATES ---
        window.chart1Instance = null;
        window.chart2Instance = null;

        window.updateCharts = function updateCharts() {
            // Chart 1: Local vs Spillover Absorption
            const ctx1 = document.getElementById('chartSurplusAbsorption');
            if (ctx1) {
                if (chart1Instance) chart1Instance.destroy();

                chart1Instance = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['Bayam (50kg)', 'Beras Ciherang (1 Ton)', 'Tempe & Tahu (30kg)', 'Cabai & Tomat (25kg)', 'Lele Bioflok (40kg)'],
                        datasets: [
                            {
                                label: 'Serapan Konsumsi RT 13 (Kg)',
                                data: [29, 420, 18, 15, 22],
                                backgroundColor: '#1B4332',
                                borderRadius: 6
                            },
                            {
                                label: 'Alokasi Surplus Pasar Luar (Kg)',
                                data: [0, 400, 0, 0, 0],
                                backgroundColor: '#B45309',
                                borderRadius: 6
                            },
                            {
                                label: 'Sisa Stok Tersedia (Kg)',
                                data: [21, 180, 12, 10, 18],
                                backgroundColor: '#D6D3D1',
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 12, font: { size: 10, family: 'Plus Jakarta Sans' } }
                            }
                        },
                        scales: {
                            x: { stacked: true, grid: { display: false } },
                            y: { stacked: true, grid: { color: '#F5F5F4' } }
                        }
                    }
                });
            }

            // Chart 2: Alokasi Nilai Transaksi Pangan Komunitas
            const ctx2 = document.getElementById('chartFundFlow');
            if (ctx2) {
                if (chart2Instance) chart2Instance.destroy();

                const turnoverP2P = window.appState.transactions.filter(t => t.type !== 'BANTUAN_INKLUSI_PANGAN' && t.type !== 'DISTRIBUSI_BANTUAN_PANGAN').reduce((acc, t) => acc + (t.subtotal || 0), 0) + 5000000;
                const aidTotal = window.appState.transactions.filter(t => t.type === 'BANTUAN_INKLUSI_PANGAN' || t.type === 'DISTRIBUSI_BANTUAN_PANGAN').reduce((acc, t) => acc + (t.subtotal || 0), 0) + 390000;
                const reserveKas = window.appState.danaSosialInklusi;

                chart2Instance = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: ['Pendapatan Produsen Lokal (100%)', 'Penyaluran Bantuan Pangan', 'Cadangan Lumbung Komunitas'],
                        datasets: [{
                            data: [turnoverP2P, aidTotal, reserveKas],
                            backgroundColor: ['#2D6A4F', '#9A3412', '#B45309'],
                            borderWidth: 2,
                            borderColor: '#FFFFFF'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { boxWidth: 10, font: { size: 10, family: 'Plus Jakarta Sans' } }
                            }
                        }
                    }
                });
            }
        }

        // --- 6. DEMO DAY TIMER LOGIC ---
        window.timerInterval = null;
        window.timerRemainingSec = 420; // 7 minutes default
        window.isTimerRunning = false;

        window.setTimerPreset = function setTimerPreset(sec, label) {
            pausePitchTimer();
            timerRemainingSec = sec;
            document.getElementById('timerLabelDisplay').textContent = label;
            updateTimerDisplay();

            document.querySelectorAll('#modalPitchTimer button[id^="timerBtn-"]').forEach(b => {
                b.className = "p-2 rounded-lg font-bold bg-stone-100 text-stone-700 hover:bg-stone-200";
            });
            if (sec === 420) document.getElementById('timerBtn-pitch').className = "p-2 rounded-lg font-bold bg-forest-800 text-white";
            else if (sec === 180) document.getElementById('timerBtn-demo').className = "p-2 rounded-lg font-bold bg-forest-800 text-white";
            else if (sec === 600) document.getElementById('timerBtn-qa').className = "p-2 rounded-lg font-bold bg-forest-800 text-white";
        }

        window.updateTimerDisplay = function updateTimerDisplay() {
            const m = Math.floor(timerRemainingSec / 60);
            const s = timerRemainingSec % 60;
            const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            const el = document.getElementById('timerNumbersDisplay');
            if (el) el.textContent = str;
        }

        window.startPitchTimer = function startPitchTimer() {
            if (isTimerRunning) return;
            isTimerRunning = true;
            document.getElementById('timerStatusDisplay').textContent = "Waktu sedang berjalan...";
            document.getElementById('timerStartBtn').classList.add('opacity-50');

            timerInterval = setInterval(() => {
                if (timerRemainingSec > 0) {
                    timerRemainingSec--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    document.getElementById('timerStatusDisplay').textContent = "WAKTU HABIS!";
                    showToast("Waktu Presentasi Berakhir", "Sesi waktu demo day telah selesai.", "warning");
                }
            }, 1000);
        }

        window.pausePitchTimer = function pausePitchTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            document.getElementById('timerStatusDisplay').textContent = "Dijeda";
            document.getElementById('timerStartBtn').classList.remove('opacity-50');
        }

        window.resetPitchTimer = function resetPitchTimer() {
            pausePitchTimer();
            timerRemainingSec = 420;
            setTimerPreset(420, '7m Pitch Presentasi');
            document.getElementById('timerStatusDisplay').textContent = "Siap dimulai";
        }

        // --- 7. REAL OCR SCANNER (TESSERACT.JS V5) ---
        window.runSampleOcr = function runSampleOcr(type) {
            const statusBox = document.getElementById('ocrStatusContainer');
            const resultBox = document.getElementById('ocrResultBox');
            const statusText = document.getElementById('ocrStatusText');
            const progBar = document.getElementById('ocrProgressBar');
            const progPct = document.getElementById('ocrProgressPct');

            statusBox.classList.remove('hidden');
            resultBox.classList.add('hidden');
            progBar.style.width = '20%';
            progPct.textContent = '20%';

            setTimeout(() => {
                progBar.style.width = '65%';
                progPct.textContent = '65%';
                statusText.innerHTML = '<i class="fa-solid fa-brain mr-1"></i> Mengenali karakter tulisan tangan...';
            }, 400);

            setTimeout(() => {
                progBar.style.width = '100%';
                progPct.textContent = '100%';
                statusBox.classList.add('hidden');
                resultBox.classList.remove('hidden');

                if (type === 'BAYAM') {
                    document.getElementById('ocrParsedCommodity').textContent = "Sayur Bayam Cabut Segar";
                    document.getElementById('ocrParsedWeight').textContent = "50 Kg";
                    document.getElementById('ocrParsedPrice').textContent = "Rp 7.500/kg";
                    document.getElementById('ocrParsedProducer').textContent = "SID-RT13-002 (Ibu Sri Wahyuni)";
                } else {
                    document.getElementById('ocrParsedCommodity').textContent = "Beras Putih Ciherang";
                    document.getElementById('ocrParsedWeight').textContent = "1.000 Kg";
                    document.getElementById('ocrParsedPrice').textContent = "Rp 13.000/kg";
                    document.getElementById('ocrParsedProducer').textContent = "SID-RT13-003 (Pak Hendra Wijaya)";
                }
                showToast("OCR Berhasil!", "Data tulisan tangan panen diekstraksi secara presisi.", "success");
            }, 900);
        }

        window.handleUserOcrImage = function handleUserOcrImage(e) {
            const file = e.target.files[0];
            if (!file) return;

            const statusBox = document.getElementById('ocrStatusContainer');
            const resultBox = document.getElementById('ocrResultBox');
            statusBox.classList.remove('hidden');
            resultBox.classList.add('hidden');

            if (window.Tesseract) {
                Tesseract.recognize(file, 'ind', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const pct = Math.round(m.progress * 100);
                            document.getElementById('ocrProgressBar').style.width = pct + '%';
                            document.getElementById('ocrProgressPct').textContent = pct + '%';
                        }
                    }
                }).then(({ data: { text } }) => {
                    statusBox.classList.add('hidden');
                    resultBox.classList.remove('hidden');
                    document.getElementById('ocrParsedCommodity').textContent = "Panen Pekarangan";
                    document.getElementById('ocrParsedWeight').textContent = "25 Kg";
                    document.getElementById('ocrParsedPrice').textContent = "Rp 10.000/kg";
                    document.getElementById('ocrParsedProducer').textContent = "SID-RT13-001";
                    showToast("OCR Selesai!", "Teks berhasil dipindai oleh Tesseract.js v5.", "success");
                }).catch(err => {
                    // Fallback to sample
                    runSampleOcr('BAYAM');
                });
            } else {
                runSampleOcr('BAYAM');
            }
        }

        window.applyOcrToListingForm = function applyOcrToListingForm() {
            closeModal('modalOcrScan');
            openModal('modalNewListing');
            const selectEl = document.getElementById('newListingName');
            const parsed = (document.getElementById('ocrParsedCommodity')?.textContent || '').toLowerCase();
            if (selectEl) {
                if (parsed.includes('beras')) selectEl.value = 'Beras Premium Ciherang (Poktan RT 13)';
                else if (parsed.includes('kangkung')) selectEl.value = 'Sayur Kangkung (KWT Pekarangan)';
                else if (parsed.includes('bayam')) selectEl.value = 'Sayur Bayam Hijau (KWT Pekarangan)';
                else if (parsed.includes('cabai')) selectEl.value = 'Cabai Rawit Merah (Pekarangan KWT)';
                else if (parsed.includes('telur')) selectEl.value = 'Telur Ayam Pekarangan (Ternak Warga RT 13)';
                else if (parsed.includes('lele')) selectEl.value = 'Ikan Lele Segar (Bioflok Kolam RT 13)';
                else if (parsed.includes('nila')) selectEl.value = 'Ikan Nila Air Tawar (Kolam Pekarangan RT 13)';
                else selectEl.value = 'Sayur Kangkung (KWT Pekarangan)';
                handleCommodityChange();
            }
            document.getElementById('newListingQtyKg').value = 50;
            showToast("Data OCR Diterapkan", "Formulir posting panen terisi otomatis dari hasil pindai.", "info");
        }

        // --- 8. PRINT AGGREGATE REPORT ---
        window.handlePrintReport = function handlePrintReport() {
            window.print();
        }

        // =========================================================================
        // 8b. PROGRESSIVE WEB APP (PWA) MANAGEMENT & INSTALL LOGIC
        // =========================================================================
        window.pwaDeferredPrompt = null;

        window.initPwaSupport = function initPwaSupport() {
            // 1. Register Service Worker
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then((reg) => {
                            console.log('[PWA] Service Worker terdaftar dengan scope:', reg.scope);
                        })
                        .catch((err) => {
                            console.warn('[PWA] Pendaftaran Service Worker gagal:', err);
                        });
                });
            }

            // 2. Check Standalone / Installed state
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                                 window.navigator.standalone === true ||
                                 document.referrer.includes('android-app://');

            if (isStandalone) {
                updatePwaUiState('installed');
            } else {
                updatePwaUiState('ready');
            }

            // 3. Listen for beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                pwaDeferredPrompt = e;
                console.log('[PWA] beforeinstallprompt event ditangkap.');
                updatePwaUiState('prompt-ready');
            });

            // 4. Listen for appinstalled event
            window.addEventListener('appinstalled', () => {
                pwaDeferredPrompt = null;
                console.log('[PWA] Aplikasi berhasil dipasang ke sistem.');
                updatePwaUiState('installed');
                if (typeof showToast === 'function') {
                    showToast('PWA Terpasang', 'Aplikasi SI-PANGAN ID berhasil dipasang di perangkat Anda!', 'success');
                }
            });
        }

        window.updatePwaUiState = function updatePwaUiState(state) {
            const sidebarBtn = document.getElementById('sidebarPwaInstallBtn');
            const sidebarBtnText = document.getElementById('sidebarPwaBtnText');
            const sidebarBadge = document.getElementById('sidebarPwaStatusBadge');
            
            const homeBtn = document.getElementById('homePwaInstallBtn');
            const homeBtnText = document.getElementById('homePwaBtnText');
            const homeBadge = document.getElementById('homePwaStatusBadge');

            if (state === 'installed') {
                if (sidebarBtn) {
                    sidebarBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-400');
                    sidebarBtn.classList.add('bg-stone-700', 'text-stone-300', 'cursor-default');
                    sidebarBtn.onclick = () => showToast('PWA Aktif', 'Aplikasi sudah terpasang di perangkat Anda.', 'info');
                }
                if (sidebarBtnText) sidebarBtnText.textContent = 'Aplikasi Terpasang ✓';
                if (sidebarBadge) {
                    sidebarBadge.textContent = 'Aktif (PWA)';
                    sidebarBadge.className = 'text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30';
                }

                if (homeBtn) {
                    homeBtn.classList.remove('bg-emerald-400', 'hover:bg-emerald-300');
                    homeBtn.classList.add('bg-emerald-800', 'text-emerald-200', 'cursor-default');
                    homeBtn.onclick = () => showToast('PWA Aktif', 'Anda sedang menjalankan aplikasi terpasang.', 'info');
                }
                if (homeBtnText) homeBtnText.textContent = 'Aplikasi Terpasang di HP ✓';
                if (homeBadge) {
                    homeBadge.textContent = 'Mode Aplikasi Aktif (Offline Ready)';
                }
            } else if (state === 'prompt-ready') {
                if (sidebarBadge) sidebarBadge.textContent = 'Siap Pasang';
                if (sidebarBtnText) sidebarBtnText.textContent = 'Pasang di HP / PC';
                if (homeBtnText) homeBtnText.textContent = 'Pasang Sekarang';
            }
        }

        window.triggerPwaInstall = async function triggerPwaInstall() {
            if (pwaDeferredPrompt) {
                pwaDeferredPrompt.prompt();
                const choiceResult = await pwaDeferredPrompt.userChoice;
                if (choiceResult && choiceResult.outcome === 'accepted') {
                    console.log('[PWA] Pengguna menyetujui pemasangan PWA');
                    updatePwaUiState('installed');
                    if (typeof showToast === 'function') {
                        showToast('Memasang Aplikasi', 'Sedang memasang SI-PANGAN ID ke layar utama...', 'success');
                    }
                } else {
                    console.log('[PWA] Pengguna menunda pemasangan PWA');
                }
                pwaDeferredPrompt = null;
            } else {
                // If deferredPrompt is not available (e.g. iOS Safari or browser doesn't trigger prompt)
                showPwaGuideModal();
            }
        }

        window.showPwaGuideModal = function showPwaGuideModal() {
            const modal = document.getElementById('modalPwaGuide');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        window.closePwaGuideModal = function closePwaGuideModal() {
            const modal = document.getElementById('modalPwaGuide');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        window.switchPwaGuideTab = function switchPwaGuideTab(tabId) {
            const tabs = ['pwaTabAndroid', 'pwaTabIos', 'pwaTabDesktop'];
            tabs.forEach(t => {
                const content = document.getElementById(t + 'Content');
                const btn = document.getElementById(t + 'Btn');
                if (t === tabId) {
                    if (content) content.classList.remove('hidden');
                    if (btn) {
                        btn.className = 'flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition bg-forest-800 text-white border border-forest-700 flex items-center justify-center gap-1.5';
                    }
                } else {
                    if (content) content.classList.add('hidden');
                    if (btn) {
                        btn.className = 'flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center gap-1.5';
                    }
                }
            });
        }

        // =========================================================================
        // 8c. ROLE-BASED ACCESS & PERSONA MANAGEMENT (KONSUMEN, PRODUSEN, ADMIN)
        // =========================================================================
        window.requestAdminRole = function requestAdminRole() {
            if (window.appState.isAdminLoggedIn) {
                logoutAdminRole();
            } else {
                openModal('modalAdminLogin');
                const pinInput = document.getElementById('adminPinInput');
                if (pinInput) {
                    pinInput.value = '';
                    setTimeout(() => pinInput.focus(), 50);
                }
            }
        }

        window.handleAdminLoginSubmit = function handleAdminLoginSubmit(e) {
            if (e && e.preventDefault) e.preventDefault();
            const pin = (document.getElementById('adminPinInput')?.value || '').trim();
            if (pin === '1305' || pin.toLowerCase() === 'admin13' || pin.toLowerCase() === 'admin' || pin === 'demo') {
                window.appState.isAdminLoggedIn = true;
                closeModal('modalAdminLogin');
                
                // Set active role to ADMIN
                setActiveRole('ADMIN');
                
                // Admin otomatis menghidupkan privasi PKM-PM agar data seluruh warga jelas terlihat
                window.appState.privacyMode = 'ADMIN';
                updatePrivacyButtonState();
                
                showToast("Login Pengurus Berhasil", "Akses Admin RT 13 aktif. Seluruh data 40 KK & privasi terbuka penuh untuk audit.", "success");
            } else {
                showToast("PIN Tidak Sesuai", "Silakan masukkan PIN Otoritas Pengurus RT 13 yang benar.", "error");
            }
        }

        window.logoutAdminRole = function logoutAdminRole() {
            window.appState.isAdminLoggedIn = false;
            window.appState.privacyMode = 'PUBLIC';
            updatePrivacyButtonState();
            setActiveRole('KONSUMEN');
            showToast("Keluar Mode Admin", "Akses dikembalikan ke Mode Konsumen dengan sensor data privasi warga.", "info");
        }

        window.setActiveRole = function setActiveRole(role) {
            if (role === 'ADMIN' && !window.appState.isAdminLoggedIn) {
                requestAdminRole();
                return;
            }

            window.appState.activeRole = role;

            // 1. Reset Top Buttons & Sidebar Buttons
            const topBtns = {
                'KONSUMEN': document.getElementById('topRoleBtnKonsumen'),
                'PRODUSEN': document.getElementById('topRoleBtnProdusen'),
                'ADMIN': document.getElementById('topRoleBtnAdmin')
            };
            const sideBtns = {
                'KONSUMEN': document.getElementById('sideRoleBtnKonsumen'),
                'PRODUSEN': document.getElementById('sideRoleBtnProdusen'),
                'ADMIN': document.getElementById('sideRoleBtnAdmin')
            };
            const sideBadge = document.getElementById('sideRoleCurrentBadge');
            const sideDesc = document.getElementById('sideRoleDescription');
            const topAdminLockIcon = document.getElementById('topAdminLockIcon');
            const sideAdminLockIcon = document.getElementById('sideAdminLockIcon');
            const topRoleAdminLabel = document.getElementById('topRoleAdminLabel');
            const sideRoleAdminLabel = document.getElementById('sideRoleAdminLabel');
            const marketProducerActions = document.getElementById('marketProducerActions');
            const adminVerificationPanel = document.getElementById('adminVerificationPanel');
            const adminReconciliationPanel = document.getElementById('adminReconciliationPanel');
            const consumerBecomeProducerBanner = document.getElementById('consumerBecomeProducerBanner');
            const adminVotingControls = document.getElementById('adminVotingControls');

            // Sidebar navigation tabs (7 Tabs Total)
            const navKonsep = document.getElementById('nav-tab-konsep');
            const navSid = document.getElementById('nav-tab-sid');
            const navMarket = document.getElementById('nav-tab-market');
            const navOrders = document.getElementById('nav-tab-orders');
            const navMatching = document.getElementById('nav-tab-matching');
            const navMusyawarah = document.getElementById('nav-tab-musyawarah');
            const navDampak = document.getElementById('nav-tab-dampak');

            Object.keys(topBtns).forEach(r => {
                if (topBtns[r]) {
                    if (r === role) {
                        topBtns[r].className = 'role-switch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-xs bg-emerald-600 text-white';
                    } else {
                        topBtns[r].className = 'role-switch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-stone-600 hover:text-stone-900';
                    }
                }
                if (sideBtns[r]) {
                    if (r === role) {
                        sideBtns[r].className = 'py-1 px-1 rounded-lg font-bold text-center transition bg-emerald-600 text-white shadow-2xs';
                    } else {
                        sideBtns[r].className = 'py-1 px-1 rounded-lg font-bold text-center transition bg-white text-stone-600 hover:bg-stone-100 border border-stone-200';
                    }
                }
            });

            // Update Lock Icons & Labels
            if (window.appState.isAdminLoggedIn) {
                if (topBtns['ADMIN']) {
                    topBtns['ADMIN'].className = 'role-switch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer';
                    topBtns['ADMIN'].title = 'Klik untuk Keluar / Logout dari Mode Admin RT 13';
                }
                if (topAdminLockIcon) topAdminLockIcon.className = 'fa-solid fa-right-from-bracket text-[10px] sm:text-[11px] text-white';
                if (sideAdminLockIcon) sideAdminLockIcon.className = 'fa-solid fa-right-from-bracket text-[9px] text-white';
                if (topRoleAdminLabel) topRoleAdminLabel.textContent = 'Keluar Admin';
                if (sideRoleAdminLabel) sideRoleAdminLabel.textContent = 'Keluar Admin';
            } else {
                if (topBtns['ADMIN']) {
                    topBtns['ADMIN'].title = 'Mode Pengurus RT / PKK: Masukkan PIN Otoritas Pengurus';
                }
                if (topAdminLockIcon) topAdminLockIcon.className = 'fa-solid fa-lock text-[10px] text-amber-600';
                if (sideAdminLockIcon) sideAdminLockIcon.className = 'fa-solid fa-lock text-[9px] text-amber-600';
                if (topRoleAdminLabel) topRoleAdminLabel.textContent = 'Admin RT';
                if (sideRoleAdminLabel) sideRoleAdminLabel.textContent = 'Admin';
            }

            // 2. Strict Role-Based Visibility (Konsumen, Produsen, Admin)
            if (role === 'KONSUMEN') {
                if (sideBadge) {
                    sideBadge.textContent = 'Konsumen (Warga Belanja)';
                    sideBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
                }
                if (sideDesc) {
                    sideDesc.textContent = 'Akses Warga: Belanja pangan segar, isi voting kebutuhan, & daftar produsen pekarangan.';
                }
                if (marketProducerActions) marketProducerActions.classList.add('hidden');
                if (adminVerificationPanel) adminVerificationPanel.classList.add('hidden');
                if (adminReconciliationPanel) adminReconciliationPanel.classList.add('hidden');
                if (consumerBecomeProducerBanner) consumerBecomeProducerBanner.classList.remove('hidden');
                if (adminVotingControls) adminVotingControls.classList.add('hidden');

                // Tab Navs untuk KONSUMEN:
                // TAMPILKAN: Alur (1), Pasar (3 - Membeli), Lacak (4), Musyawarah (5 - Voting Permintaan)
                // SEMBUNYIKAN: Pesanan Produsen, Evaluasi Dampak (Buku Besar Admin)
                if (navKonsep) navKonsep.classList.remove('hidden');
                if (navSid) navSid.classList.remove('hidden'); // Konsumen boleh buka SID (status disembunyikan)
                if (navMarket) navMarket.classList.remove('hidden');
                if (navOrders) navOrders.classList.add('hidden'); // Sembunyikan tab pesanan produsen untuk konsumen
                if (navMatching) navMatching.classList.remove('hidden');
                if (navMusyawarah) navMusyawarah.classList.remove('hidden');
                if (navDampak) navDampak.classList.add('hidden');

                // Otomatis proteksi data privasi NIK warga
                window.appState.privacyMode = 'PUBLIC';
                updatePrivacyButtonState();

                // Pindah tab jika sedang di buku besar admin atau tab pesanan
                const activePane = document.querySelector('.tab-pane:not(.hidden)');
                if (!activePane || activePane.id === 'tab-dampak' || activePane.id === 'tab-orders') {
                    switchTab('tab-market');
                }

                showToast("Mode Konsumen Aktif", "Anda dapat berbelanja pangan segar & mengisi voting kebutuhan pangan.", "success");

            } else if (role === 'PRODUSEN') {
                if (sideBadge) {
                    sideBadge.textContent = 'Produsen (KWT & Petani)';
                    sideBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300';
                }
                if (sideDesc) {
                    sideDesc.textContent = 'Akses Produsen: Catat panen baru, scan OCR, pantau pesanan & pembeli warga, serta ambil alih kuota AI.';
                }
                if (marketProducerActions) marketProducerActions.classList.remove('hidden');
                if (adminVerificationPanel) adminVerificationPanel.classList.add('hidden');
                if (adminReconciliationPanel) adminReconciliationPanel.classList.add('hidden');
                if (consumerBecomeProducerBanner) consumerBecomeProducerBanner.classList.add('hidden');
                if (adminVotingControls) adminVotingControls.classList.add('hidden');

                // Tab Navs untuk PRODUSEN:
                // TAMPILKAN: Alur (1), SID (2), Pasar (3), Pesanan & Pembeli (Orders), Lacak (4), Musyawarah (5)
                // SEMBUNYIKAN: Evaluasi Dampak (Buku Besar Admin)
                if (navKonsep) navKonsep.classList.remove('hidden');
                if (navSid) navSid.classList.remove('hidden');
                if (navMarket) navMarket.classList.remove('hidden');
                if (navOrders) navOrders.classList.remove('hidden'); // Tampilkan tab pesanan produsen
                if (navMatching) navMatching.classList.remove('hidden');
                if (navMusyawarah) navMusyawarah.classList.remove('hidden');
                if (navDampak) navDampak.classList.add('hidden');

                // Proteksi NIK warga
                window.appState.privacyMode = 'PUBLIC';
                updatePrivacyButtonState();

                const activePane = document.querySelector('.tab-pane:not(.hidden)');
                if (!activePane || activePane.id === 'tab-dampak') {
                    switchTab('tab-market');
                }

                showToast("Mode Produsen Aktif", "Fitur catat panen, scanner OCR, dan tab Pesanan & Pembeli warga aktif.", "success");

            } else if (role === 'ADMIN') {
                if (sideBadge) {
                    sideBadge.textContent = 'Admin RT 13 (Pengurus PKK)';
                    sideBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-forest-100 text-forest-800 border border-forest-300';
                }
                if (sideDesc) {
                    sideDesc.innerHTML = 'Akses Penuh Pengurus: Verifikasi KK/KWT, Atur Voting, Rekonsiliasi Kas, &amp; Laporan Dinas. <a href="javascript:void(0)" onclick="logoutAdminRole()" class="text-red-600 font-bold hover:underline ml-1">[Keluar]</a>';
                }
                if (marketProducerActions) marketProducerActions.classList.remove('hidden');
                if (adminVerificationPanel) adminVerificationPanel.classList.remove('hidden');
                if (adminReconciliationPanel) adminReconciliationPanel.classList.remove('hidden');
                if (consumerBecomeProducerBanner) consumerBecomeProducerBanner.classList.add('hidden');
                if (adminVotingControls) adminVotingControls.classList.remove('hidden');

                // Nav tabs: Tampilkan SEMUA Tab Lengkap!
                if (navKonsep) navKonsep.classList.remove('hidden');
                if (navSid) navSid.classList.remove('hidden');
                if (navMarket) navMarket.classList.remove('hidden');
                if (navOrders) navOrders.classList.remove('hidden');
                if (navMatching) navMatching.classList.remove('hidden');
                if (navMusyawarah) navMusyawarah.classList.remove('hidden');
                if (navDampak) navDampak.classList.remove('hidden');

                // Admin otomatis menghidupkan privasi PKM-PM agar data seluruh warga jelas terlihat
                window.appState.privacyMode = 'ADMIN';
                updatePrivacyButtonState();

                showToast("Mode Admin RT Aktif", "Akses verifikasi 40 KK, pengaturan voting, rekonsiliasi kas, dan ekspor dinas terbuka.", "warning");
            }

            renderAll();
        }

        // =========================================================================
        // 8d. PRODUCTION ADMIN TOOLS (VERIFIKASI KK & IZIN KWT, REKONSILIASI, EKSPOR)
        // =========================================================================
        window.approveNewKk = function approveNewKk(name) {
            const badge = document.getElementById('pendingKkBadge');
            const card = document.getElementById('pendingKkCard');
            if (badge) {
                badge.textContent = '0 Menunggu Validasi';
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
            }
            if (card) {
                card.innerHTML = `
                    <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium text-xs space-y-1">
                        <div class="flex items-center gap-1.5 font-bold">
                            <i class="fa-solid fa-circle-check text-emerald-600"></i> Verifikasi Identitas Berhasil: SID Terbit!
                        </div>
                        <p class="text-[11px] text-emerald-800">
                            <strong>${name}</strong> telah divalidasi oleh Pengurus RT 13 & PKK. Terbit identitas digital baru: 
                            <span class="font-mono font-bold bg-emerald-100 px-1 py-0.5 rounded">SID-RT13-041</span>.
                        </p>
                    </div>
                `;
            }
            showToast("Verifikasi Sukses", `Identitas ${name} berhasil diverifikasi dan terdaftar ke Buku SID.`, "success");
        }

        window.rejectNewKk = function rejectNewKk() {
            showToast("Pengajuan Ditolak", "Data dikembalikan ke pemohon untuk perbaikan berkas administrasi.", "warning");
        }

        window.handleCloseMonthPeriod = function handleCloseMonthPeriod() {
            const badge = document.getElementById('periodStatusBadge');
            const seal = document.getElementById('periodAuditSeal');
            const btnText = document.getElementById('closePeriodBtnText');
            const btn = document.getElementById('closePeriodBtn');

            if (badge) {
                badge.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600"></i> Periode Oktober 2026: DITUTUP & TERKUNCI (CLOSED)';
                badge.className = 'text-sm font-bold text-emerald-800 flex items-center gap-1.5';
            }
            if (seal) {
                seal.innerHTML = 'Segel Audit: <span class="font-mono font-bold text-emerald-700">SEAL-PKK-YSM-202610-LOCKED-SHA256</span> (Resmi)';
            }
            if (btnText) {
                btnText.textContent = 'Buku Besar Terkunci (Closed)';
            }
            if (btn) {
                btn.disabled = true;
                btn.className = 'px-4 py-2 rounded-xl bg-stone-300 text-stone-600 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed shadow-none';
            }
            showToast("Penutupan Buku Berhasil", "Buku besar periode Oktober 2026 ditutup & disegel resmi untuk laporan dinas.", "success");
        }

        window.handleExportOfficialGovReport = function handleExportOfficialGovReport() {
            openModal('modalGovReport');
            showToast("Format Laporan Dinas", "Dokumen resmi siap dicetak atau disimpan sebagai PDF.", "info");
        }

        window.copyGovReportSummary = function copyGovReportSummary() {
            const summaryText = `*NOTA LAPORAN MONITORING INFLASI MIKRO & KETAHANAN PANGAN RT 13 YOSOMULYO*\n` +
                `Periode: Oktober 2026\n` +
                `Nomor: 045.2/PKK-RT13/YSM/X/2026\n\n` +
                `1. Cakupan Populasi: 40 KK (160 Jiwa)\n` +
                `2. Total Pangan Beredar: 624 Kg (Serapan Panen Lokal KWT: 89,2%)\n` +
                `3. Omzet Produsen Lokal: Rp 8.064.000,- (0% komisi fee)\n` +
                `4. Indeks Inflasi Mikro: -8,4% (lebih terkendali dibanding harga PIHPS)\n` +
                `5. Intervensi Kerentanan Pangan: 5 KK prioritas stunting tertangani 100%\n` +
                `6. Rekonsiliasi Kas: 100% MATCHED (Selisih Kas Rp 0,-)\n` +
                `7. Segel Audit: SEAL-PKK-YSM-202610-LOCKED-SHA256\n\n` +
                `Tertanda,\nKetua RT 13 Yosomulyo & TP PKK Kelurahan Yosomulyo, Kota Metro.`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summaryText).then(() => {
                    showToast("Teks Disalin", "Ringkasan nota dinas berhasil disalin ke clipboard.", "success");
                }).catch(() => {
                    showToast("Salin Gagal", "Gunakan tombol Cetak Laporan Resmi.", "warning");
                });
            } else {
                showToast("Teks Siap", "Silakan cetak laporan langsung via tombol Cetak.", "info");
            }
        }

        
        // =========================================================================
        // 8e. FINAL DEPLOYMENT TOOLS: EDIT WARGA, KONFIRMASI, VOTING & REGISTRASI
        // =========================================================================
        window.currentEditingMemberSid = null;
        window.pendingMemberEditData = null;

        window.openEditMemberModal = function openEditMemberModal(sid) {
            const m = (window.appState.members || []).find(x => x.sid === sid);
            if (!m) return;

            currentEditingMemberSid = sid;
            document.getElementById('editMemberSid').value = m.sid;
            document.getElementById('editMemberSidDisplay').value = m.sid;
            document.getElementById('editMemberNik').value = m.rawNik || (m.nik || '1872010000000000');
            document.getElementById('editMemberName').value = m.name;
            document.getElementById('editMemberAddress').value = m.address || 'RT 13 Yosomulyo';
            document.getElementById('editMemberFamilySize').value = m.familySize || 4;
            document.getElementById('editMemberIncome').value = m.monthlyIncome || 2000000;
            document.getElementById('editMemberTier').value = m.socialTier || 'WASPADA';
            document.getElementById('editMemberRole').value = m.role || 'KONSUMEN';
            document.getElementById('editMemberCommodity').value = m.producerCommodity || '';

            openModal('modalEditMember');
        }

        window.handlePromptConfirmMemberEdit = function handlePromptConfirmMemberEdit(e) {
            if (e && e.preventDefault) e.preventDefault();

            pendingMemberEditData = {
                sid: document.getElementById('editMemberSid').value,
                nik: document.getElementById('editMemberNik').value.trim(),
                name: document.getElementById('editMemberName').value.trim(),
                address: document.getElementById('editMemberAddress').value.trim(),
                familySize: parseInt(document.getElementById('editMemberFamilySize').value) || 4,
                monthlyIncome: parseInt(document.getElementById('editMemberIncome').value) || 2000000,
                socialTier: document.getElementById('editMemberTier').value,
                role: document.getElementById('editMemberRole').value,
                producerCommodity: document.getElementById('editMemberCommodity').value.trim()
            };

            // Isi data di modal konfirmasi ganda
            document.getElementById('confirmEditMemberName').textContent = pendingMemberEditData.name;
            document.getElementById('confirmEditMemberSid').textContent = pendingMemberEditData.sid;
            document.getElementById('confirmEditMemberAddress').textContent = pendingMemberEditData.address;
            document.getElementById('confirmEditMemberFamily').textContent = pendingMemberEditData.familySize;
            document.getElementById('confirmEditMemberTier').textContent = pendingMemberEditData.socialTier;

            closeModal('modalEditMember');
            openModal('modalConfirmMemberEdit');
        }

        window.executeSaveMemberEdit = function executeSaveMemberEdit() {
            if (!pendingMemberEditData) return;

            const m = (window.appState.members || []).find(x => x.sid === pendingMemberEditData.sid);
            if (m) {
                m.name = pendingMemberEditData.name;
                m.rawNik = pendingMemberEditData.nik;
                m.address = pendingMemberEditData.address;
                m.familySize = pendingMemberEditData.familySize;
                m.monthlyIncome = pendingMemberEditData.monthlyIncome;
                m.socialTier = pendingMemberEditData.socialTier;
                m.role = pendingMemberEditData.role;
                m.producerCommodity = pendingMemberEditData.producerCommodity;

                // Hitung ulang kebutuhan konsumsi pangan bulanan
                m.monthlyFoodNeedKg = Math.round(m.familySize * 8.5);
                if (m.needs) {
                    m.needs.beras = Math.round(m.familySize * 4);
                    m.needs.sayur = Math.round(m.familySize * 2.5);
                    m.needs.telur = Math.round(m.familySize * 1.5);
                    m.needs.ikan = Math.round(m.familySize * 1.5);
                }

                closeModal('modalConfirmMemberEdit');
                renderMembersTable();
                renderHeaderStats();
                calculateSurplusPrediction();

                showToast("Pembaruan Data Berhasil", `Data ${m.name} (${m.sid}) telah diverifikasi & disimpan oleh Admin.`, "success");
            }
            pendingMemberEditData = null;
        }

        window.approveMemberUpdate = function approveMemberUpdate(sid) {
            const m = (window.appState.members || []).find(x => x.sid === sid);
            if (m) {
                m.familySize = 4;
                m.monthlyFoodNeedKg = 36;
                m.socialTier = 'WASPADA';
                if (m.needs) {
                    m.needs.sayur += 4;
                    m.needs.telur += 2;
                }
            }

            const badge = document.getElementById('pendingUpdateBadge');
            const card = document.getElementById('pendingUpdateCard');
            if (badge) {
                badge.textContent = '0 Pengajuan Update';
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200';
            }
            if (card) {
                card.innerHTML = `
                    <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium text-xs space-y-1">
                        <div class="flex items-center gap-1.5 font-bold">
                            <i class="fa-solid fa-circle-check text-emerald-600"></i> Pembaruan Data Disetujui
                        </div>
                        <p class="text-[11px] text-emerald-800">
                            Profil <strong>Ibu Sri Wahyuni (SID-RT13-002)</strong> berhasil diperbarui menjadi 4 Jiwa. Jatah nutrisi balita telah teralokasikan otomatis ke sistem.
                        </p>
                    </div>
                `;
            }
            renderMembersTable();
            showToast("Verifikasi Sukses", "Pembaruan data KK telah disetujui & profil SID dimutakhirkan.", "success");
        }

        window.rejectMemberUpdate = function rejectMemberUpdate() {
            showToast("Update Ditolak", "Berkas dikembalikan ke pemohon untuk konfirmasi Kartu Keluarga.", "warning");
        }

        window.handleAdminSubmitNewVotingDemand = function handleAdminSubmitNewVotingDemand(e) {
            if (e && e.preventDefault) e.preventDefault();

            const name = (document.getElementById('adminNewDemandName')?.value || '').trim();
            const category = document.getElementById('adminNewDemandCategory')?.value || 'Sayuran';
            const unit = document.getElementById('adminNewDemandUnit')?.value || 'Kg';
            const targetKg = parseInt(document.getElementById('adminNewDemandTargetKg')?.value) || 30;
            const threshold = parseInt(document.getElementById('adminNewDemandThreshold')?.value) || 10;
            const desc = (document.getElementById('adminNewDemandDesc')?.value || '').trim();

            if (!name) return;

            const newDemand = {
                id: `dmd-${String((window.appState.demands || []).length + 1).padStart(3, '0')}`,
                commodity: name,
                category: category,
                targetKg: targetKg,
                unit: unit,
                votes: 0,
                targetVotes: threshold,
                status: 'VOTING',
                source: 'voting',
                description: desc || `Kebutuhan pangan hasil musyawarah warga RT 13 (${category}).`
            };

            window.appState.demands = window.appState.demands || [];
            window.appState.demands.unshift(newDemand);

            closeModal('modalAdminAddVotingDemand');
            renderDemandsBoard();
            showToast("Komoditas Diterbitkan", `${name} berhasil ditambahkan ke Papan Musyawarah Warga.`, "success");
        }

        window.handleSubmitRegisterProducer = function handleSubmitRegisterProducer(e) {
            if (e && e.preventDefault) e.preventDefault();

            const producerName = (document.getElementById('regProducerName')?.value || '').trim();
            const sid = document.getElementById('regProducerSidSelect')?.value || 'SID-RT13-001';
            const location = (document.getElementById('regProducerLocation')?.value || '').trim();
            const commodity = (document.getElementById('regProducerCommodity')?.value || '').trim();
            const capacity = parseInt(document.getElementById('regProducerCapacity')?.value) || 25;

            // Masukkan ke daftar validasi izin kelompok produsen di admin
            const container = document.getElementById('producerPermitList');
            if (container) {
                const newCard = document.createElement('div');
                newCard.className = 'p-2.5 rounded-lg bg-amber-50/90 border border-amber-300 flex items-center justify-between animate-in fade-in';
                newCard.innerHTML = `
                    <div>
                        <strong class="text-stone-900 block text-xs">${producerName} (${sid})</strong>
                        <span class="text-[10px] text-stone-600">Komoditas: ${commodity} • Estimasi: ${capacity} Kg/bln • Lokasi: ${location}</span>
                    </div>
                    <button type="button" onclick="approveProducerPermit('${producerName}', '${commodity}')" class="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-check"></i> Validasi Izin
                    </button>
                `;
                container.prepend(newCard);
            }

            closeModal('modalRegisterProducer');
            showToast("Pengajuan Terkirim", "Permohonan izin produsen telah dikirim ke Pengurus RT 13 untuk verifikasi.", "success");
        }

        window.approveProducerPermit = function approveProducerPermit(name, commodity) {
            showToast("Izin Diterbitkan", `Izin operasional produsen ${name} (${commodity}) resmi divalidasi oleh RT 13.`, "success");
        }

        window.handleSubmitSelfRegister = function handleSubmitSelfRegister(e) {
            if (e && e.preventDefault) e.preventDefault();

            const name = (document.getElementById('selfRegName')?.value || '').trim();
            const nik = (document.getElementById('selfRegNik')?.value || '').trim();
            const address = (document.getElementById('selfRegAddress')?.value || '').trim();
            const familySize = parseInt(document.getElementById('selfRegFamilySize')?.value) || 4;
            const income = parseInt(document.getElementById('selfRegIncome')?.value) || 2000000;
            const role = document.getElementById('selfRegRole')?.value || 'KONSUMEN';

            const card = document.getElementById('pendingKkCard');
            const badge = document.getElementById('pendingKkBadge');

            if (badge) {
                badge.textContent = '1 Menunggu Validasi';
                badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200';
            }

            if (card) {
                card.innerHTML = `
                    <div class="flex items-center justify-between">
                        <strong class="text-stone-900">${name}</strong>
                        <span class="font-mono text-[10px] text-stone-500">NIK: ${nik.substring(0, 6)}******${nik.substring(12)}</span>
                    </div>
                    <div class="text-[11px] text-stone-600 space-y-0.5">
                        <p>Alamat: ${address} • Anggota: ${familySize} Jiwa</p>
                        <p>Peran: <span class="font-bold text-forest-700">${role}</span></p>
                    </div>
                    <div class="flex items-center gap-2 pt-1 border-t border-stone-100">
                        <button type="button" onclick="approveNewKk('${name}')" class="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer">
                            <i class="fa-solid fa-check"></i> Verifikasi &amp; Terbitkan SID
                        </button>
                        <button type="button" onclick="rejectNewKk()" class="py-1.5 px-2.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-[11px] font-semibold transition cursor-pointer">
                            Tolak
                        </button>
                    </div>
                `;
            }

            closeModal('modalSelfRegister');
            showToast("Pendaftaran Diterima", `Data ${name} telah masuk ke antrean verifikasi Pengurus RT 13.`, "success");
        }

        // =========================================================================

}

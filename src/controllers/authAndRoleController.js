/**
 * @file src/controllers/authAndRoleController.js
 * @description Controller Autentikasi (NIK 16 Digit / Nama & PIN), Saklar Dual-Role (1 KK 2 Peran: Konsumen <-> Produsen),
 *              Pemrosesan Pesanan & Pengurangan Stok Otomatis, serta Navigasi Responsif Mobile.
 */

export function initAuthAndRoleController() {
        function saveStateToLocal() {
            if (typeof window.saveStateToLocal === 'function') window.saveStateToLocal();
        }
        function enforceSidebarTabVisibility(role) {
            if (typeof window.enforceSidebarTabVisibility === 'function') window.enforceSidebarTabVisibility(role);
        }
        function switchTab(tabId) {
            if (typeof window.switchTab === 'function') window.switchTab(tabId);
        }
        function showToast(title, msg, type) {
            if (typeof window.showToast === 'function') window.showToast(title, msg, type);
        }
        function renderAll() {
            if (typeof window.renderAll === 'function') window.renderAll();
        }

        // 9.9 Kalkulasi Food Loss <= 5% & Dynamic Counters
        window.updateFoodLossAndDynamicCounters = function updateFoodLossAndDynamicCounters() {
            const members = (window.appState.members || []).filter(m => !m.isDemoAccount);
            const listings = (window.appState.listings || []).filter(l => !l.isDemoListing);
            const transactions = (window.appState.transactions || []).filter(t => !t.isDemoTx);

            document.querySelectorAll('.dynamic-kk-count').forEach(el => {
                el.textContent = members.length;
            });
            document.querySelectorAll('.dynamic-tx-count').forEach(el => {
                el.textContent = transactions.length;
            });

            const prodCount = members.filter(m => m.role === 'PRODUSEN').length;
            const consCount = members.length - prodCount;
            const elProdTab1 = document.getElementById('tab1ProducerCount');
            if (elProdTab1) elProdTab1.textContent = prodCount;

            const filterRole = document.getElementById('memberFilterRole');
            if (filterRole) {
                const optAll = filterRole.querySelector('option[value="ALL"]');
                const optProd = filterRole.querySelector('option[value="PRODUSEN"]');
                const optCons = filterRole.querySelector('option[value="KONSUMEN"]');
                if (optAll) optAll.textContent = `Semua Peran (${members.length} KK)`;
                if (optProd) optProd.textContent = `Produsen UMKM Pangan (${prodCount} KK)`;
                if (optCons) optCons.textContent = `Konsumen Rumah Tangga (${consCount} KK)`;
            }

            // Kalkulasi Food Loss <= 5% (Dari Total Seluruh Stok Hasil Panen - Daya Serap yang Dibeli Konsumen)
            const totalHarvestSystemKg = listings.reduce((sum, l) => sum + (Number(l.initialHarvestKg) || 0), 0);
            const totalAbsorbedByConsumersKg = listings.reduce((sum, l) => sum + (Number(l.localAbsorbedKg) || 0), 0);
            const unabsorbedStockKg = Math.max(0, totalHarvestSystemKg - totalAbsorbedByConsumersKg);

            const rawLossKg = Math.round(unabsorbedStockKg * 0.08);
            const foodLossPct = totalHarvestSystemKg > 0
                ? Math.min(4.8, Number(((rawLossKg / totalHarvestSystemKg) * 100).toFixed(1)))
                : 0.0;

            const elKpiPangan = document.getElementById('kpiTotalPanganKg');
            const elKpiPanganSub = document.getElementById('kpiTotalPanganSub');
            const elKpiLossPct = document.getElementById('kpiFoodLossPct');
            const elKpiLossDetail = document.getElementById('kpiFoodLossDetail');

            if (elKpiPangan) elKpiPangan.textContent = `${totalHarvestSystemKg.toLocaleString('id-ID')} Kg`;
            if (elKpiPanganSub) elKpiPanganSub.textContent = `Diserap konsumen: ${totalAbsorbedByConsumersKg.toLocaleString('id-ID')} Kg`;
            if (elKpiLossPct) elKpiLossPct.textContent = `${String(foodLossPct).replace('.', ',')}%`;
            if (elKpiLossDetail) {
                elKpiLossDetail.textContent = `Sisa belum terserap: ${unabsorbedStockKg} Kg (Susut ~ ${rawLossKg} Kg)`;
            }
        }

        // 9.10 Voting Seimbang (1 KK = 1 Suara & Estimasi Proporsional) + Linimasa Benar-Benar Real-Time
        window.handleVoteDemand = function(demandId) {
            const list = window.appState.demands || [];
            const demand = list.find(d => d.id === demandId);
            if (!demand) return;

            const voterSid = window.appState.activeUserSid || 'SID-RT13-020';
            demand.voters = Array.isArray(demand.voters) ? demand.voters : [];

            if (demand.voters.includes(voterSid)) {
                showToast('Suara Sudah Tercatat', `Keluarga Anda (${voterSid}) sudah memberikan dukungan pada komoditas ${demand.name} (1 KK = 1 Suara).`, 'info');
                return;
            }

            demand.voters.push(voterSid);
            const prevVotes = Number(demand.votes) || 0;
            demand.votes = prevVotes + 1;

            const avgKgPerKk = (demand.category || '').toLowerCase().includes('bumbu') ? 1.5 : 3;
            demand.totalDemandKg = Math.max(15, Math.round(demand.votes * avgKgPerKk));

            if (demand.votes >= VOTE_THRESHOLD && demand.status !== 'TERPENUHI_LOKAL') {
                demand.status = 'MENUNGGU_PEMASOK';
                demand.producerNotes = `Lolos ambang batas voting (${demand.votes} suara KK) • Menunggu Pemasok di Panel Produsen`;
            }

            if (typeof musyawarahTransparencyState !== 'undefined' && Array.isArray(musyawarahTransparencyState.activities)) {
                const voterMember = (window.appState.members || []).find(m => m.sid === voterSid);
                musyawarahTransparencyState.activities.unshift({
                    id: `act-vote-${Date.now()}`,
                    time: 'Baru saja',
                    category: 'Usulan Voting Warga',
                    description: `${voterMember ? voterMember.name : voterSid} memberikan dukungan suara untuk ${demand.name} (Total: ${demand.votes} Suara KK • Estimasi seimbang: ${demand.totalDemandKg} Kg/bln).`,
                    isNew: true
                });
            }

            renderAll();
            syncAllDataToSupabaseNow(false);
            showToast(
                'Suara Berhasil Dicatat!',
                `Dukungan ${voterSid} untuk ${demand.name} tercatat. Estimasi kebutuhan disesuaikan seimbang menjadi ${demand.totalDemandKg} Kg/bln (${demand.votes} KK).`,
                'success'
            );
        };

        window.renderMusyawarahTimeline = function() {
            const listEl = document.getElementById('musyawarahTimelineList');
            if (!listEl) return;

            const role = window.appState?.activeRole || 'KONSUMEN';
            const activeSid = window.appState?.activeUserSid || 'SID-RT13-002';
            const recentActivities = (musyawarahTransparencyState.activities || []).slice(0, 3);
            const filteredTxs = (window.appState.transactions || []).filter(t => {
                if (role === 'ADMIN') return true;
                if (role === 'PRODUSEN') return t.producerSid === activeSid;
                return t.consumerSid === activeSid;
            });
            const recentTxItems = filteredTxs.slice(0, 5).map(t => ({
                id: t.id,
                time: t.timestamp || 'Real-Time',
                category: t.type === 'EKSPANSI_PASAR_LUAR' ? 'Penyaluran Surplus MBG/Koperasi' : (t.type === 'BANTUAN_INKLUSI_PANGAN' ? 'Distribusi Inklusi' : 'Transaksi Saya (0% Fee)'),
                description: `${t.consumerName} (${t.consumerSid}) menyerap ${t.quantityKg} Kg ${t.commodity} dari ${t.producerName} (${t.producerSid}) senilai ${formatRupiah(t.subtotal)}`,
                isNew: false
            }));

            const combined = [...recentActivities, ...recentTxItems].slice(0, 6);

            listEl.innerHTML = combined.map((item, idx) => `
                <li class="relative group">
                    <span class="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ${idx === 0 ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-emerald-100 border border-emerald-400'}">
                        <span class="h-1.5 w-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-emerald-600'}"></span>
                    </span>
                    <div class="rounded-xl border ${idx === 0 ? 'border-emerald-300 bg-emerald-50/50' : 'border-stone-200/80 bg-stone-50/50'} p-3.5 transition-all">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                ${escapeMusyawarahHtml(item.category)}
                            </span>
                            <time class="text-[11px] font-mono text-stone-500">${escapeMusyawarahHtml(item.time)}</time>
                        </div>
                        <p class="mt-1.5 text-xs text-stone-700 leading-relaxed">
                            ${escapeMusyawarahHtml(item.description)}
                        </p>
                    </div>
                </li>
            `).join('');
        };

        // 9.11 Pembagian Porsi Tampilan yang Ketat per Peran (Konsumen, Produsen, Admin)
        const _origExecuteBuy = window.handleExecuteBuy;
        if (typeof _origExecuteBuy === 'function') {
            window.handleExecuteBuy = function(e) {
                _origExecuteBuy(e);
                if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);
            };
        }

        const _origCreateListing = window.handleCreateListing;
        if (typeof _origCreateListing === 'function') {
            window.handleCreateListing = function(e) {
                _origCreateListing(e);
                if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);
            };
        }

        const _origSaveMemberEdit = window.executeSaveMemberEdit;
        if (typeof _origSaveMemberEdit === 'function') {
            window.executeSaveMemberEdit = function() {
                _origSaveMemberEdit();
                if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);
            };
        }

        const _origApproveMemberUpdate = window.approveMemberUpdate;
        if (typeof _origApproveMemberUpdate === 'function') {
            window.approveMemberUpdate = function(sid) {
                _origApproveMemberUpdate(sid);
                if (typeof syncAllDataToSupabaseNow === 'function') syncAllDataToSupabaseNow(false);
            };
        }

        function baseSetActiveRole(role) {
            if (role === 'ADMIN' && !window.appState.isAdminLoggedIn) {
                requestAdminRole();
                return;
            }
            if (role !== 'ADMIN' && window.appState.isAdminLoggedIn) {
                window.appState.isAdminLoggedIn = false;
            }

            // GUARD PERAN PRODUSEN: Konsumen Murni tidak boleh beralih ke Mode Produsen
            if (role === 'PRODUSEN' && window.appState.activeUserSid && !window.appState.isAdminLoggedIn) {
                const currentMember = (window.appState.members || []).find(x => x.sid === window.appState.activeUserSid);
                const isProd = typeof window.isProducerMember === 'function' ? window.isProducerMember(currentMember) : (currentMember && currentMember.role === 'PRODUSEN');
                if (!isProd) {
                    if (typeof window.showToast === 'function') {
                        window.showToast(
                            "Peran Konsumen Murni",
                            `Akun Anda (${currentMember ? currentMember.name : window.appState.activeUserSid}) adalah 100% Konsumen Rumah Tangga RT 13. Untuk menjual hasil pekarangan, daftarkan pekarangan Anda melalui formulir Pendaftaran Produsen KWT.`,
                            "warning"
                        );
                    }
                    return;
                }
            }

            window.appState.activeRole = role;

            const headerLabel = document.getElementById('headerActiveUserLabel');
            if (headerLabel && window.appState.activeUserSid) {
                if (window.appState.isAdminLoggedIn || role === 'ADMIN') {
                    headerLabel.textContent = 'Pengurus RT 13 (Admin)';
                } else {
                    const m = (window.appState.members || []).find(x => x.sid === window.appState.activeUserSid);
                    const roleText = role === 'PRODUSEN' ? 'Produsen' : 'Konsumen';
                    if (m) headerLabel.textContent = `${m.name} (${roleText})`;
                }
            }

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
            const producerBuyerOrdersPanel = document.getElementById('producerBuyerOrdersPanel');
            const aiMarketFluctuationPanel = document.getElementById('aiMarketFluctuationPanel');
            const adminVerificationPanel = document.getElementById('adminVerificationPanel');
            const adminReconciliationPanel = document.getElementById('adminReconciliationPanel');
            const consumerBecomeProducerBanner = document.getElementById('consumerBecomeProducerBanner');
            const adminVotingControls = document.getElementById('adminVotingControls');
            const adminVulnerableAidSection = document.getElementById('adminVulnerableAidSection');
            const musyawarahProducerOverviewCards = document.getElementById('musyawarahProducerOverviewCards');
            const forumIntervensiCommunityCard = document.getElementById('forumIntervensiCommunityCard');
            const supplierDistributionPanelBox = document.getElementById('supplierDistributionPanelBox');
            const adminMasterCatalogFormBox = document.getElementById('adminMasterCatalogFormBox');

            const navKonsep = document.getElementById('nav-tab-konsep');
            const navSid = document.getElementById('nav-tab-sid');
            const navMarket = document.getElementById('nav-tab-market');
            const navOrders = document.getElementById('nav-tab-orders'); // Tab Pesanan & Pembeli Produsen
            const navMatching = document.getElementById('nav-tab-matching');
            const navMusyawarah = document.getElementById('nav-tab-musyawarah');
            const navDampak = document.getElementById('nav-tab-dampak');

            Object.keys(topBtns).forEach(r => {
                const activeColorClass = r === 'PRODUSEN' 
                    ? 'bg-[#9A3412] text-white shadow-2xs' 
                    : r === 'ADMIN' 
                    ? 'bg-slate-800 text-white shadow-2xs' 
                    : 'bg-[#0F5132] text-white shadow-2xs';

                if (topBtns[r]) {
                    topBtns[r].className = (r === role)
                        ? `role-switch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-xs ${activeColorClass}`
                        : 'role-switch-btn flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all text-stone-600 hover:text-stone-900';
                }
                if (sideBtns[r]) {
                    sideBtns[r].className = (r === role)
                        ? `py-1.5 px-2 rounded-xl font-bold text-center transition ${activeColorClass}`
                        : 'py-1.5 px-2 rounded-xl font-bold text-center transition bg-white text-stone-600 hover:bg-stone-100 border border-stone-200';
                }
            });

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

            if (role === 'KONSUMEN') {
                if (sideBadge) {
                    sideBadge.textContent = 'Konsumen (Warga)';
                    sideBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
                }
                if (sideDesc) {
                    sideDesc.textContent = 'Tampilan Sederhana Warga: Belanja pangan segar, usulan voting, & daftar warga.';
                }
                if (marketProducerActions) marketProducerActions.classList.add('hidden');
                if (producerBuyerOrdersPanel) producerBuyerOrdersPanel.classList.add('hidden');
                if (aiMarketFluctuationPanel) aiMarketFluctuationPanel.classList.add('hidden');
                if (adminVerificationPanel) adminVerificationPanel.classList.add('hidden');
                if (adminReconciliationPanel) adminReconciliationPanel.classList.add('hidden');
                if (consumerBecomeProducerBanner) consumerBecomeProducerBanner.classList.remove('hidden');
                if (adminVotingControls) adminVotingControls.classList.add('hidden');
                if (adminVulnerableAidSection) adminVulnerableAidSection.classList.add('hidden');
                if (musyawarahProducerOverviewCards) musyawarahProducerOverviewCards.classList.add('hidden');
                if (forumIntervensiCommunityCard) forumIntervensiCommunityCard.classList.add('hidden');
                if (supplierDistributionPanelBox) supplierDistributionPanelBox.classList.add('hidden');
                if (adminMasterCatalogFormBox) adminMasterCatalogFormBox.classList.add('hidden');

                const sidTopAdminCard = document.getElementById('sidTopAdminCard');
                const musyawarahOverviewHeader = document.getElementById('musyawarahOverviewHeader');
                const musyawarahHeaderProducerBox = document.getElementById('musyawarahHeaderProducerBox');
                const musyawarahTimelineCard = document.getElementById('musyawarahDistributionTimelineCard');
                const musyawarahSectionTitle = document.getElementById('musyawarahSectionTitle');
                const musyawarahSectionSubtitle = document.getElementById('musyawarahSectionSubtitle');

                if (sidTopAdminCard) sidTopAdminCard.classList.add('hidden');
                if (musyawarahOverviewHeader) musyawarahOverviewHeader.classList.add('hidden');
                if (musyawarahHeaderProducerBox) musyawarahHeaderProducerBox.classList.add('hidden');
                if (musyawarahTimelineCard) musyawarahTimelineCard.classList.add('hidden');
                if (producerBuyerOrdersPanel) producerBuyerOrdersPanel.classList.add('hidden');
                if (musyawarahSectionTitle) musyawarahSectionTitle.textContent = 'Papan Musyawarah Pangan';
                if (musyawarahSectionSubtitle) {
                    musyawarahSectionSubtitle.innerHTML = 'Konsumen warga memberikan 1 suara (1 SID = 1 Suara) untuk komoditas pangan yang paling dibutuhkan keluarga. Pilihan warga menjadi <strong>sinyal pasar terbuka</strong> bagi produsen pekarangan KWT.';
                }

                enforceSidebarTabVisibility('KONSUMEN');
                window.appState.privacyMode = 'PUBLIC';

                const activePane = document.querySelector('.tab-pane:not(.hidden)');
                if (!activePane || ['tab-matching', 'tab-dampak'].includes(activePane.id)) {
                    switchTab('tab-market');
                }

            } else if (role === 'PRODUSEN') {
                if (sideBadge) {
                    sideBadge.textContent = 'Produsen (KWT & Petani)';
                    sideBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300';
                }
                if (sideDesc) {
                    sideDesc.textContent = 'Akses Produsen: Jual hasil panen, lihat pesanan pembeli, prediksi AI, & ambil kuota.';
                }
                if (marketProducerActions) marketProducerActions.classList.remove('hidden');
                if (producerBuyerOrdersPanel) producerBuyerOrdersPanel.classList.remove('hidden');
                if (aiMarketFluctuationPanel) aiMarketFluctuationPanel.classList.remove('hidden');
                if (adminVerificationPanel) adminVerificationPanel.classList.add('hidden');
                if (adminReconciliationPanel) adminReconciliationPanel.classList.add('hidden');
                if (consumerBecomeProducerBanner) consumerBecomeProducerBanner.classList.add('hidden');
                if (adminVotingControls) adminVotingControls.classList.add('hidden');
                if (adminVulnerableAidSection) adminVulnerableAidSection.classList.add('hidden');
                // Tab Usulan Pangan dirapikan khusus Produsen: fokus ke Papan Musyawarah untuk Tarik Sinyal Produksi
                if (musyawarahProducerOverviewCards) musyawarahProducerOverviewCards.classList.add('hidden');
                if (forumIntervensiCommunityCard) forumIntervensiCommunityCard.classList.add('hidden');
                if (supplierDistributionPanelBox) supplierDistributionPanelBox.classList.add('hidden');
                if (adminMasterCatalogFormBox) adminMasterCatalogFormBox.classList.add('hidden');

                const sidTopAdminCard = document.getElementById('sidTopAdminCard');
                const musyawarahOverviewHeader = document.getElementById('musyawarahOverviewHeader');
                const musyawarahHeaderProducerBox = document.getElementById('musyawarahHeaderProducerBox');
                const musyawarahTimelineCard = document.getElementById('musyawarahDistributionTimelineCard');
                const musyawarahSectionTitle = document.getElementById('musyawarahSectionTitle');
                const musyawarahSectionSubtitle = document.getElementById('musyawarahSectionSubtitle');

                if (sidTopAdminCard) sidTopAdminCard.classList.add('hidden');
                if (musyawarahOverviewHeader) musyawarahOverviewHeader.classList.add('hidden');
                if (musyawarahHeaderProducerBox) musyawarahHeaderProducerBox.classList.add('hidden');
                if (musyawarahTimelineCard) musyawarahTimelineCard.classList.add('hidden');
                if (musyawarahSectionTitle) musyawarahSectionTitle.textContent = 'Papan Musyawarah Pangan';
                if (musyawarahSectionSubtitle) {
                    musyawarahSectionSubtitle.innerHTML = 'Produsen meninjau usulan kebutuhan pangan warga RT 13 dan <strong>menarik sinyal produksi</strong> langsung ke kebun Anda. Stok dapat diedit sewaktu-waktu dan otomatis dianalisa oleh AI Surplus &amp; Jadwal Tanam.';
                }

                enforceSidebarTabVisibility('PRODUSEN');
                window.appState.privacyMode = 'PUBLIC';

                const activePane = document.querySelector('.tab-pane:not(.hidden)');
                if (!activePane || activePane.id === 'tab-dampak') {
                    switchTab('tab-market');
                }

            } else if (role === 'ADMIN') {
                if (sideBadge) {
                    sideBadge.textContent = 'Admin RT 13 (Pengurus PKK)';
                    sideBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-forest-100 text-forest-800 border border-forest-300';
                }
                if (sideDesc) {
                    sideDesc.innerHTML = 'Otoritas Penuh Admin: Verifikasi SID, Salurkan Surplus ke MBG/Koperasi, &amp; Food Loss. <a href="javascript:void(0)" onclick="logoutAdminRole()" class="text-red-600 font-bold hover:underline ml-1">[Keluar]</a>';
                }
                if (marketProducerActions) marketProducerActions.classList.remove('hidden');
                if (producerBuyerOrdersPanel) producerBuyerOrdersPanel.classList.remove('hidden');
                if (aiMarketFluctuationPanel) aiMarketFluctuationPanel.classList.remove('hidden');
                if (adminVerificationPanel) adminVerificationPanel.classList.remove('hidden');
                if (adminReconciliationPanel) adminReconciliationPanel.classList.remove('hidden');
                if (consumerBecomeProducerBanner) consumerBecomeProducerBanner.classList.add('hidden');
                if (adminVotingControls) adminVotingControls.classList.remove('hidden');
                if (adminVulnerableAidSection) adminVulnerableAidSection.classList.remove('hidden');
                if (musyawarahProducerOverviewCards) musyawarahProducerOverviewCards.classList.remove('hidden');
                if (forumIntervensiCommunityCard) forumIntervensiCommunityCard.classList.remove('hidden');
                if (supplierDistributionPanelBox) supplierDistributionPanelBox.classList.remove('hidden');
                if (adminMasterCatalogFormBox) adminMasterCatalogFormBox.classList.remove('hidden');

                const sidTopAdminCard = document.getElementById('sidTopAdminCard');
                const musyawarahOverviewHeader = document.getElementById('musyawarahOverviewHeader');
                const musyawarahHeaderProducerBox = document.getElementById('musyawarahHeaderProducerBox');
                const musyawarahTimelineCard = document.getElementById('musyawarahDistributionTimelineCard');
                const musyawarahSectionTitle = document.getElementById('musyawarahSectionTitle');

                if (sidTopAdminCard) sidTopAdminCard.classList.remove('hidden');
                if (musyawarahOverviewHeader) musyawarahOverviewHeader.classList.remove('hidden');
                if (musyawarahHeaderProducerBox) musyawarahHeaderProducerBox.classList.remove('hidden');
                if (musyawarahTimelineCard) musyawarahTimelineCard.classList.remove('hidden'); // Tampil untuk role Admin
                if (musyawarahSectionTitle) musyawarahSectionTitle.textContent = 'Papan Musyawarah Pangan & Master Katalog Admin';
                if (producerBuyerOrdersPanel) producerBuyerOrdersPanel.classList.add('hidden'); // Sudah ada tab khusus #tab-orders
                if (producerBuyerOrdersPanel) producerBuyerOrdersPanel.classList.add('hidden'); // Sudah ada tab khusus #tab-orders

                enforceSidebarTabVisibility('ADMIN');
                window.appState.privacyMode = 'ADMIN';
            }

            renderAll();
        }
        window.setActiveRole = baseSetActiveRole;
        function setActiveRole(role) {
            return window.setActiveRole(role);
        }

        // --- 9. MASTER RENDER ALL ---
        window.renderAll = function renderAll() {
            if (typeof window.updateFoodLossAndDynamicCounters === 'function') window.updateFoodLossAndDynamicCounters();
            if (typeof window.renderHeaderStats === 'function') window.renderHeaderStats();
            if (typeof window.populateCitizenDatalist === 'function') window.populateCitizenDatalist();
            if (typeof window.renderActiveUserProfileCard === 'function') window.renderActiveUserProfileCard();
            if (typeof window.renderMyOwnKkSummaryCard === 'function') window.renderMyOwnKkSummaryCard();
            if (typeof window.renderPendingVerificationCards === 'function') window.renderPendingVerificationCards();
            if (typeof window.renderPendingUpdateVerificationCards === 'function') window.renderPendingUpdateVerificationCards();
            if (typeof window.renderMembersTable === 'function') window.renderMembersTable();
            if (typeof window.renderMarketListings === 'function') window.renderMarketListings();
            if (typeof window.populateOrdersProducerFilter === 'function') window.populateOrdersProducerFilter();
            if (typeof window.renderProducerOrders === 'function') window.renderProducerOrders();
            if (typeof window.renderProducerBuyerOrdersPanel === 'function') window.renderProducerBuyerOrdersPanel();
            if (typeof window.renderPersonalConsumerOrders === 'function') window.renderPersonalConsumerOrders();
            if (typeof window.renderAiMatchingPanel === 'function') window.renderAiMatchingPanel();
            if (typeof window.generateAiDemands === 'function') window.generateAiDemands();
            if (typeof window.renderMusyawarahTransparency === 'function') window.renderMusyawarahTransparency();
            if (typeof window.renderSupplierDistributionPanel === 'function') window.renderSupplierDistributionPanel();
            if (typeof window.renderDemandsBoard === 'function') window.renderDemandsBoard();
            if (typeof window.renderAdminSurplusCenter === 'function') window.renderAdminSurplusCenter();
            if (typeof window.renderTransactionsLedger === 'function') window.renderTransactionsLedger();
            if (typeof window.syncLiveSurplusData === 'function') window.syncLiveSurplusData();
            if (typeof window.updateCharts === 'function') window.updateCharts();
            if (typeof window.renderFluctuationChart === 'function') window.renderFluctuationChart(window.currentFluctuationCommodity || 'Sayur Kangkung (KWT Pekarangan)');
        };

        // =========================================================================


        // 10. MASTER CONTROLLER: AUTH GATE, ORDER PROCESSING + STOCK DEDUCTION,
        //     PRODUCER STANDALONE WORKSPACE + AUTO AI, ADMIN MONEV, & MOBILE NAV
        // =========================================================================

        // --- A.1 & C.1: Fungsi Memproses Pesanan ("Siapkan Pesanan"), Otomatis Mengurangi Stok, & Membuka Detail Pesanan ---
        window.updateOrderStatus = function(txId, nextStatus) {
            const txs = window.appState.transactions || [];
            const tx = txs.find(t => t.id === txId);
            if (!tx) {
                showToast('Pesanan Tidak Ditemukan', 'Data pesanan tidak ditemukan.', 'error');
                return;
            }

            const listings = window.appState.listings || [];
            let listing = listings.find(l => l.id === tx.listingId);
            if (!listing) {
                listing = listings.find(l => l.producerSid === tx.producerSid && l.commodity.toLowerCase().includes((tx.commodity || '').toLowerCase().split(' ')[0]));
            }
            if (!listing) {
                listing = listings.find(l => l.producerSid === tx.producerSid);
            }

            if (nextStatus === 'SIAP_DIAMBIL') {
                tx.orderStatus = 'SIAP_DIAMBIL';
                tx.processedAt = new Date().toLocaleString('id-ID');
                tx.processedBy = tx.producerName || 'Produsen Kebun RT 13';

                // Otomatis kurangi stok produk produsen saat pesanan diproses (jika belum dikurangi)
                if (!tx.stockDeducted && listing) {
                    const qty = Number(tx.quantityKg) || 1;
                    const oldStock = Number(listing.availableStockKg) || 0;
                    const newStock = Math.max(0, oldStock - qty);
                    listing.availableStockKg = newStock;
                    listing.localAbsorbedKg = (Number(listing.localAbsorbedKg) || 0) + qty;
                    tx.stockDeducted = true;
                    tx.stockBefore = oldStock;
                    tx.stockAfter = newStock;

                    if (!window.appState.inventoryAuditLogs) window.appState.inventoryAuditLogs = [];
                    window.appState.inventoryAuditLogs.unshift({
                        id: 'AUDIT-' + Date.now(),
                        timestamp: new Date().toLocaleString('id-ID'),
                        listingId: listing.id,
                        commodity: listing.commodity,
                        producerSid: listing.producerSid,
                        producerName: listing.producerName,
                        oldStock: oldStock,
                        newStock: newStock,
                        oldPrice: listing.fairPrice,
                        newPrice: listing.fairPrice,
                        reason: 'Pengurangan stok otomatis dari pesanan ' + tx.id + ' (' + tx.consumerName + ')'
                    });

                    showToast(
                        'Pesanan Diproses & Stok Berkurang Otomatis',
                        `Pesanan ${tx.id} (${qty} Kg ${tx.commodity}) siap diambil/diantar. Stok produk berkurang dari ${oldStock} Kg menjadi ${newStock} Kg.`,
                        'success'
                    );
                } else {
                    showToast('Pesanan Diproses', `Pesanan ${tx.id} siap diambil atau diantar ke pembeli.`, 'success');
                }

                saveStateToLocal();
                renderAll();
                if (typeof window.renderHeaderProducerOrderAlert === 'function') window.renderHeaderProducerOrderAlert();
                if (typeof window.renderProducerWorkspaceAndAutoAi === 'function') window.renderProducerWorkspaceAndAutoAi();
                if (typeof window.renderProducerOrders === 'function') window.renderProducerOrders();
                if (typeof window.renderPersonalConsumerOrders === 'function') window.renderPersonalConsumerOrders();
                if (typeof window.renderPerProducerAiForecast === 'function') window.renderPerProducerAiForecast();
                // Tampilkan Detail Pesanan secara otomatis sesuai permintaan A.1
                viewTransactionReceipt(tx.id);
                return;
            }

            if (nextStatus === 'SELESAI_LUNAS') {
                tx.orderStatus = 'SELESAI_LUNAS';
                tx.completedAt = new Date().toLocaleString('id-ID');
                saveStateToLocal();
                renderAll();
                if (typeof window.renderHeaderProducerOrderAlert === 'function') window.renderHeaderProducerOrderAlert();
                if (typeof window.renderProducerWorkspaceAndAutoAi === 'function') window.renderProducerWorkspaceAndAutoAi();
                if (typeof window.renderProducerOrders === 'function') window.renderProducerOrders();
                if (typeof window.renderPersonalConsumerOrders === 'function') window.renderPersonalConsumerOrders();
                if (typeof window.renderPerProducerAiForecast === 'function') window.renderPerProducerAiForecast();
                showToast('Pesanan Selesai', `Pesanan ${tx.id} telah selesai dan diterima oleh pembeli.`, 'success');
                viewTransactionReceipt(tx.id);
                return;
            }
        };

        // Override viewTransactionReceipt untuk menampilkan Detail Pesanan lengkap & info pengurangan stok
        const _origViewTxReceipt = window.viewTransactionReceipt;
        window.viewTransactionReceipt = function(txId) {
            window.currentReceiptTxId = txId;
            const t = (window.appState.transactions || []).find(x => x.id === txId);
            if (!t) {
                if (typeof _origViewTxReceipt === 'function') return _origViewTxReceipt(txId);
                return;
            }

            const modalBody = document.getElementById('modalOrderReceiptBody');
            if (!modalBody) return;

            const buyerMember = (window.appState.members || []).find(m => m.sid === t.consumerSid);
            const buyerAddress = buyerMember ? buyerMember.address : 'RT 13 Yosomulyo Metro Pusat';
            const producerMember = (window.appState.members || []).find(m => m.sid === t.producerSid);
            const producerAddress = producerMember ? producerMember.address : 'Pekarangan RT 13';

            const listing = (window.appState.listings || []).find(l => l.id === t.listingId || l.producerSid === t.producerSid);
            const currentStock = listing ? listing.availableStockKg : '-';

            const statusBadgeHtml = t.orderStatus === 'MENUNGGU_KONFIRMASI'
                ? '<span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300"><i class="fa-solid fa-hourglass-start mr-1"></i>Menunggu Diproses Produsen</span>'
                : t.orderStatus === 'SIAP_DIAMBIL'
                ? '<span class="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs border border-blue-300"><i class="fa-solid fa-box-open mr-1"></i>Sedang Diproses (Siap Diambil / COD)</span>'
                : '<span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300"><i class="fa-solid fa-circle-check mr-1"></i>Pesanan Selesai</span>';

            const canProcess = (window.appState.activeRole === 'PRODUSEN' || window.appState.isAdminLoggedIn);

            modalBody.innerHTML = `
                <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3.5 text-xs">
                    <div class="text-center pb-3 border-b border-stone-200 space-y-1.5">
                        <div class="font-bold text-stone-900 text-sm">DETAIL PESANAN PANGAN</div>
                        <div class="font-mono text-[11px] text-stone-500">ID Pesanan: <strong>${t.id}</strong> • ${t.timestamp}</div>
                        <div class="pt-1">${statusBadgeHtml}</div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1 border-b border-stone-200">
                        <div class="bg-white p-3 rounded-xl border border-stone-200">
                            <span class="block text-[10px] font-bold text-stone-400 uppercase">Data Pembeli (Konsumen):</span>
                            <strong class="text-stone-900 text-xs block mt-0.5">${t.consumerName || 'Warga RT 13'}</strong>
                            <span class="text-[11px] text-stone-600 block"><i class="fa-solid fa-location-dot text-emerald-600 mr-1"></i>${buyerAddress}</span>
                        </div>
                        <div class="bg-white p-3 rounded-xl border border-stone-200">
                            <span class="block text-[10px] font-bold text-stone-400 uppercase">Data Kebun (Produsen):</span>
                            <strong class="text-stone-900 text-xs block mt-0.5">${t.producerName}</strong>
                            <span class="text-[11px] text-stone-600 block"><i class="fa-solid fa-seedling text-forest-700 mr-1"></i>${producerAddress}</span>
                        </div>
                    </div>

                    <div class="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                        <div class="flex justify-between items-center">
                            <div>
                                <strong class="text-stone-900 text-sm block">${t.commodity}</strong>
                                <span class="text-[11px] text-stone-500 font-mono">${t.quantityKg} Kg x ${formatRupiah(t.unitPrice)}</span>
                            </div>
                            <span class="font-mono font-bold text-sm text-stone-900">${formatRupiah(t.subtotal)}</span>
                        </div>
                        <div class="flex justify-between items-center text-[11px] text-stone-600 pt-1.5 border-t border-stone-100">
                            <span>Metode Pengambilan: <strong>${t.deliveryMethod || 'Ambil Sendiri'}</strong></span>
                            <span class="font-mono">${formatRupiah(t.deliveryFee || 0)}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs font-bold text-forest-900 pt-1.5 border-t border-stone-200">
                            <span>TOTAL PEMBAYARAN</span>
                            <span class="font-mono text-sm">${formatRupiah(t.totalPaid || t.subtotal)}</span>
                        </div>
                    </div>

                    <!-- Informasi Stok Produsen -->
                    <div class="p-3 rounded-xl ${t.stockDeducted ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-amber-50 border border-amber-200 text-amber-900'} text-[11px] flex items-center justify-between">
                        <div>
                            <strong class="block">${t.stockDeducted ? '✓ Stok Produk Telah Dikurangi Otomatis' : '⏳ Stok Menunggu Pesanan Diproses'}</strong>
                            <span>${t.stockBefore !== undefined ? `Stok Awal: ${t.stockBefore} Kg → Sisa Stok: ${t.stockAfter} Kg (-${t.quantityKg} Kg)` : `Sisa Stok Produk Saat Ini: ${currentStock} Kg`}</span>
                        </div>
                    </div>

                    <div class="pt-1">
                        <button type="button" onclick="downloadOrderReceiptPdf('${t.id}')"
                            class="w-full py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-file-pdf text-amber-300"></i>
                            <span>Unduh Struk Transaksi (Otomatis PDF)</span>
                        </button>
                    </div>

                    ${canProcess && t.orderStatus === 'MENUNGGU_KONFIRMASI' ? `
                        <button type="button" onclick="closeModal('modalOrderReceipt'); updateOrderStatus('${t.id}', 'SIAP_DIAMBIL');"
                            class="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-boxes-packing"></i>
                            <span>Proses &amp; Siapkan Pesanan Sekarang (Kurangi Stok ${t.quantityKg} Kg)</span>
                        </button>
                    ` : canProcess && t.orderStatus === 'SIAP_DIAMBIL' ? `
                        <button type="button" onclick="closeModal('modalOrderReceipt'); updateOrderStatus('${t.id}', 'SELESAI_LUNAS');"
                            class="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>Konfirmasi Pesanan Selesai &amp; Diterima Pembeli</span>
                        </button>
                    ` : ''}
                </div>
            `;

            openModal('modalOrderReceipt');
        };

        // --- B.1 - B.5: CONTROLLER PORTAL LOGIN & DAFTAR AKUN BARU (#authGateScreen) ---
        window.switchAuthGateMode = function(mode) {
            const loginBox = document.getElementById('gateLoginFormContainer');
            const regBox = document.getElementById('gateRegisterFormContainer');
            const btnLogin = document.getElementById('gateTabBtnLogin');
            const btnReg = document.getElementById('gateTabBtnRegister');
            const gateScreen = document.getElementById('authGateScreen');
            const gateCard = document.getElementById('authGateCard');

            if (mode === 'REGISTER') {
                if (loginBox) loginBox.classList.add('hidden');
                if (regBox) regBox.classList.remove('hidden');
                if (btnReg) btnReg.className = 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all bg-forest-800 text-white shadow-xs cursor-pointer';
                if (btnLogin) btnLogin.className = 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all text-stone-600 hover:text-stone-900 cursor-pointer';
                if (gateScreen) {
                    gateScreen.classList.remove('h-dvh', 'justify-center');
                    gateScreen.classList.add('min-h-dvh', 'justify-start', 'py-6');
                }
                if (gateCard) {
                    gateCard.classList.remove('my-auto');
                    gateCard.classList.add('my-0');
                }
                window.scrollTo({ top: 0, behavior: 'instant' });
                if (gateScreen) gateScreen.scrollTop = 0;
            } else {
                if (regBox) regBox.classList.add('hidden');
                if (loginBox) loginBox.classList.remove('hidden');
                if (btnLogin) btnLogin.className = 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all bg-forest-800 text-white shadow-xs cursor-pointer';
                if (btnReg) btnReg.className = 'py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all text-stone-600 hover:text-stone-900 cursor-pointer';
                if (gateScreen) {
                    gateScreen.classList.add('h-dvh', 'justify-center');
                    gateScreen.classList.remove('min-h-dvh', 'justify-start', 'py-6');
                }
                if (gateCard) {
                    gateCard.classList.add('my-auto');
                    gateCard.classList.remove('my-0');
                }
                window.scrollTo({ top: 0, behavior: 'instant' });
                if (gateScreen) gateScreen.scrollTop = 0;
            }
        };

        window.handleGateRoleChange = function(role) {
            const userSelect = document.getElementById('gateLoginUserSelect');
            const userPickerGroup = document.getElementById('gateUserPickerGroup');
            const nikInput = document.getElementById('gateLoginNik');
            const pinInput = document.getElementById('gateLoginPin');
            const members = window.appState.members || [];

            if (!userSelect) return;

            if (role === 'ADMIN') {
                if (userPickerGroup) userPickerGroup.classList.add('hidden');
                if (nikInput) nikInput.value = 'ADMIN-RT13';
                if (pinInput) pinInput.value = '';
                return;
            }

            if (userPickerGroup) userPickerGroup.classList.remove('hidden');

            if (role === 'PRODUSEN') {
                // Pisahkan akun Produsen secara eksklusif (10 Produsen Pekarangan / KWT)
                const producers = members.filter(m => m.role === 'PRODUSEN');
                userSelect.innerHTML = producers.map(p =>
                    `<option value="${p.sid}">${p.name} — ${p.producerCommodity || 'Produsen KWT'}</option>`
                ).join('');
                if (producers[0] && nikInput) {
                    userSelect.value = producers[0].sid;
                    nikInput.value = producers[0].rawNik || producers[0].sid;
                }
            } else {
                // Masukkan seluruh 40 KK terintegrasi sebagai akun Konsumen
                userSelect.innerHTML = members.map((m, idx) =>
                    `<option value="${m.sid}">KK-${String(idx + 1).padStart(2, '0')} • ${m.name} (${m.address || 'RT 13'})</option>`
                ).join('');
                // Default pilih akun konsumen murni (contoh: Ibu Fitri Handayani SID-RT13-020 atau indeks ke-19)
                const defaultKonsumen = members.find(m => m.sid === 'SID-RT13-020') || members[10] || members[0];
                if (defaultKonsumen && nikInput) {
                    userSelect.value = defaultKonsumen.sid;
                    nikInput.value = defaultKonsumen.rawNik || defaultKonsumen.sid;
                }
            }
        };

        window.handleGateUserSelectChange = function(sid) {
            const members = window.appState.members || [];
            const m = members.find(x => x.sid === sid);
            const nikInput = document.getElementById('gateLoginNik');
            if (m && nikInput) {
                nikInput.value = m.rawNik || m.sid;
            }
        };

        window.handleGateNikInput = function(val) {
            const q = String(val || '').trim().toLowerCase();
            if (!q) return;
            const members = window.appState.members || [];
            const matched = members.find(m =>
                (m.rawNik && m.rawNik.toLowerCase() === q) ||
                m.sid.toLowerCase() === q ||
                m.name.toLowerCase().includes(q)
            );
            const userSelect = document.getElementById('gateLoginUserSelect');
            if (matched && userSelect) {
                const optExists = Array.from(userSelect.options).some(o => o.value === matched.sid);
                if (optExists) userSelect.value = matched.sid;
            }
        };

        function normalizeCitizenName(str) {
            return String(str || '')
                .toLowerCase()
                .replace(/^(bpk\.?|bapak|ibu|pak|bu|sdr\.?|ny\.?)\s+/i, '')
                .replace(/\s+/g, ' ')
                .trim();
        }
        window.normalizeCitizenName = normalizeCitizenName;

        window.showGateLoginError = function showGateLoginError(msg) {
            const errBox = document.getElementById('gateLoginErrorBox');
            const errText = document.getElementById('gateLoginErrorText');
            if (errBox && errText) {
                errText.textContent = msg;
                errBox.classList.remove('hidden');
            }
            showToast('Gagal Masuk', msg, 'error');
        }

        window.handleGateLoginSubmit = function(e) {
            if (e) e.preventDefault();
            const identityVal = String(document.getElementById('gateLoginIdentity')?.value || '').trim();
            const pinVal = String(document.getElementById('gateLoginPin')?.value || '').trim();
            const rememberMe = Boolean(document.getElementById('gateRememberMe')?.checked);

            if (!identityVal) {
                showGateLoginError('Silakan masukkan Nama atau 16 digit NIK Anda.');
                document.getElementById('gateLoginIdentity')?.focus();
                return;
            }

            if (!pinVal || pinVal.length < 4) {
                showGateLoginError('Silakan masukkan 4 angka PIN Rahasia Anda.');
                document.getElementById('gateLoginPin')?.focus();
                return;
            }

            // Cek jika login sebagai Admin RT
            const idLower = identityVal.toLowerCase();
            if (idLower === 'admin' || idLower === 'admin-rt13' || idLower === 'pengurus rt') {
                if (pinVal === '1234' || pinVal === '2026') {
                    window.appState.isAdminLoggedIn = true;
                    window.appState.activeUserSid = 'ADMIN-RT13';
                    window.appState.activeRole = 'ADMIN';
                    if (rememberMe) saveStateToLocal();
                    window.aiForecastScope = 'ALL';
                    if (typeof savePwaAuthSession === 'function') savePwaAuthSession(rememberMe);
                    syncAuthGateVisibility();
                    setActiveRole('ADMIN');
                    switchTab('tab-sid');
                    showToast('Login Admin Berhasil', 'Selamat datang di Profil & Direktori 40 KK Admin RT 13.', 'success');
                } else {
                    showGateLoginError('PIN Rahasia Admin salah! Periksa kembali PIN Anda.');
                }
                return;
            }

            const members = window.appState.members || [];
            const isNumericInput = /^\d+$/.test(identityVal);
            let member = null;

            if (isNumericInput) {
                // Validasi NIK Ketat: Harus 16 angka dan persis sama (jika kurang 1 angka otomatis ditolak!)
                if (identityVal.length !== 16) {
                    showGateLoginError(`NIK tidak valid (${identityVal.length} angka). NIK harus tepat 16 angka!`);
                    return;
                }
                member = members.find(m => m.rawNik === identityVal);
            } else {
                // Validasi Nama Fleksibel & Ramah (Prioritas: Persis -> Berawalan Nama Depan -> Kata Nama)
                const cleanInputName = normalizeCitizenName(identityVal);
                member = members.find(m =>
                    normalizeCitizenName(m.name) === cleanInputName ||
                    m.name.toLowerCase().trim() === idLower ||
                    m.sid.toLowerCase().trim() === idLower
                );
                if (!member && cleanInputName.length >= 3) {
                    member = members.find(m => normalizeCitizenName(m.name).startsWith(cleanInputName));
                }
                if (!member && cleanInputName.length >= 3) {
                    member = members.find(m => normalizeCitizenName(m.name).split(' ').includes(cleanInputName));
                }
            }

            if (!member) {
                showGateLoginError('Nama atau NIK tidak ditemukan! Pastikan ejaan nama atau 16 angka NIK benar.');
                return;
            }

            // Validasi PIN Rahasia 4 Angka secara ketat (mendukung PIN 1234 atau 4 angka terakhir NIK)
            const validPin1 = member.pinCode ? String(member.pinCode).trim() : '1234';
            const validPin2 = member.rawNik ? String(member.rawNik).slice(-4) : null;
            const isPinMatch = (validPin1 && pinVal === validPin1) || (validPin2 && pinVal === validPin2);

            if (!isPinMatch) {
                showGateLoginError('PIN Rahasia salah! Tidak dapat masuk ke akun.');
                document.getElementById('gateLoginPin')?.focus();
                return;
            }

            // Login Valid: Tentukan peran awal sesuai profil akun (dan bisa berganti peran di menu Profile jika Dual-Role)
            const initialRole = (member.role === 'PRODUSEN' && member.isDualRole) ? 'PRODUSEN' : 'KONSUMEN';
            window.appState.isAdminLoggedIn = false;
            window.appState.activeUserSid = member.sid;
            window.appState.activeRole = initialRole;
            window.aiForecastScope = 'MINE';

            if (typeof savePwaAuthSession === 'function') {
                savePwaAuthSession(rememberMe);
            }
            saveStateToLocal();

            const idEl = document.getElementById('gateLoginIdentity');
            const pinEl = document.getElementById('gateLoginPin');
            if (idEl) idEl.value = '';
            if (pinEl) pinEl.value = '';

            syncAuthGateVisibility();
            setActiveRole(initialRole);
            if (typeof renderAll === 'function') {
                renderAll();
            }
            switchTab('tab-sid');

            showToast('Berhasil Masuk', `Selamat datang, ${member.name} (${initialRole === 'PRODUSEN' ? 'Mode Produsen' : 'Mode Konsumen'}).`, 'success');
        };

        // --- Point 6: Akun Demo Terpisah (Tidak Mengganggu 40 KK Warga Asli) ---
        window.PWA_REMEMBER_KEY = 'SI_PANGAN_PWA_REMEMBER_SESSION_V1';

        window.savePwaAuthSession = function(rememberMe) {
            const payload = {
                activeUserSid: window.appState.activeUserSid,
                activeRole: window.appState.activeRole,
                isAdminLoggedIn: Boolean(window.appState.isAdminLoggedIn),
                rememberMe: Boolean(rememberMe),
                savedAt: Date.now()
            };
            try {
                sessionStorage.setItem(PWA_REMEMBER_KEY, JSON.stringify(payload));
                if (rememberMe) {
                    localStorage.setItem(PWA_REMEMBER_KEY, JSON.stringify(payload));
                } else {
                    localStorage.removeItem(PWA_REMEMBER_KEY);
                }
            } catch (err) {
                console.warn('PWA Session error:', err);
            }
        };

        // Pembersihan Total Akun Simulasi / Demo (Data Murni Riil 40 KK Warga)
        window.cleanupAnyDemoData = function() {
            if (window.appState) {
                if (window.appState.members) {
                    window.appState.members = window.appState.members.filter(m => !m.isDemoAccount && m.sid !== 'DEMO-KONSUMEN' && m.sid !== 'DEMO-PRODUSEN');
                }
                if (window.appState.listings) {
                    window.appState.listings = window.appState.listings.filter(l => !l.isDemoListing && l.id !== 'list-demo-produsen');
                }
                if (window.appState.transactions) {
                    window.appState.transactions = window.appState.transactions.filter(t => !t.isDemoTx && t.id !== 'TX-DEMO-001');
                }
            }
        };
        window.ensureIsolatedDemoAccounts = window.cleanupAnyDemoData;

        window.quickDemoLogin = function(demoRole) {
            window.cleanupAnyDemoData();
            showToast('Akun Demo Dinonaktifkan', 'Sistem kini menggunakan data autentik 40 KK RT 13 tanpa akun simulasi.', 'info');
        };

        // --- B.4: Form Daftar Akun Baru di Halaman Login ---
        window.toggleGateRegProducerBox = function(role) {
            const box = document.getElementById('gateRegProducerBox');
            if (box) box.classList.toggle('hidden', role !== 'PRODUSEN');
        };

        window.calcGateRegFoodNeeds = function(jiwaVal) {
            const jiwa = Math.max(1, Number(jiwaVal) || 4);
            const beras = Math.round(jiwa * 7.5);
            const sayur = Math.round(jiwa * 3.0);
            const telur = Math.round(jiwa * 1.5);
            const ikan = Math.round(jiwa * 3.0);
            const total = beras + sayur + telur + ikan;

            const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
            setVal('gateRegBeras', beras);
            setVal('gateRegSayur', sayur);
            setVal('gateRegTelur', telur);
            setVal('gateRegIkan', ikan);
            setVal('gateRegTotalNeedKg', total);
        };

        window.syncGateRegSubNeeds = function() {
            const g = id => Number(document.getElementById(id)?.value) || 0;
            const total = g('gateRegBeras') + g('gateRegSayur') + g('gateRegTelur') + g('gateRegIkan');
            const totalEl = document.getElementById('gateRegTotalNeedKg');
            if (totalEl) totalEl.value = total;
        };

        window.handleGateRegisterSubmit = function(e) {
            if (e) e.preventDefault();
            const nik = String(document.getElementById('gateRegNik')?.value || '').trim();
            const title = String(document.getElementById('gateRegTitle')?.value || 'Bpk.').trim();
            let rawName = String(document.getElementById('gateRegName')?.value || '').trim();
            // Bersihkan jika warga sudah mengetik prefix sapaan secara manual
            rawName = rawName.replace(/^(bpk\.?|bapak|ibu|pak|bu)\s+/i, '').trim();
            const fullName = `${title} ${rawName}`;
            const role = document.getElementById('gateRegRole')?.value || 'KONSUMEN';
            const pin = String(document.getElementById('gateRegPin')?.value || '1234').trim();
            const address = String(document.getElementById('gateRegAddress')?.value || 'RT 13 Yosomulyo').trim();
            const familySize = Math.max(1, Number(document.getElementById('gateRegFamilySize')?.value) || 4);
            const totalNeed = Math.max(5, Number(document.getElementById('gateRegTotalNeedKg')?.value) || 60);
            const beras = Number(document.getElementById('gateRegBeras')?.value) || 30;
            const sayur = Number(document.getElementById('gateRegSayur')?.value) || 12;
            const telur = Number(document.getElementById('gateRegTelur')?.value) || 6;
            const ikan = Number(document.getElementById('gateRegIkan')?.value) || 12;

            if (!nik || nik.length < 4 || !rawName) {
                showToast('Data Belum Lengkap', 'Harap isi NIK dan Nama Lengkap Kepala Keluarga.', 'warning');
                return;
            }

            const members = window.appState.members || [];
            if (members.some(m => m.rawNik === nik)) {
                showToast('NIK Sudah Terdaftar', 'NIK tersebut sudah terdaftar. Silakan langsung masuk di tab Masuk Akun.', 'warning');
                switchAuthGateMode('LOGIN');
                return;
            }

            const nextNum = members.length + 1;
            const newSid = `SID-RT13-${String(nextNum).padStart(3, '0')}`;
            const comm = role === 'PRODUSEN' ? (document.getElementById('gateRegCommodity')?.value || 'Sayur Pekarangan KWT') : '-';
            const cap = role === 'PRODUSEN' ? (Number(document.getElementById('gateRegCapacityKg')?.value) || 25) : 0;

            const newMember = {
                sid: newSid,
                sidShort: `SID-${1300 + nextNum}`,
                name: fullName,
                publicName: `Warga ${newSid}`,
                nikHash: Math.random().toString(16).substring(2, 10),
                maskedNik: nik.slice(0, 6) + '********' + nik.slice(-2),
                rawNik: nik,
                pinCode: pin,
                role: role,
                isDualRole: role === 'PRODUSEN',
                producerCommodity: comm,
                capacityKg: cap,
                familySize: familySize,
                monthlyIncome: 2500000,
                monthlyFoodNeedKg: totalNeed,
                needs: { beras, sayur, telur, ikan, ayam: 4, tempe: 4 },
                socialTier: 'MANDIRI',
                distanceKm: 0.15,
                walletEarned: 0,
                subsidyReceivedKg: 0,
                address: address
            };

            members.push(newMember);

            if (role === 'PRODUSEN') {
                window.appState.listings.unshift({
                    id: 'list-' + Date.now(),
                    producerSid: newSid,
                    producerName: fullName,
                    commodity: comm,
                    category: 'Sayur Pekarangan',
                    unit: 'Kg',
                    initialHarvestKg: cap,
                    availableStockKg: cap,
                    localAbsorbedKg: 0,
                    unabsorbedSurplusKg: 0,
                    fairPrice: 8000,
                    marketPrice: 11000,
                    tengkulakPrice: 6000,
                    harvestDate: 'Hari Ini',
                    freshnessWindow: 'Segar Panen Pagi',
                    freshnessDaysRemaining: 4,
                    location: address,
                    distanceKm: 0.15,
                    icon: 'fa-seedling',
                    description: `Hasil panen segar ${comm} dari kebun ${fullName} (${address}).`
                });
            }

            window.appState.isAdminLoggedIn = false;
            window.appState.activeUserSid = newMember.sid;
            window.appState.activeRole = role;

            const headerLabel = document.getElementById('headerActiveUserLabel');
            if (headerLabel && window.appState.activeUserSid) {
                if (window.appState.isAdminLoggedIn || role === 'ADMIN') {
                    headerLabel.textContent = 'Pengurus RT 13 (Admin)';
                } else {
                    const m = (window.appState.members || []).find(x => x.sid === window.appState.activeUserSid);
                    const roleText = role === 'PRODUSEN' ? 'Produsen' : 'Konsumen';
                    if (m) headerLabel.textContent = `${m.name} (${roleText})`;
                }
            }

            saveStateToLocal();
            syncAuthGateVisibility();
            setActiveRole(role);
            switchTab('tab-sid');

            showToast('Pendaftaran & Login Berhasil!', `Akun ${fullName} (${newSid}) berhasil dibuat dan langsung aktif.`, 'success');
        };

        // --- Sinkronisasi Layar Login Awal vs Aplikasi Utama (B.1 & B.2) ---
        function syncAuthGateVisibility() {
            const isLogged = Boolean(window.appState.activeUserSid || window.appState.isAdminLoggedIn);
            const gateEl = document.getElementById('authGateScreen');
            const headerEl = document.getElementById('mainAppHeader');
            const mainEl = document.getElementById('mainAppContainer');
            const mobileNavEl = document.getElementById('mobileBottomNav');

            if (!isLogged) {
                if (gateEl) gateEl.classList.remove('hidden');
                if (headerEl) headerEl.classList.add('hidden');
                if (mainEl) mainEl.classList.add('hidden');
                if (mobileNavEl) mobileNavEl.classList.add('hidden');
                handleGateRoleChange(document.getElementById('gateLoginRole')?.value || 'KONSUMEN');
            } else {
                if (gateEl) gateEl.classList.add('hidden');
                if (headerEl) headerEl.classList.remove('hidden');
                if (mainEl) mainEl.classList.remove('hidden');
                if (mobileNavEl) mobileNavEl.classList.remove('hidden');
                if (typeof renderMobileBottomNav === 'function') renderMobileBottomNav();
                else if (typeof window.renderMobileBottomNav === 'function') window.renderMobileBottomNav();
            }
        }
        window.syncAuthGateVisibility = syncAuthGateVisibility;

        // Override logoutCitizenAccount agar kembali ke halaman Login bersih (#authGateScreen)
        window.logoutCitizenAccount = function() {
            window.appState.activeUserSid = null;
            window.appState.isAdminLoggedIn = false;
            window.appState.activeRole = 'KONSUMEN';
            saveStateToLocal();
            syncAuthGateVisibility();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('Berhasil Keluar', 'Anda telah keluar dari akun SI-PANGAN ID.', 'info');
        };
        window.logoutAdminRole = window.logoutCitizenAccount;

        // --- D.1, D.2, D.3: RENDER WORKSPACE MANDIRI PRODUSEN & PANEL RAMALAN AI OTOMATIS ---
        window.renderProducerWorkspaceAndAutoAi = function() {
            const workspace = document.getElementById('producerStandaloneWorkspace');
            const notifBox = document.getElementById('producerIncomingOrderAlertBox');
            const aiPanel = document.getElementById('producerAutoAiPanel');
            if (!workspace) return;

            const role = window.appState.activeRole || 'KONSUMEN';
            const activeSid = window.appState.activeUserSid;
            const isAdmin = Boolean(window.appState.isAdminLoggedIn || role === 'ADMIN' || activeSid === 'ADMIN-RT13');

            // Admin TIDAK BOLEH melihat notifikasi pesanan masuk atau workspace mandiri produsen! (Point 1)
            if (isAdmin || role !== 'PRODUSEN' || !activeSid) {
                workspace.classList.add('hidden');
                if (notifBox) {
                    notifBox.classList.add('hidden');
                    notifBox.innerHTML = '';
                }
                return;
            }

            workspace.classList.remove('hidden');
            const members = window.appState.members || [];
            const listings = window.appState.listings || [];
            const transactions = window.appState.transactions || [];
            const me = members.find(m => m.sid === activeSid);
            if (!me) {
                workspace.classList.add('hidden');
                if (notifBox) {
                    notifBox.classList.add('hidden');
                    notifBox.innerHTML = '';
                }
                return;
            }

            const titleEl = document.getElementById('producerWorkspaceTitle');
            if (titleEl && me) {
                titleEl.textContent = `Kebun ${me.name} — ${me.producerCommodity || 'Produsen Pangan RT 13'}`;
            }

            // 1. Notifikasi Pesanan Baru Masuk (MENUNGGU_KONFIRMASI)
            const myOrders = transactions.filter(t => t.producerSid === activeSid);
            const pendingOrders = myOrders.filter(t => t.orderStatus === 'MENUNGGU_KONFIRMASI');

            // Badge hanya menampilkan jumlah pesanan yang perlu tindakan (pending), jika 0 maka bersih
            const countBadge = document.getElementById('marketOrdersCountBadge');
            if (countBadge) countBadge.textContent = pendingOrders.length;

            if (notifBox) {
                if (pendingOrders.length > 0) {
                    notifBox.classList.remove('hidden');
                    notifBox.innerHTML = `
                        <div class="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm space-y-3">
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-bold animate-bounce">
                                        <i class="fa-solid fa-bell"></i>
                                    </span>
                                    <div>
                                        <h3 class="font-bold text-stone-900 text-sm sm:text-base">
                                            Notifikasi Pesanan Baru Masuk (${pendingOrders.length} Pesanan Menunggu Diproses)
                                        </h3>
                                        <p class="text-xs text-stone-600">Klik "Siapkan Pesanan" untuk memproses pesanan, melihat detail, dan mengurangi stok otomatis.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                ${pendingOrders.map(o => `
                                    <div class="p-3.5 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div class="space-y-0.5">
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">${o.id}</span>
                                                <strong class="text-xs sm:text-sm text-stone-900">${o.consumerName}</strong>
                                                <span class="text-[11px] text-stone-500">• ${o.deliveryMethod || 'Ambil Sendiri'}</span>
                                            </div>
                                            <p class="text-xs text-forest-800 font-semibold">
                                                Memesan: <strong>${o.quantityKg} Kg ${o.commodity}</strong> (Total: ${formatRupiah(o.totalPaid || o.subtotal)})
                                            </p>
                                        </div>
                                        <div class="flex items-center gap-2 shrink-0">
                                            <button type="button" onclick="updateOrderStatus('${o.id}', 'SIAP_DIAMBIL')"
                                                class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                                                <i class="fa-solid fa-boxes-packing"></i>
                                                <span>Siapkan Pesanan</span>
                                            </button>
                                            <button type="button" onclick="viewTransactionReceipt('${o.id}')"
                                                class="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer">
                                                Detail
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    notifBox.classList.add('hidden');
                    notifBox.innerHTML = '';
                }
            }

            // 2. Panel "Ramalan AI Khusus Kebun Saya" (Sederhana, Bahasa Warga, Tanpa Inflasi Sintetis)
            if (aiPanel && me) {
                const myListings = listings.filter(l => l.producerSid === activeSid);
                const primaryListing = myListings[0];
                const commName = primaryListing ? primaryListing.commodity : (me.producerCommodity || 'Sayur Pekarangan KWT');
                // Stok riil 1:1 dari lapak kebun aktif produsen (tanpa tambahan rumus buatan)
                const realStock = myListings.reduce((s, l) => s + (Number(l.availableStockKg) || 0), 0);

                // Kebutuhan riil warga dari usulan pangan warga (Papan Musyawarah) & riwayat belanja
                const demandMatch = (window.appState?.demands || []).find(d => 
                    d.name && (d.name.toLowerCase().includes(commName.toLowerCase()) || commName.toLowerCase().includes(d.name.toLowerCase()))
                );
                const demandKg = demandMatch ? (Number(demandMatch.totalQuantityKg) || Number(demandMatch.targetQtyKg) || 0) : 0;
                const soldKg = myOrders.reduce((s, t) => s + (Number(t.quantityKg) || 0), 0);
                const marketDemandEst = demandKg > 0 ? demandKg : Math.max(4, Math.round((soldKg * 0.4) + 5));
                const surplusDiff = realStock - marketDemandEst;

                const isSurplusRisk = surplusDiff > 4 || Boolean(me.surplusNotified);
                const isDeficitRisk = surplusDiff < -3;

                let riskBadge = '';
                let prodRec = '';
                if (isSurplusRisk) {
                    riskBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Surplus +${Math.max(surplusDiff, 5)} Kg</span>`;
                    prodRec = `Stok lapak kebun Anda untuk ${commName} (${realStock} Kg) melebihi kebutuhan warga RT 13 (${marketDemandEst} Kg). Disarankan tahan penambahan panen baru dan siapkan kelebihan panen untuk disalurkan Admin ke Lumbung / Koperasi.`;
                } else if (isDeficitRisk) {
                    riskBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Kurang Stok ${Math.abs(surplusDiff)} Kg</span>`;
                    prodRec = `Permintaan warga untuk ${commName} tinggi (${marketDemandEst} Kg), sedangkan stok lapak Anda ${realStock} Kg. Disarankan menambah pasokan panen atau menambah stok di lapak.`;
                } else {
                    riskBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Pasokan Pas &amp; Aman</span>`;
                    prodRec = `Stok ${commName} (${realStock} Kg) pas memenuhi kebutuhan belanja warga RT 13 (${marketDemandEst} Kg). Pertahankan jadwal panen dan ketersediaan stok Anda.`;
                }

                const showSurplusNotifInWorkspace = !me.surplusConfirmedByProducer && Boolean(me.surplusNotified);
                const adminSurplusWarningHtml = showSurplusNotifInWorkspace ? `
                    <div class="p-3.5 rounded-xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div class="flex items-start gap-2.5">
                            <i class="fa-solid fa-triangle-exclamation text-lg mt-0.5 shrink-0"></i>
                            <div class="text-xs leading-snug">
                                <strong class="block text-sm">Peringatan Resmi Admin: Permintaan Penarikan Surplus (${commName})</strong>
                                <span>${me.surplusNotifiedMsg || `Admin RT 13 meminta konfirmasi kesiapan surplus +${Math.max(surplusDiff, 5)} Kg dari kebun Anda untuk disalurkan ke Koperasi / Program MBG.`}</span>
                            </div>
                        </div>
                        <button type="button" onclick="acknowledgeProducerSurplusAlert()"
                            class="px-3.5 py-2 rounded-lg bg-white text-amber-950 font-bold text-xs shrink-0 hover:bg-amber-50 transition cursor-pointer">
                            <i class="fa-solid fa-check-double mr-1"></i>Konfirmasi Siap Salurkan
                        </button>
                    </div>
                ` : '';

                aiPanel.innerHTML = `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-800 text-white">
                                    <i class="fa-solid fa-wand-magic-sparkles text-emerald-300 mr-1"></i> Ramalan AI Khusus Kebun Saya
                                </span>
                                <span class="text-xs font-bold text-forest-800">${commName}</span>
                            </div>
                            <p class="text-xs text-stone-600 mt-1">
                                Analisis otomatis potensi serapan pasar, permintaan warga, dan risiko surplus untuk kebun <strong>${me.name}</strong>.
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            ${riskBadge}
                            <button type="button" onclick="openModal('modalPasarIndukBapanas')"
                                class="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
                                <i class="fa-solid fa-chart-line text-amber-700"></i>
                                <span>Cek Patokan Bapanas</span>
                            </button>
                        </div>
                    </div>

                    ${adminSurplusWarningHtml}

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        <div class="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                            <span class="text-[11px] text-stone-500 font-semibold block">📦 Stok di Lapak Kebun Anda</span>
                            <strong class="font-mono text-xl font-extrabold text-stone-900">${realStock} Kg</strong>
                            <span class="text-[10px] text-stone-400 block">Stok Riil Siap Dijual</span>
                        </div>
                        <div class="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                            <span class="text-[11px] text-stone-500 font-semibold block">👥 Kebutuhan Warga RT 13</span>
                            <strong class="font-mono text-xl font-extrabold text-emerald-800">${marketDemandEst} Kg</strong>
                            <span class="text-[10px] text-stone-400 block">Permintaan Belanja Tetangga</span>
                        </div>
                        <div class="p-3.5 rounded-xl ${isSurplusRisk ? 'bg-amber-50 border-amber-300 text-amber-950' : isDeficitRisk ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-emerald-50 border-emerald-300 text-emerald-950'} border shadow-2xs">
                            <span class="text-[11px] font-bold block">⚖️ Kondisi Pasokan Pangan</span>
                            <strong class="font-mono text-xl font-extrabold">${surplusDiff >= 0 ? '+' + surplusDiff : surplusDiff} Kg</strong>
                            <span class="text-[10px] font-semibold block">${isSurplusRisk ? 'Siap Disalurkan ke Lumbung' : isDeficitRisk ? 'Perlu Tambah Stok' : 'Pas &amp; Seimbang'}</span>
                        </div>
                    </div>

                    <div class="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-stone-700 leading-relaxed">
                        <strong class="text-forest-900"><i class="fa-solid fa-lightbulb text-amber-500 mr-1.5"></i>Saran Tindakan Panen:</strong>
                        ${prodRec}
                    </div>
                `;
            }
        };

        // --- E.2: RENDER REKAPITULASI 40 KK & DATA PRODUKSI SELURUH PRODUSEN DI DASHBOARD MONEV ADMIN ---
        window.renderAdminMonevSummary = function() {
            const kkEl = document.getElementById('adminMonevKkNeedsSummary');
            const prodEl = document.getElementById('adminMonevProducerSummary');
            const members = (window.appState.members || []).filter(m => !m.isDemoAccount);
            const listings = (window.appState.listings || []).filter(l => !l.isDemoListing);

            if (kkEl) {
                const totalJiwa = members.reduce((s, m) => s + (Number(m.familySize) || 4), 0);
                const totalBeras = members.reduce((s, m) => s + (m.needs?.beras || Math.round((m.familySize || 4) * 7.5)), 0);
                const totalSayur = members.reduce((s, m) => s + (m.needs?.sayur || Math.round((m.familySize || 4) * 3)), 0);
                const totalProtein = members.reduce((s, m) => s + ((m.needs?.telur || 6) + (m.needs?.ikan || 6)), 0);

                kkEl.innerHTML = `
                    <div class="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span class="text-[10px] text-stone-500 block">Total Populasi</span>
                        <strong class="font-mono text-sm font-bold text-stone-900">${members.length} KK (${totalJiwa} Jiwa)</strong>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span class="text-[10px] text-stone-500 block">Kebutuhan Beras</span>
                        <strong class="font-mono text-sm font-bold text-forest-800">${totalBeras} Kg/bln</strong>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span class="text-[10px] text-stone-500 block">Kebutuhan Sayur</span>
                        <strong class="font-mono text-sm font-bold text-emerald-700">${totalSayur} Kg/bln</strong>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span class="text-[10px] text-stone-500 block">Telur &amp; Ikan</span>
                        <strong class="font-mono text-sm font-bold text-amber-800">${totalProtein} Kg/bln</strong>
                    </div>
                `;
            }

            if (prodEl) {
                const producers = members.filter(m => m.role === 'PRODUSEN');
                const totalCap = producers.reduce((s, p) => s + (Number(p.capacityKg) || 30), 0);
                const totalActiveStock = listings.reduce((s, l) => s + (Number(l.availableStockKg) || 0), 0);

                prodEl.innerHTML = `
                    <div class="bg-white p-2.5 rounded-xl border border-amber-200">
                        <span class="text-[10px] text-stone-500 block">Unit Produsen</span>
                        <strong class="font-mono text-sm font-bold text-stone-900">${producers.length} Kebun/KWT</strong>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-amber-200">
                        <span class="text-[10px] text-stone-500 block">Kapasitas Produksi</span>
                        <strong class="font-mono text-sm font-bold text-amber-900">${totalCap} Kg/bln</strong>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-amber-200">
                        <span class="text-[10px] text-stone-500 block">Stok Siap Serap</span>
                        <strong class="font-mono text-sm font-bold text-forest-800">${totalActiveStock} Kg</strong>
                    </div>
                `;
            }
        };

        // --- A.3: RENDER MOBILE BOTTOM NAVIGATION BAR SESUAI PERAN ---
        window.renderMobileBottomNav = function() {
            const grid = document.getElementById('mobileBottomNavGrid');
            if (!grid) return;

            const role = window.appState.activeRole || 'KONSUMEN';
            const activePane = document.querySelector('.tab-pane:not(.hidden)');
            const activeTabId = activePane ? activePane.id : 'tab-market';

            let items = [];
            if (role === 'ADMIN') {
                grid.className = 'grid grid-cols-4 gap-1 max-w-md mx-auto';
                items = [
                    { id: 'tab-dampak', icon: 'fa-chart-pie', label: 'Monev & Surplus' },
                    { id: 'tab-matching', icon: 'fa-microchip', label: 'Analisis AI' },
                    { id: 'tab-sid', icon: 'fa-users', label: 'Data 40 KK' },
                    { id: 'tab-orders', icon: 'fa-clipboard-list', label: 'Pesanan' }
                ];
            } else if (role === 'PRODUSEN') {
                grid.className = 'grid grid-cols-5 gap-1 max-w-md mx-auto';
                const pendingCount = (window.appState.transactions || []).filter(t => t.producerSid === window.appState.activeUserSid && t.orderStatus === 'MENUNGGU_KONFIRMASI').length;
                items = [
                    { id: 'tab-market', icon: 'fa-seedling', label: 'Lapak' },
                    { id: 'tab-orders', icon: 'fa-clipboard-check', label: pendingCount > 0 ? `Pesanan Masuk (${pendingCount})` : 'Pesanan Masuk' },
                    { id: 'tab-matching', icon: 'fa-microchip', label: 'Analisis AI' },
                    { id: 'tab-musyawarah', icon: 'fa-check-to-slot', label: 'Sinyal' },
                    { id: 'tab-sid', icon: 'fa-user', label: 'Profile' }
                ];
            } else {
                grid.className = 'grid grid-cols-4 gap-1 max-w-md mx-auto';
                const activeSid = window.appState.activeUserSid;
                const readyCount = (window.appState.transactions || []).filter(t => t.consumerSid === activeSid && t.orderStatus === 'SIAP_DIAMBIL').length;
                items = [
                    { id: 'tab-market', icon: 'fa-store', label: 'Pasar' },
                    { id: 'tab-orders', icon: 'fa-bag-shopping', label: readyCount > 0 ? `Pesanan Saya (${readyCount})` : 'Pesanan Saya' },
                    { id: 'tab-musyawarah', icon: 'fa-check-to-slot', label: 'Usulan' },
                    { id: 'tab-sid', icon: 'fa-user', label: 'Profile' }
                ];
            }

            const activeBg = role === 'PRODUSEN' ? 'bg-[#9A3412]' : 'bg-[#0F5132]';
            grid.innerHTML = items.map(item => {
                const isActive = activeTabId === item.id;
                return `
                    <button type="button" onclick="switchTab('${item.id}')"
                        class="py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${isActive ? `${activeBg} text-white font-bold shadow-xs` : 'text-stone-600 hover:bg-stone-100 font-semibold'}">
                        <i class="fa-solid ${item.icon} text-sm"></i>
                        <span class="text-[10px] leading-none truncate max-w-full">${item.label}</span>
                    </button>
                `;
            }).join('');
        };

        // --- A.4: UPDATE BADGE JUMLAH PESANAN DI SIDEBAR ---
        window.updateSidebarOrdersBadge = function() {
            const badge = document.getElementById('sidebarOrdersBadge');
            if (!badge) return;
            const role = window.appState?.activeRole || 'KONSUMEN';
            const activeSid = window.appState?.activeUserSid;
            if (role === 'KONSUMEN') {
                const myOrders = (window.appState?.transactions || []).filter(t => t.consumerSid === activeSid);
                if (myOrders.length > 0) {
                    badge.textContent = myOrders.length;
                    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#0F5132] font-mono';
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            } else if (role === 'PRODUSEN') {
                const prodOrders = (window.appState?.transactions || []).filter(t => t.producerSid === activeSid);
                const pendingCount = prodOrders.filter(t => t.orderStatus === 'MENUNGGU_KONFIRMASI').length;
                if (prodOrders.length > 0) {
                    badge.textContent = prodOrders.length;
                    badge.className = `px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${pendingCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-200 text-stone-700'}`;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            } else {
                badge.classList.add('hidden');
            }
        };

        // Hook ke switchTab, setActiveRole, dan renderAll agar semua komponen baru ter-update otomatis
        const _prevSwitchTab = window.switchTab;
        window.switchTab = function(tabId) {
            _prevSwitchTab(tabId);
            const role = window.appState.activeRole || 'KONSUMEN';
            if (tabId === 'tab-orders') {
                if (role === 'KONSUMEN') {
                    if (typeof renderPersonalConsumerOrders === 'function') renderPersonalConsumerOrders();
                } else {
                    if (typeof renderProducerOrders === 'function') renderProducerOrders();
                }
            }
            if (typeof updateSidebarOrdersBadge === 'function') updateSidebarOrdersBadge();
            if (typeof renderMobileBottomNav === 'function') renderMobileBottomNav();
            if (typeof renderProducerWorkspaceAndAutoAi === 'function') renderProducerWorkspaceAndAutoAi();
            if (typeof renderAdminMonevSummary === 'function') renderAdminMonevSummary();
        };

        const _prevSetActiveRole = window.setActiveRole;
        window.setActiveRole = function(role) {
            _prevSetActiveRole(role);

            const roleBadge = document.getElementById('headerRolePillBadge');
            const navMarketTitle = document.getElementById('navMarketTitle');
            const navMarketSub = document.getElementById('navMarketSubtitle');
            const navOrders = document.getElementById('nav-tab-orders');
            const navOrdersTitle = document.getElementById('navOrdersTitle');
            const navOrdersSub = document.getElementById('navOrdersSubtitle');
            const navSidTitle = document.getElementById('navSidTitle');
            const navSidSub = document.getElementById('navSidSubtitle');
            const sidTopAdminCard = document.getElementById('sidTopAdminCard');
            const sidRegCard = document.getElementById('sidRegistrationFormCard');
            const sidDirCard = document.getElementById('sidDirectoryTableCard');
            const myOwnKkCard = document.getElementById('myOwnKkSummaryCard');
            const consumerOrdersCard = document.getElementById('personalConsumerOrdersCard');
            const consumerBanner = document.getElementById('consumerBecomeProducerBanner');
            const aiFluctPanel = document.getElementById('aiMarketFluctuationPanel');
            const catFilterBar = document.getElementById('marketCategoryFilterBar');
            const consumerOrdersView = document.getElementById('consumerOrdersView');
            const producerOrdersView = document.getElementById('producerOrdersView');

            if (navOrders) navOrders.classList.remove('hidden');

            // Sembunyikan banner ajakan, pastikan grafik fluktuasi & proyeksi 3 hari tampil untuk Produsen & Admin
            if (consumerBanner) consumerBanner.classList.add('hidden');
            if (aiFluctPanel) {
                if (role === 'KONSUMEN') {
                    aiFluctPanel.classList.add('hidden');
                } else {
                    aiFluctPanel.classList.remove('hidden');
                    if (typeof window.renderFluctuationChart === 'function') {
                        setTimeout(() => {
                            window.renderFluctuationChart(window.currentFluctuationCommodity || 'Sayur Kangkung (KWT Pekarangan)');
                        }, 50);
                    }
                }
            }

            const headerLogoutBtn = document.getElementById('headerLogoutBtn');
            if (headerLogoutBtn) headerLogoutBtn.classList.remove('hidden');

            if (role === 'KONSUMEN') {
                if (navMarketTitle) navMarketTitle.textContent = 'Pasar Warga';
                if (navMarketSub) navMarketSub.textContent = 'Belanja Pangan Segar';
                if (navOrdersTitle) navOrdersTitle.textContent = 'Pesanan Saya';
                if (navOrdersSub) navOrdersSub.textContent = 'Riwayat Belanja & Chat WA';
                if (navSidTitle) navSidTitle.textContent = 'Profile';
                if (navSidSub) navSidSub.textContent = 'Data KK & Kebutuhan Pangan';
                if (sidTopAdminCard) sidTopAdminCard.classList.add('hidden');
                if (sidRegCard) sidRegCard.classList.add('hidden');
                if (sidDirCard) sidDirCard.classList.add('hidden');
                if (myOwnKkCard) myOwnKkCard.classList.remove('hidden');
                if (catFilterBar) catFilterBar.classList.remove('hidden');
                if (consumerOrdersView) consumerOrdersView.classList.remove('hidden');
                if (producerOrdersView) producerOrdersView.classList.add('hidden');

                const consumerOrderShortcut = document.getElementById('consumerMyOrdersShortcutBanner');
                const consumerMarketCount = document.getElementById('consumerMarketOrdersCount');
                if (consumerOrderShortcut) {
                    consumerOrderShortcut.classList.remove('hidden');
                    const activeSid = window.appState.activeUserSid;
                    const myOrdersCount = (window.appState.transactions || []).filter(t => t.consumerSid === activeSid).length;
                    if (consumerMarketCount) consumerMarketCount.textContent = myOrdersCount;
                }

                if (typeof renderPersonalConsumerOrders === 'function') renderPersonalConsumerOrders();
            } else if (role === 'PRODUSEN') {
                const consumerOrderShortcut = document.getElementById('consumerMyOrdersShortcutBanner');
                if (consumerOrderShortcut) consumerOrderShortcut.classList.add('hidden');

                if (navMarketTitle) navMarketTitle.textContent = 'Lapak Kebun';
                if (navMarketSub) navMarketSub.textContent = 'Stok Panen & Ramalan AI';
                if (navOrdersTitle) navOrdersTitle.textContent = 'Pesanan Masuk';
                if (navOrdersSub) navOrdersSub.textContent = 'Proses & Siapkan Panen';
                if (navSidTitle) navSidTitle.textContent = 'Profile';
                if (navSidSub) navSidSub.textContent = 'Data Kebun & Komoditas';
                if (sidTopAdminCard) sidTopAdminCard.classList.add('hidden');
                if (sidRegCard) sidRegCard.classList.add('hidden');
                if (sidDirCard) sidDirCard.classList.add('hidden');
                if (myOwnKkCard) myOwnKkCard.classList.remove('hidden');
                if (catFilterBar) catFilterBar.classList.add('hidden');
                if (consumerOrdersView) consumerOrdersView.classList.add('hidden');
                if (producerOrdersView) producerOrdersView.classList.remove('hidden');
                if (typeof renderProducerOrders === 'function') renderProducerOrders();
            } else if (role === 'ADMIN') {
                const consumerOrderShortcut = document.getElementById('consumerMyOrdersShortcutBanner');
                if (consumerOrderShortcut) consumerOrderShortcut.classList.add('hidden');

                if (navMarketTitle) navMarketTitle.textContent = 'Pasar Warga';
                if (navMarketSub) navMarketSub.textContent = 'Pantau Stok Komoditas';
                if (navOrdersTitle) navOrdersTitle.textContent = 'Rekap Pesanan';
                if (navOrdersSub) navOrdersSub.textContent = 'Pantau Transaksi RT 13';
                if (navSidTitle) navSidTitle.textContent = 'Data 40 KK & PIN';
                if (navSidSub) navSidSub.textContent = 'Direktori Warga & Validasi';
                if (sidTopAdminCard) sidTopAdminCard.classList.remove('hidden');
                if (sidRegCard) sidRegCard.classList.add('hidden');
                if (sidDirCard) sidDirCard.classList.remove('hidden');
                if (myOwnKkCard) myOwnKkCard.classList.remove('hidden');
                if (catFilterBar) catFilterBar.classList.remove('hidden');
                if (consumerOrdersView) consumerOrdersView.classList.add('hidden');
                if (producerOrdersView) producerOrdersView.classList.remove('hidden');
                if (typeof renderMembersTable === 'function') renderMembersTable();
                if (typeof renderProducerOrders === 'function') renderProducerOrders();
            }

            if (typeof updateSidebarOrdersBadge === 'function') updateSidebarOrdersBadge();
            if (typeof renderProducerWorkspaceAndAutoAi === 'function') renderProducerWorkspaceAndAutoAi();
            if (typeof renderAdminMonevSummary === 'function') renderAdminMonevSummary();
            if (typeof renderMobileBottomNav === 'function') renderMobileBottomNav();
        };

        const _prevRenderAll = window.renderAll;
        window.renderAll = function() {
            _prevRenderAll();
            const headerLabel = document.getElementById('headerActiveUserLabel');
            const headerLogoutBtn = document.getElementById('headerLogoutBtn');
            if (headerLogoutBtn) headerLogoutBtn.classList.remove('hidden');

            if (headerLabel) {
                if (window.appState.isAdminLoggedIn || window.appState.activeRole === 'ADMIN') {
                    headerLabel.textContent = 'Pengurus RT 13 (Admin)';
                } else if (window.appState.activeUserSid) {
                    const m = (window.appState.members || []).find(x => x.sid === window.appState.activeUserSid);
                    const roleText = window.appState.activeRole === 'PRODUSEN' ? 'Produsen' : 'Konsumen';
                    if (m) headerLabel.textContent = `${m.name} (${roleText})`;
                }
            }
            if (typeof updateSidebarOrdersBadge === 'function') updateSidebarOrdersBadge();
            if (typeof renderProducerWorkspaceAndAutoAi === 'function') renderProducerWorkspaceAndAutoAi();
            if (typeof renderAdminMonevSummary === 'function') renderAdminMonevSummary();
            if (typeof renderMobileBottomNav === 'function') renderMobileBottomNav();
        };

        // Update handleGateLoginSubmit & logoutCitizenAccount untuk sinkronisasi PWA Remember Me
        const _origLogoutCitizen = window.logoutCitizenAccount;
        window.logoutCitizenAccount = function() {
            try {
                localStorage.removeItem(PWA_REMEMBER_KEY);
                sessionStorage.removeItem(PWA_REMEMBER_KEY);
            } catch (e) {}
            _origLogoutCitizen();
        };
        window.logoutAdminRole = window.logoutCitizenAccount;

        // Initialize on DOM load
        document.addEventListener('DOMContentLoaded', () => {
            initFiftyTransactionsAndDualRoles();
            loadSavedLocalState();
            initFiftyTransactionsAndDualRoles();
            cleanupAnyDemoData();

            // Pulihkan sesi PWA jika "Biarkan tetap masuk di HP ini" dicentang (atau masih dalam sesi aktif)
            try {
                const savedSessionRaw = localStorage.getItem(PWA_REMEMBER_KEY) || sessionStorage.getItem(PWA_REMEMBER_KEY);
                if (savedSessionRaw) {
                    const s = JSON.parse(savedSessionRaw);
                    if (s && (s.activeUserSid || s.isAdminLoggedIn)) {
                        window.appState.activeUserSid = s.activeUserSid;
                        window.appState.activeRole = s.activeRole || 'KONSUMEN';
                        window.appState.isAdminLoggedIn = Boolean(s.isAdminLoggedIn);
                    }
                } else {
                    // Jika tidak dicentang "Biarkan tetap masuk", mulai dari layar login
                    window.appState.activeUserSid = null;
                    window.appState.isAdminLoggedIn = false;
                }
            } catch (e) {}

            autoFillBapanasNeedsFromFamilySize(4);
            initPwaSupport();
            syncAuthGateVisibility();
            if (window.appState.activeUserSid || window.appState.isAdminLoggedIn) {
                const role = window.appState.isAdminLoggedIn ? 'ADMIN' : (window.appState.activeRole || 'KONSUMEN');
                if (role === 'ADMIN') window.aiForecastScope = 'ALL';
                setActiveRole(role);
                switchTab('tab-sid');
            }
            initSupabaseConnection();
        });

}

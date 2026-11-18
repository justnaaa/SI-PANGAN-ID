/**
 * @file src/ai/aiForecastAndSurplus.js
 * @description Mesin Machine Learning & AI SI-PANGAN ID:
 *              - Peramalan Kapasitas Panen vs Daya Serap 40 KK RT 13
 *              - Deteksi Otomatis Surplus / Defisit per Komoditas & per Produsen
 *              - Alur Tarik Data Surplus Admin -> Notifikasi Produsen -> Konfirmasi Produsen -> Pusat Penarikan Surplus Koperasi/MBG
 */

export function initAiForecastAndSurplusEngine() {
        // TAB 4: AI MATCHING, PREDIKSI & ROUND-ROBIN ALLOCATION
        window.renderAiMatchingPanel = function renderAiMatchingPanel() {
            const container = document.getElementById('aiMatchingRecommendationsContainer');
            if (!container) return;

            // 1. Ambil seluruh warga dengan status Prioritas Bantuan (RENTAN_PRIORITAS)
            const vulnerable = window.appState.members
                .filter(m => m.socialTier === 'RENTAN_PRIORITAS')
                .map(m => {
                    if (m.aiScore === undefined) {
                        const ai = calculateAiVulnerability(m.monthlyIncome || 950000, m.familySize || 4, m.monthlyFoodNeedKg || 35);
                        m.aiScore = ai.score;
                    }
                    if (m.aidReceivedThisMonth === undefined) {
                        m.aidReceivedThisMonth = false;
                    }
                    return m;
                });

            if (vulnerable.length === 0) {
                container.innerHTML = '<div class="col-span-2 p-6 rounded-xl bg-stone-50 text-center text-stone-500">Tidak ada data warga dalam kategori Prioritas Bantuan.</div>';
                return;
            }

            // 2. ATURAN ROUND-ROBIN ALLOCATION:
            // - Urutkan warga berdasarkan Skor AI tertinggi
            // - Prioritaskan mereka yang BELUM menerima bantuan (aidReceivedThisMonth === false)
            // - Warga yang SUDAH menerima bantuan (aidReceivedThisMonth === true) digeser ke posisi bawah
            vulnerable.sort((a, b) => {
                if (!a.aidReceivedThisMonth && b.aidReceivedThisMonth) return -1;
                if (a.aidReceivedThisMonth && !b.aidReceivedThisMonth) return 1;
                return (b.aiScore || 0) - (a.aiScore || 0);
            });

            // Paket pangan komunitas yang disesuaikan
            const packagesPresets = [
                {
                    matchedProduce: [
                        { name: "Beras Ciherang Pulen", qtyKg: 10, priceKg: 12000, source: "Pak Hendra (SID-RT13-003)" },
                        { name: "Sayur Bayam Segar", qtyKg: 2, priceKg: 7500, source: "Ibu Sri Wahyuni (SID-RT13-002)" }
                    ],
                    scoreBase: 96.4,
                    totalCost: 135000
                },
                {
                    matchedProduce: [
                        { name: "Tempe Daun & Tahu", qtyKg: 5, priceKg: 10000, source: "Ibu Ratna (SID-RT13-004)" },
                        { name: "Lele Segar Bioflok", qtyKg: 2, priceKg: 22000, source: "Pak Joko (SID-RT13-006)" }
                    ],
                    scoreBase: 94.2,
                    totalCost: 94000
                },
                {
                    matchedProduce: [
                        { name: "Beras Ciherang Pulen", qtyKg: 10, priceKg: 12000, source: "Pak Hendra (SID-RT13-003)" },
                        { name: "Telur Ayam RT 13", qtyKg: 2, priceKg: 26000, source: "Ibu Dewi (SID-RT13-009)" }
                    ],
                    scoreBase: 95.8,
                    totalCost: 172000
                },
                {
                    matchedProduce: [
                        { name: "Sayur Bayam Segar", qtyKg: 3, priceKg: 7500, source: "Ibu Sri Wahyuni (SID-RT13-002)" },
                        { name: "Tempe Daun & Tahu", qtyKg: 4, priceKg: 10000, source: "Ibu Ratna (SID-RT13-004)" }
                    ],
                    scoreBase: 92.5,
                    totalCost: 62500
                }
            ];

            // Tampilkan rekomendasi warga teratas (hingga 4 kartu alokasi)
            const displayVulnerable = vulnerable.slice(0, 4);

            container.innerHTML = displayVulnerable.map((m, idx) => {
                const pkg = packagesPresets[idx % packagesPresets.length];
                const matchPct = Math.min(99, Math.round((m.aiScore * 0.6) + (pkg.scoreBase * 0.4)));
                const isFulfilled = m.aidReceivedThisMonth === true;

                return `
                    <div class="bg-white rounded-2xl border ${isFulfilled ? 'border-stone-200 bg-stone-50/50 opacity-90' : 'border-forest-300 ring-1 ring-forest-400/20'} p-5 shadow-xs space-y-3.5 flex flex-col justify-between transition-all">
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                ${isFulfilled ? `
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700 border border-stone-300 flex items-center gap-1">
                                        <i class="fa-solid fa-circle-check text-stone-500"></i> Kebutuhan Bulan Ini: Terpenuhi
                                    </span>
                                ` : `
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-100 text-terracotta-900 border border-terracotta-200 flex items-center gap-1">
                                        <i class="fa-solid fa-star text-terracotta-600"></i> Rekomendasi #${idx + 1} (Prioritas Utama)
                                    </span>
                                `}
                                <div class="flex items-center gap-1 text-forest-800 font-mono font-bold text-xs">
                                    <i class="fa-solid fa-bolt text-paddy-500"></i> AI Match: ${matchPct}%
                                </div>
                            </div>

                            <div>
                                <span class="text-[11px] text-stone-500 block">Penerima Manfaat Single Identity:</span>
                                <h4 class="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                                    <span>${getMemberDisplayName(m)}</span>
                                    <span class="text-stone-400 font-mono font-normal text-xs">(${m.sid})</span>
                                </h4>
                                <p class="text-[11px] text-stone-500 mt-0.5">
                                    ${m.familySize} Jiwa • Skor AI: <strong class="text-stone-800 font-mono">${m.aiScore}/100</strong> • Kebutuhan: ${m.monthlyFoodNeedKg} Kg/bln
                                </p>
                                <p class="text-[10px] text-stone-400"><i class="fa-solid fa-location-dot text-stone-400 mr-1"></i>${m.address}</p>
                            </div>

                            <div class="p-3 rounded-xl bg-forest-50/70 border border-forest-200 space-y-1.5">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">
                                    ${(m.role === 'PRODUSEN') ? 'Bantuan Paket Pangan Gizi + Subsidi Modal Bahan Baku UKM' : 'Paket Pangan Bergizi yang Diserap:'}
                                </span>
                                ${pkg.matchedProduce.map(p => `
                                    <div class="flex justify-between text-xs text-stone-800">
                                        <span>${p.name} (${p.qtyKg} Kg) <span class="text-[10px] text-stone-500">dari ${p.source}</span></span>
                                        <span class="font-mono font-bold">${formatRupiah(p.qtyKg * p.priceKg)}</span>
                                    </div>
                                `).join('')}
                                <div class="pt-1.5 border-t border-forest-200 flex justify-between font-bold text-xs text-forest-900">
                                    <span>Total Alokasi Bantuan:</span>
                                    <span class="font-mono">${formatRupiah(pkg.totalCost)}</span>
                                </div>
                            </div>

                            <div class="text-[10px] text-stone-500 flex items-center justify-between">
                                <span><strong>Rotasi Pemerataan:</strong> ${isFulfilled ? 'Sudah tersalurkan (giliran berikutnya)' : 'Siap dialokasikan bulan ini'}</span>
                                <span class="font-mono text-stone-400">${m.distanceKm || 0.2} km</span>
                            </div>
                        </div>

                        ${isFulfilled ? `
                            <button disabled class="w-full py-2.5 rounded-xl bg-stone-200 text-stone-500 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2">
                                <i class="fa-solid fa-check"></i>
                                <span>Bantuan Bulan Ini Telah Diterima (Rotasi Selesai)</span>
                            </button>
                        ` : `
                            <button onclick="executeFoodAid('${m.sid}', ${pkg.totalCost})" class="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs">
                                <i class="fa-solid fa-gift"></i>
                                <span>Eksekusi Penyaluran Bantuan Inklusif (${formatRupiah(pkg.totalCost)})</span>
                            </button>
                        `}
                    </div>
                `;
            }).join('');
        }

        window.executeFoodAid = function executeFoodAid(beneficiarySid, costAmount) {
            if (window.appState.danaSosialInklusi < costAmount) {
                showToast("Kas Tidak Mencukupi", `Saldo kas inklusi (${formatRupiah(window.appState.danaSosialInklusi)}) kurang untuk mendanai bantuan ${formatRupiah(costAmount)}.`, "error");
                return;
            }

            const beneficiary = window.appState.members.find(m => m.sid === beneficiarySid || m.sidShort === beneficiarySid);
            window.appState.danaSosialInklusi -= costAmount;

            if (beneficiary) {
                // Rotasi Pemerataan: Tandai warga sudah menerima bantuan bulan ini
                beneficiary.aidReceivedThisMonth = true;
                beneficiary.subsidyReceivedKg = (beneficiary.subsidyReceivedKg || 0) + 12;
            }

            // Catat ke Buku Kas / Transaksi Ekosistem (DISTRIBUSI BANTUAN PANGAN)
            const txId = `TX-RT13-AID${Math.floor(100 + Math.random() * 900)}`;
            window.appState.transactions.unshift({
                id: txId,
                timestamp: "Baru Saja • Bantuan Inklusi",
                type: "DISTRIBUSI_BANTUAN_PANGAN",
                typeName: "DISTRIBUSI BANTUAN PANGAN",
                producerSid: "MULTIPLE-PRODUSEN",
                producerName: "Surplus Petani Lokal RT 13",
                consumerSid: beneficiarySid,
                consumerName: beneficiary ? beneficiary.name : "Warga Prioritas Bantuan",
                commodity: "Paket Pangan Bergizi (Beras & Sayur Panen Lokal)",
                quantityKg: 12,
                unitPrice: 0,
                subtotal: costAmount,
                producerNet: costAmount,
                deliveryMethod: "Diantar Pengurus RT 13 & KWT",
                deliveryFee: 0,
                totalPaid: costAmount,
                status: "TERDISTRIBUSI_BANTUAN"
            });

            renderAll();
            showToast("Bantuan Disalurkan!", `Penyaluran bantuan senilai ${formatRupiah(costAmount)} berhasil. Rotasi round-robin diaktifkan: antrean digeser ke warga berikutnya.`, "success");
        }

        // --- 5.5 ASISTEN PERAMAL KEBUTUHAN & PANEN LINGKUNGAN (PROYEKSI 3 HARI - ENGINE NYATA) ---
        window.currentSurplusScenario = 'SURPLUS_SAYUR';

        // Fungsi Tarik Otomatis Data Nyata dari Ekosistem Aktif (Non-Template)
        window.syncLiveSurplusData = function syncLiveSurplusData() {
            const listings = window.appState.listings || [];
            const members = window.appState.members || [];
            const demands = window.appState.demands || [];
            const transactions = window.appState.transactions || [];

            // 1. Total Pasokan Tersedia Riil di Etalase
            const totalStockLive = listings.reduce((sum, l) => sum + (Number(l.availableStockKg) || 0), 0);

            // 2. Kebutuhan Konsumsi Riil 40 KK (Proyeksi 3 Hari = 10% dari Kebutuhan Bulanan SID)
            const baseNeed3Days = Math.round(members.reduce((sum, m) => sum + (Number(m.monthlyFoodNeedKg) || 30), 0) * 0.10);
            const votingDemandSum = demands.reduce((sum, d) => sum + Math.round((Number(d.targetKg) || 20) * ((d.votes || 0) / 10)), 0);
            const totalDemandLive = Math.max(30, baseNeed3Days + votingDemandSum);

            // Update Input
            const harvestInput = document.getElementById('surplusHarvestKg');
            const demandInput = document.getElementById('surplusDemandKg');
            if (harvestInput) harvestInput.value = totalStockLive;
            if (demandInput) demandInput.value = totalDemandLive;

            // Jalankan kalkulasi engine
            calculateSurplusPrediction(true);

            showToast("Sinkronisasi Selesai", `Data Riil Ditarik: Pasokan ${totalStockLive} Kg • Kebutuhan Konsumsi ${totalDemandLive} Kg.`, "success");
        }

        window.calculateSurplusPrediction = function calculateSurplusPrediction(isLiveSync = false) {
            const harvestInput = document.getElementById('surplusHarvestKg');
            const demandInput = document.getElementById('surplusDemandKg');

            const harvest = Math.max(0, Number(harvestInput?.value || 80));
            const demand = Math.max(0, Number(demandInput?.value || 60));

            // Hitung selisih: Total Panen dikurangi Konsumsi Lokal
            const surplus = harvest - demand;

            // Tentukan satuan
            const unitLabel = currentSurplusScenario === 'DEFISIT_TELUR' ? 'Butir' : 'Kg';

            // Hitung persentase rasio serapan lokal vs spillover pasar luar
            let localPct = 0;
            let spilloverPct = 0;

            if (harvest > 0) {
                if (surplus > 0) {
                    localPct = Math.round((demand / harvest) * 100);
                    spilloverPct = 100 - localPct;
                } else {
                    localPct = 100;
                    spilloverPct = 0;
                }
            }

            // Perbarui Metric Cards
            const displayTotal = document.getElementById('surplusDisplayTotal');
            const displayLocal = document.getElementById('surplusDisplayLocal');
            const displayDiff = document.getElementById('surplusDisplayDiff');
            const displayLocalSub = document.getElementById('surplusDisplayLocalSub');
            const displayDiffSub = document.getElementById('surplusDisplayDiffSub');

            const currentMembers = window.appState?.members || [];
            const kkCount = currentMembers.length || 40;
            const totalJiwa = currentMembers.reduce((s, m) => s + (Number(m.familySize) || 4), 0);

            if (displayTotal) displayTotal.textContent = `${harvest.toLocaleString('id-ID')} ${unitLabel}`;
            if (displayLocal) displayLocal.textContent = `${Math.min(harvest, demand).toLocaleString('id-ID')} ${unitLabel}`;
            if (displayLocalSub) displayLocalSub.textContent = `Terserap oleh ${kkCount} KK (${totalJiwa} Jiwa)`;

            if (displayDiff) {
                if (surplus > 0) {
                    displayDiff.textContent = `+${surplus.toLocaleString('id-ID')} ${unitLabel}`;
                    displayDiff.className = "serif-heading text-2xl font-bold text-emerald-800 mono-num";
                    if (displayDiffSub) displayDiffSub.textContent = "Surplus Spillover ke Koperasi";
                } else if (surplus === 0) {
                    displayDiff.textContent = `0 ${unitLabel}`;
                    displayDiff.className = "serif-heading text-2xl font-bold text-forest-700 mono-num";
                    if (displayDiffSub) displayDiffSub.textContent = "Pasokan Seimbang (100% RT 13)";
                } else {
                    displayDiff.textContent = `${surplus.toLocaleString('id-ID')} ${unitLabel}`;
                    displayDiff.className = "serif-heading text-2xl font-bold text-amber-700 mono-num";
                    if (displayDiffSub) displayDiffSub.textContent = `Defisit ${(demand - harvest).toLocaleString('id-ID')} ${unitLabel}`;
                }
            }

            // Perbarui Progress Bar secara real-time
            const barLocal = document.getElementById('surplusBarLocal');
            const barSpillover = document.getElementById('surplusBarSpillover');
            const barLocalText = document.getElementById('surplusBarLocalText');
            const barSpilloverText = document.getElementById('surplusBarSpilloverText');
            const ratioPill = document.getElementById('surplusRatioPill');
            const labelLocalDetail = document.getElementById('surplusLabelLocalDetail');
            const labelSpilloverDetail = document.getElementById('surplusLabelSpilloverDetail');

            if (barLocal) {
                barLocal.style.width = `${localPct}%`;
                if (barLocalText) barLocalText.textContent = localPct > 15 ? `Lokal: ${localPct}%` : `${localPct}%`;
            }
            if (barSpillover) {
                barSpillover.style.width = `${spilloverPct}%`;
                if (barSpilloverText) barSpilloverText.textContent = spilloverPct > 15 ? `Koperasi: ${spilloverPct}%` : (spilloverPct > 0 ? `${spilloverPct}%` : '');
            }

            if (ratioPill) {
                ratioPill.textContent = `${localPct}% Serapan RT 13 • ${spilloverPct}% Dialihkan Koperasi`;
                ratioPill.className = surplus > 0
                    ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300';
            }

            if (labelLocalDetail) {
                labelLocalDetail.innerHTML = `<i class="fa-solid fa-arrow-down-short-wide text-emerald-600"></i> Serapan Lokal ${kkCount} KK: ${Math.min(harvest, demand).toLocaleString('id-ID')} ${unitLabel} (${localPct}%)`;
            }
            if (labelSpilloverDetail) {
                labelSpilloverDetail.innerHTML = `Dialihkan ke Koperasi: ${Math.max(0, surplus).toLocaleString('id-ID')} ${unitLabel} (${spilloverPct}%) <i class="fa-solid fa-arrow-up-right-from-square text-amber-600"></i>`;
            }

            // Area hasil (Result Display): KALKULASI DINAMIS BERBASIS DATA RIIL (BUKAN TEMPLATE MATI)
            const resultBox = document.getElementById('surplusResultBox');
            if (resultBox) {
                if (surplus > 0) {
                    resultBox.className = "p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 text-emerald-950 flex items-start gap-3 shadow-xs transition-all duration-300";
                    resultBox.innerHTML = `
                        <div class="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 text-base shadow-xs">
                            <i class="fa-solid fa-scale-balanced"></i>
                        </div>
                        <div class="space-y-1.5 flex-1">
                            <div class="flex items-center justify-between flex-wrap gap-1">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded inline-block font-mono border border-emerald-200">
                                    Proyeksi 3 Hari • Diagnosis Surplus Terukur (+${surplus} ${unitLabel})
                                </span>
                                <span class="text-[10px] font-bold text-emerald-800 font-mono">${isLiveSync ? '● Live Aggregated Data' : 'Simulasi Presisi'}</span>
                            </div>
                            <p class="text-xs sm:text-sm text-emerald-950 font-bold leading-relaxed">
                                Neraca Pangan Positif: Volume panen aktif produsen (${harvest} ${unitLabel}) melebihi estimasi kebutuhan konsumsi ${kkCount} KK (${demand} ${unitLabel}). Terdapat surplus bersih senilai +${surplus} ${unitLabel}.
                            </p>
                            <div class="text-[11px] text-emerald-900 leading-normal bg-white/70 p-2.5 rounded-lg border border-emerald-200/60 space-y-1">
                                <p><strong class="text-emerald-950 font-semibold"><i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>Tindakan Sistem Otomatis:</strong></p>
                                <p>1. Memprioritaskan alokasi ${Math.min(harvest, demand)} ${unitLabel} (100% serapan lokal) untuk dapur warga RT 13 dengan 0% biaya perantara.</p>
                                <p>2. Mengalihkan kelebihan ${surplus} ${unitLabel} (${spilloverPct}%) ke Koperasi Kelurahan Yosomulyo untuk menjaga kesegaran komoditas dan stabilitas harga petani.</p>
                            </div>
                        </div>
                    `;
                } else if (surplus < 0) {
                    const absDefisit = Math.abs(surplus);
                    resultBox.className = "p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs transition-all duration-300";
                    resultBox.innerHTML = `
                        <div class="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0 text-base shadow-xs">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <div class="space-y-1.5 flex-1">
                            <div class="flex items-center justify-between flex-wrap gap-1">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded inline-block font-mono border border-amber-200">
                                    Proyeksi 3 Hari • Peringatan Defisit Pangan (-${absDefisit} ${unitLabel})
                                </span>
                                <span class="text-[10px] font-bold text-amber-800 font-mono">${isLiveSync ? '● Live Aggregated Data' : 'Simulasi Presisi'}</span>
                            </div>
                            <p class="text-xs sm:text-sm text-amber-950 font-bold leading-relaxed">
                                Peringatan Pasokan Rendah: Estimasi kebutuhan konsumsi 40 KK (${demand} ${unitLabel}) melampaui stok panen yang tersedia (${harvest} ${unitLabel}). Terdapat defisit pasokan sebesar -${absDefisit} ${unitLabel}.
                            </p>
                            <div class="text-[11px] text-amber-900 leading-normal bg-white/70 p-2.5 rounded-lg border border-amber-200/60 space-y-1">
                                <p><strong class="text-amber-950 font-semibold"><i class="fa-solid fa-seedling text-amber-600 mr-1"></i>Tindakan Sistem Otomatis:</strong></p>
                                <p>1. Menerbitkan <strong>Sinyal Tanam Prioritas</strong> di Papan Musyawarah agar KWT & peternak pekarangan meningkatkan kapasitas produksi komoditas ini.</p>
                                <p>2. Menyalurkan cadangan lumbung darurat RT 13 khusus untuk 5 KK klaster rentan stunting agar asupan nutrisi tidak terganggu.</p>
                            </div>
                        </div>
                    `;
                } else {
                    resultBox.className = "p-4 sm:p-5 rounded-2xl bg-forest-50/90 border-2 border-forest-300 text-forest-950 flex items-start gap-3 shadow-xs transition-all duration-300";
                    resultBox.innerHTML = `
                        <div class="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center shrink-0 text-base shadow-xs">
                            <i class="fa-solid fa-check-double"></i>
                        </div>
                        <div class="space-y-1.5 flex-1">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100 px-2 py-0.5 rounded inline-block font-mono border border-forest-200">
                                Proyeksi 3 Hari • Keseimbangan Pangan Sempurna (100% Ekosistem Serasi)
                            </span>
                            <p class="text-xs sm:text-sm text-forest-950 font-bold leading-relaxed">
                                Pasokan panen (${harvest} ${unitLabel}) sama persis dengan daya serap kebutuhan konsumsi 40 KK (${demand} ${unitLabel}). Seluruh hasil kebun terserap habis tanpa sisa susut pascapanen.
                            </p>
                        </div>
                    `;
                }
            }
        }

        window.setSurplusScenario = function setSurplusScenario(harvestKg, demandKg, scenarioType) {
            currentSurplusScenario = scenarioType || (harvestKg === 80 ? 'SURPLUS_SAYUR' : (harvestKg === 50 ? 'DEFISIT_TELUR' : 'SURPLUS_BERAS'));
            const harvestInput = document.getElementById('surplusHarvestKg');
            const demandInput = document.getElementById('surplusDemandKg');
            if (harvestInput) harvestInput.value = harvestKg;
            if (demandInput) demandInput.value = demandKg;
            calculateSurplusPrediction();
            const label = currentSurplusScenario === 'SURPLUS_SAYUR' ? 'Surplus Sayur KWT (+20 Kg)' : (currentSurplusScenario === 'DEFISIT_TELUR' ? 'Defisit Telur Ayam (-30 Butir)' : 'Beras 1 Ton Bapak A (+400 Kg)');
            showToast("Skenario Diterapkan", `${label}: Panen ${harvestKg} • Kebutuhan ${demandKg}`, "info");
        }

        // Alias fungsi agar kompatibel dengan pemanggilan simulasi
        window.runSurplusSimulation = function runSurplusSimulation() {
            calculateSurplusPrediction();
        }


        window.renderPerProducerAiForecast = function renderPerProducerAiForecast() {
            const tbody = document.getElementById('aiPerProducerForecastBody');
            const highlightBox = document.getElementById('aiPersonalProducerHighlightBox');
            const cardsGrid = document.getElementById('aiSpecificProductCardsGrid');

            const members = window.appState.members || [];
            const listings = window.appState.listings || [];
            const transactions = window.appState.transactions || [];
            const producers = members.filter(m => m.role === 'PRODUSEN' || m.isDualRole);

            const mlAccEl = document.getElementById('mlAccuracyBadge');
            const mlCapEl = document.getElementById('mlProducerCapLabel');
            const confidence = Math.min(99.4, (91.5 + (transactions.length * 0.065))).toFixed(1).replace('.', ',');
            if (mlAccEl) mlAccEl.textContent = `${confidence}% Confidence`;
            if (mlCapEl) mlCapEl.textContent = `${producers.length} Produsen KWT Aktif`;

            const forecastList = [];
            producers.forEach(p => {
                const prodListings = listings.filter(l => l.producerSid === p.sid);
                const itemsToProcess = prodListings.length > 0 ? prodListings : [{
                    id: '',
                    producerSid: p.sid,
                    commodity: (p.registeredCommodities?.[0]?.name || (p.producerCommodity && p.producerCommodity !== '-' ? p.producerCommodity : 'Sayur Bayam Hijau (KWT Pekarangan)')),
                    availableStockKg: Math.round((Number(p.capacityKg) || 40) / 3),
                    unabsorbedSurplusKg: 0,
                    surplusNotified: Boolean(p.surplusNotified),
                    surplusConfirmedByProducer: Boolean(p.surplusConfirmedByProducer)
                }];

                itemsToProcess.forEach((lItem) => {
                    const commodityName = lItem.commodity || 'Sayur Bayam Hijau (KWT Pekarangan)';
                    const activeStock = (Number(lItem.availableStockKg) || 0) + (Number(lItem.unabsorbedSurplusKg) || 0);
                    const weeklyCap = Math.max(15, Math.round((Number(p.capacityKg) || 40) / (4 * itemsToProcess.length)) + activeStock);

                    const prodTxKg = transactions
                        .filter(t => t.producerSid === p.sid && (!lItem.commodity || !t.commodity || t.commodity.toLowerCase().includes(commodityName.split(' ')[0].toLowerCase())))
                        .reduce((s, t) => s + (Number(t.quantityKg) || 0), 0);

                    const predictedDemandWeekly = Math.max(12, Math.round((prodTxKg * 0.35) + 16));
                    const diff = weeklyCap - predictedDemandWeekly;

                    const isNotified = Boolean(lItem.surplusNotified || p.surplusNotified);
                    const isConfirmed = Boolean(lItem.surplusConfirmedByProducer || p.surplusConfirmedByProducer);

                    let statusType = 'SEIMBANG';
                    let statusBadge = '';
                    let cardBorder = 'border-emerald-200 bg-white';
                    let recommendation = '';

                    if (diff > 5) {
                        statusType = 'SURPLUS';
                        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">🔴 SURPLUS +${diff} Kg</span>`;
                        cardBorder = 'border-amber-300 bg-amber-50/40';
                        recommendation = `Surplus +${diff} Kg ${commodityName} melebihi daya serap lokal RT 13. Siap ditarik ke Paket Koperasi / Dapur MBG.`;
                    } else if (diff < -3) {
                        statusType = 'DEFISIT';
                        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">🟡 KURANG STOK ${diff} Kg</span>`;
                        cardBorder = 'border-rose-200 bg-rose-50/30';
                        recommendation = `Permintaan warga tinggi! Kurang ${Math.abs(diff)} Kg ${commodityName}. Silakan tambah panen/stok.`;
                    } else {
                        statusType = 'SEIMBANG';
                        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 PAS / SEIMBANG (${diff >= 0 ? '+' + diff : diff} Kg)</span>`;
                        cardBorder = 'border-emerald-200 bg-emerald-50/20';
                        recommendation = `Panen ${commodityName} pas dengan daya serap warga RT 13 minggu ini. Pertahankan jadwal tanam.`;
                    }

                    forecastList.push({
                        producer: p,
                        listingId: lItem.id || '',
                        sid: p.sid,
                        name: p.name,
                        address: p.address || 'RT 13 Yosomulyo',
                        commodity: commodityName,
                        cycle: p.harvestCycleWeekly || 'Panen Setiap Minggu',
                        weeklyCap,
                        predictedDemandWeekly,
                        diff,
                        statusType,
                        statusBadge,
                        cardBorder,
                        recommendation,
                        surplusNotified: isNotified,
                        surplusConfirmedByProducer: isConfirmed
                    });
                });
            });

            const activeSid = window.appState?.activeUserSid;
            const currentRole = window.appState?.activeRole || 'KONSUMEN';
            const isAdmin = Boolean(window.appState?.isAdminLoggedIn || currentRole === 'ADMIN' || activeSid === 'ADMIN-RT13');
            const activeMember = activeSid ? members.find(m => m.sid === activeSid) : null;
            const myForecasts = activeSid ? forecastList.filter(f => f.sid === activeSid) : [];
            let myForecast = myForecasts[0] || null;

            if (activeMember && (activeMember.role === 'PRODUSEN' || activeMember.isDualRole || currentRole === 'PRODUSEN') && !myForecast) {
                const comm = (activeMember.producerCommodity && activeMember.producerCommodity !== '-')
                    ? activeMember.producerCommodity
                    : (activeMember.registeredCommodities?.[0]?.name || 'Sayur Bayam Hijau (KWT Pekarangan)');
                const cap = Number(activeMember.capacityKg) || 35;
                myForecast = {
                    producer: activeMember,
                    listingId: '',
                    sid: activeMember.sid,
                    name: activeMember.name,
                    address: activeMember.address || 'RT 13 Yosomulyo',
                    commodity: comm,
                    cycle: activeMember.harvestCycleWeekly || 'Panen Rutin Setiap Minggu',
                    weeklyCap: cap,
                    predictedDemandWeekly: Math.round(cap * 0.75),
                    diff: Math.round(cap * 0.25),
                    statusType: 'SURPLUS',
                    statusBadge: '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">🔴 SURPLUS +' + Math.round(cap * 0.25) + ' Kg</span>',
                    cardBorder: 'border-amber-300 bg-amber-50/40',
                    recommendation: 'Hasil panen ' + comm + ' siap diserap warga RT 13 dan sebagian disalurkan kolektif ke mitra kelurahan.',
                    surplusNotified: Boolean(activeMember.surplusNotified),
                    surplusConfirmedByProducer: Boolean(activeMember.surplusConfirmedByProducer)
                };
                myForecasts.push(myForecast);
            }

            const aggSimulator = document.getElementById('aiAdminAggregateSimulatorSection');
            if (aggSimulator) {
                aggSimulator.classList.toggle('hidden', !isAdmin);
            }

            if (highlightBox) {
                if (isAdmin) {
                    const totalCap = forecastList.reduce((s, f) => s + f.weeklyCap, 0);
                    const totalDemand = forecastList.reduce((s, f) => s + f.predictedDemandWeekly, 0);
                    const totalDiff = totalCap - totalDemand;
                    const surplusCount = forecastList.filter(f => f.statusType === 'SURPLUS').length;
                    highlightBox.innerHTML = `
                        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div class="space-y-1.5">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-800 text-white">
                                        <i class="fa-solid fa-chart-pie mr-1"></i> Ramalan AI Agregat Seluruh Kebun RT 13 (Monev Pengurus)
                                    </span>
                                    <span class="font-mono text-xs font-bold text-forest-800">${forecastList.length} Komoditas Kebun Terpantau</span>
                                </div>
                                <h4 class="serif-heading text-lg sm:text-xl font-bold text-stone-900">
                                    Status Kapasitas Panen vs Daya Serap 40 KK Warga
                                </h4>
                                <p class="text-xs text-stone-700 leading-relaxed max-w-2xl">
                                    <strong>Petunjuk Admin (Alur Penarikan Surplus):</strong> Terdapat <strong>${surplusCount} komoditas mengalami Surplus</strong> di bawah ini. Klik tombol <strong>"Tarik Data Surplus &amp; Beritahu Produsen"</strong> pada kartu komoditas yang surplus. Setelah dikonfirmasi oleh Produsen, komoditas tersebut otomatis masuk ke <strong>Dashboard Monev &amp; Surplus &rarr; Pusat Penarikan Resume Surplus (1 Paket Terpadu)</strong>.
                                </p>
                            </div>

                            <div class="grid grid-cols-3 gap-2.5 shrink-0 text-center">
                                <div class="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                    <span class="text-[10px] text-stone-500 font-semibold block">Total Panen</span>
                                    <strong class="font-mono text-base font-extrabold text-stone-900">${totalCap} Kg</strong>
                                </div>
                                <div class="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                    <span class="text-[10px] text-stone-500 font-semibold block">Serapan 40 KK</span>
                                    <strong class="font-mono text-base font-extrabold text-emerald-800">${totalDemand} Kg</strong>
                                </div>
                                <div class="p-3 rounded-xl bg-amber-100 border-amber-300 text-amber-950 border shadow-2xs">
                                    <span class="text-[10px] font-bold block">Surplus Luapan</span>
                                    <strong class="font-mono text-base font-extrabold">+${Math.max(0, totalDiff)} Kg</strong>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (myForecasts.length > 0) {
                    const allMyCommodities = myForecasts.map(f => f.commodity).join(', ');
                    const myTotalCap = myForecasts.reduce((s, f) => s + f.weeklyCap, 0);
                    const myTotalDemand = myForecasts.reduce((s, f) => s + f.predictedDemandWeekly, 0);
                    const myTotalDiff = myTotalCap - myTotalDemand;
                    const isSurplus = myTotalDiff > 5;
                    const isDefisit = myTotalDiff < -3;
                    const hasPendingSurplusNotif = Boolean(activeMember && activeMember.surplusNotified && !activeMember.surplusConfirmedByProducer);

                    highlightBox.innerHTML = `
                        <div class="space-y-4">
                            ${hasPendingSurplusNotif ? `
                                <div class="p-4 rounded-xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                    <div class="flex items-start gap-2.5">
                                        <i class="fa-solid fa-bell text-lg mt-0.5 animate-bounce shrink-0"></i>
                                        <div class="text-xs leading-snug">
                                            <strong class="block text-sm">Pemberitahuan Admin RT 13: Permintaan Penarikan Surplus Kebun Anda</strong>
                                            <span>${activeMember.surplusNotifiedMsg || `Admin RT 13 meminta konfirmasi kesiapan panen surplus (${allMyCommodities}) untuk disalurkan ke Koperasi / Program MBG.`}</span>
                                        </div>
                                    </div>
                                    <button type="button" onclick="acknowledgeProducerSurplusAlert()"
                                        class="px-4 py-2.5 rounded-xl bg-white text-amber-950 font-bold text-xs shrink-0 hover:bg-amber-50 transition cursor-pointer shadow-xs">
                                        <i class="fa-solid fa-check-double mr-1"></i> Konfirmasi Siap Salurkan
                                    </button>
                                </div>
                            ` : ''}
                            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div class="space-y-1.5">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-800 text-white">
                                            <i class="fa-solid fa-user-check mr-1"></i> Hasil Ramalan AI Khusus Kebun Anda
                                        </span>
                                        <span class="font-mono text-xs font-bold text-forest-800">${myForecast.name} (${myForecast.sid})</span>
                                    </div>
                                    <h4 class="serif-heading text-lg sm:text-xl font-bold text-stone-900">
                                        Komoditas yang Dijual: <span class="text-forest-800 underline decoration-emerald-400">${allMyCommodities}</span>
                                    </h4>
                                    <p class="text-xs text-stone-700 leading-relaxed max-w-2xl">
                                        <strong>Kesimpulan AI untuk Komoditas Anda:</strong> ${myForecast.recommendation}
                                    </p>
                                </div>

                                <div class="grid grid-cols-3 gap-2.5 shrink-0 text-center">
                                    <div class="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                        <span class="text-[10px] text-stone-500 font-semibold block">Panen Anda</span>
                                        <strong class="font-mono text-base font-extrabold text-stone-900">${myTotalCap} Kg</strong>
                                    </div>
                                    <div class="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
                                        <span class="text-[10px] text-stone-500 font-semibold block">Dibeli Warga</span>
                                        <strong class="font-mono text-base font-extrabold text-emerald-800">${myTotalDemand} Kg</strong>
                                    </div>
                                    <div class="p-3 rounded-xl ${isSurplus ? 'bg-amber-100 border-amber-300 text-amber-950' : isDefisit ? 'bg-rose-100 border-rose-300 text-rose-950' : 'bg-emerald-100 border-emerald-300 text-emerald-950'} border shadow-2xs">
                                        <span class="text-[10px] font-bold block">${isSurplus ? 'Surplus Produk' : isDefisit ? 'Kurang Stok' : 'Status Pas'}</span>
                                        <strong class="font-mono text-base font-extrabold">${myTotalDiff >= 0 ? '+' + myTotalDiff : myTotalDiff} Kg</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    highlightBox.innerHTML = `
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div class="space-y-1">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 inline-flex items-center gap-1">
                                    <i class="fa-solid fa-lock"></i> Ramalan AI Khusus Produsen
                                </span>
                                <h4 class="serif-heading text-base sm:text-lg font-bold text-stone-900">
                                    Masuk sebagai Produsen untuk Melihat Ramalan Kebun Anda
                                </h4>
                                <p class="text-xs text-stone-500 max-w-xl leading-relaxed">
                                    Sistem AI memprediksi kapasitas panen mingguan vs serapan konsumsi tetangga RT 13 khusus untuk komoditas yang dijual produsen.
                                </p>
                            </div>
                            <button type="button" onclick="switchTab('tab-sid')" class="px-4 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 transition shrink-0 cursor-pointer shadow-2xs">
                                Buka Menu Profile (Ganti Mode)
                            </button>
                        </div>
                    `;
                }
            }

            if (cardsGrid) {
                const btnAll = document.getElementById('btnAiFilterAllProd');
                const btnMine = document.getElementById('btnAiFilterMyProd');
                if (btnAll) {
                    if (isAdmin) {
                        btnAll.classList.remove('hidden');
                        btnAll.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-forest-800 text-white';
                        if (btnMine) btnMine.classList.add('hidden');
                    } else {
                        btnAll.classList.add('hidden');
                        if (btnMine) {
                            btnMine.classList.remove('hidden');
                            btnMine.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-forest-800 text-white';
                        }
                    }
                }

                let scopedList = [];
                if (isAdmin) {
                    scopedList = forecastList;
                } else if (activeSid) {
                    scopedList = myForecasts;
                }

                if (scopedList.length === 0) {
                    cardsGrid.innerHTML = `
                        <div class="col-span-full p-6 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500 space-y-1">
                            <i class="fa-solid fa-seedling text-emerald-700 text-base"></i>
                            <p class="font-semibold text-stone-700">Belum ada komoditas yang didaftarkan pada akun kebun Anda. Silakan tambahkan komoditas di menu Profile.</p>
                        </div>
                    `;
                } else {
                    cardsGrid.innerHTML = scopedList.map(item => {
                        let actionFooterHtml = '';

                        if (isAdmin && item.statusType === 'SURPLUS') {
                            if (item.surplusConfirmedByProducer) {
                                actionFooterHtml = `
                                    <div class="pt-2.5 mt-2 border-t border-emerald-200 space-y-1.5">
                                        <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                                            <i class="fa-solid fa-circle-check text-emerald-700"></i>
                                            Terkonfirmasi Produsen • Masuk Pusat Surplus
                                        </span>
                                        <button type="button" onclick="switchTab('tab-dampak')"
                                            class="w-full py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-truck-fast"></i>
                                            <span>Lihat di Pusat Penarikan Surplus &rarr;</span>
                                        </button>
                                    </div>
                                `;
                            } else if (item.surplusNotified) {
                                actionFooterHtml = `
                                    <div class="pt-2.5 mt-2 border-t border-amber-200 space-y-1.5">
                                        <span class="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                                            <i class="fa-solid fa-clock text-amber-700"></i>
                                            Notif Terkirim • Menunggu Konfirmasi Produsen
                                        </span>
                                        <p class="text-[10px] text-stone-600 leading-tight">
                                            Menunggu <strong>${item.name}</strong> mengklik konfirmasi di akunnya agar otomatis tampil di Pusat Penarikan Resume Surplus.
                                        </p>
                                    </div>
                                `;
                            } else {
                                actionFooterHtml = `
                                    <div class="pt-2.5 mt-2 border-t border-amber-200">
                                        <button type="button" onclick="adminPullAndNotifySurplus('${item.sid}', '${item.listingId}', ${item.diff})"
                                            class="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                                            <i class="fa-solid fa-bell"></i>
                                            <span>Tarik Data Surplus &amp; Beritahu Produsen (+${item.diff} Kg)</span>
                                        </button>
                                    </div>
                                `;
                            }
                        } else if (!isAdmin && item.sid === activeSid && item.surplusNotified && !item.surplusConfirmedByProducer) {
                            actionFooterHtml = `
                                <div class="pt-2.5 mt-2 border-t border-amber-300 space-y-1.5">
                                    <div class="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-[11px] text-amber-950 font-semibold">
                                        <i class="fa-solid fa-bell text-amber-700 mr-1"></i>
                                        Admin meminta konfirmasi kesiapan surplus <strong>+${Math.max(item.diff, 5)} Kg ${item.commodity}</strong> untuk disalurkan ke Koperasi / MBG.
                                    </div>
                                    <button type="button" onclick="acknowledgeProducerSurplusAlert('${item.listingId}')"
                                        class="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer">
                                        <i class="fa-solid fa-check-double"></i>
                                        <span>Konfirmasi Siap Salurkan Surplus</span>
                                    </button>
                                </div>
                            `;
                        }

                        return `
                            <div class="p-4 rounded-xl border ${item.cardBorder} space-y-2.5 shadow-2xs flex flex-col justify-between">
                                <div class="space-y-1.5">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                                            ${(activeSid && item.sid === activeSid) ? '⭐ KOMODITAS ANDA' : item.sid}
                                        </span>
                                        ${item.statusBadge}
                                    </div>
                                    <div>
                                        <h5 class="font-bold text-sm text-stone-900">${item.commodity}</h5>
                                        <p class="text-xs font-semibold text-forest-800">
                                            <i class="fa-solid fa-user-tag mr-1 text-emerald-600"></i>Produsen: ${(activeSid && item.sid === activeSid) || isAdmin ? item.name : (item.producer.publicName || item.name.split(' ')[0] + ' (KWT RT 13)')}
                                        </p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                                        <div class="p-2 rounded-lg bg-white/90 border border-stone-200/80">
                                            <span class="text-[10px] text-stone-500 block">Stok/Panen:</span>
                                            <strong class="text-stone-900">${item.weeklyCap} Kg</strong>
                                        </div>
                                        <div class="p-2 rounded-lg bg-white/90 border border-stone-200/80">
                                            <span class="text-[10px] text-stone-500 block">Serapan Warga:</span>
                                            <strong class="text-emerald-800">${item.predictedDemandWeekly} Kg</strong>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[11px] text-stone-700 leading-snug pt-2 border-t border-stone-200/60">
                                        <strong>Saran AI:</strong> ${item.recommendation}
                                    </p>
                                    ${actionFooterHtml}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            const surplusProducers = forecastList.filter(f => f.statusType === 'SURPLUS');
            const deficitProducers = forecastList.filter(f => f.statusType === 'DEFISIT');
            const resultBox = document.getElementById('surplusResultBox');
            if (resultBox) {
                if (isAdmin && surplusProducers.length > 0) {
                    const detailNames = surplusProducers.map(s => `<strong>${s.commodity} (+${s.diff} Kg milik ${s.name})</strong>`).join(', ');
                    const deficitNames = deficitProducers.length > 0
                        ? ` Sedangkan komoditas yang masih kurang stok adalah: ${deficitProducers.map(d => `<strong>${d.commodity} (${d.diff} Kg - ${d.name})</strong>`).join(', ')}.`
                        : '';
                    resultBox.innerHTML = `
                        <div class="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 text-base shadow-xs">
                            <i class="fa-solid fa-user-shield"></i>
                        </div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded inline-block font-mono">
                                    Konsol Pengurus RT: Resume Panen &amp; Penyaluran MBG
                                </span>
                                <span class="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">Khusus Admin</span>
                            </div>
                            <p class="text-xs sm:text-sm text-stone-900 leading-relaxed">
                                Terdeteksi <strong>${surplusProducers.length} Produk Produsen Mengalami Surplus</strong> minggu ini yaitu: ${detailNames}.${deficitNames}
                            </p>
                            <p class="text-[11px] text-stone-600">
                                Klik tombol <strong>"Tarik Data Surplus &amp; Beritahu Produsen"</strong> pada kartu di atas. Setelah dikonfirmasi oleh petani, komoditas otomatis masuk ke Pusat Penarikan Resume Surplus di Dashboard Monev &amp; Surplus.
                            </p>
                        </div>
                    `;
                    resultBox.classList.remove('hidden');
                } else if (activeSid && myForecast && myForecast.statusType === 'SURPLUS') {
                    resultBox.innerHTML = `
                        <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-base shadow-xs">
                            <i class="fa-solid fa-circle-info"></i>
                        </div>
                        <div class="space-y-1">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded inline-block font-mono">
                                Status Kebun Anda
                            </span>
                            <p class="text-xs sm:text-sm text-stone-900 leading-relaxed">
                                Panen Anda (<strong>${myForecast.commodity}</strong>) berpotensi mengalami <strong>Surplus +${myForecast.diff} Kg</strong> minggu ini. Kelebihan panen akan dibantu penyalurannya secara kolektif oleh Admin RT ke mitra kelurahan.
                            </p>
                        </div>
                    `;
                    resultBox.classList.remove('hidden');
                } else {
                    resultBox.classList.add('hidden');
                }
            }

            if (!tbody) return;
            tbody.innerHTML = forecastList.map(item => {
                const isMe = Boolean(activeSid && item.sid === activeSid);
                const displayName = (isMe || isAdmin)
                    ? item.name
                    : (item.producer.publicName || (item.name.split(' ')[0] + ' (KWT)'));

                return `
                    <tr class="hover:bg-stone-50 transition ${isMe ? 'bg-emerald-50/50 font-medium' : ''}">
                        <td class="py-3 px-3.5 text-stone-900">
                            <strong>${displayName}</strong>
                            ${isMe ? '<span class="ml-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300">Kebun Anda</span>' : ''}
                            <span class="block text-[10px] font-mono text-stone-500">${item.sid}</span>
                        </td>
                        <td class="py-3 px-3.5">
                            <strong class="text-forest-900 block">${item.commodity}</strong>
                            <span class="text-[10px] text-stone-500"><i class="fa-regular fa-calendar-check mr-1"></i>${item.cycle}</span>
                        </td>
                        <td class="py-3 px-3.5 text-right font-mono font-bold text-stone-800">${item.weeklyCap} Kg/mgg</td>
                        <td class="py-3 px-3.5 text-right font-mono font-bold text-emerald-800">${item.predictedDemandWeekly} Kg/mgg</td>
                        <td class="py-3 px-3.5 text-right">${item.statusBadge}</td>
                        <td class="py-3 px-3.5 text-[11px] text-stone-700">${item.recommendation}</td>
                    </tr>
                `;
            }).join('');
        }

        window.getActiveSurplusItems = function getActiveSurplusItems() {
            const listings = window.appState.listings || [];
            const members = window.appState.members || [];
            const surplusItems = [];

            listings.forEach(l => {
                if (l.isDemoListing) return;
                const totalHarvest = Number(l.initialHarvestKg) || 0;
                const absorbed = Number(l.localAbsorbedKg) || 0;
                const avail = Number(l.availableStockKg) || 0;
                const unabsorbed = Number(l.unabsorbedSurplusKg) || 0;

                const surplusKg = unabsorbed > 0 ? unabsorbed : avail;
                const prod = members.find(m => m.sid === l.producerSid);
                const isConfirmed = Boolean(l.surplusConfirmedByProducer || (prod && prod.surplusConfirmedByProducer));

                if (surplusKg > 0 && isConfirmed) {
                    surplusItems.push({
                        listingId: l.id,
                        producerSid: l.producerSid,
                        producerName: prod ? prod.name : l.producerName,
                        commodity: l.commodity,
                        category: l.category,
                        unit: l.unit || 'Kg',
                        cycle: prod ? (prod.harvestCycleWeekly || 'Panen Mingguan') : 'Panen Mingguan',
                        initialHarvestKg: totalHarvest,
                        absorbedKg: absorbed,
                        surplusKg: surplusKg,
                        fairPrice: Number(l.fairPrice) || 10000,
                        confirmed: true
                    });
                }
            });
            return surplusItems;
        }

        window.renderAdminSurplusCenter = function renderAdminSurplusCenter() {
            const tbody = document.getElementById('adminWeeklySurplusTableBody');
            const countPill = document.getElementById('adminSurplusCountPill');
            const totalPkgKgEl = document.getElementById('adminTotalSurplusPackageKg');
            const totalPkgValEl = document.getElementById('adminTotalSurplusPackageValue');
            const previewTextEl = document.getElementById('adminSurplusResumePreviewText');
            const navBadge = document.getElementById('adminSurplusNavBadge');

            const surplusItems = getActiveSurplusItems();
            const totalSurplusKg = surplusItems.reduce((s, x) => s + x.surplusKg, 0);
            const totalSurplusVal = surplusItems.reduce((s, x) => s + (x.surplusKg * x.fairPrice), 0);

            if (navBadge) {
                if (totalSurplusKg > 0) {
                    navBadge.classList.remove('hidden');
                    navBadge.textContent = `Surplus +${totalSurplusKg}Kg`;
                } else {
                    navBadge.classList.add('hidden');
                }
            }

            if (!tbody) return;

            if (countPill) countPill.textContent = `${surplusItems.length} Komoditas Terkonfirmasi Siap Salurkan`;
            if (totalPkgKgEl) totalPkgKgEl.textContent = `${totalSurplusKg.toLocaleString('id-ID')} Kg`;
            if (totalPkgValEl) totalPkgValEl.textContent = `Estimasi Nilai: ${formatRupiah(totalSurplusVal)}`;

            if (surplusItems.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="py-6 px-4 text-center text-stone-700 bg-amber-50/40 space-y-2">
                            <div class="font-bold text-emerald-900">
                                <i class="fa-solid fa-circle-info text-amber-600 mr-1"></i>
                                Belum ada komoditas surplus baru yang dikonfirmasi oleh produsen (atau seluruh surplus sudah disalurkan).
                            </div>
                            <p class="text-xs text-stone-600">
                                Silakan buka tab <strong>Analisis AI &amp; Pasar</strong> pada bagian <em>"Deteksi Otomatis per Produk &amp; per Produsen"</em>, lalu klik tombol <strong>"Tarik Data Surplus &amp; Beritahu Produsen"</strong> pada komoditas yang mengalami surplus.
                            </p>
                            <button type="button" onclick="switchTab('tab-matching')"
                                class="mt-1 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer">
                                <i class="fa-solid fa-microchip"></i>
                                <span>Buka Deteksi Surplus di Tab Analisis AI &amp; Pasar &rarr;</span>
                            </button>
                        </td>
                    </tr>
                `;
                if (previewTextEl) {
                    previewTextEl.textContent = 'Menunggu penarikan & konfirmasi surplus komoditas dari produsen melalui Tab Analisis AI & Pasar.';
                }
                return;
            }

            const summaryParts = surplusItems.map(item => `${item.commodity} (${item.surplusKg} ${item.unit} - ${item.producerName})`);
            if (previewTextEl) {
                previewTextEl.textContent = `[PAKET RESUME SURPLUS TERKONFIRMASI RT 13 YOSOMULYO]: Total ${totalSurplusKg} Kg senilai ${formatRupiah(totalSurplusVal)} terdiri dari: ${summaryParts.join('; ')}.`;
            }

            tbody.innerHTML = surplusItems.map(item => `
                <tr class="hover:bg-amber-50/30 transition">
                    <td class="py-3 px-4 font-bold text-stone-900">
                        ${item.producerName}
                        <span class="block text-[10px] font-mono font-normal text-stone-500">${item.producerSid}</span>
                    </td>
                    <td class="py-3 px-4">
                        <strong class="text-forest-900 block">${item.commodity}</strong>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">${item.category}</span>
                    </td>
                    <td class="py-3 px-4 text-[11px] text-stone-700">
                        <i class="fa-solid fa-rotate text-emerald-600 mr-1"></i>${item.cycle}
                    </td>
                    <td class="py-3 px-4 text-right font-mono text-xs text-stone-700">
                        Panen: <strong>${item.initialHarvestKg} Kg</strong><br>
                        <span class="text-[10px] text-emerald-700">Terserap Warga: ${item.absorbedKg} Kg</span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-extrabold text-amber-800 text-sm">
                        +${item.surplusKg} ${item.unit}
                        <span class="block text-[10px] font-normal text-stone-500">${formatRupiah(item.surplusKg * item.fairPrice)}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <i class="fa-solid fa-circle-check"></i> Terkonfirmasi Produsen
                        </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="dispatchSingleSurplusToDistribution('${item.listingId}')"
                                class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Tarik hasil surplus komoditas ini dan salurkan ke Koperasi / Dapur MBG">
                                <i class="fa-solid fa-truck-fast"></i>
                                <span>Tarik &amp; Salurkan</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        window.dispatchSingleSurplusToDistribution = function(listingId) {
            const listing = (window.appState.listings || []).find(l => l.id === listingId);
            if (!listing) return;

            const targetInstSelect = document.getElementById('surplusTargetInstitution');
            const targetInst = targetInstSelect ? targetInstSelect.value : 'MBG_METRO';
            const targetName = targetInst === 'MBG_METRO'
                ? 'Satuan Pelayanan Pemenuhan Gizi (Dapur MBG) Kota Metro'
                : 'Koperasi Produsen Kelurahan Yosomulyo';

            const surplusKg = (listing.unabsorbedSurplusKg || 0) > 0 ? listing.unabsorbedSurplusKg : listing.availableStockKg;
            const fairPrice = Number(listing.fairPrice) || 6000;
            const subtotal = surplusKg * fairPrice;

            if (surplusKg <= 0) {
                showToast('Stok Kosong', 'Stok surplus komoditas ini sudah tidak ada.', 'warning');
                return;
            }

            if ((listing.unabsorbedSurplusKg || 0) > 0) {
                listing.unabsorbedSurplusKg = 0;
            } else {
                listing.availableStockKg = 0;
            }
            listing.localAbsorbedKg = (listing.localAbsorbedKg || 0) + surplusKg;
            listing.surplusNotified = false;
            listing.surplusConfirmedByProducer = false;

            const prod = (window.appState.members || []).find(m => m.sid === listing.producerSid);
            if (prod) {
                prod.walletEarned = (prod.walletEarned || 0) + subtotal;
                prod.surplusNotified = false;
                prod.surplusConfirmedByProducer = false;
            }

            const txId = `TX-RT13-MBG${Math.floor(100 + Math.random() * 900)}`;
            window.appState.transactions.unshift({
                id: txId,
                timestamp: 'Baru Saja • Penyaluran Surplus',
                type: 'EKSPANSI_PASAR_LUAR',
                orderStatus: 'SELESAI_LUNAS',
                producerSid: listing.producerSid,
                producerName: listing.producerName,
                consumerSid: targetInst,
                consumerName: targetName,
                commodity: `${listing.commodity} (Surplus Panen)`,
                quantityKg: surplusKg,
                unitPrice: fairPrice,
                subtotal: subtotal,
                producerNet: subtotal,
                deliveryMethod: 'Penyaluran Kolektif via Admin RT',
                deliveryFee: 0,
                totalPaid: subtotal,
                status: 'TERVERIFIKASI_MBG_KOPERASI'
            });

            if (typeof musyawarahTransparencyState !== 'undefined' && Array.isArray(musyawarahTransparencyState.activities)) {
                musyawarahTransparencyState.activities.unshift({
                    id: `act-mbg-${Date.now()}`,
                    time: 'Baru saja',
                    category: 'Penyaluran Surplus MBG/Koperasi',
                    description: `Admin RT 13 menarik dan menyalurkan ${surplusKg} Kg ${listing.commodity} senilai ${formatRupiah(subtotal)} dari ${listing.producerName} ke ${targetName}.`,
                    isNew: true
                });
            }

            // Reset filter transaksi pesanan agar langsung muncul paling atas
            const filterSelect = document.getElementById('ordersProducerFilter');
            if (filterSelect) filterSelect.value = 'ALL';
            const deliveryFilter = document.getElementById('ordersDeliveryFilter');
            if (deliveryFilter) deliveryFilter.value = 'ALL';
            const searchInput = document.getElementById('ordersSearchInput');
            if (searchInput) searchInput.value = '';

            renderAll();
            syncAllDataToSupabaseNow(false);

            showToast(
                'Surplus Berhasil Ditarik & Disalurkan!',
                `${surplusKg} Kg ${listing.commodity} berhasil disalurkan ke ${targetName} dan dicatat di Tab Penyaluran & Pesanan.`,
                'success'
            );

            setTimeout(() => {
                switchTab('tab-orders');
            }, 500);
        };

        window.notifyProducerSurplus = function(listingId) {
            const listing = (window.appState.listings || []).find(l => l.id === listingId);
            if (!listing) return;

            const prod = (window.appState.members || []).find(m => m.sid === listing.producerSid);
            const surplusKg = (listing.unabsorbedSurplusKg || 0) > 0 ? listing.unabsorbedSurplusKg : listing.availableStockKg;

            listing.surplusNotified = true;
            if (prod) {
                prod.surplusNotified = true;
                prod.surplusNotifiedMsg = `Pemberitahuan Admin RT 13: Komoditas ${listing.commodity} Anda terdeteksi mengalami Surplus +${surplusKg} ${listing.unit || 'Kg'}. Stok ini telah dimasukkan ke Paket Resume Kolektif untuk disalurkan ke Koperasi / Dapur MBG.`;
            }

            if (typeof musyawarahTransparencyState !== 'undefined' && Array.isArray(musyawarahTransparencyState.activities)) {
                musyawarahTransparencyState.activities.unshift({
                    id: `act-notif-${Date.now()}`,
                    time: 'Baru saja',
                    category: 'Notifikasi Surplus Petani',
                    description: `Admin RT 13 mengirimkan pemberitahuan surplus panen (+${surplusKg} Kg ${listing.commodity}) kepada ${listing.producerName} (${listing.producerSid}).`,
                    isNew: true
                });
            }

            renderAll();
            syncAllDataToSupabaseNow(false);
            showToast(
                'Produsen Berhasil Diberitahu!',
                `Notifikasi surplus +${surplusKg} Kg ${listing.commodity} telah dikirim ke akun ${listing.producerName} (${listing.producerSid}).`,
                'success'
            );
        };

        window.handleDispatchUnifiedSurplusViaWa = function(skipWhatsApp = false) {
            const surplusItems = getActiveSurplusItems();
            if (surplusItems.length === 0) {
                showToast('Tidak Ada Surplus Tersisa', 'Seluruh stok surplus sudah terserap atau telah disalurkan.', 'info');
                return;
            }

            const targetInstSelect = document.getElementById('surplusTargetInstitution');
            const targetInst = targetInstSelect ? targetInstSelect.value : 'MBG_METRO';
            const targetName = targetInst === 'MBG_METRO'
                ? 'Satuan Pelayanan Pemenuhan Gizi (Dapur MBG) Kota Metro'
                : 'Koperasi Produsen Kelurahan Yosomulyo';

            const rawPhone = (document.getElementById('surplusWhatsappPhone')?.value || '6281272001313').replace(/[^0-9]/g, '');
            const waPhone = rawPhone.startsWith('0') ? ('62' + rawPhone.slice(1)) : (rawPhone || '6281272001313');

            const totalKg = surplusItems.reduce((s, x) => s + x.surplusKg, 0);
            const totalVal = surplusItems.reduce((s, x) => s + (x.surplusKg * x.fairPrice), 0);

            const lines = surplusItems.map((it, idx) =>
                `${idx + 1}. *${it.commodity}*: ${it.surplusKg} ${it.unit} (Produsen: ${it.producerName} - ${it.producerSid}) @ Rp ${it.fairPrice.toLocaleString('id-ID')}`
            );

            const waMessage =
                `*BERITA ACARA PENYALURAN 1 PAKET SURPLUS PANGAN RT 13 YOSOMULYO*\n` +
                `Tujuan: *${targetName}*\n` +
                `Tanggal: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}\n\n` +
                `Berikut daftar panen segar terverifikasi Single Identity (SID) yang siap diserap dalam *1 Paket Terpadu (Sayur, Lauk & Beras)*:\n` +
                lines.join('\n') +
                `\n\n*Total Volume Paket*: ${totalKg} Kg\n` +
                `*Total Nilai Transaksi Adil (0% Komisi)*: ${formatRupiah(totalVal)}\n\n` +
                `Mohon konfirmasi jadwal penjemputan di Hub Pangan RT 13 Kelurahan Yosomulyo. Terima kasih.`;

            surplusItems.forEach(item => {
                const l = (window.appState.listings || []).find(x => x.id === item.listingId);
                if (l) {
                    if ((l.unabsorbedSurplusKg || 0) > 0) {
                        l.unabsorbedSurplusKg = 0;
                    } else {
                        l.availableStockKg = Math.max(0, (l.availableStockKg || 0) - item.surplusKg);
                    }
                    l.localAbsorbedKg = (l.localAbsorbedKg || 0) + item.surplusKg;
                    l.surplusNotified = true;
                }
                const prod = (window.appState.members || []).find(m => m.sid === item.producerSid);
                if (prod) {
                    prod.walletEarned = (prod.walletEarned || 0) + (item.surplusKg * item.fairPrice);
                    prod.surplusNotified = true;
                    prod.surplusNotifiedMsg = `Panen surplus Anda (${item.surplusKg} ${item.unit} ${item.commodity}) telah disalurkan oleh Admin RT 13 dalam 1 Paket Kolektif ke ${targetName}.`;
                }
            });

            const txId = `TX-RT13-MBG${Math.floor(100 + Math.random() * 900)}`;
            window.appState.transactions.unshift({
                id: txId,
                timestamp: 'Baru Saja • Paket Kolektif',
                type: 'EKSPANSI_PASAR_LUAR',
                orderStatus: 'SELESAI_LUNAS',
                producerSid: 'KOLEKTIF-KWT-RT13',
                producerName: `${surplusItems.length} Produsen KWT RT 13`,
                consumerSid: targetInst,
                consumerName: targetName,
                commodity: `1 Paket Resume Surplus (${surplusItems.map(s => s.commodity.split(' ')[0]).join(', ')})`,
                quantityKg: totalKg,
                unitPrice: Math.round(totalVal / Math.max(1, totalKg)),
                subtotal: totalVal,
                producerNet: totalVal,
                deliveryMethod: 'Penyaluran Kolektif via WA Resmi',
                deliveryFee: 0,
                totalPaid: totalVal,
                status: 'TERVERIFIKASI_MBG_KOPERASI'
            });

            if (typeof musyawarahTransparencyState !== 'undefined' && Array.isArray(musyawarahTransparencyState.activities)) {
                musyawarahTransparencyState.activities.unshift({
                    id: `act-mbg-${Date.now()}`,
                    time: 'Baru saja',
                    category: 'Penyaluran Paket Surplus (WA)',
                    description: `Admin RT 13 menyalurkan 1 Paket Resume Surplus (${totalKg} Kg senilai ${formatRupiah(totalVal)}) ke ${targetName} & mengirim notifikasi ke ${surplusItems.length} produsen.`,
                    isNew: true
                });
            }

            // Reset filter transaksi pesanan agar langsung muncul paling atas
            const filterSelect = document.getElementById('ordersProducerFilter');
            if (filterSelect) filterSelect.value = 'ALL';
            const deliveryFilter = document.getElementById('ordersDeliveryFilter');
            if (deliveryFilter) deliveryFilter.value = 'ALL';
            const searchInput = document.getElementById('ordersSearchInput');
            if (searchInput) searchInput.value = '';

            renderAll();
            syncAllDataToSupabaseNow(false);

            if (!skipWhatsApp) {
                try {
                    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;
                    window.open(waUrl, '_blank', 'noopener,noreferrer');
                } catch (err) {
                    console.warn('Popup blocked:', err);
                }
            }

            showToast(
                '1 Paket Surplus Berhasil Disalurkan!',
                `Total ${totalKg} Kg (${formatRupiah(totalVal)}) dipindahkan ke Tab Penyaluran & Pesanan.`,
                'success'
            );

            // Otomatis berpindah ke tab pesanan & penyaluran
            setTimeout(() => {
                switchTab('tab-orders');
            }, 600);
        };


}

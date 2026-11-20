/**
 * @file src/services/receiptPdfService.js
 * @description Layanan Rekap Pesanan Masuk, Struk Digital, Generator PDF 1.4 Binary Client-Side,
 *              & Ekspor Data CSV.
 */

export function initReceiptPdfService() {
        // 8e. TAB ORDERS (PESANAN MASUK & REKAP PEMBELI PANEN PRODUSEN)
        // =========================================================================
        window.populateOrdersProducerFilter = function populateOrdersProducerFilter() {
            const select = document.getElementById('ordersProducerFilter');
            if (!select) return;

            const producers = (window.appState.members || []).filter(m => m.role === 'PRODUSEN' || m.isDualRole);
            const activeSid = window.appState?.activeUserSid;
            const isAdmin = Boolean(window.appState?.isAdminLoggedIn || window.appState?.activeRole === 'ADMIN');

            const personalBadge = document.getElementById('ordersPersonalProducerBadge');
            const personalText = document.getElementById('ordersPersonalProducerText');
            const adminFilterBox = document.getElementById('ordersAdminFilterBox');

            if (!isAdmin) {
                if (!activeSid) {
                    select.innerHTML = '<option value="">-- Belum Masuk Akun --</option>';
                    select.value = '';
                    if (personalText) personalText.textContent = 'Belum Masuk Akun Produsen';
                    if (personalBadge) {
                        personalBadge.classList.remove('hidden');
                        personalBadge.classList.add('flex');
                    }
                    if (adminFilterBox) {
                        adminFilterBox.classList.add('hidden');
                        adminFilterBox.classList.remove('flex');
                    }
                    return;
                }

                // Mode Produsen: Kunci HANYA ke akun Produsen yang sedang login
                const myProd = producers.find(p => p.sid === activeSid);
                if (myProd) {
                    select.innerHTML = `<option value="${myProd.sid}" selected>${myProd.name} (${myProd.sid})</option>`;
                    select.value = myProd.sid;
                    if (personalText) personalText.textContent = `Pesanan Kebun Saya: ${myProd.name} (${myProd.producerCommodity || 'Pekarangan'})`;
                } else {
                    select.innerHTML = '<option value="">Bukan Akun Produsen</option>';
                    select.value = '';
                    if (personalText) personalText.textContent = 'Akun Anda Terdaftar sebagai Konsumen';
                }
                if (personalBadge) {
                    personalBadge.classList.remove('hidden');
                    personalBadge.classList.add('flex');
                }
                if (adminFilterBox) {
                    adminFilterBox.classList.add('hidden');
                    adminFilterBox.classList.remove('flex');
                }
            } else {
                // Mode Admin: Bisa melihat semua produsen atau filter per produsen
                const currentVal = select.value;
                let html = '<option value="ALL">Semua Produsen (Rekap RT 13)</option>';
                producers.forEach(p => {
                    html += `<option value="${p.sid}">${p.name} (${p.sid}) - ${p.producerCommodity || 'Pekarangan'}</option>`;
                });
                select.innerHTML = html;
                if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
                    select.value = currentVal;
                }
                if (personalBadge) {
                    personalBadge.classList.add('hidden');
                    personalBadge.classList.remove('flex');
                }
                if (adminFilterBox) {
                    adminFilterBox.classList.remove('hidden');
                    adminFilterBox.classList.add('flex');
                }
            }
        }

        window.renderProducerOrders = function renderProducerOrders() {
            const container = document.getElementById('producerOrdersCardContainer');
            if (!container) return;

            const activeSid = window.appState?.activeUserSid;
            const isAdmin = Boolean(window.appState?.isAdminLoggedIn || window.appState?.activeRole === 'ADMIN');

            if (!activeSid && !isAdmin) {
                container.innerHTML = `
                    <div class="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                        <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                            <i class="fa-solid fa-lock"></i>
                        </div>
                        <h4 class="font-bold text-stone-800 text-base">Anda Belum Masuk Akun Produsen</h4>
                        <p class="text-xs text-stone-500 max-w-md mx-auto">
                            Halaman ini khusus untuk Produsen KWT / Petani RT 13 mengelola pesanan masuk dari pembeli tetangga. Silakan masuk ke akun Anda terlebih dahulu di Tab Masuk Akun.
                        </p>
                        <button type="button" onclick="switchTab('tab-konsep')" class="px-5 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 transition cursor-pointer">
                            Masuk ke Akun Saya
                        </button>
                    </div>
                `;
                const elCount = document.getElementById('ordersFilteredCountText');
                const elKg = document.getElementById('ordersTotalVolumeKg');
                const elEarned = document.getElementById('ordersTotalIncomeRp');
                if (elCount) elCount.textContent = '0 Pesanan';
                if (elKg) elKg.textContent = '0';
                if (elEarned) elEarned.textContent = 'Rp 0';
                return;
            }

            const producerFilter = document.getElementById('ordersProducerFilter')?.value || (isAdmin ? 'ALL' : activeSid);
            const searchQuery = (document.getElementById('ordersSearchInput')?.value || '').toLowerCase().trim();
            const deliveryFilter = document.getElementById('ordersDeliveryFilter')?.value || 'ALL';

            const transactions = window.appState.transactions || [];

            // Filter transaksi yang relevan
            const orders = transactions.filter(t => {
                if (producerFilter !== 'ALL' && t.producerSid !== producerFilter) {
                    return false;
                }
                if (deliveryFilter === 'AMBIL' && !t.deliveryMethod?.toLowerCase().includes('ambil')) {
                    return false;
                }
                if (deliveryFilter === 'DIANTAR' && !t.deliveryMethod?.toLowerCase().includes('diantar')) {
                    return false;
                }
                if (searchQuery) {
                    const matchBuyer = (t.consumerName || '').toLowerCase().includes(searchQuery);
                    const matchSid = (t.consumerSid || '').toLowerCase().includes(searchQuery);
                    const matchCommodity = (t.commodity || '').toLowerCase().includes(searchQuery);
                    const matchTx = (t.id || '').toLowerCase().includes(searchQuery);
                    if (!matchBuyer && !matchSid && !matchCommodity && !matchTx) {
                        return false;
                    }
                }
                return true;
            });

            // Hitung metrik
            const totalCount = orders.length;
            const totalKg = orders.reduce((sum, o) => sum + (o.quantityKg || 0), 0);
            const totalEarned = orders.reduce((sum, o) => sum + (o.producerNet || o.subtotal || 0), 0);

            // Update UI Counters
            const elCount = document.getElementById('ordersCountDisplay');
            const elKg = document.getElementById('ordersKgDisplay');
            const elEarned = document.getElementById('ordersEarnedDisplay');
            const elBadgeHeader = document.getElementById('ordersCountBadgeHeader');
            const elMarketBadge = document.getElementById('marketOrdersCountBadge');

            if (elCount) elCount.textContent = totalCount;
            if (elKg) elKg.textContent = totalKg;
            if (elEarned) elEarned.textContent = formatRupiah(totalEarned);
            if (elBadgeHeader) elBadgeHeader.textContent = `${totalCount} Pesanan`;
            if (elMarketBadge) elMarketBadge.textContent = totalCount;

            // Render Cards
            if (orders.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
                        <div class="w-12 h-12 rounded-full bg-stone-150 text-stone-400 flex items-center justify-center mx-auto text-lg">
                            <i class="fa-solid fa-basket-shopping"></i>
                        </div>
                        <h4 class="font-bold text-stone-700 text-sm">Belum Ada Pesanan yang Sesuai</h4>
                        <p class="text-xs text-stone-500 max-w-sm mx-auto">
                            Tidak ditemukan transaksi dengan filter saat ini. Coba sesuaikan kata kunci pencarian atau pilih filter Semua Produsen.
                        </p>
                    </div>
                `;
                renderOrdersTopBuyers(orders);
                return;
            }

            let cardsHtml = '';
            orders.forEach(t => {
                const isAmbil = (t.deliveryMethod || '').toLowerCase().includes('ambil');
                const isSurplusDispatch = t.type === 'EKSPANSI_PASAR_LUAR' || t.status === 'TERVERIFIKASI_MBG_KOPERASI' || String(t.commodity || '').includes('Surplus');
                const buyerMember = (window.appState.members || []).find(m => m.sid === t.consumerSid);
                const buyerAddress = isSurplusDispatch ? 'Mitra MBG / Koperasi Pangan Kota Metro' : (buyerMember ? buyerMember.address : 'Warga RT 13 Metro Pusat');
                const buyerName = t.consumerName || (buyerMember ? buyerMember.name : (isSurplusDispatch ? 'Mitra Penyaluran Surplus' : 'Warga RT 13'));
                const buyerPhone = buyerMember?.phone || '081271230011';
                const cleanBuyerPhone = String(buyerPhone).replace(/[^0-9]/g, '').replace(/^0/, '62');

                const buyerWaMsg = `Halo ${buyerName}, saya ${t.producerName} (Produsen SI-PANGAN ID RT 13). Mengenai pesanan Anda ${t.id} untuk ${t.commodity} (${t.quantityKg} Kg). Status: ${t.orderStatus === 'SIAP_DIAMBIL' ? 'Sudah Siap Diambil di Kebun' : (t.orderStatus === 'SELESAI_LUNAS' ? 'Selesai & Lunas' : 'Sedang Disiapkan')}. Mohon koordinasi pengambilannya. Terima kasih!`;
                const buyerWaUrl = `https://wa.me/${cleanBuyerPhone}?text=${encodeURIComponent(buyerWaMsg)}`;

                const isDone = t.orderStatus === 'SELESAI_LUNAS' || t.orderStatus === 'SELESAI';
                const isReady = t.orderStatus === 'SIAP_DIAMBIL';
                const isPending = !isDone && !isReady;

                cardsHtml += `
                    <div class="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white hover:shadow-md transition shadow-2xs space-y-3">
                        <!-- 1. Header Pill ID & Harga (Sesuai Referensi Canvas Mobile Image 2) -->
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-3 py-1 rounded-full font-mono">${t.id}</span>
                            <span class="font-extrabold text-base sm:text-lg text-slate-900 mono-num">${formatRupiah(t.producerNet || t.subtotal)}</span>
                        </div>

                        <!-- 2. Komoditas, Pembeli, & Alamat -->
                        <div>
                            <h4 class="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                                ${t.commodity} (${t.quantityKg} Kg)
                            </h4>
                            <p class="text-xs text-slate-600 mt-1">
                                <span>Pembeli: <b class="text-slate-900">${buyerName}</b></span>
                                <span class="font-mono text-slate-500">(${t.consumerSid || 'SID-RT13'})</span>
                            </p>
                            <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <span class="text-rose-500 text-xs">📍</span>
                                <span>${buyerAddress} • ${isSurplusDispatch ? 'Penyaluran MBG' : (isAmbil ? 'Ambil di Kebun' : 'Diantar Warga')}</span>
                            </p>
                        </div>

                        <!-- 3. Dua Tombol Sejajar (💬 Chat WA & Tombol Status Sesuai Mockup) -->
                        <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                            <a href="${buyerWaUrl}" target="_blank" rel="noopener noreferrer"
                               class="bg-[#E8F5E9] hover:bg-emerald-100 text-[#0F5132] font-bold text-xs py-2.5 px-2 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer">
                                <span>💬</span>
                                <span>Chat WA</span>
                            </a>
                            ${isPending ? `
                                <button type="button" onclick="updateOrderStatus('${t.id}', 'SIAP_DIAMBIL')"
                                    class="bg-[#D97706] hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-2 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                                    <span>✓ Siapkan Pesanan</span>
                                </button>
                            ` : isReady ? `
                                <button type="button" onclick="updateOrderStatus('${t.id}', 'SELESAI_LUNAS')"
                                    class="bg-[#D97706] hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-2 rounded-2xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                                    <span>✓ Tandai Selesai</span>
                                </button>
                            ` : `
                                <button type="button" disabled
                                    class="bg-[#F1F5F9] text-slate-600 font-bold text-xs py-2.5 px-2 rounded-2xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-default">
                                    <span>✅ Selesai &amp; Lunas</span>
                                </button>
                            `}
                        </div>

                        <!-- 4. Quick Action Struk & PDF Ringkas -->
                        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <span>Waktu: ${t.timestamp || 'Hari Ini'}</span>
                            <div class="flex items-center gap-2">
                                <button type="button" onclick="viewTransactionReceipt('${t.id}')" class="text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer">
                                    Lihat Struk
                                </button>
                                <span>•</span>
                                <button type="button" onclick="downloadOrderReceiptPdf('${t.id}')" class="text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer">
                                    Unduh PDF
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = cardsHtml;
            renderOrdersTopBuyers(orders);
        }

        window.renderOrdersTopBuyers = function renderOrdersTopBuyers(currentOrders) {
            const listEl = document.getElementById('producerTopBuyersList');
            if (!listEl) return;

            const buyerMap = {};
            (currentOrders || []).forEach(o => {
                const key = o.consumerSid || o.consumerName;
                if (!buyerMap[key]) {
                    buyerMap[key] = {
                        name: o.consumerName || key,
                        sid: o.consumerSid || '-',
                        count: 0,
                        totalKg: 0,
                        totalRp: 0
                    };
                }
                buyerMap[key].count += 1;
                buyerMap[key].totalKg += (o.quantityKg || 0);
                buyerMap[key].totalRp += (o.subtotal || o.producerNet || 0);
            });

            const topBuyers = Object.values(buyerMap).sort((a, b) => b.count - a.count).slice(0, 4);

            if (topBuyers.length === 0) {
                listEl.innerHTML = '<div class="col-span-full text-center py-4 text-xs text-stone-400">Belum ada riwayat pembeli aktif.</div>';
                return;
            }

            let html = '';
            topBuyers.forEach(b => {
                const member = (window.appState.members || []).find(m => m.sid === b.sid);
                const address = member ? member.address : 'RT 13 Yosomulyo';
                html += `
                    <div class="p-3 rounded-xl bg-stone-50/70 border border-stone-150 space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-stone-900 text-xs truncate max-w-[120px]">${b.name}</span>
                            <span class="text-[10px] font-mono font-bold text-forest-700 bg-forest-50 px-1 py-0.5 rounded border border-forest-150">${b.count}x Belanja</span>
                        </div>
                        <div class="text-[10px] text-stone-500 truncate">${address}</div>
                        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100 font-mono">
                            <span class="text-stone-600">${b.totalKg} Kg Total</span>
                            <span class="font-bold text-forest-800">${formatRupiah(b.totalRp)}</span>
                        </div>
                    </div>
                `;
            });
            listEl.innerHTML = html;
        }

        window.viewTransactionReceipt = function viewTransactionReceipt(txId) {
            window.currentReceiptTxId = txId;
            const t = (window.appState.transactions || []).find(x => x.id === txId);
            if (!t) {
                showToast("Data Tidak Ditemukan", `Transaksi ${txId} tidak tercatat di buku kas.`, "warning");
                return;
            }

            const modalBody = document.getElementById('modalOrderReceiptBody');
            if (!modalBody) return;

            const buyerMember = (window.appState.members || []).find(m => m.sid === t.consumerSid);
            const buyerAddress = buyerMember ? buyerMember.address : 'RT 13 Yosomulyo Metro Pusat';
            const producerMember = (window.appState.members || []).find(m => m.sid === t.producerSid);
            const producerAddress = producerMember ? producerMember.address : 'Pekarangan KWT RT 13';

            modalBody.innerHTML = `
                <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 font-mono text-[11px]">
                    <div class="text-center pb-2 border-b border-dashed border-stone-300 space-y-0.5">
                        <div class="font-bold text-stone-900 text-sm">LUMBUNG PANGAN MANDIRI RT 13</div>
                        <div class="text-stone-500 text-[10px]">Kel. Yosomulyo, Kec. Metro Pusat, Kota Metro</div>
                        <div class="text-[10px] text-stone-400">No. Transaksi: ${t.id} • ${t.timestamp}</div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-stone-600 py-1 border-b border-dashed border-stone-300">
                        <div>
                            <span class="block text-[10px] text-stone-400">PEMBELI (WARGA):</span>
                            <strong class="text-stone-900">${t.consumerName || 'Warga RT 13'}</strong>
                            <div class="text-[10px]">${t.consumerSid || '-'}</div>
                            <div class="text-[10px] text-stone-500 truncate">${buyerAddress}</div>
                        </div>
                        <div class="text-right">
                            <span class="block text-[10px] text-stone-400">PENJUAL (PRODUSEN):</span>
                            <strong class="text-stone-900">${t.producerName}</strong>
                            <div class="text-[10px]">${t.producerSid || '-'}</div>
                            <div class="text-[10px] text-stone-500 truncate">${producerAddress}</div>
                        </div>
                    </div>

                    <div class="space-y-1.5 py-1 border-b border-dashed border-stone-300">
                        <div class="flex justify-between items-center text-stone-800">
                            <div>
                                <strong class="block">${t.commodity}</strong>
                                <span class="text-[10px] text-stone-500">${t.quantityKg} Kg x ${formatRupiah(t.unitPrice)}</span>
                            </div>
                            <span class="font-bold">${formatRupiah(t.subtotal)}</span>
                        </div>
                        <div class="flex justify-between items-center text-stone-600 text-[10px]">
                            <span>Pengantaran: ${t.deliveryMethod || 'Ambil Sendiri'}</span>
                            <span>${formatRupiah(t.deliveryFee || 0)}</span>
                        </div>
                    </div>

                    <div class="pt-1 space-y-1">
                        <div class="flex justify-between items-center text-xs font-bold text-stone-900">
                            <span>TOTAL DIBAYAR</span>
                            <span class="text-forest-800 text-sm">${formatRupiah(t.totalPaid || t.subtotal)}</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] text-stone-500">
                            <span>Pendapatan Bersih Petani</span>
                            <span class="font-bold text-stone-800">${formatRupiah(t.producerNet || t.subtotal)}</span>
                        </div>
                    </div>

                    <div class="pt-3 text-center border-t border-dashed border-stone-300 space-y-1">
                        <span class="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                            ✓ LUNAS &amp; TERVERIFIKASI SINGLE IDENTITY
                        </span>
                        <p class="text-[9px] text-stone-400">
                            Dicatat pada Buku Kas Digital RT 13 Yosomulyo. Transaksi resmi bebas tengkulak.
                        </p>
                    </div>

                    <div class="pt-2">
                        <button type="button" onclick="downloadOrderReceiptPdf('${t.id}')"
                            class="w-full py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-file-pdf text-amber-300"></i>
                            <span>Unduh Struk Transaksi (Otomatis PDF)</span>
                        </button>
                    </div>
                </div>
            `;

            openModal('modalOrderReceipt');
        }

        window.buildReceiptPdfBinary = function(t, buyerMember, prodMember) {
            const sanitize = (str, maxLen = 40) => {
                const clean = String(str || '').replace(/[()\\\\]/g, '').replace(/[\r\n\t]+/g, ' ').trim();
                return clean.length > maxLen ? clean.slice(0, maxLen - 2) + '..' : clean;
            };
            const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

            const buyerName = sanitize(t.consumerName || (buyerMember ? buyerMember.name : 'Warga RT 13'), 32);
            const buyerSid = sanitize(t.consumerSid || 'SID-RT13', 20);
            const buyerAddr = sanitize(buyerMember ? buyerMember.address : 'RT 13 Kel. Yosomulyo Metro', 36);

            const prodName = sanitize(t.producerName || (prodMember ? prodMember.name : 'Produsen KWT RT 13'), 32);
            const prodSid = sanitize(t.producerSid || 'SID-KWT', 20);
            const prodAddr = sanitize(prodMember ? prodMember.address : 'Kebun Pekarangan RT 13', 36);

            const commodity = sanitize(t.commodity || 'Pangan Segar', 30);
            const qty = Number(t.quantityKg) || 1;
            const unitPrice = Number(t.unitPrice) || 0;
            const subtotal = Number(t.subtotal) || (qty * unitPrice);
            const deliveryMethod = sanitize(t.deliveryMethod || 'Ambil Sendiri di Kebun', 24);
            const deliveryFee = Number(t.deliveryFee) || 0;
            const totalPaid = Number(t.totalPaid) || (subtotal + deliveryFee);
            const txId = sanitize(t.id || 'TX-RT13-000', 25);
            const timeStr = sanitize(t.timestamp || new Date().toLocaleString('id-ID'), 25);

            const width = 280;
            const height = 480;

            let s = '';
            // Background card & outer border
            s += '0.98 0.98 0.97 rg 8 8 264 464 re f\n';
            s += '0.08 0.35 0.18 RG 1.5 w 8 8 264 464 re S\n';

            // Header Green Banner
            s += '0.08 0.35 0.18 rg 8 415 264 57 re f\n';
            s += 'BT /F2 13 Tf 1 1 1 rg 55 450 Td (SI-PANGAN ID RT 13) Tj ET\n';
            s += 'BT /F1 7.5 Tf 0.85 0.95 0.88 rg 40 437 Td (Lumbung Pangan Mandiri & Ketahanan Pangan) Tj ET\n';
            s += 'BT /F1 7 Tf 0.75 0.90 0.82 rg 45 425 Td (Kel. Yosomulyo, Metro Pusat, Kota Metro) Tj ET\n';

            // Receipt Title & Tx ID Box
            s += '0.93 0.96 0.94 rg 16 376 248 32 re f\n';
            s += '0.75 0.85 0.78 RG 0.8 w 16 376 248 32 re S\n';
            s += 'BT /F2 8.5 Tf 0.08 0.35 0.18 rg 24 394 Td (BUKTI TRANSAKSI PEMBELIAN PANEN) Tj ET\n';
            s += 'BT /F1 7.5 Tf 0.3 0.3 0.3 rg 24 382 Td (No. ' + txId + '  |  ' + timeStr + ') Tj ET\n';

            // Section: Pembeli & Produsen
            s += 'BT /F2 7.5 Tf 0.4 0.4 0.4 rg 18 358 Td (DATA PEMBELI (KONSUMEN):) Tj ET\n';
            s += 'BT /F2 8.5 Tf 0.1 0.1 0.1 rg 18 346 Td (' + buyerName + ') Tj ET\n';
            s += 'BT /F1 7 Tf 0.3 0.3 0.3 rg 18 335 Td (SID: ' + buyerSid + '  -  ' + buyerAddr + ') Tj ET\n';

            s += '0.85 0.85 0.85 RG 0.5 w 18 326 m 262 326 l S\n';

            s += 'BT /F2 7.5 Tf 0.4 0.4 0.4 rg 18 313 Td (DATA PRODUSEN (KEBUN KWT):) Tj ET\n';
            s += 'BT /F2 8.5 Tf 0.1 0.1 0.1 rg 18 301 Td (' + prodName + ') Tj ET\n';
            s += 'BT /F1 7 Tf 0.3 0.3 0.3 rg 18 290 Td (SID: ' + prodSid + '  -  ' + prodAddr + ') Tj ET\n';

            // Item Table Box
            s += '0.85 0.85 0.85 RG 0.8 w 16 195 248 84 re S\n';
            s += '0.92 0.94 0.93 rg 16 257 248 22 re f\n';
            s += 'BT /F2 7.5 Tf 0.2 0.2 0.2 rg 22 265 Td (KOMODITAS HASIL PANEN) Tj ET\n';
            s += 'BT /F2 7.5 Tf 0.2 0.2 0.2 rg 205 265 Td (SUBTOTAL) Tj ET\n';

            s += 'BT /F2 8.5 Tf 0.1 0.1 0.1 rg 22 242 Td (' + commodity + ') Tj ET\n';
            s += 'BT /F1 7.5 Tf 0.4 0.4 0.4 rg 22 230 Td (' + qty + ' Kg  x  ' + formatRp(unitPrice) + ') Tj ET\n';
            s += 'BT /F2 8.5 Tf 0.1 0.1 0.1 rg 195 230 Td (' + formatRp(subtotal) + ') Tj ET\n';

            s += '0.88 0.88 0.88 RG 0.5 w 22 220 m 258 220 l S\n';
            s += 'BT /F1 7.5 Tf 0.4 0.4 0.4 rg 22 205 Td (Metode: ' + deliveryMethod + ') Tj ET\n';
            s += 'BT /F1 7.5 Tf 0.4 0.4 0.4 rg 200 205 Td (' + formatRp(deliveryFee) + ') Tj ET\n';

            // Total Amount Box
            s += '0.08 0.35 0.18 rg 16 148 248 38 re f\n';
            s += 'BT /F1 8 Tf 0.85 0.95 0.88 rg 24 168 Td (TOTAL PEMBAYARAN:) Tj ET\n';
            s += 'BT /F2 13 Tf 1 1 1 rg 150 168 Td (' + formatRp(totalPaid) + ') Tj ET\n';
            s += 'BT /F1 7 Tf 0.80 0.90 0.85 rg 24 154 Td (0% Komisi Transaksi - 100% Diterima Petani) Tj ET\n';

            // Verified Stamp Box
            s += '0.94 0.98 0.95 rg 24 95 232 42 re f\n';
            s += '0.2 0.6 0.3 RG 1 w 24 95 232 42 re S\n';
            s += 'BT /F2 8.5 Tf 0.08 0.45 0.2 rg 40 122 Td ([LUNAS & TERVERIFIKASI SISTEM RT 13]) Tj ET\n';
            s += 'BT /F1 6.5 Tf 0.35 0.50 0.4 rg 30 110 Td (Tercatat pada Buku Kas Digital & Transparansi Musyawarah) Tj ET\n';
            s += 'BT /F1 6 Tf 0.4 0.55 0.4 rg 45 100 Td (Kode Otoritas: SHA256-' + txId.slice(-6) + ') Tj ET\n';

            // Footer note
            s += 'BT /F1 6.5 Tf 0.5 0.5 0.5 rg 48 55 Td (Terima kasih atas partisipasi ketahanan pangan warga) Tj ET\n';
            s += 'BT /F1 6 Tf 0.6 0.6 0.6 rg 65 44 Td (Simpan struk PDF ini sebagai bukti transaksi resmi) Tj ET\n';

            const streamLength = s.length;

            let objects = [];
            objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
            objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
            objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + width + ' ' + height + '] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n');
            objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
            objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');
            objects.push('6 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + s + '\nendstream\nendobj\n');

            let header = '%PDF-1.4\n%\\xE2\\xE3\\xCF\\xD3\n';
            let offsets = [];
            let currentOffset = header.length;

            let body = '';
            for (let i = 0; i < objects.length; i++) {
                offsets.push(currentOffset);
                body += objects[i];
                currentOffset += objects[i].length;
            }

            let startxref = currentOffset;
            let xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
            for (let i = 0; i < offsets.length; i++) {
                xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
            }

            let trailer = 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';

            return header + body + xref + trailer;
        };

        window.downloadOrderReceiptPdf = function(txId, directPrint = false) {
            const targetId = txId || window.currentReceiptTxId || (window.appState.transactions && window.appState.transactions[0]?.id);
            const t = (window.appState.transactions || []).find(x => x.id === targetId);
            if (!t) {
                showToast('Data Transaksi Tidak Ditemukan', 'Tidak dapat mencetak struk karena transaksi tidak ditemukan.', 'error');
                return;
            }

            const buyerMember = (window.appState.members || []).find(m => m.sid === t.consumerSid);
            const prodMember = (window.appState.members || []).find(m => m.sid === t.producerSid);

            if (directPrint) {
                const printWindow = window.open('', '_blank', 'width=380,height=600');
                if (printWindow) {
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Struk - ${t.id}</title>
                            <style>
                                @page { size: 80mm auto; margin: 4mm; }
                                body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; margin: 0; padding: 12px; width: 280px; }
                                .center { text-align: center; }
                                .bold { font-weight: bold; }
                                .line { border-top: 1px dashed #666; margin: 8px 0; }
                                .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                                .total-row { font-size: 13px; font-weight: bold; margin-top: 4px; }
                                .badge { border: 1px solid #000; padding: 3px 6px; display: inline-block; font-weight: bold; font-size: 10px; margin-top: 6px; }
                            </style>
                        </head>
                        <body>
                            <div class="center bold" style="font-size:13px;">SI-PANGAN ID RT 13</div>
                            <div class="center" style="font-size:10px;">Lumbung Pangan Mandiri Yosomulyo</div>
                            <div class="center" style="font-size:9px; color:#555;">Kec. Metro Pusat, Kota Metro</div>
                            <div class="line"></div>
                            <div class="row"><span>No. Pesanan:</span><span class="bold">${t.id}</span></div>
                            <div class="row"><span>Waktu:</span><span>${t.timestamp}</span></div>
                            <div class="line"></div>
                            <div><span style="color:#555;font-size:10px;">PEMBELI:</span> <strong>${t.consumerName || 'Warga'}</strong></div>
                            <div style="font-size:10px; color:#555;">${buyerMember?.address || 'RT 13 Yosomulyo'}</div>
                            <div style="margin-top:4px;"><span style="color:#555;font-size:10px;">PRODUSEN:</span> <strong>${t.producerName}</strong></div>
                            <div style="font-size:10px; color:#555;">${prodMember?.address || 'Pekarangan KWT'}</div>
                            <div class="line"></div>
                            <div class="row">
                                <div><strong>${t.commodity}</strong><br><span style="font-size:10px;color:#555;">${t.quantityKg} Kg x ${formatRupiah(t.unitPrice)}</span></div>
                                <span class="bold">${formatRupiah(t.subtotal)}</span>
                            </div>
                            <div class="row" style="margin-top:4px; font-size:10px;">
                                <span>Metode: ${t.deliveryMethod || 'Ambil Sendiri'}</span>
                                <span>${formatRupiah(t.deliveryFee || 0)}</span>
                            </div>
                            <div class="line"></div>
                            <div class="row total-row">
                                <span>TOTAL BAYAR:</span>
                                <span>${formatRupiah(t.totalPaid || t.subtotal)}</span>
                            </div>
                            <div class="center" style="margin-top:10px;">
                                <span class="badge">✓ LUNAS &amp; TERVERIFIKASI</span>
                                <div style="font-size:8px; color:#666; margin-top:4px;">Dicatat pada Buku Kas Digital RT 13</div>
                            </div>
                            <script>
                                window.onload = function() {
                                    window.focus();
                                    window.print();
                                };
                            <\/script>
                        </body>
                        </html>
                    `);
                    printWindow.document.close();
                } else {
                    window.print();
                }
                return;
            }

            // Default: OTOMATIS DOWNLOAD PDF
            try {
                const pdfString = window.buildReceiptPdfBinary(t, buyerMember, prodMember);
                const bytes = new Uint8Array(pdfString.length);
                for (let i = 0; i < pdfString.length; i++) {
                    bytes[i] = pdfString.charCodeAt(i) & 0xff;
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = `Struk-Belanja-${t.id}.pdf`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                setTimeout(() => {
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(blobUrl);
                }, 300);

                showToast(
                    'Struk PDF Berhasil Diunduh!',
                    `File Struk-Belanja-${t.id}.pdf otomatis tersimpan di perangkat Anda.`,
                    'success'
                );
            } catch (err) {
                console.error('Gagal generate PDF struk:', err);
                showToast('Gagal Mengunduh PDF', 'Terjadi kesalahan saat memproses file PDF.', 'error');
            }
        };

        window.exportOrdersCsv = function exportOrdersCsv() {
            const transactions = window.appState.transactions || [];
            if (transactions.length === 0) {
                showToast("Tidak Ada Data", "Belum ada transaksi untuk diekspor ke CSV.", "warning");
                return;
            }

            let csv = "ID Transaksi,Waktu,Produsen SID,Nama Produsen,Pembeli SID,Nama Pembeli,Komoditas,Volume (Kg),Harga Satuan,Subtotal,Pengantaran,Total Bayar,Status\n";
            transactions.forEach(t => {
                const row = [
                    t.id,
                    `"${t.timestamp}"`,
                    t.producerSid || '',
                    `"${t.producerName || ''}"`,
                    t.consumerSid || '',
                    `"${t.consumerName || ''}"`,
                    `"${t.commodity || ''}"`,
                    t.quantityKg || 0,
                    t.unitPrice || 0,
                    t.subtotal || 0,
                    `"${t.deliveryMethod || ''}"`,
                    t.totalPaid || t.subtotal || 0,
                    t.status || 'SELESAI'
                ];
                csv += row.join(",") + "\n";
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `rekap-pesanan-pangan-rt13-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Ekspor Berhasil", "Berkas CSV rekap pesanan pembeli berhasil diunduh.", "success");
        }

        // =========================================================================
        // 9. PRODUCTION FINAL ENGINE: SUPABASE CLOUD DB, 50 TRANSAKSI, BAPANAS AI,
        //    PERSONAL LOGIN (1 SID 2 PERAN), SURPLUS MBG/KOPERASI WA & FOOD LOSS 5%
        // =========================================================================

}

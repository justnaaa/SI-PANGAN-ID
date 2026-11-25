import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPin, verifyMemberPin, sanitizePinDigits, can } from '../src/domain/sharedFoundation.js';
import {
    buildStatePayload,
    applyCloudStateExtras,
    toTransaksiRows,
    toWargaRow
} from '../src/services/cloudMapping.js';

test('B2 PIN 4-6 digit angka; teks; nol di depan aman', () => {
    for (const ok of ['1234', '12345', '123456', '0123', '001234']) assert.equal(isValidPin(ok), true, ok);
    for (const bad of ['123', '1234567', 'abcd', '12 4', '', '12.4']) assert.equal(isValidPin(bad), false, bad);
    assert.equal(sanitizePinDigits('12ab-34567890'), '123456');

    const m = (pin) => ({ sid: 'S', pinCode: pin, rawNik: '1872011009810006' });
    assert.equal(verifyMemberPin(m('0123'), '0123'), true);
    assert.equal(verifyMemberPin(m('001234'), '001234'), true);
    assert.equal(verifyMemberPin(m('123'), '123'), false);
    assert.equal(verifyMemberPin(m('1234'), '1234567'), false);
    assert.equal(verifyMemberPin(m('1234'), 'abcd'), false);
    // PIN lama 4 digit tetap bisa login; PIN default 1234 bila belum ada
    assert.equal(verifyMemberPin({ sid: 'X' }, '1234'), true);
    // 4 angka akhir NIK TIDAK bisa dipakai login (hanya PIN tersimpan yang berlaku)
    assert.equal(verifyMemberPin(m('1234'), '0006'), false);
    assert.equal(verifyMemberPin(m('12345'), '12345'), true);
    assert.equal(verifyMemberPin(m('123456'), '123456'), true);
    assert.equal(verifyMemberPin(m('1234'), '9999'), false);
    // Angka di data (number) tidak merusak: disimpan teks
    assert.equal(toWargaRow({ sid: 'S', name: 'N', pinCode: '0123' }).pin_code, '0123');
    assert.equal(typeof toWargaRow({ sid: 'S', name: 'N' }).pin_code, 'string');

    // Admin reset PIN ke 6 digit angka
    const memberUpdated = { sid: 'SID-RT13-006', name: 'Pak Joko', rawNik: '1872011009810006', pinCode: '654321' };
    assert.equal(verifyMemberPin(memberUpdated, '654321'), true);
    assert.equal(verifyMemberPin(memberUpdated, '1234'), false);
    assert.equal(toWargaRow(memberUpdated).pin_code, '654321');
});

test('Tugas 5: Hak akses editMemberPin hanya untuk Admin; Produsen dan Konsumen ditolak', () => {
    const adminState = { isAdminLoggedIn: true, activeRole: 'ADMIN', activeUserSid: 'ADMIN-RT13' };
    const konsumenState = { isAdminLoggedIn: false, activeRole: 'KONSUMEN', activeUserSid: 'SID-RT13-011' };
    const produsenState = { isAdminLoggedIn: false, activeRole: 'PRODUSEN', activeUserSid: 'SID-RT13-001' };

    assert.equal(can(adminState, 'EDIT_KK_DATA', null, adminState), true);
    assert.equal(can(konsumenState, 'EDIT_KK_DATA', null, konsumenState), false);
    assert.equal(can(produsenState, 'EDIT_KK_DATA', null, produsenState), false);
});

test('B1.3 payload cloud lengkap + mock cloud round trip + data cloud lama tidak error', () => {
    const mockCloud = new Map(); // meniru sipangan_cloud_state {state_key, payload}
    const state = {
        members: [{ sid: 'A' }], listings: [{ id: 'list-005', isModerated: true }],
        transactions: [{ id: 'T1', orderStatus: 'DIBATALKAN', isInvalidSelfBuying: true, channel: 'koperasi_mbg' }],
        demands: [{ id: 'dem-005', votes: 10, voters: ['SID-RT13-011'] }],
        pendingNewKks: [], pendingKkUpdates: [{ sid: 'A' }], danaSosialInklusi: 1300000,
        activePeriod: '2026-11', closedPeriods: ['2026-10'], lastClosedPeriod: '2026-10', lastClosedAt: 'x',
        moderationLogs: [{ id: 'MOD-1' }], b2bSurplusHistory: [{ id: 'B2B-1' }], inventoryAuditLogs: [{ id: 'AUD-1' }]
    };
    mockCloud.set('RT13', JSON.parse(JSON.stringify({ payload: buildStatePayload(state) })));

    const fresh = { activePeriod: '2026-10', closedPeriods: [] }; // setelah localStorage.clear()
    applyCloudStateExtras(fresh, mockCloud.get('RT13').payload);
    assert.equal(fresh.activePeriod, '2026-11');
    assert.deepEqual(fresh.closedPeriods, ['2026-10']);
    assert.equal(fresh.lastClosedPeriod, '2026-10');
    assert.equal(fresh.moderationLogs.length, 1);
    assert.equal(fresh.b2bSurplusHistory.length, 1);
    assert.equal(fresh.danaSosialInklusi, 1300000);
    assert.equal(fresh.pendingKkUpdates.length, 1);

    // data cloud LAMA (tanpa field baru)
    const legacy = {};
    assert.doesNotThrow(() => applyCloudStateExtras(legacy, { members: [], listings: [] }));
    assert.equal(legacy.activePeriod, '2026-10');
    assert.deepEqual(legacy.closedPeriods, []);
    assert.deepEqual(legacy.moderationLogs, []);
    assert.deepEqual(legacy.b2bSurplusHistory, []);
    assert.doesNotThrow(() => applyCloudStateExtras(legacy, null));
});

test('baris transaksi cloud: ID ganda dikirim sekali, state asli tidak dihapus', () => {
    const txs = [{ id: 'TX-1', totalPaid: 1 }, { id: 'TX-1', totalPaid: 1 }, { id: 'TX-2' }];
    assert.equal(toTransaksiRows(txs).length, 2);
    assert.equal(txs.length, 3);
});

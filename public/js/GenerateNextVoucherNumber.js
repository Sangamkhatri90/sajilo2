async function generateVoucherNo(udvNo, inputEl) {
  try {
    console.log('[VoucherNo] Generator started for UDVNo:', udvNo);
    const datesRes = await fetch('/api/indicator-fiscal-dates');
    const dates = await datesRes.json();
    console.log('[VoucherNo] Fiscal dates returned:', dates);
    if (!datesRes.ok || !dates.success || !dates.startDate || !dates.endDate) {
      throw new Error(dates.message || 'Fiscal-year dates are unavailable.');
    }

    const params = new URLSearchParams({
      startDate: dates.startDate,
      endDate: dates.endDate
    });
    const res = await fetch(`/api/nextVoucher/${udvNo}?${params}`);
    const data = await res.json();
    console.log('[VoucherNo] Number generation response:', { status: res.status, data });
    if (!res.ok || !data.voucherNumber) throw new Error(data.message || 'Failed to generate voucher number.');
    inputEl.value = data.voucherNumber;
    console.log('[VoucherNo] Set voucher field to:', inputEl.value);
  } catch (err) {
    console.error('Error generating VoucherNo:', err.message);
    inputEl.value = '';
    if (typeof showCustomAlert === 'function') showCustomAlert(err.message);
  }
}

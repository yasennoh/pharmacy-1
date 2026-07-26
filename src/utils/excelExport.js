import * as XLSX from 'xlsx';

export const exportDashboardToExcel = (selectedMonth, storesTotal, receipts) => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: ملخص المذاخر
  const summaryData = Object.entries(storesTotal).map(([store, total]) => ({
    'اسم المذخر': store,
    'إجمالي المبلغ المطلوب (د.ع)': total,
  }));
  
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  // تفعيل اتجاه اليمين لليسار في ملف الاكسل
  wsSummary['!views'] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص المذاخر');

  // 2. Sheet 2: تفاصيل الوصولات لهذا الشهر
  const detailsData = receipts.map((r) => ({
    'التاريخ': r.date,
    'اسم المذخر': r.store_name,
    'المبلغ (د.ع)': r.amount,
    'ملاحظات': r.notes || '',
  }));
  
  const wsDetails = XLSX.utils.json_to_sheet(detailsData);
  wsDetails['!views'] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, wsDetails, 'تفاصيل الوصولات');

  // تصدير وتحميل الملف
  XLSX.writeFile(wb, `تقرير_وصولات_مذاخر_${selectedMonth}.xlsx`);
};

export const exportReceiptsToExcel = (receipts, fileName = 'سجل_الوصولات.xlsx') => {
  const wb = XLSX.utils.book_new();

  const data = receipts.map((r) => ({
    'التاريخ': r.date,
    'اسم المذخر': r.store_name,
    'المبلغ (د.ع)': r.amount,
    'ملاحظات': r.notes || '',
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!views'] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, ws, 'الوصولات');

  XLSX.writeFile(wb, fileName);
};

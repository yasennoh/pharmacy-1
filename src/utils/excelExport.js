import * as XLSX from 'xlsx';

export const exportDashboardToExcel = (selectedMonth, storesSummary, receipts) => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: ملخص المذاخر
  const summaryData = Object.entries(storesSummary).map(([store, data]) => ({
    'اسم المذخر': store,
    'إجمالي قيمة الفواتير (د.ع)': data.invoices,
    'إجمالي قيمة الراجع (د.ع)': data.returns,
    'إجمالي المبالغ المسددة (د.ع)': data.paid,
    'الدين المتبقي بذمتكم (د.ع)': data.remaining,
  }));
  
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  // تفعيل اتجاه اليمين لليسار في ملف الاكسل
  wsSummary['!views'] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص المذاخر المالي');

  // 2. Sheet 2: تفاصيل الوصولات لهذا الشهر
  const detailsData = receipts.map((r) => {
    const amt = r.amount || 0;
    const ret = r.returns || 0;
    const paid = r.paid_amount || 0;
    const remaining = amt - ret - paid;
    
    return {
      'التاريخ': r.date,
      'اسم المذخر': r.store_name,
      'قيمة الوصل الأساسية (د.ع)': amt,
      'الراجع / المرجوعات (د.ع)': ret,
      'المبلغ المسدد (د.ع)': paid,
      'المتبقي (الدين) (د.ع)': remaining,
      'ملاحظات': r.notes || '',
    };
  });
  
  const wsDetails = XLSX.utils.json_to_sheet(detailsData);
  wsDetails['!views'] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, wsDetails, 'تفاصيل الوصولات الفردية');

  // تصدير وتحميل الملف
  XLSX.writeFile(wb, `تقرير_وصولات_وحسابات_${selectedMonth}.xlsx`);
};

export const exportReceiptsToExcel = (receipts, fileName = 'سجل_الوصولات.xlsx') => {
  const wb = XLSX.utils.book_new();

  const data = receipts.map((r) => {
    const amt = r.amount || 0;
    const ret = r.returns || 0;
    const paid = r.paid_amount || 0;
    const remaining = amt - ret - paid;

    return {
      'التاريخ': r.date,
      'اسم المذخر': r.store_name,
      'قيمة الوصل الأساسية (د.ع)': amt,
      'الراجع / المردود (د.ع)': ret,
      'المبلغ المسدد (د.ع)': paid,
      'المتبقي (الدين) (د.ع)': remaining,
      'ملاحظات': r.notes || '',
    };
  });
  
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!views'] = [{ RTL: true }];
  XLSX.utils.book_append_sheet(wb, ws, 'الوصولات المفلترة');

  XLSX.writeFile(wb, fileName);
};

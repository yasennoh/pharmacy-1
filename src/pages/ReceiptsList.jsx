import React, { useState, useEffect } from 'react';
import { getReceipts, deleteReceipt } from '../services/api';
import { exportReceiptsToExcel } from '../utils/excelExport';
import { Trash2, Search, FileDown, Filter } from 'lucide-react';

const ReceiptsList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // فلاتر البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data || []);
    } catch (err) {
      setError('تعذر جلب البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الوصل؟')) {
      try {
        await deleteReceipt(id);
        setReceipts(receipts.filter(r => r.id !== id));
      } catch (err) {
        alert('حدث خطأ أثناء الحذف.');
      }
    }
  };

  // استخراج المذاخر الفريدة للتصفية
  const uniqueStores = ['All', ...new Set(receipts.map(r => r.store_name))];

  // استخراج السنوات الفريدة للتصفية
  const uniqueYears = ['All', ...new Set(receipts.map(r => r.date.substring(0, 4)))].sort((a, b) => b - a);

  // قائمة الأشهر الثابتة باللغة العربية
  const monthsList = [
    { value: 'All', label: 'كل الأشهر' },
    { value: '01', label: 'كانون الثاني (01)' },
    { value: '02', label: 'شباط (02)' },
    { value: '03', label: 'آذار (03)' },
    { value: '04', label: 'نيسان (04)' },
    { value: '05', label: 'أيار (05)' },
    { value: '06', label: 'حزيران (06)' },
    { value: '07', label: 'تموز (07)' },
    { value: '08', label: 'آب (08)' },
    { value: '09', label: 'أيلول (09)' },
    { value: '10', label: 'تشرين الأول (10)' },
    { value: '11', label: 'تشرين الثاني (11)' },
    { value: '12', label: 'كانون الأول (12)' }
  ];

  // فلترة البيانات
  const filteredReceipts = receipts.filter(receipt => {
    const year = receipt.date.substring(0, 4);
    const month = receipt.date.substring(5, 7);

    const matchesSearch = 
      receipt.store_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (receipt.notes && receipt.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      receipt.amount.toString().includes(searchTerm);

    const matchesStore = selectedStore === 'All' || receipt.store_name === selectedStore;
    const matchesYear = selectedYear === 'All' || year === selectedYear;
    const matchesMonth = selectedMonth === 'All' || month === selectedMonth;

    return matchesSearch && matchesStore && matchesYear && matchesMonth;
  });

  const totalFilteredAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

  const handleExport = () => {
    if (filteredReceipts.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }
    const filterLabel = `تصدير_سجل_${selectedStore !== 'All' ? selectedStore : 'كل_المذاخر'}_شفر_${selectedMonth !== 'All' ? selectedMonth : 'كل_الاشهر'}_سنة_${selectedYear !== 'All' ? selectedYear : 'كل_السنوات'}`;
    exportReceiptsToExcel(filteredReceipts, `${filterLabel}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>سجل الوصولات</h1>
        
        <button onClick={handleExport} className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
          <FileDown size={20} />
          <span>تصدير المفلتر إلى Excel</span>
        </button>
      </div>

      {/* لوحة الفلاتر */}
      <div className="card mb-4" style={{ padding: '1.25rem' }}>
        <h3 className="flex items-center gap-4" style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          <Filter size={18} />
          خيارات التصفية والبحث
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* بحث نصي */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>البحث السريع:</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="بحث عن مذخر، مبلغ، ملاحظات..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingRight: '35px', width: '100%' }}
              />
            </div>
          </div>

          {/* فلتر المذخر */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>المذخر:</label>
            <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
              {uniqueStores.map(store => (
                <option key={store} value={store}>
                  {store === 'All' ? 'كل المذاخر' : store}
                </option>
              ))}
            </select>
          </div>

          {/* فلتر السنة */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>السنة:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="All">كل السنوات</option>
              {uniqueYears.filter(y => y !== 'All').map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* فلتر الشهر */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>الشهر:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ملخص الفلترة الحالية */}
      <div className="card mb-4" style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span>مجموع المبالغ المفلترة: </span>
          <strong className="text-danger" style={{ fontSize: '1.2rem' }}>{totalFilteredAmount.toLocaleString()} د.ع</strong>
        </div>
        <div className="text-muted">
          عدد الوصولات: {filteredReceipts.length}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-muted">جاري التحميل...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : filteredReceipts.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>اسم المذخر</th>
                  <th>قيمة الوصل</th>
                  <th>ملاحظات</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map(receipt => (
                  <tr key={receipt.id}>
                    <td>{receipt.date}</td>
                    <td style={{ fontWeight: 'bold' }}>{receipt.store_name}</td>
                    <td className="text-danger" style={{ fontWeight: 'bold' }}>{receipt.amount.toLocaleString()} د.ع</td>
                    <td className="text-muted">{receipt.notes || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleDelete(receipt.id)} 
                        className="btn btn-danger"
                        style={{ padding: '0.5rem', borderRadius: '6px' }}
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center" style={{ padding: '2rem 0' }}>لا توجد وصولات مطابقة للفلاتر المحددة.</p>
        )}
      </div>
    </div>
  );
};

export default ReceiptsList;

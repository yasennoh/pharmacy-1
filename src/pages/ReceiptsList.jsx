import React, { useState, useEffect } from 'react';
import { getReceipts, deleteReceipt, updateReceipt } from '../services/api';
import { exportReceiptsToExcel } from '../utils/excelExport';
import { Trash2, Edit2, Search, FileDown, Filter, X, Save, AlertTriangle } from 'lucide-react';

const ReceiptsList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // فلاتر البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // حالات نافذة التعديل
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    storeName: '',
    amount: '',
    date: '',
    notes: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // حالة نافذة التأكيد المخصصة (Custom Confirm Dialog)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'delete', // 'delete' or 'edit'
    title: '',
    message: '',
    onConfirm: () => {}
  });

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

  // فتح نافذة تأكيد الحذف
  const handleDeleteClick = (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'تأكيد حذف الوصل',
      message: '⚠️ تنبيه: هل أنت متأكد تماماً من رغبتك في حذف هذا الوصل نهائياً؟ لا يمكن التراجع عن هذه الخطوة.',
      onConfirm: () => executeDelete(id)
    });
  };

  const executeDelete = async (id) => {
    try {
      await deleteReceipt(id);
      setReceipts(receipts.filter(r => r.id !== id));
    } catch (err) {
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  // فتح مودال التعديل
  const openEditModal = (receipt) => {
    setEditFormData({
      id: receipt.id,
      storeName: receipt.store_name,
      amount: receipt.amount,
      date: receipt.date,
      notes: receipt.notes || ''
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  // فتح نافذة تأكيد التعديل قبل الحفظ
  const handleEditSubmitClick = (e) => {
    e.preventDefault();
    if (!editFormData.storeName || !editFormData.amount || !editFormData.date) {
      setEditError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'edit',
      title: 'تأكيد تعديل الوصل',
      message: 'هل أنت متأكد من رغبتك في حفظ التعديلات الجديدة على هذا الوصل؟',
      onConfirm: () => executeEdit()
    });
  };

  const executeEdit = async () => {
    setEditLoading(true);
    setEditError('');
    
    try {
      await updateReceipt(editFormData.id, editFormData);
      // تحديث البيانات محلياً في الصفحة
      setReceipts(receipts.map(r => 
        r.id === editFormData.id 
          ? { 
              ...r, 
              store_name: editFormData.storeName, 
              amount: parseFloat(editFormData.amount), 
              date: editFormData.date, 
              notes: editFormData.notes 
            } 
          : r
      ));
      setIsEditModalOpen(false);
    } catch (err) {
      setEditError('حدث خطأ أثناء حفظ التعديلات. حاول مجدداً.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => openEditModal(receipt)} 
                          className="btn btn-outline"
                          style={{ padding: '0.5rem', borderRadius: '6px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(receipt.id)} 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem', borderRadius: '6px' }}
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      {/* نافذة التعديل المنبثقة (Modal) */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content card">
            <div className="modal-header flex justify-between items-center mb-4">
              <h2 style={{ margin: 0 }}>تعديل بيانات الوصل</h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem', borderRadius: '50%' }} onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="text-danger mb-4" style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmitClick}>
              <div className="form-group">
                <label>اسم المذخر *</label>
                <input 
                  type="text" 
                  name="storeName" 
                  value={editFormData.storeName} 
                  onChange={handleEditChange} 
                  required
                />
              </div>

              <div className="form-group">
                <label>قيمة الوصل (بالدينار) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={editFormData.amount} 
                  onChange={handleEditChange} 
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>تاريخ الوصل *</label>
                <input 
                  type="date" 
                  name="date" 
                  value={editFormData.date} 
                  onChange={handleEditChange} 
                  required
                />
              </div>

              <div className="form-group">
                <label>ملاحظات</label>
                <textarea 
                  name="notes" 
                  value={editFormData.notes} 
                  onChange={handleEditChange} 
                  rows="3" 
                />
              </div>

              <div className="flex gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة التأكيد المخصصة بدقة عالية (Custom Confirmation Modal) */}
      {confirmDialog.isOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content card" style={{ maxWidth: '420px', textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '1rem', 
              borderRadius: '50%', 
              backgroundColor: confirmDialog.type === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
              color: confirmDialog.type === 'delete' ? 'var(--danger)' : 'var(--primary)',
              marginBottom: '1.5rem'
            }}>
              <AlertTriangle size={36} />
            </div>

            <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>{confirmDialog.title}</h3>
            
            <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {confirmDialog.message}
            </p>
            
            <div className="flex gap-4" style={{ justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                style={{ flex: 1 }}
              >
                إلغاء
              </button>
              <button 
                type="button" 
                className={`btn ${confirmDialog.type === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                }}
                style={{ flex: 1 }}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsList;

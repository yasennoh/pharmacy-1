import React, { useState, useEffect } from 'react';
import { getReceipts, deleteReceipt, updateReceipt } from '../services/api';
import { exportReceiptsToExcel } from '../utils/excelExport';
import { Trash2, Edit2, Search, FileDown, Filter, X, Save, AlertTriangle, CheckCircle, Clock, Check } from 'lucide-react';

const ReceiptsList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // فلاتر البحث والتصفية
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // حالات نافذة التعديل
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    storeName: '',
    amount: '',
    returns: '0',
    paidAmount: '0',
    date: '',
    notes: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // حالة نافذة التأكيد المخصصة (Custom Confirm Dialog)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'delete', // 'delete', 'edit', or 'settle'
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

  // فتح نافذة تأكيد التسديد الكامل للوصل
  const handleSettleClick = (receipt) => {
    const netAmount = receipt.amount - (receipt.returns || 0);
    setConfirmDialog({
      isOpen: true,
      type: 'settle',
      title: 'تأكيد سداد الوصل بالكامل',
      message: `هل أنت متأكد من رغبتك في سداد هذا الوصل بالكامل؟ سيتم دفع القيمة الصافية المتبقية (${(netAmount - (receipt.paid_amount || 0)).toLocaleString()} د.ع)، ويصبح هذا الوصل مسدداً بالكامل.`,
      onConfirm: () => executeSettle(receipt, netAmount)
    });
  };

  const executeSettle = async (receipt, netAmount) => {
    try {
      const updatedFields = {
        storeName: receipt.store_name,
        amount: receipt.amount,
        returns: receipt.returns || 0,
        paidAmount: netAmount, // تسديد القيمة الصافية كاملة
        date: receipt.date,
        notes: receipt.notes
      };
      
      await updateReceipt(receipt.id, updatedFields);
      
      // تحديث الحالة محلياً في الجدول
      setReceipts(receipts.map(r => 
        r.id === receipt.id ? { ...r, paid_amount: netAmount } : r
      ));
    } catch (err) {
      alert('حدث خطأ أثناء تسديد الفاتورة.');
    }
  };

  // فتح مودال التعديل
  const openEditModal = (receipt) => {
    setEditFormData({
      id: receipt.id,
      storeName: receipt.store_name,
      amount: receipt.amount,
      returns: receipt.returns || 0,
      paidAmount: receipt.paid_amount || 0,
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
      message: 'هل أنت متأكد من رغبتك في حفظ التعديلات الجديدة على هذا الوصل؟ سيتم تحديث الحسابات فوراً.',
      onConfirm: () => executeEdit()
    });
  };

  const executeEdit = async () => {
    setEditLoading(true);
    setEditError('');
    
    try {
      await updateReceipt(editFormData.id, editFormData);
      setReceipts(receipts.map(r => 
        r.id === editFormData.id 
          ? { 
              ...r, 
              store_name: editFormData.storeName, 
              amount: parseFloat(editFormData.amount), 
              returns: parseFloat(editFormData.returns || 0),
              paid_amount: parseFloat(editFormData.paidAmount || 0),
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
    
    const amt = receipt.amount || 0;
    const ret = receipt.returns || 0;
    const paid = receipt.paid_amount || 0;
    const remaining = amt - ret - paid;

    const matchesSearch = 
      receipt.store_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (receipt.notes && receipt.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      receipt.amount.toString().includes(searchTerm);

    const matchesStore = selectedStore === 'All' || receipt.store_name === selectedStore;
    const matchesYear = selectedYear === 'All' || year === selectedYear;
    const matchesMonth = selectedMonth === 'All' || month === selectedMonth;
    
    let matchesStatus = true;
    if (selectedStatus === 'paid') {
      matchesStatus = remaining <= 0;
    } else if (selectedStatus === 'partial') {
      matchesStatus = remaining > 0 && paid > 0;
    } else if (selectedStatus === 'unpaid') {
      matchesStatus = remaining > 0 && paid === 0;
    }

    return matchesSearch && matchesStore && matchesYear && matchesMonth && matchesStatus;
  });

  // حساب إجماليات البيانات المعروضة
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalReturns = filteredReceipts.reduce((sum, r) => sum + (r.returns || 0), 0);
  const totalPaid = filteredReceipts.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
  const totalRemaining = totalAmount - totalReturns - totalPaid;

  const handleExport = () => {
    if (filteredReceipts.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }
    const filterLabel = `تصدير_سجل_${selectedStore !== 'All' ? selectedStore : 'كل_المذاخر'}_شفر_${selectedMonth !== 'All' ? selectedMonth : 'كل_الاشهر'}_سنة_${selectedYear !== 'All' ? selectedYear : 'كل_السنوات'}`;
    exportReceiptsToExcel(filteredReceipts, `${filterLabel}.xlsx`);
  };

  // دالة لتوليد شارة حالة السداد بشكل جميل
  const renderStatusBadge = (amount, returnsVal, paidVal) => {
    const remaining = amount - (returnsVal || 0) - (paidVal || 0);
    if (remaining <= 0) {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', 
          color: 'var(--success)' 
        }}>
          <CheckCircle size={12} />
          مسدد بالكامل
        </span>
      );
    } else if (paidVal > 0) {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold',
          backgroundColor: 'rgba(245, 158, 11, 0.1)', 
          color: '#D97706' 
        }}>
          <Clock size={12} />
          مسدد جزئياً
        </span>
      );
    } else {
      return (
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          padding: '0.25rem 0.5rem', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold',
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--danger)' 
        }}>
          <AlertTriangle size={12} />
          غير مسدد
        </span>
      );
    }
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* بحث نصي */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>البحث السريع:</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="مذخر، مبلغ، ملاحظات..." 
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

          {/* فلتر حالة السداد */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>حالة السداد:</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">كل الفواتير</option>
              <option value="paid">مسدد بالكامل</option>
              <option value="partial">مسدد جزئياً</option>
              <option value="unpaid">غير مسدد</option>
            </select>
          </div>
        </div>
      </div>

      {/* ملخص الفلترة الحالية */}
      <div className="card mb-4" style={{ padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'center' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>المبلغ الإجمالي: </span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{totalAmount.toLocaleString()} د.ع</div>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>إجمالي الراجع: </span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-muted)' }}>{totalReturns.toLocaleString()} د.ع</div>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>إجمالي المسدد: </span>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--success)' }}>{totalPaid.toLocaleString()} د.ع</div>
        </div>
        <div>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>الدين المتبقي: </span>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--danger)' }}>{totalRemaining.toLocaleString()} د.ع</div>
        </div>
        <div style={{ textAlign: 'left', fontWeight: '600' }}>
          عدد الفواتير: {filteredReceipts.length}
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
                  <th>الراجع</th>
                  <th>المسدد</th>
                  <th>المتبقي</th>
                  <th>الحالة</th>
                  <th>ملاحظات</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map(receipt => {
                  const amt = receipt.amount || 0;
                  const ret = receipt.returns || 0;
                  const paid = receipt.paid_amount || 0;
                  const remaining = amt - ret - paid;

                  return (
                    <tr key={receipt.id}>
                      <td>{receipt.date}</td>
                      <td style={{ fontWeight: 'bold' }}>{receipt.store_name}</td>
                      <td>{amt.toLocaleString()} د.ع</td>
                      <td style={{ color: 'var(--text-muted)' }}>{ret > 0 ? `${ret.toLocaleString()} د.ع` : '-'}</td>
                      <td className="text-success">{paid > 0 ? `${paid.toLocaleString()} د.ع` : '-'}</td>
                      <td style={{ fontWeight: 'bold', color: remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {remaining.toLocaleString()} د.ع
                      </td>
                      <td>{renderStatusBadge(amt, ret, paid)}</td>
                      <td className="text-muted" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={receipt.notes}>
                        {receipt.notes || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {remaining > 0 && (
                            <button 
                              onClick={() => handleSettleClick(receipt)} 
                              className="btn btn-outline"
                              style={{ 
                                padding: '0.4rem 0.6rem', 
                                borderRadius: '6px', 
                                borderColor: 'var(--success)', 
                                color: 'var(--success)',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem'
                              }}
                              title="تسديد الفاتورة بالكامل"
                            >
                              <Check size={14} />
                              تسديد
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(receipt)} 
                            className="btn btn-outline"
                            style={{ padding: '0.4rem', borderRadius: '6px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            title="تعديل"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(receipt.id)} 
                            className="btn btn-danger"
                            style={{ padding: '0.4rem', borderRadius: '6px' }}
                            title="حذف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
          <div className="modal-content card" style={{ maxWidth: '600px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>قيمة الوصل الأساسية *</label>
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
                  <label>الراجع / المردود</label>
                  <input 
                    type="number" 
                    name="returns" 
                    value={editFormData.returns} 
                    onChange={handleEditChange} 
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>المبلغ المسدد (المدفوع)</label>
                  <input 
                    type="number" 
                    name="paidAmount" 
                    value={editFormData.paidAmount} 
                    onChange={handleEditChange} 
                    min="0"
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

              {/* الحسبة الحية للمعاينة في المودال */}
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold' }}>معاينة الحساب المعدل: </span>
                المتبقي (الدين): <strong style={{ color: (editFormData.amount - (editFormData.returns || 0) - (editFormData.paidAmount || 0)) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {(editFormData.amount - (editFormData.returns || 0) - (editFormData.paidAmount || 0)).toLocaleString()} د.ع
                </strong>
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
              backgroundColor: confirmDialog.type === 'delete' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
              color: confirmDialog.type === 'delete' ? 'var(--danger)' : 'var(--success)',
              marginBottom: '1.5rem'
            }}>
              {confirmDialog.type === 'delete' ? <AlertTriangle size={36} /> : <CheckCircle size={36} />}
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

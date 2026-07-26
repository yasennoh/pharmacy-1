import React, { useState, useEffect } from 'react';
import { addReceipt, getReceipts } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Save, Plus } from 'lucide-react';

const AddReceipt = () => {
  const navigate = useNavigate();
  const [existingStores, setExistingStores] = useState([]);
  
  // حقول النموذج
  const [storeSelection, setStoreSelection] = useState('last'); // 'last', 'existing', or 'new'
  const [customStoreName, setCustomStoreName] = useState('');
  const [formData, setFormData] = useState({
    storeName: '',
    amount: '',
    returns: '0',
    paidAmount: '0',
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStores();
    
    // تحميل آخر مذخر تم إدخاله من localStorage
    const savedStore = localStorage.getItem('last_store_name');
    if (savedStore) {
      setFormData(prev => ({ ...prev, storeName: savedStore }));
      setStoreSelection('last');
    } else {
      setStoreSelection('new');
    }
  }, []);

  const fetchStores = async () => {
    try {
      const receipts = await getReceipts();
      const uniqueStores = [...new Set(receipts.map(r => r.store_name))];
      setExistingStores(uniqueStores);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  const handleSelectionChange = (e) => {
    const value = e.target.value;
    setStoreSelection(value);
    
    if (value === 'last') {
      const savedStore = localStorage.getItem('last_store_name') || '';
      setFormData(prev => ({ ...prev, storeName: savedStore }));
    } else if (value === 'existing') {
      setFormData(prev => ({ ...prev, storeName: existingStores[0] || '' }));
    } else if (value === 'new') {
      setFormData(prev => ({ ...prev, storeName: customStoreName }));
    }
  };

  const handleExistingStoreChange = (e) => {
    setFormData(prev => ({ ...prev, storeName: e.target.value }));
  };

  const handleCustomStoreChange = (e) => {
    const value = e.target.value;
    setCustomStoreName(value);
    setFormData(prev => ({ ...prev, storeName: value }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeName || !formData.amount || !formData.date) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await addReceipt(formData);
      setSuccess(true);
      
      // حفظ اسم المذخر الأخير في localStorage
      localStorage.setItem('last_store_name', formData.storeName);
      
      // إعادة تعيين الحقول مع الحفاظ على اسم المذخر
      setFormData({
        storeName: formData.storeName,
        amount: '',
        returns: '0',
        paidAmount: '0',
        date: new Date().toISOString().slice(0, 10),
        notes: ''
      });
      
      setCustomStoreName('');
      setStoreSelection('last');
      fetchStores(); // تحديث المذاخر المتوفرة بالقائمة
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // العمليات الحسابية الفورية للمعاينة
  const rawAmount = parseFloat(formData.amount) || 0;
  const rawReturns = parseFloat(formData.returns) || 0;
  const rawPaid = parseFloat(formData.paidAmount) || 0;
  const netInvoice = rawAmount - rawReturns;
  const remainingDebt = netInvoice - rawPaid;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="page-title">إضافة وصل جديد</h1>

      <div className="card">
        {error && <div className="text-danger mb-4" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {success && <div className="text-success mb-4" style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>تم حفظ الوصل بنجاح!</div>}

        <form onSubmit={handleSubmit}>
          {/* قسم اختيار المذخر الذكي */}
          <div className="form-group">
            <label>اسم المذخر *</label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              {localStorage.getItem('last_store_name') && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="storeSelection" 
                    value="last" 
                    checked={storeSelection === 'last'} 
                    onChange={handleSelectionChange} 
                  />
                  <span>المذخر الأخير ({localStorage.getItem('last_store_name')})</span>
                </label>
              )}

              {existingStores.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="storeSelection" 
                    value="existing" 
                    checked={storeSelection === 'existing'} 
                    onChange={handleSelectionChange} 
                  />
                  <span>اختر من المذاخر السابقة</span>
                </label>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="storeSelection" 
                  value="new" 
                  checked={storeSelection === 'new'} 
                  onChange={handleSelectionChange} 
                />
                <span>كتابة اسم مذخر جديد</span>
              </label>
            </div>

            {/* إدخال المذخر بناءً على الاختيار */}
            {storeSelection === 'existing' && existingStores.length > 0 && (
              <select value={formData.storeName} onChange={handleExistingStoreChange}>
                {existingStores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            )}

            {storeSelection === 'new' && (
              <input 
                type="text" 
                value={customStoreName} 
                onChange={handleCustomStoreChange} 
                placeholder="اكتب اسم المذخر الجديد هنا..." 
                required
              />
            )}
            
            {storeSelection === 'last' && (
              <input 
                type="text" 
                value={formData.storeName} 
                disabled 
                style={{ backgroundColor: 'var(--border-color)', cursor: 'not-allowed' }}
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>قيمة الوصل الأساسية *</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                placeholder="مثال: 150000" 
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>الراجع / المردود (إن وجد)</label>
              <input 
                type="number" 
                name="returns" 
                value={formData.returns} 
                onChange={handleChange} 
                placeholder="قيمة المرجعات لخصمها" 
                min="0"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>المبلغ المسدد (المدفوع حالياً)</label>
              <input 
                type="number" 
                name="paidAmount" 
                value={formData.paidAmount} 
                onChange={handleChange} 
                placeholder="المبلغ المدفوع للوصل" 
                min="0"
              />
            </div>

            <div className="form-group">
              <label>تاريخ الوصل *</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>ملاحظات إضافية</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="3" 
              placeholder="أي ملاحظات حول الطلبية أو الراجع..."
            />
          </div>

          {/* لوحة حساب الفاتورة الحية لمعاينة الحسابات قبل الحفظ */}
          <div className="card mb-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px dashed var(--primary)', padding: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>معاينة حساب الفاتورة قبل الحفظ:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
              <div className="flex justify-between">
                <span>المبلغ الكلي:</span>
                <span>{rawAmount.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>الخصم / الراجع:</span>
                <span>- {rawReturns.toLocaleString()} د.ع</span>
              </div>
              <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
              <div className="flex justify-between" style={{ fontWeight: 'bold' }}>
                <span>صافي الفاتورة:</span>
                <span>{netInvoice.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-success">
                <span>المسدد:</span>
                <span>{rawPaid.toLocaleString()} د.ع</span>
              </div>
              <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }} />
              <div className="flex justify-between" style={{ fontWeight: 'bold', color: remainingDebt > 0 ? 'var(--danger)' : 'var(--success)' }}>
                <span>المتبقي في الذمة (الدين):</span>
                <span>{remainingDebt.toLocaleString()} د.ع</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            <Save size={20} />
            {loading ? 'جاري الحفظ...' : 'حفظ الوصل'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReceipt;

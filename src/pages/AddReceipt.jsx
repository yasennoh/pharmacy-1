import React, { useState } from 'react';
import { addReceipt } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';

const AddReceipt = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storeName: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setFormData({
        storeName: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        notes: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">إضافة وصل جديد</h1>

      <div className="card">
        {error && <div className="text-danger mb-4" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {success && <div className="text-success mb-4" style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>تم حفظ الوصل بنجاح!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المذخر *</label>
            <input 
              type="text" 
              name="storeName" 
              value={formData.storeName} 
              onChange={handleChange} 
              placeholder="مثال: مذخر بغداد" 
              required
            />
          </div>

          <div className="form-group">
            <label>قيمة الوصل (بالدينار) *</label>
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
            <label>تاريخ الوصل *</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="form-group">
            <label>ملاحظات إضافية (اختياري)</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="3" 
              placeholder="أي ملاحظات حول الطلبية..."
            />
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

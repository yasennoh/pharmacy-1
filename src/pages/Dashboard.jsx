import React, { useState, useEffect } from 'react';
import { getReceipts } from '../services/api';
import { DollarSign, Building2, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getReceipts();
      setReceipts(data || []);
    } catch (err) {
      setError('تعذر جلب البيانات. يرجى التأكد من إعدادات قاعدة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(r => r.date.startsWith(selectedMonth));
  
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const uniqueStores = [...new Set(filteredReceipts.map(r => r.store_name))].length;

  const storesTotal = filteredReceipts.reduce((acc, curr) => {
    acc[curr.store_name] = (acc[curr.store_name] || 0) + curr.amount;
    return acc;
  }, {});

  if (loading) return <div className="page-title">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>لوحة التحكم والتقارير</h1>
        <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center' }}>
          <label style={{ margin: 0 }}>اختر الشهر:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
          />
        </div>
      </div>

      {error && <div className="card text-danger mb-4">{error}</div>}

      <div className="grid grid-cols-3 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-muted">الإجمالي الكلي للشهر</p>
            <h2 style={{ marginBottom: 0 }}>{totalAmount.toLocaleString()} د.ع</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '50%' }}>
            <Building2 size={32} />
          </div>
          <div>
            <p className="text-muted">عدد المذاخر المتعامل معها</p>
            <h2 style={{ marginBottom: 0 }}>{uniqueStores} مذخر</h2>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '50%' }}>
            <Calendar size={32} />
          </div>
          <div>
            <p className="text-muted">عدد الوصولات</p>
            <h2 style={{ marginBottom: 0 }}>{filteredReceipts.length} وصل</h2>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <h2 className="flex items-center gap-4 mb-4"><TrendingUp /> تفاصيل المذاخر لهذا الشهر</h2>
        {Object.keys(storesTotal).length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>اسم المذخر</th>
                  <th>إجمالي المبلغ المطلوب</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(storesTotal)
                  .sort((a, b) => b[1] - a[1])
                  .map(([store, total]) => (
                  <tr key={store}>
                    <td style={{ fontWeight: 'bold' }}>{store}</td>
                    <td className="text-danger" style={{ fontWeight: 'bold' }}>{total.toLocaleString()} د.ع</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted">لا توجد بيانات لهذا الشهر.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

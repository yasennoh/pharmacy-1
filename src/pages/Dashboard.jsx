import React, { useState, useEffect } from 'react';
import { getReceipts } from '../services/api';
import { exportDashboardToExcel } from '../utils/excelExport';
import { DollarSign, Building2, TrendingUp, Calendar, FileDown, CheckCircle, Clock, CreditCard } from 'lucide-react';

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
      setError('تعذر جلب البيانات. يرجى التأكد من إعدادات قاعدة البيانات وتحديث الجداول.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(r => r.date.startsWith(selectedMonth));
  
  // حساب الإحصائيات الشهرية
  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalReturns = filteredReceipts.reduce((sum, r) => sum + (r.returns || 0), 0);
  const totalPaid = filteredReceipts.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
  const totalRemaining = totalAmount - totalReturns - totalPaid;
  const uniqueStores = [...new Set(filteredReceipts.map(r => r.store_name))].length;

  // جرد حساب كل مذخر للشهر المحدد
  const storesSummary = filteredReceipts.reduce((acc, curr) => {
    const store = curr.store_name;
    if (!acc[store]) {
      acc[store] = { invoices: 0, returns: 0, paid: 0, remaining: 0 };
    }
    acc[store].invoices += curr.amount;
    acc[store].returns += curr.returns || 0;
    acc[store].paid += curr.paid_amount || 0;
    acc[store].remaining += (curr.amount - (curr.returns || 0) - (curr.paid_amount || 0));
    return acc;
  }, {});

  const handleExportExcel = () => {
    if (filteredReceipts.length === 0) {
      alert('لا توجد بيانات لتصديرها لهذا الشهر.');
      return;
    }
    exportDashboardToExcel(selectedMonth, storesSummary, filteredReceipts);
  };

  if (loading) return <div className="page-title">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>لوحة التحكم والتقارير</h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ margin: 0 }}>اختر الشهر:</label>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
            />
          </div>

          <button onClick={handleExportExcel} className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
            <FileDown size={20} />
            <span>تحميل تقرير Excel المالي</span>
          </button>
        </div>
      </div>

      {error && <div className="card text-danger mb-4">{error}</div>}

      {/* بطاقات الإحصائيات المتقدمة */}
      <div className="grid grid-cols-3 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* إجمالي الفواتير */}
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>إجمالي الفواتير</p>
            <h3 style={{ marginBottom: 0, fontSize: '1.2rem' }}>{totalAmount.toLocaleString()} د.ع</h3>
          </div>
        </div>

        {/* المردودات (الراجع) */}
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--text-muted)', color: 'white', borderRadius: '50%', display: 'flex' }}>
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>إجمالي الراجع (الخصم)</p>
            <h3 style={{ marginBottom: 0, fontSize: '1.2rem' }}>{totalReturns.toLocaleString()} د.ع</h3>
          </div>
        </div>

        {/* المسدد */}
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '50%', display: 'flex' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>إجمالي المبالغ المسددة</p>
            <h3 style={{ marginBottom: 0, fontSize: '1.2rem', color: 'var(--success)' }}>{totalPaid.toLocaleString()} د.ع</h3>
          </div>
        </div>

        {/* الدين المتبقي */}
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '50%', display: 'flex' }}>
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>إجمالي الديون المتبقية</p>
            <h3 style={{ marginBottom: 0, fontSize: '1.25rem', color: 'var(--danger)', fontWeight: 'bold' }}>{totalRemaining.toLocaleString()} د.ع</h3>
          </div>
        </div>
      </div>

      {/* جدول تلخيص حسابات المذاخر */}
      <div className="card mt-4">
        <h2 className="flex items-center gap-4 mb-4"><TrendingUp /> كشف حساب المذاخر لشهر ({selectedMonth})</h2>
        {Object.keys(storesSummary).length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>اسم المذخر</th>
                  <th>إجمالي قيمة الفواتير</th>
                  <th>إجمالي قيمة الراجع</th>
                  <th>إجمالي المبالغ المسددة</th>
                  <th>الدين المتبقي بذمتكم</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(storesSummary)
                  .sort((a, b) => b[1].remaining - a[1].remaining)
                  .map(([store, summary]) => (
                  <tr key={store}>
                    <td style={{ fontWeight: 'bold' }}>{store}</td>
                    <td>{summary.invoices.toLocaleString()} د.ع</td>
                    <td style={{ color: 'var(--text-muted)' }}>{summary.returns > 0 ? `${summary.returns.toLocaleString()} د.ع` : '-'}</td>
                    <td className="text-success">{summary.paid > 0 ? `${summary.paid.toLocaleString()} د.ع` : '-'}</td>
                    <td style={{ fontWeight: 'bold', color: summary.remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {summary.remaining.toLocaleString()} د.ع
                    </td>
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

import React, { useState, useEffect } from 'react';
import { getReceipts, deleteReceipt } from '../services/api';
import { Trash2, Search } from 'lucide-react';

const ReceiptsList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredReceipts = receipts.filter(r => 
    r.store_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.date.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title" style={{ marginBottom: 0 }}>سجل الوصولات</h1>
        <div className="form-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="بحث عن مذخر أو تاريخ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '35px', width: '300px' }}
          />
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
          <p className="text-muted text-center" style={{ padding: '2rem 0' }}>لا توجد وصولات مطابقة للبحث.</p>
        )}
      </div>
    </div>
  );
};

export default ReceiptsList;

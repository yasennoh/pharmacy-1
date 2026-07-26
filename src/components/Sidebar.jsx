import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, List, Moon, Sun, Pill, LogOut, X } from 'lucide-react';
import { signOut } from '../services/api';

const Sidebar = ({ theme, toggleTheme, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      try {
        await signOut();
        navigate('/login');
      } catch (err) {
        alert('حدث خطأ أثناء تسجيل الخروج.');
      }
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <Pill size={32} />
          <span>نظام الصيدلية</span>
        </div>
        {/* زر إغلاق القائمة (يظهر على الهواتف فقط عبر CSS) */}
        <button className="btn btn-outline mobile-close-btn" onClick={onClose} style={{ padding: '0.25rem', borderRadius: '50%' }}>
          <X size={20} />
        </button>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>لوحة التحكم</span>
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FilePlus size={20} />
          <span>إضافة وصل</span>
        </NavLink>
        <NavLink to="/receipts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <List size={20} />
          <span>سجل الوصولات</span>
        </NavLink>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
        <button onClick={toggleTheme} className="btn btn-outline" style={{ width: '100%' }}>
          {theme === 'light' ? (
            <><Moon size={20} /> الوضع الليلي</>
          ) : (
            <><Sun size={20} /> الوضع النهاري</>
          )}
        </button>

        <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', gap: '0.5rem' }}>
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

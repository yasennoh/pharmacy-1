import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, List, Moon, Sun, Pill, LogOut } from 'lucide-react';
import { signOut } from '../services/api';

const Sidebar = ({ theme, toggleTheme }) => {
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
    <aside className="sidebar">
      <div className="flex items-center gap-4 mb-4" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Pill size={32} />
        <span>نظام الصيدلية</span>
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

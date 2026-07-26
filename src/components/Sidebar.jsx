import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, List, Moon, Sun, Pill } from 'lucide-react';

const Sidebar = ({ theme, toggleTheme }) => {
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

      <button onClick={toggleTheme} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }}>
        {theme === 'light' ? (
          <><Moon size={20} /> الوضع الليلي</>
        ) : (
          <><Sun size={20} /> الوضع النهاري</>
        )}
      </button>
    </aside>
  );
};

export default Sidebar;

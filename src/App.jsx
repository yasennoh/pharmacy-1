import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddReceipt from './pages/AddReceipt';
import ReceiptsList from './pages/ReceiptsList';
import Login from './pages/Login';
import { onAuthStateChange, getCurrentUser } from './services/api';
import { Menu, Pill } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // إغلاق القائمة الجانبية تلقائياً عند تغيير الصفحة (لشاشات الهاتف)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    getCurrentUser().then(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    const subscription = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/login');
      } else if (window.location.pathname === '/login') {
        navigate('/');
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <h3>جاري التحميل...</h3>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login onLoginSuccess={(u) => { setUser(u); navigate('/'); }} />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* الشريط العلوي للهاتف (يظهر فقط على الشاشات الصغيرة عبر CSS) */}
      <header className="mobile-header">
        <button className="btn btn-outline mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-4" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
          <Pill size={24} />
          <span>نظام الصيدلية</span>
        </div>
      </header>

      {/* خلفية معتمة عند فتح القائمة على الهاتف لإغلاقها بالنقر في أي مكان */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <Sidebar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddReceipt />} />
          <Route path="/receipts" element={<ReceiptsList />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AddReceipt from './pages/AddReceipt';
import ReceiptsList from './pages/ReceiptsList';
import Login from './pages/Login';
import { onAuthStateChange, getCurrentUser } from './services/api';

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // التحقق من الجلسة الحالية عند تحميل التطبيق
    getCurrentUser().then(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    // الاستماع لأي تغيير في حالة تسجيل الدخول
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

  // إذا لم يكن المستخدم مسجلاً، اعرض واجهة تسجيل الدخول فقط
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login onLoginSuccess={(u) => { setUser(u); navigate('/'); }} />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
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

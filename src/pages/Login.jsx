import React, { useState } from 'react';
import { signIn } from '../services/api';
import { LogIn, Lock, Mail } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await signIn(email, password);
      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError('خطأ في تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card card">
        <div className="login-header">
          <div className="login-icon">
            <Lock size={32} />
          </div>
          <h2>تسجيل الدخول للنظام</h2>
          <p className="text-muted">نظام إدارة وصولات الصيدلية</p>
        </div>

        {error && (
          <div className="text-danger mb-4" style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon-left" />
              <input 
                type="email" 
                placeholder="example@mail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon-left" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            <LogIn size={20} />
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

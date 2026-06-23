import { useEffect, useState } from 'react';
import { API_BASE_URL as API } from '../config/api';

export default function GoogleCallback() {
  const [status, setStatus] = useState('Memproses login Google...');

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const callbackUrl = `${window.location.origin}/auth/google/callback`;

    if (error) {
      setStatus('Login dibatalkan.');
      setTimeout(() => window.location.replace('/login'), 1500);
      return;
    }

    if (!code) {
      window.location.replace('/');
      return;
    }

    fetch(`${API}/auth/google/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: callbackUrl }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          window.dispatchEvent(new Event('userLoggedIn'));

          const returnPath = sessionStorage.getItem('google_auth_return') || '/';
          sessionStorage.removeItem('google_auth_return');

          const dest = data.user.role === 'admin' ? '/dashboard'
            : data.user.role === 'tenant' ? '/tenant-dashboard'
            : '/';

          window.location.replace(dest);
        } else if (data.needs_completion) {
          sessionStorage.setItem('google_completion_data', JSON.stringify(data.google_data));
          window.location.replace('/login?complete=google');
        } else {
          setStatus(data.message || 'Login gagal.');
          setTimeout(() => window.location.replace('/login'), 2000);
        }
      })
      .catch(() => {
        setStatus('Tidak dapat terhubung ke server.');
        setTimeout(() => window.location.replace('/login'), 2000);
      });
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'sans-serif', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 40 }}>🔐</div>
      <div style={{
        width: 40, height: 40, border: '3px solid #e5e7eb',
        borderTop: '3px solid #dc2626', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

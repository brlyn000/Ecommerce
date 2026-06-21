import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006/api';

export default function GoogleCallback() {
  const [status, setStatus] = useState('Memproses login...');

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const callbackUrl = `${window.location.origin}/auth/google/callback`;

    console.log('[GoogleCallback] code:', code, 'error:', error);

    if (error) {
      setStatus(`Login dibatalkan.`);
      window.opener?.postMessage({ type: 'GOOGLE_AUTH_CODE', error }, window.location.origin);
      return;
    }

    if (!code) {
      setStatus('Tidak ada kode dari Google.');
      return;
    }

    if (window.opener) {
      // Popup — kirim ke parent
      window.opener.postMessage({ type: 'GOOGLE_AUTH_CODE', code }, window.location.origin);
      setStatus('Berhasil!');
      return;
    }

    // Tab biasa — proses langsung
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
          if (data.user.role === 'tenant') window.location.replace('/tenant-dashboard');
          else if (data.user.role === 'admin') window.location.replace('/dashboard');
          else window.location.replace(localStorage.getItem('lastVisitedPage') || '/');
        } else if (data.needs_completion) {
          sessionStorage.setItem('google_completion_data', JSON.stringify(data.google_data));
          window.location.replace('/login?complete=google');
        } else {
          setStatus(data.message || 'Login gagal.');
        }
      })
      .catch(() => setStatus('Tidak dapat terhubung ke server.'));
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'sans-serif', flexDirection: 'column', gap: 12
    }}>
      <div style={{ fontSize: 32 }}>🔐</div>
      <p style={{ color: '#555' }}>{status}</p>
    </div>
  );
}

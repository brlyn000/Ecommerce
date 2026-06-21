import { useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5006/api';

// Global flag — hanya satu proses Google auth yang boleh berjalan
let _activeHandler = null;

export function useGoogleAuth({ onSuccess, onNeedsCompletion, onError }) {
  const signIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError('Google Client ID belum dikonfigurasi.');
      return;
    }

    // Batalkan listener sebelumnya jika ada
    if (_activeHandler) {
      window.removeEventListener('message', _activeHandler);
      _activeHandler = null;
    }

    const callbackUrl = `${window.location.origin}/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });

    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'google-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes`
    );

    if (!popup) {
      onError('Popup diblokir browser. Izinkan popup untuk situs ini.');
      return;
    }

    let processed = false;

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'GOOGLE_AUTH_CODE') return;
      if (processed) return;
      processed = true;

      window.removeEventListener('message', handleMessage);
      _activeHandler = null;
      if (!popup.closed) popup.close();

      const { code, error } = event.data;
      if (error) { onError(`Google error: ${error}`); return; }
      if (!code) { onError('Tidak ada kode dari Google'); return; }

      try {
        const res = await fetch(`${API}/auth/google/code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: callbackUrl }),
        });
        const data = await res.json();
        if (!res.ok) { onError(data.message || 'Google login gagal'); return; }
        if (data.needs_completion) onNeedsCompletion(data.google_data);
        else onSuccess(data);
      } catch {
        onError('Tidak dapat terhubung ke server');
      }
    };

    _activeHandler = handleMessage;
    window.addEventListener('message', handleMessage);

    const pollInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollInterval);
        if (!processed) {
          window.removeEventListener('message', handleMessage);
          _activeHandler = null;
        }
      }
    }, 500);

    setTimeout(() => {
      clearInterval(pollInterval);
      if (!processed) {
        window.removeEventListener('message', handleMessage);
        _activeHandler = null;
        if (!popup.closed) popup.close();
      }
    }, 5 * 60 * 1000);
  }, [onSuccess, onNeedsCompletion, onError]);

  return { signIn, isConfigured: !!GOOGLE_CLIENT_ID };
}

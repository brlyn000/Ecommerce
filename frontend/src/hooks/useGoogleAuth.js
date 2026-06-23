import { useCallback } from 'react';
import { API_BASE_URL as API } from '../config/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function useGoogleAuth({ onSuccess, onNeedsCompletion, onError }) {
  const signIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      onError('Google Client ID belum dikonfigurasi.');
      return;
    }

    const callbackUrl = `${window.location.origin}/auth/google/callback`;

    // Simpan halaman saat ini untuk redirect kembali setelah login
    sessionStorage.setItem('google_auth_return', window.location.pathname);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });

    // Redirect langsung (bukan popup) — paling reliable di semua browser
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }, [onSuccess, onNeedsCompletion, onError]);

  return { signIn, isConfigured: !!GOOGLE_CLIENT_ID };
}

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Callback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const fetchToken = async () => {
      const code = params.get('code');
      const verifier = localStorage.getItem('pkce_verifier');

      if (!code || !verifier) {
        console.error('Missing code or verifier');
        return;
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
        code_verifier: verifier,
      });

      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        router.push('/dashboard');
      } else {
        console.error('Failed to get access token', data);
      }
    };

    fetchToken();
  }, [params, router]);

  return <p className="p-4">Logging you in...</p>;
}

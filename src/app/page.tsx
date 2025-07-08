'use client';

import { generateCodeVerifier, generateCodeChallenge } from '@/utils/pcke'
import queryString from 'query-string';

export default function Home() {
  const login = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('pkce_verifier', verifier);

    const params = queryString.stringify({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      response_type: 'code',
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
      scope: process.env.NEXT_PUBLIC_SCOPES!,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params}`;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Spotify History</h1>
      <button
        onClick={login}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
      >
        Log in with Spotify
      </button>
    </main>
  );
}

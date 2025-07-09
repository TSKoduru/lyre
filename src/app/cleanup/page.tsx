'use client';

import { useEffect, useState } from 'react';
import { fetchUserId, deleteRecentPlaylists } from '@/utils/spotify';

export default function Cleanup() {
  const [status, setStatus] = useState('Starting cleanup...');

  useEffect(() => {
    async function go() {
      try {
        setStatus('Getting user ID...');
        const userId = await fetchUserId();

        setStatus('Deleting recent playlists...');
        await deleteRecentPlaylists(userId);

        setStatus('✅ Cleanup complete! Check your Spotify playlists.');
      } catch (err) {
        console.error('❌ Error during cleanup:', err);
        setStatus('❌ Error during cleanup. See console.');
      }
    }

    go();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Spotify Playlist Cleanup</h1>
      <p>{status}</p>
    </div>
  );
}

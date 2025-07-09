'use client';

import { useEffect, useState } from 'react';
import {
  fetchAllLikedTracks,
  groupTracksByMonth,
  fetchUserId,
  findExistingPlaylist,
  createPlaylist,
  clearPlaylist,
  addTracksToPlaylist,
  sleep,
} from '@/utils/spotify';

export default function Dashboard() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    async function go() {
      try {
        setStatus('Fetching liked tracks...');
        const tracks = await fetchAllLikedTracks();

        setStatus('Grouping by month...');
        const grouped = groupTracksByMonth(tracks);

        setStatus('Getting user ID...');
        const userId = await fetchUserId();

        for (const [month, monthTracks] of Object.entries(grouped)) {
          const playlistName = `${month}`;

          setStatus(`Checking for existing playlist: ${playlistName}`);
          let playlistId = await findExistingPlaylist(userId, playlistName);

          if (playlistId) {
            setStatus(`Clearing existing playlist: ${playlistName}`);
            await clearPlaylist(playlistId);
          } else {
            setStatus(`Creating playlist: ${playlistName}`);
            playlistId = await createPlaylist(userId, playlistName);
          }

          const uris = monthTracks.map((track: any) => track.uri);
          setStatus(`Adding ${uris.length} tracks to ${playlistName}`);
          await addTracksToPlaylist(playlistId, uris);

          await sleep(1000); // rate limit buffer
        }

        setStatus('✅ Done! Check your Spotify playlists.');
      } catch (err) {
        console.error('❌ Error in playlist generation:', err);
        setStatus('❌ Something went wrong. Check the console.');
      }
    }

    go();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Spotify History Builder</h1>
      <p>{status}</p>
    </div>
  );
}

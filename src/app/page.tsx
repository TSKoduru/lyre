'use client';

import { useState } from 'react';
import {
  fetchAllLikedTracks,
  groupTracksByMonth,
  fetchUserId,
  findExistingPlaylist,
  clearPlaylist,
  createPlaylist,
  addTracksToPlaylist,
  sleep,
} from '@/utils/spotify';

export default function Dashboard() {
  const [status, setStatus] = useState('Idle');
  const [started, setStarted] = useState(false);

  const run = async () => {
    setStarted(true);
    try {
      setStatus('Fetching liked tracks...');
      const tracks = await fetchAllLikedTracks();

      setStatus('Grouping by month...');
      const grouped = groupTracksByMonth(tracks);

      setStatus('Getting user ID...');
      const userId = await fetchUserId();

      for (const [month, monthTracks] of Object.entries(grouped)) {
        const playlistName = `${month}`;
        setStatus(`Checking for playlist: ${playlistName}`);

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

        await sleep(1000);
      }

      setStatus('✅ Done! Check your Spotify playlists.');
    } catch (err) {
      console.error('❌ Error:', err);
      setStatus('❌ Something went wrong. See console.');
    }
  };

  return (
    <div className="p-6 flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Spotify History Builder</h1>
      {!started && (
        <button
          onClick={run}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Start Creating Playlists
        </button>
      )}
      <p className="text-sm text-gray-700">{status}</p>
    </div>
  );
}

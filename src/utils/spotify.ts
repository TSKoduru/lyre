const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

function getToken() {
  return localStorage.getItem('spotify_access_token')!;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchAllLikedTracks(): Promise<any[]> {
    const tracks: any[] = [];
    let url = `${SPOTIFY_API_BASE}/me/tracks?limit=50`;
    
    while (url) {
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
      tracks.push(...data.items);
      url = data.next;
    }
  
    return tracks;
  }

  export function groupTracksByMonth(tracks: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
  
    for (const item of tracks) {
      const date = new Date(item.added_at);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item.track);
    }
  
    return groups;
  }
  
  export async function createPlaylist(userId: string, name: string): Promise<string> {
    const res = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name,
        description: 'Generated from liked songs',
        public: false,
      }),
    });
    const data = await res.json();
    return data.id; 
  }
  
  export async function addTracksToPlaylist(playlistId: string, uris: string[]) {
    const chunkSize = 100;
    for (let i = 0; i < uris.length; i += chunkSize) {
      const chunk = uris.slice(i, i + chunkSize);
      await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ uris: chunk }),
      });
    }
  }

  export async function fetchUserId(): Promise<string> {
    const res = await fetch(`${SPOTIFY_API_BASE}/me`, { headers: authHeaders() });
    const data = await res.json();
    return data.id;
  }
  
  export async function deleteRecentPlaylists(userId: string): Promise<void> {
    let url = `${SPOTIFY_API_BASE}/me/playlists?limit=50`;    ;
  
    const pattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b \d{4}/;
  
    let page = 1;
  
    while (url) {
      console.log(`📄 Fetching page ${page++} of playlists...`);
      const res = await fetch(url, { headers: authHeaders() });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Failed to fetch playlists:`, res.status, errorText);
        throw new Error(`Failed to fetch playlists (status ${res.status})`);
      }
  
      const data = await res.json();
  
      for (const pl of data.items) {
        
        const isOwnedByUser = pl.owner?.id === userId;
        const isMatching = pattern.test(pl.name);
        
        console.log(`🧐 Found: "${pl.name}" | owner=${isOwnedByUser} | match=${isMatching}`);
  
        if (isOwnedByUser && isMatching) {
          console.log(`🗑 Removing playlist: ${pl.name}`);
          await fetch(`${SPOTIFY_API_BASE}/playlists/${pl.id}/followers`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
          await sleep(2000);
        }
      }
  
      url = data.next;
    }
  
    console.log('✅ Done checking all playlists.');
  }
  
  
  export async function findExistingPlaylist(userId: string, name: string): Promise<string | null> {
    let url = `${SPOTIFY_API_BASE}/me/playlists?limit=50`;
  
    while (url) {
      const res = await fetch(url, { headers: authHeaders() });
      const data = await res.json();
  
      const match = data.items.find((pl: any) => pl.name === name && pl.owner?.id === userId);
      if (match) return match.id;
  
      url = data.next;
    }
  
    return null;
  }

  export async function clearPlaylist(playlistId: string) {
    const res = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    const uris = data.items.map((item: any) => ({
      uri: item.track.uri,
    }));
  
    if (uris.length === 0) return;
  
    await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ tracks: uris }),
    });
  }
  
  export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
import { login, refleshAccessToken } from '~utils';

function getFromStorage(key: string): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (result) {
        return resolve(result);
      }

      reject(new Error(`Missing key: ${key}`));
    });
  });
}

interface Api {
  likeTrack(id: string): Promise<any>;
  findTrack(query: string): Promise<any>;
  authorize(): Promise<void>;
  isAuthorized(): Promise<boolean>;
}

export class SpotifyApi implements Api {
  static async refreshToken(): Promise<void> {
    const { refreshToken } = await getFromStorage('refreshToken');

    await refleshAccessToken(refreshToken);
  }

  static async getAccessToken(): Promise<string> {
    const { expiresAt } = await getFromStorage('expiresAt');

    if (!expiresAt) {
      await login();
    }

    // @ts-expect-error: ok
    if (expiresAt < Date.now()) {
      await SpotifyApi.refreshToken();
    }

    const { accessToken } = await getFromStorage('accessToken');

    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    return accessToken;
  }

  async authorize(): Promise<void> {
    await login();
  }

  async isAuthorized(): Promise<boolean> {
    const { refreshToken } = await getFromStorage('refreshToken');

    return Boolean(refreshToken);
  }

  async likeTrack(id: string): Promise<any> {
    const accessToken = await SpotifyApi.getAccessToken();

    return fetch(`https://api.spotify.com/v1/me/tracks`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ['Content-Type']: 'application/json',
      },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  async findTrack(query: string): Promise<any> {
    const accessToken = await SpotifyApi.getAccessToken();

    return fetch(
      `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
      .then((response) => response.json())
      .then(({ tracks }) => tracks.items[0]);
  }
}

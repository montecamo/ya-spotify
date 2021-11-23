import { login, refleshAccessToken } from "~utils";
import { SpotifyNowplayingStorage } from "~types";

function getFromStorage(data: string): Promise<SpotifyNowplayingStorage> {
  return new Promise((resolve) => {
    // @ts-expect-error: ok
    chrome.storage.local.get(data, resolve);
  });
}

function fetchTrack(query: string, accessToken: string): Promise<any> {
  console.warn("query", query);
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

function likeTrack(id: string, accessToken: string): Promise<any> {
  return fetch(`https://api.spotify.com/v1/me/tracks`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ["Content-Type"]: "application/json",
    },
    body: JSON.stringify({ ids: [id] }),
  });
}

let temp: any;
chrome.runtime.onMessage.addListener(async ({ artists, title, version }) => {
  const { expiresAt } = (await getFromStorage(
    "expiresAt"
  )) as SpotifyNowplayingStorage;

  if (!expiresAt) {
    await login();
  }

  if (expiresAt < Date.now()) {
    const { refreshToken } = (await getFromStorage(
      "refreshToken"
    )) as SpotifyNowplayingStorage;
    await refleshAccessToken(refreshToken);
  }

  const { accessToken } = (await getFromStorage(
    "accessToken"
  )) as SpotifyNowplayingStorage;

  console.warn("access", accessToken, btoa);
  if (!accessToken) {
    return;
  }

  fetchTrack(`${title} ${version} ${artists.join(" ")}`, accessToken).then(
    (track) => {
      console.warn("track", track);
      temp = track;
    }
  );
});

chrome.action.onClicked.addListener(async () => {
  console.warn("tempi", temp);
  if (temp) {
    const { accessToken } = (await getFromStorage(
      "accessToken"
    )) as SpotifyNowplayingStorage;

    console.warn("liking");

    // @ts-ignore
    likeTrack(temp?.id, accessToken).then(console.warn);
  }
});

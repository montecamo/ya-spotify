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

function send(message: any) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      // @ts-expect-error: ok
      tabs[0].id,
      message
    );
  });
}
function error() {
  send({ success: false });
}
function success() {
  send({ success: true });
}

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

  if (!accessToken) {
    error();
    return;
  }

  fetchTrack(`${title} ${version} ${artists.join(" ")}`, accessToken)
    .then((track) => {
      if (track) {
        likeTrack(track.id, accessToken).then(success).catch(error);
      } else {
        error();
      }
    })
    .catch(error);
});

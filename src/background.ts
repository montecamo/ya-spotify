import { SpotifyApi } from "./api";

const api = new SpotifyApi();

function sendMessage(message: any): void {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      // @ts-expect-error: ok
      tabs[0].id,
      message
    );
  });
}

function sendError(err: Error): void {
  sendMessage({ error: err.message });
}
function sendSuccess(): void {
  sendMessage({ error: undefined });
}

const buildQuery = ({ artists, title, version }: any): string =>
  `${title} ${version} ${artists.join(" ")}`;

chrome.runtime.onMessage.addListener((data) => {
  api
    .findTrack(buildQuery(data))
    .then((track) => {
      if (!track) {
        throw new Error("Track not found");
      }

      return track;
    })
    .then((track) => api.likeTrack(track.id))
    .then(sendSuccess)
    .catch(sendError);
});

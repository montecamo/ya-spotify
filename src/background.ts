import {
  setExtensionIcon,
  GREEN_ICON,
  RED_ICON,
  DEFAULT_ICON,
} from '~utils/extension';
import { SpotifyApi } from './api';

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
  `${title} ${version} ${artists.join(' ')}`;

const buildFuzzyQuery = ({ artists, title }: any): string =>
  `${title} ${artists.join(' ')}`;

function findTrack(queries: string[]): Promise<any> {
  return api.findTrack(queries[0]).then((track) => {
    if (!track && queries.length > 0) {
      return findTrack(queries.slice(1));
    }

    return track;
  });
}

chrome.runtime.onMessage.addListener((data) => {
  findTrack([buildQuery(data), buildFuzzyQuery(data)])
    .then((track) => {
      if (!track) {
        throw new Error('Track not found');
      }

      return track;
    })
    .then((track) => api.likeTrack(track.id))
    .then(sendSuccess)
    .catch(sendError);
});

chrome.action.onClicked.addListener(() => {
  api.isAuthorized().then((isAuthorized) => {
    if (isAuthorized) {
      api
        .authorize()
        .then(() => {
          setExtensionIcon(GREEN_ICON);
        })
        .catch(() => {
          setExtensionIcon(RED_ICON);
        });
    }
  });
});

api.isAuthorized().then((isAuthorized) => {
  if (isAuthorized) {
    setExtensionIcon(GREEN_ICON);
  } else {
    setExtensionIcon(DEFAULT_ICON);
  }
});

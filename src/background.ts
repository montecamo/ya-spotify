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

const buildQuery = ({ artists, title, version }: any): string =>
  `${title} ${version} ${artists.join(' ')}`;

const buildFuzzyQuery = ({ artists, title }: any): string =>
  `${title} ${artists.join(' ')}`;

async function findTrack(queries: string[]): Promise<any> {
  if (queries.length === 0) {
    return undefined;
  }

  const track = await api.findTrack(queries[0]);

  if (!track) {
    return findTrack(queries.slice(1));
  }

  return track;
}

function sendError(err: Error): void {
  sendMessage({ type: 'error', payload: err.message });
}

chrome.runtime.onMessage.addListener(({ type, payload }) => {
  const queries = [buildQuery(payload), buildFuzzyQuery(payload)];
  switch (type) {
    case 'like':
      findTrack(queries)
        .then((track) => {
          if (!track) {
            throw new Error('Track not found');
          }

          return track;
        })
        .then((track) => api.likeTrack(track.id))
        .then(() => sendMessage({ type: 'isLiked', payload: true }))
        .catch(sendError);
      break;
    case 'check':
      findTrack(queries)
        .then((track) => {
          if (!track) {
            return false;
          }

          return api.isTrackLiked(track.id);
        })
        .then((isLiked) => {
          sendMessage({ type: 'isLiked', payload: isLiked });
        })
        .catch(sendError);
  }
});

chrome.action.onClicked.addListener(async () => {
  api
    .authorize()
    .then(() => {
      setExtensionIcon(GREEN_ICON);
    })
    .catch(() => {
      setExtensionIcon(RED_ICON);
    });
});

api.isAuthorized().then((isAuthorized) => {
  if (isAuthorized) {
    setExtensionIcon(GREEN_ICON);
  } else {
    setExtensionIcon(DEFAULT_ICON);
  }
});

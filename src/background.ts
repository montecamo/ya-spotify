import {
  setExtensionIcon,
  GREEN_ICON,
  RED_ICON,
  DEFAULT_ICON,
} from '~utils/extension';
import { SpotifyApi } from './api';

const api = new SpotifyApi();

function sendMessage(tabId: number, message: any): void {
  chrome.tabs.sendMessage(tabId, message);
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

function sendError(tabId: number, err: Error): void {
  sendMessage(tabId, { type: 'error', payload: err.message });
}

chrome.runtime.onMessage.addListener(async ({ type, payload }, { tab }) => {
  const tabId = tab?.id;
  if (!tabId) {
    throw new Error('Missing tab id');
  }

  switch (type) {
    case 'like':
      if (!payload) {
        sendError(tabId, new Error('Track not found'));
        return;
      }

      api
        .likeTrack(payload)
        .then(() =>
          sendMessage(tabId, {
            type: 'like',
            payload: { status: true },
          })
        )
        .catch((err) => sendError(tabId, err));
      break;
    case 'check': {
      const track = await findTrack([
        buildQuery(payload),
        buildFuzzyQuery(payload),
      ]);

      const liked = track ? await api.isTrackLiked(track.id) : false;

      sendMessage(tabId, {
        type: 'check',
        payload: { status: liked, trackId: track?.id },
      });
      break;
    }
    case 'unlike':
      if (!payload) {
        sendError(tabId, new Error('Track not found'));
        return;
      }

      api
        .unlikeTrack(payload)
        .then(() => {
          sendMessage(tabId, {
            type: 'like',
            payload: { status: false },
          });
        })
        .catch((err) => sendError(tabId, err));
  }
});

chrome.browserAction.onClicked.addListener(async () => {
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

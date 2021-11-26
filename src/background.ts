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

chrome.runtime.onMessage.addListener(async ({ type, payload }) => {
  switch (type) {
    case 'like':
      if (!payload) {
        sendError(new Error('Track not found'));
        return;
      }

      api
        .likeTrack(payload)
        .then(() =>
          sendMessage({
            type: 'like',
            payload: { status: true },
          })
        )
        .catch(sendError);
      break;
    case 'check': {
      const track = await findTrack([
        buildQuery(payload),
        buildFuzzyQuery(payload),
      ]);

      const liked = track ? await api.isTrackLiked(track.id) : false;

      sendMessage({
        type: 'check',
        payload: { status: liked, trackId: track?.id },
      });
      break;
    }
    case 'unlike':
      if (!payload) {
        sendError(new Error('Track not found'));
        return;
      }

      api
        .unlikeTrack(payload)
        .then(() => {
          sendMessage({
            type: 'like',
            payload: { status: false },
          });
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

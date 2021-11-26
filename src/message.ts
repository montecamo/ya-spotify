import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

type ErrorMessage = {
  type: 'error';
  payload: string;
};
type LikeMessage = {
  type: 'like';
  payload: {
    status: boolean;
    trackId: string;
  };
};
type CheckMessage = {
  type: 'check';
  payload: {
    status: boolean;
    trackId: string;
  };
};

type Message = ErrorMessage | LikeMessage | CheckMessage;

const message$ = new Observable<Message>((subscriber) => {
  chrome.runtime.onMessage.addListener((message) => subscriber.next(message));
});

const like$ = message$.pipe(
  filter(({ type }) => type === 'like')
) as Observable<LikeMessage>;

const check$ = message$.pipe(
  filter(({ type }) => type === 'check')
) as Observable<LikeMessage>;

const error$ = message$.pipe(
  filter(({ type }) => type === 'error')
) as Observable<ErrorMessage>;

export { like$, check$, error$ };

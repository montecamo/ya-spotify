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

const likeMessage$ = message$.pipe(
  filter(({ type }) => type === 'like')
) as Observable<LikeMessage>;

const checkMessage$ = message$.pipe(
  filter(({ type }) => type === 'check')
) as Observable<CheckMessage>;

const errorMessage$ = message$.pipe(
  filter(({ type }) => type === 'error')
) as Observable<ErrorMessage>;

export { likeMessage$, checkMessage$, errorMessage$ };

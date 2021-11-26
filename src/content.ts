import { merge, pluck } from 'rxjs';
import { filter, map, shareReplay, withLatestFrom } from 'rxjs/operators';

import { waitElement, getElementByClass } from '~utils';

import {
  makeButton,
  isButtonActive,
  existingButton$,
  click$,
  paintButtonDefault,
  paintButtonGreen,
  paintButtonRed,
  button$,
} from './button';
import { likeMessage$, errorMessage$, checkMessage$ } from './message';
import { song$ } from './song';
import { theme$ } from './theme';

async function injectButton(button: HTMLElement): Promise<void> {
  const buttons = await waitElement(() =>
    getElementByClass('player-controls__track-controls')
  );

  buttons.style.marginRight = '-45px';
  buttons.appendChild(button);
}

theme$
  .pipe(
    withLatestFrom(existingButton$),
    pluck(1),
    filter((button) => !isButtonActive(button))
  )
  .subscribe((button) => {
    paintButtonDefault(button);
  });

song$.subscribe((song) => {
  chrome.runtime.sendMessage({ type: 'check', payload: song });
});

button$.pipe(filter((b) => !b)).subscribe(() => {
  const button = makeButton();

  injectButton(button);
});

errorMessage$
  .pipe(withLatestFrom(existingButton$))
  .subscribe(([{ payload }, button]) => {
    console.error(`Spotify extension: ${payload}`);

    paintButtonRed(button);
  });

const liked$ = merge(likeMessage$, checkMessage$).pipe(
  map((message) => message.payload.status),
  shareReplay(1)
);

const trackId$ = checkMessage$.pipe(
  map((message) => message.payload.trackId),
  shareReplay(1)
);

liked$.pipe(withLatestFrom(existingButton$)).subscribe(([isLiked, button]) => {
  if (isLiked) {
    paintButtonGreen(button);
    return;
  }

  paintButtonDefault(button);
});

click$
  .pipe(withLatestFrom(trackId$, liked$))
  .subscribe(([, trackId, liked]) => {
    chrome.runtime.sendMessage({
      type: liked ? 'unlike' : 'like',
      payload: trackId,
    });
  });

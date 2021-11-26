import { merge, pluck } from 'rxjs';
import { filter, map, shareReplay, withLatestFrom } from 'rxjs/operators';

import { waitElement, getElementByClass } from '~utils';

import {
  makeButton,
  isButtonActive,
  existingButton$,
  missingButton$,
  click$,
  paintButtonDefault,
  paintButtonGreen,
  paintButtonRed,
} from './button';
import { like$, error$, check$ } from './message';
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

missingButton$.subscribe(() => {
  const button = makeButton();

  injectButton(button);
});

click$.pipe(withLatestFrom(song$), pluck(1)).subscribe((song) => {
  chrome.runtime.sendMessage({
    type: 'like',
    payload: song,
  });
});

error$
  .pipe(withLatestFrom(existingButton$))
  .subscribe(([{ payload }, button]) => {
    console.error(`Spotify extension: ${payload}`);

    paintButtonRed(button);
  });

const liked$ = merge(like$, check$).pipe(
  map((message) => message.payload.status)
);

liked$.pipe(withLatestFrom(existingButton$)).subscribe(([isLiked, button]) => {
  if (isLiked) {
    paintButtonGreen(button);
    return;
  }

  paintButtonDefault(button);
});

const trackId$ = like$.pipe(
  map(({ payload: { trackId } }) => trackId),
  shareReplay()
);

trackId$.subscribe(console.warn);

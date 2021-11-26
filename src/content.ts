import { switchMap, merge } from 'rxjs';
import { take, filter, map, shareReplay, withLatestFrom } from 'rxjs/operators';

import { waitElement, getElementByClass } from '~utils';

import {
  paintButton,
  makeButton,
  isButtonActive,
  BUTTON_COLORS,
  existingButton$,
  missingButton$,
  click$,
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
    filter(([, button]) => !isButtonActive(button))
  )
  .subscribe(([theme, button]) => {
    paintButton(
      button,
      theme === 'dark' ? BUTTON_COLORS.white : BUTTON_COLORS.default
    );
  });

song$.subscribe((song) => {
  chrome.runtime.sendMessage({ type: 'check', payload: song });
});

missingButton$.subscribe(() => {
  const button = makeButton();

  injectButton(button);
});

click$.pipe(switchMap(() => song$.pipe(take(1)))).subscribe((song) => {
  chrome.runtime.sendMessage({
    type: 'like',
    payload: song,
  });
});

error$
  .pipe(withLatestFrom(existingButton$))
  .subscribe(([{ payload }, button]) => {
    console.error(`Spotify extension: ${payload}`);

    paintButton(button, BUTTON_COLORS.red);
  });

merge(like$, check$)
  .pipe(withLatestFrom(existingButton$, theme$))
  .subscribe(([message, button, theme]) => {
    const defaultColor =
      theme === 'dark' ? BUTTON_COLORS.white : BUTTON_COLORS.default;

    paintButton(
      button,
      message.payload.status ? BUTTON_COLORS.green : defaultColor
    );
  });

const trackId$ = like$.pipe(
  map(({ payload: { trackId } }) => trackId),
  shareReplay()
);

trackId$.subscribe(console.warn);

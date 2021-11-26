import { getElementByClass, watchMutations$ } from '~utils';
import { distinctUntilChanged, filter, shareReplay, tap } from 'rxjs/operators';
import { fromEvent, Observable, switchMap } from 'rxjs';
import { getTheme } from './theme';

const BUTTON_COLORS: Record<string, string> = {
  green: chrome.runtime.getURL('spotify-green.svg'),
  red: chrome.runtime.getURL('spotify-red.svg'),
  white: chrome.runtime.getURL('spotify-white.svg'),
  default: chrome.runtime.getURL('spotify.svg'),
};
const OPACITY_COLORS = [BUTTON_COLORS.default, BUTTON_COLORS.white];

function isButtonActive(button: HTMLElement): boolean {
  return button.style.opacity === '1';
}

function paintButton(button: HTMLElement, icon: string): void {
  button.style.opacity = OPACITY_COLORS.includes(icon) ? '' : '1';

  // @ts-expect-error: ok
  button.children[0].style.backgroundImage = `url(${icon})`;
}

function paintButtonDefault(button: HTMLElement): void {
  paintButton(
    button,
    getTheme() === 'dark' ? BUTTON_COLORS.white : BUTTON_COLORS.default
  );
}
function paintButtonGreen(button: HTMLElement): void {
  paintButton(button, BUTTON_COLORS.green);
}
function paintButtonRed(button: HTMLElement): void {
  paintButton(button, BUTTON_COLORS.red);
}

function makeButton(): HTMLElement {
  const classNames = [
    'dislike',
    'player-controls__btn',
    'deco-player-controls__button',
    'dislike_theme-player',
    'spotify',
  ];

  const container = document.createElement('span');
  const child = document.createElement('span');

  getElementByClass('player-controls__btn-cast')?.remove();

  container.classList.add(...classNames);
  child.classList.add('d-icon');

  container.appendChild(child);

  paintButtonDefault(container);

  return container;
}

const button$ = watchMutations$(() => getElementByClass('spotify')).pipe(
  distinctUntilChanged(),
  shareReplay(1)
);
const existingButton$ = button$.pipe(
  filter(Boolean)
) as Observable<HTMLElement>;

const click$ = existingButton$.pipe(
  switchMap((button) => fromEvent(button, 'click')),
  tap((e) => {
    e.preventDefault();
    e.stopPropagation();
  })
);

export {
  paintButtonGreen,
  paintButtonRed,
  paintButtonDefault,
  makeButton,
  isButtonActive,
  click$,
  button$,
  existingButton$,
};

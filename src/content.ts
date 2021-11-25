import { distinctUntilChanged, filter } from 'rxjs/operators';
import isEqual from 'lodash-es/isEqual';

import { watchMutations$, waitElement, getElementByClass } from '~utils';

type Song = {
  title: string;
  version: string;
  artists: string[];
};

const BUTTON_COLORS: Record<string, string> = {
  green: chrome.runtime.getURL('spotify-green.svg'),
  red: chrome.runtime.getURL('spotify-red.svg'),
  white: chrome.runtime.getURL('spotify-white.svg'),
  default: chrome.runtime.getURL('spotify.svg'),
};

function paintButton(button: HTMLElement, icon: string): void {
  button.style.backgroundImage = `url(${icon})`;
}

function parseSong(): Song | void {
  const player = getElementByClass('track__name');

  if (!player) {
    return undefined;
  }

  const title = getElementByClass('track__title', player)?.title ?? '';
  const artists = Array.from(
    player
      .getElementsByClassName('d-artists')[0]
      .getElementsByClassName('d-link')
    // @ts-expect-error: ok
  ).map((a) => a.title);

  const version = getElementByClass('track__ver', player)?.innerText ?? '';

  return {
    title,
    version,
    artists,
  };
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

  paintButton(
    child,
    document.body.classList.contains('theme-black')
      ? BUTTON_COLORS.white
      : BUTTON_COLORS.default
  );

  container.appendChild(child);

  return container;
}

async function injectButton(button: HTMLElement): Promise<void> {
  const buttons = await waitElement(() =>
    getElementByClass('player-controls__track-controls')
  );

  buttons.style.marginRight = '-45px';
  buttons.appendChild(button);
}

async function handleButtonClick(e: MouseEvent): Promise<void> {
  e.preventDefault();
  e.stopImmediatePropagation();

  chrome.runtime.sendMessage({
    type: 'like',
    payload: parseSong(),
  });
}

watchMutations$(() => document.body.classList.contains('theme-black'))
  .pipe(distinctUntilChanged())
  .subscribe((isDark) => {
    const button = getElementByClass('spotify');

    if (button?.style.opacity !== '1') {
      paintButton(
        // @ts-expect-error: ok
        button.children[0],
        isDark ? BUTTON_COLORS.white : BUTTON_COLORS.default
      );
    }
  });
watchMutations$(() => parseSong())
  .pipe(distinctUntilChanged(isEqual), filter(Boolean))
  .subscribe((song) => {
    chrome.runtime.sendMessage({ type: 'check', payload: song });
  });

watchMutations$(() => getElementByClass('spotify'))
  .pipe(
    distinctUntilChanged(),
    filter((elem) => !elem)
  )
  .subscribe(() => {
    const button = makeButton();
    button.addEventListener('click', handleButtonClick);

    injectButton(button);
  });

chrome.runtime.onMessage.addListener(({ type, payload }) => {
  const container = getElementByClass('spotify');
  if (!container) {
    return;
  }

  const button = container.children[0] as HTMLElement;
  if (!button) {
    return;
  }

  switch (type) {
    case 'error':
      console.error(`Spotify extension: ${payload}`);
      container.style.opacity = '1';
      paintButton(button, BUTTON_COLORS.red);
      break;
    case 'isLiked':
      if (payload) {
        paintButton(button, BUTTON_COLORS.green);
        container.style.opacity = '1';
      }
  }
});

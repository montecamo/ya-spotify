import { distinctUntilChanged, filter } from 'rxjs/operators';
import { watchElement$, waitElement, getElementByClass } from '~utils/dom';

const BUTTON_COLORS: Record<string, string> = {
  green: chrome.runtime.getURL('spotify-green.svg'),
  red: chrome.runtime.getURL('spotify-red.svg'),
  default: chrome.runtime.getURL('spotify.svg'),
};

function paintButton(button: HTMLElement, icon: string): void {
  button.style.backgroundImage = `url(${icon})`;
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

  paintButton(child, BUTTON_COLORS.default);

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

  const player = await waitElement(() => getElementByClass('track__name'));

  const title = getElementByClass('track__title', player)?.title;
  const artists = Array.from(
    player
      .getElementsByClassName('d-artists')[0]
      .getElementsByClassName('d-link')
    // @ts-expect-error: ok
  ).map((a) => a.title);

  const version = getElementByClass('track__ver', player)?.innerText ?? '';

  chrome.runtime.sendMessage({
    title,
    artists,
    version,
  });
}

watchElement$(() => getElementByClass('spotify'))
  .pipe(
    distinctUntilChanged(),
    filter((elem) => !elem)
  )
  .subscribe(() => {
    const button = makeButton();
    button.addEventListener('click', handleButtonClick);

    injectButton(button);
  });

chrome.runtime.onMessage.addListener(({ error }) => {
  const container = getElementByClass('spotify');
  if (!container) {
    return;
  }

  const button = container.children[0] as HTMLElement;
  if (!button) {
    return;
  }

  container.style.opacity = '1';

  paintButton(button, error ? BUTTON_COLORS.red : BUTTON_COLORS.green);

  if (error) {
    console.error(`Spotify extension: ${error}`);
  }
});

import { distinctUntilChanged, filter } from "rxjs/operators";
import { watchElement$, waitElement, getElementByClass } from "./utils";

const BUTTON_COLORS: Record<string, string> = {
  green: chrome.runtime.getURL("spotify-green.svg"),
  red: chrome.runtime.getURL("spotify-red.svg"),
  default: chrome.runtime.getURL("spotify.svg"),
};

function paintButton(button: HTMLElement, icon: string): void {
  button.style.backgroundImage = `url(${icon})`;
}

function makeButton(): HTMLElement {
  const classNames = [
    "dislike",
    "player-controls__btn",
    "deco-player-controls__button",
    "dislike_theme-player",
    "spotify",
  ];

  const container = document.createElement("span");
  const child = document.createElement("span");

  getElementByClass("player-controls__btn-cast")?.remove();

  container.classList.add(...classNames);
  child.classList.add("d-icon");

  paintButton(child, BUTTON_COLORS.default);

  container.appendChild(child);

  return container;
}

async function injectButton(button: HTMLElement): Promise<void> {
  const buttons = await waitElement(() =>
    getElementByClass("player-controls__track-controls")
  );

  buttons.style.marginRight = "-45px";
  buttons.appendChild(button);
}

const handleButtonClick = (e: MouseEvent): void => {
  e.preventDefault();
  e.stopImmediatePropagation();

  // @ts-expect-error: ok
  if (document.getElementsByClassName("spotify")?.style?.color) {
    return;
  }

  console.warn("send");
  const player = document.getElementsByClassName("track__name")[0];

  // @ts-expect-error: ok
  const title = player.getElementsByClassName("track__title")[0].title;
  const artists = Array.from(
    player
      .getElementsByClassName("d-artists")[0]
      .getElementsByClassName("d-link")
    // @ts-expect-error: ok
  ).map((a) => a.title);

  const version =
    // @ts-expect-error: ok
    player.getElementsByClassName("track__ver")[0]?.innerText ?? "";

  chrome.runtime.sendMessage({
    title,
    artists,
    version,
  });
};

watchElement$(() => getElementByClass("spotify"))
  .pipe(
    distinctUntilChanged(),
    filter((elem) => !elem)
  )
  .subscribe(() => {
    const button = makeButton();
    button.addEventListener("click", handleButtonClick);

    injectButton(button);
  });

chrome.runtime.onMessage.addListener(({ success }) => {
  const container = getElementByClass("spotify");
  if (!container) {
    return;
  }

  const button = container.children[0] as HTMLElement;
  if (!button) {
    return;
  }

  container.style.opacity = "1";

  paintButton(button, success ? BUTTON_COLORS.green : BUTTON_COLORS.red);
});

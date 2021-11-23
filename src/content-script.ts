function getElement(className: string): Promise<HTMLElement> {
  const elements = document.getElementsByClassName(className);

  if (elements.length) {
    return Promise.resolve(elements[0] as HTMLElement);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver((_, o) => {
      const elements = document.getElementsByClassName(className);

      if (elements.length) {
        o.disconnect();

        return resolve(elements[0] as HTMLElement);
      }
    });

    observer.observe(document, { subtree: true, childList: true });
  });
}

function successButton() {
  const container = document.getElementsByClassName("spotify")[0];
  const button = container.children[0];

  if (button) {
    // @ts-expect-error: ok
    container.style.opacity = 1;
    // @ts-expect-error: ok
    button.style.backgroundImage = `url(${chrome.runtime.getURL(
      "spotify-green.svg"
    )})`;
  }
}
function errorButton() {
  const button = document.getElementsByClassName("spotify")[0];

  if (button) {
    // @ts-expect-error: ok
    container.style.opacity = 1;
    // @ts-expect-error: ok
    button.style.backgroundImage = `url(${chrome.runtime.getURL(
      "spotify-red.svg"
    )})`;
  }
}

async function injectButton() {
  console.warn("injecty");
  const buttons = await getElement("player-controls__track-controls");
  const container = document.createElement("span");
  const child = document.createElement("span");

  document.container.classList.add(
    ..."dislike player-controls__btn deco-player-controls__button dislike_theme-player spotify".split(
      " "
    )
  );
  child.classList.add("d-icon");
  child.style.backgroundImage = `url(${chrome.runtime.getURL("spotify.svg")})`;
  container.appendChild(child);

  buttons.style.marginRight = "0";
  buttons.appendChild(container);

  return container;
}

const listener = (e: any) => {
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

let injecting = false;
const observer = new MutationObserver(() => {
  if (document.getElementsByClassName("spotify").length === 0 && !injecting) {
    injecting = true;
    console.warn("inject", injecting);
    injectButton().then((button) => {
      button.addEventListener("click", listener);
      injecting = false;
    });
  }
});

observer.observe(document, { subtree: true, childList: true });

chrome.runtime.onMessage.addListener(({ success }) => {
  if (success) {
    successButton();
  } else {
    errorButton();
  }
});

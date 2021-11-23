function getElement(className: string): Promise<HTMLElement> {
  const elements = document.getElementsByClassName(className);

  if (elements.length) {
    return Promise.resolve(elements[0]);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const elements = document.getElementsByClassName(className);

      if (elements.length) {
        return Promise.resolve(elements[0]);
      }
    });
  });
}

function injectButton() {
  const container = document.createElement("span");
  const child = document.createElement("span");

  container.classList.add(
    ..."dislike player-controls__btn deco-player-controls__button dislike_theme-player".split(
      " "
    )
  );
  child.classList.add("d-icon");
  child.style.backgroundImage = `url(${chrome.runtime.getURL("spotify.svg")})`;
  container.appendChild(child);
  const buttons = document.getElementsByClassName(
    "player-controls__track-controls"
  )[0];

  buttons.style.marginRight = "0";
  buttons.appendChild(container);
}

window.addEventListener("click", () => {
  console.warn("send messages");
  injectButton();
  return;

  console.warn("get", chrome, chrome.runtime.getURL("spotify.svg"));

  const player = document.getElementsByClassName("track__name")[0];
  const title = player.getElementsByClassName("track__title")[0].title;
  const artists = Array.from(
    player
      .getElementsByClassName("d-artists")[0]
      .getElementsByClassName("d-link")
  ).map((a) => a.title);
  const version =
    player.getElementsByClassName("track__ver")[0]?.innerText ?? "";

  chrome.runtime.sendMessage({
    title,
    artists,
    version,
  });
});

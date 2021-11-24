import { Observable } from "rxjs";

import type { Selector } from "~types";

export function waitElement(selector: Selector): Promise<HTMLElement> {
  const elem = selector();
  if (elem) {
    return Promise.resolve(elem);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const elem = selector();

      if (elem) {
        resolve(elem);
      }
    });

    observer.observe(document, { subtree: true, childList: true });
  });
}

export function watchElement$(
  selector: Selector
): Observable<ReturnType<Selector>> {
  return new Observable((subscriber) => {
    const observer = new MutationObserver(() => {
      subscriber.next(selector());
    });

    subscriber.next(selector());
    observer.observe(document, { subtree: true, childList: true });

    return () => observer.disconnect();
  });
}

export function getElementByClass(className: string): HTMLElement | void {
  return document.getElementsByClassName(className)[0] as HTMLElement;
}

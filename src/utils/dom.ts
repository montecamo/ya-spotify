import { Observable } from 'rxjs';

type Selector<T> = () => T;

export function waitElement(
  selector: Selector<HTMLElement | void>
): Promise<HTMLElement> {
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

export function watchMutations$<T>(
  selector: Selector<T>
): Observable<ReturnType<Selector<T>>> {
  return new Observable((subscriber) => {
    const observer = new MutationObserver(() => {
      subscriber.next(selector());
    });

    subscriber.next(selector());
    observer.observe(document, { subtree: true, childList: true });

    return () => observer.disconnect();
  });
}

export function getElementByClass(
  className: string,
  parent: HTMLElement | Document = document
): HTMLElement | void {
  return parent.getElementsByClassName(className)[0] as HTMLElement;
}

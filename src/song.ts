import { getElementByClass, watchMutations$ } from '~utils';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, shareReplay } from 'rxjs/operators';
import isEqual from 'lodash-es/isEqual';

type Song = {
  title: string;
  version: string;
  artists: string[];
};

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

const song$: Observable<Song> = watchMutations$(() => parseSong()).pipe(
  distinctUntilChanged(isEqual),
  filter(Boolean),
  shareReplay(1)
);

export { song$ };

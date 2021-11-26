import { watchMutations$ } from '~utils';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

type Theme = 'light' | 'dark';

function getTheme(): Theme {
  return document.body.classList.contains('theme-black') ? 'dark' : 'light';
}

const theme$ = watchMutations$(getTheme).pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export { getTheme, theme$ };

import chokidar, { FSWatcher } from 'chokidar';
import fs from 'fs';
import { copyFile, mkdir } from 'fs/promises';
import path from 'path';

const copy = async (sourcePath: string, dest: string): Promise<void> => {
  try {
    await mkdir(path.dirname(dest), { recursive: true });
  } catch (_) { }

  copyFile(sourcePath, dest)
    .then(() => {
      console.log(`${sourcePath} is copied to ${dest}`);
    })
    .catch((err: Parameters<fs.NoParamCallback>[0]) => {
      if (err) {
        console.log(err.stack);
      }
    });
};

export const copyFiles = async (paths: { [s: string]: string }, watch: boolean): Promise<FSWatcher[]> => {
  if (watch) {
    const watchers = Object.keys(paths).map((s) => chokidar.watch(s));
    for (const watcher of watchers) {
      watcher.on('add', async (path) => await copy(path, paths[path]));
      watch && watcher.on('change', async (path) => await copy(path, paths[path]));
    }
    return watchers;
  }

  for (const [src, dest] of Object.entries(paths)) {
    await copy(src, dest);
  }
  return [];
};

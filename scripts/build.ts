import { build } from "esbuild";
import TscWatchClient from "tsc-watch/client";

import { copyFiles } from "./copy";

const isDevelopment = process.env.NODE_ENV === "development";

(async () => {
  const tscWatch = new TscWatchClient();
  // Improve type checking because `tsc --watch` clears a terminal
  isDevelopment && tscWatch.start("--noEmit");

  const copyWatchers = await copyFiles(
    {
      "src/manifest.json": "dist/manifest.json",
      "src/spotify.svg": "dist/spotify.svg",
      "src/spotify-red.svg": "dist/spotify-red.svg",
      "src/spotify-green.svg": "dist/spotify-green.svg",
      "src/options/index.html": "dist/options/index.html",
    },
    isDevelopment
  );

  build({
    entryPoints: [
      "src/background.ts",
      "src/options/index.ts",
      "src/content-script.ts",
    ],
    outdir: "dist",
    bundle: true,
    watch: isDevelopment && {
      onRebuild(error, result) {
        if (error) {
          console.error("watch build failed:", error);
          return;
        }
        console.log("watch build succeeded:", result);
      },
    },
    minify: !isDevelopment,
    target: ["es2020"],
  })
    .then(() => {
      console.log(
        "build finished" + (isDevelopment ? ", watching for changes..." : "")
      );
    })
    .catch(() => {
      tscWatch.kill();
      for (const watcher of copyWatchers) {
        watcher.close();
      }
      process.exit(1);
    });
})();

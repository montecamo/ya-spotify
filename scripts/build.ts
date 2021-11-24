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
      "public/manifest.json": "dist/manifest.json",
      "public/spotify.svg": "dist/spotify.svg",
      "public/spotify-red.svg": "dist/spotify-red.svg",
      "public/spotify-green.svg": "dist/spotify-green.svg",
      "public/icon-128-green.png": "dist/icon-128-green.png",
      "public/icon-128-default.png": "dist/icon-128-default.png",
      "public/icon-128-red.png": "dist/icon-128-red.png",
    },
    isDevelopment
  );

  build({
    entryPoints: ["src/background.ts", "src/content-script.ts"],
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

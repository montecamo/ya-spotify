# Spotify NowPlaying

A Chrome extension that tweets the song you are listening to on Spotify

## Installation

1. Clone this repository and cd to it
1. Create a Spotify app from [Spotify dashboard](https://developer.spotify.com/dashboard) and copy the client id
1. Rename the file `config.ts.orig` to `config.ts` and insert your app client id into `''`
    ```sh
    mv config.ts{.orig,}
    # Edit config.ts with your editor
    vim config.ts
    ```
1. Build this project with the following command:
    ```sh
    yarn && yarn build
    ```
1. Open `chrome://extensions/` in Google Chrome and load the `dist` directory.
  Click `load unpacked` and select `dist` or drag and drop `dist` on the page.
1. Copy the extension ID in the box of the added extension
  ![image](https://user-images.githubusercontent.com/10758173/122782335-9aba9a00-d2eb-11eb-925c-6cdc948337db.png)
1. Open your Spotify app settings to input `https://<copied-extension-id>.chromiumapp.org/` to `Redirect URIs` and save the settings  
  Replace `<copied-extension-id>` by the extension id you just copied now. For example, when the extension id is `ehjnkeeomghenaiaaioaabggalacbfbg`, the URL you input is `https://ehjnkeeomghenaiaaioaabggalacbfbg.chromiumapp.org/`.
1. Excellent! By clicking the `[S]` icon on toolbar, you can tweet the song you are listening to on Spotify!  
  A tweet page `https://twitter.com/intet/tweet` with a song information will be opened. Also, the authorization page where the permission is requested to access your account data will be opened at first.

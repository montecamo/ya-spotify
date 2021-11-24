# YaSpotify

A Chrome extension which adds spotify like button to Yandex Music

## Installation

1. Clone this repository and cd to it
2. Create a Spotify app from [Spotify dashboard](https://developer.spotify.com/dashboard) and paste the client id to `config.ts`.
3. Build this project with the following command:
    ```sh
    npm i && npm run build
    ```
4. Open `chrome://extensions/` in Google Chrome and load the `dist` directory.
  Click `load unpacked` and select `dist` or drag and drop `dist` on the page.
5. Copy the extension ID in the box of the added extension
  ![image](https://user-images.githubusercontent.com/10758173/122782335-9aba9a00-d2eb-11eb-925c-6cdc948337db.png)
6. Open your Spotify app settings to input `https://<copied-extension-id>.chromiumapp.org/` to `Redirect URIs` and save the settings  
  Replace `<copied-extension-id>` by the extension id you just copied now. For example, when the extension id is `ehjnkeeomghenaiaaioaabggalacbfbg`, the URL you input is `https://ehjnkeeomghenaiaaioaabggalacbfbg.chromiumapp.org/`.
7. Excellent! By clicking the icon on toolbar, you can authorize in Spotify.

/* eslint-disable no-undef */
navigator.mediaSession.setActionHandler('play', () => {
  window.externalAPI.togglePause(false);
});

navigator.mediaSession.setActionHandler('pause', () => {
  window.externalAPI.togglePause(true);
});

navigator.mediaSession.setActionHandler('previoustrack', () => {
  window.externalAPI.prev();
});

navigator.mediaSession.setActionHandler('nexttrack', () => {
  window.externalAPI.next();
});

window.externalAPI.on(window.externalAPI.EVENT_TRACK, () => {
  const track = window.externalAPI.getCurrentTrack();
  const dimensions = [
    '30x30',
    '50x50',
    '80x80',
    '100x100',
    '200x200',
    '300x300',
    '400x400',
  ];

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artists.map((a) => a.title).join(', '),
    album: track.album.title,
    artwork: dimensions.map((size) => ({
      src: `http://${track.cover.replace('%%', size)}`,
      sizes: size,
      type: 'image/png',
    })),
  });
});

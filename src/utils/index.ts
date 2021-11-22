import { authenticate, exchangeForToken } from '~utils/authenticate';
import { AuthorizationError, UnmatchStateError } from '~types';
import clientId from '~config';

export const login = async (): Promise<void> => {
  const data = await authenticate(clientId);

  if (data instanceof AuthorizationError) {
    console.log(data.message);
    return;
  }

  if (data instanceof UnmatchStateError) {
    console.log(data.message);
    return;
  }

  const { expires_in: expiresIn, access_token: accessToken, refresh_token: refreshToken } = data;

  const user = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }).then((response) => response.json()).then((data) => {
    return {
      userName: data.display_name,
      isPremium: data.product === 'premium',
    };
  });

  chrome.storage.local.set({
    ...user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + Number(expiresIn) * 1000,
  });
};

export const refleshAccessToken = async (refreshToken: string): Promise<void> => {
  const { expires_in: expiresIn, access_token: accessToken, refresh_token: newRefreshToken } = await exchangeForToken({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  chrome.storage.local.set({
    accessToken,
    refreshToken: newRefreshToken,
    expiresAt: Date.now() + Number(expiresIn) * 1000,
  });
};

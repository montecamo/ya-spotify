import { browser } from 'webextension-polyfill-ts';

import { AuthorizationError, UnmatchStateError } from '~types';

interface AuthorizationQueryParameter {
  client_id: string;
  response_type: 'code';
  redirect_uri: string;
  code_challenge_method: 'S256';
  code_challenge: string;
  state?: string;
  scope?: string;
}

interface RedirectQueryParameter {
  code?: string;
  error?: string;
  state?: string;
}

interface RefleshedTokenRequestBody extends Record<string, string> {
  client_id: string;
  grant_type: 'refresh_token';
  refresh_token: string;
}

interface TokenRequestBody extends Record<string, string> {
  client_id: string;
  grant_type: 'authorization_code';
  code: string;
  redirect_uri: string;
  code_verifier: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: string;
  refresh_token: string;
}

type AuthenticationError = AuthorizationError | UnmatchStateError;

export const encodeToBase64 = (buffer: ArrayBuffer): string => {
  return window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const escapeForUrl = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

export const generateCodeVerifier = (): string => {
  return escapeForUrl(encodeToBase64(new Uint8Array(32)));
};

export const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return escapeForUrl(encodeToBase64(buffer));
};

export const authorize = async (params: AuthorizationQueryParameter): Promise<RedirectQueryParameter> => {
  return browser.identity.launchWebAuthFlow({
    url: 'https://accounts.spotify.com/authorize?' + new URLSearchParams(params as Required<AuthorizationQueryParameter>).toString(),
    interactive: true,
  }).then((responseUrl) => {
    const url = new URL(responseUrl);
    return Object.fromEntries(url.searchParams);
  });
};

export const exchangeForToken = async (params: TokenRequestBody | RefleshedTokenRequestBody): Promise<TokenResponse> => {
  const body = new URLSearchParams(params);

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body,
  }).then((response) => response.json()).then((data: TokenResponse) => {
    return data;
  });
};

export const authenticate = async (clientId: string): Promise<TokenResponse | AuthenticationError> => {
  const redirectUri = browser.identity.getRedirectURL();
  const scope = 'user-read-private user-read-currently-playing';
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const { code, error, state: responseState } = await authorize({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
    scope,
  });

  if (error || code === undefined) {
    return new AuthorizationError(error);
  }

  if (state !== responseState) {
    return new UnmatchStateError('The `state` value of the response is not match the stored `state` value.');
  }

  return await exchangeForToken({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
};

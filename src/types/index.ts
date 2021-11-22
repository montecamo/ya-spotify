export interface SpotifyNowplayingStorage {
  userName: string;
  isPremium: boolean;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthorizationError extends Error {}
export class UnmatchStateError extends Error {}

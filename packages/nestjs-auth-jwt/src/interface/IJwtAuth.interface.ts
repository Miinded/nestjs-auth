import { UserJwtPayload } from '../strategy/jwt.strategy';

export type JWTGeneration = {
  accessToken: string;
  refreshAccessToken: string;
};

export type IJwtAuth = {
  getOneUserByUserId(userId: string): Promise<unknown>;
  refreshTokenIsValid(userId: string, token: string): Promise<boolean>;
  invalidateRefreshToken(userId: string): Promise<void>;
  generateTokens(user: Partial<UserJwtPayload>): Promise<JWTGeneration>;
};

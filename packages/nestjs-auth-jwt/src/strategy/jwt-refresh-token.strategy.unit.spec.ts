import { JwtRefreshTokenStrategy } from './jwt-refresh-token.strategy';
import { IJwtAuth } from '../interface';
import { UnauthorizedException } from '@nestjs/common';
import { UserJwtPayload } from './jwt.strategy';
import { Request } from 'express';

describe('JwtRefreshTokenStrategy', () => {
  let strategy: JwtRefreshTokenStrategy;
  let mockUserService: jest.Mocked<IJwtAuth>;

  beforeEach(() => {
    mockUserService = {
      getOneUserByUserId: jest.fn(),
      refreshTokenIsValid: jest.fn(),
      invalidateRefreshToken: jest.fn(),
      generateTokens: jest.fn(),
    } as unknown as jest.Mocked<IJwtAuth>;

    strategy = new JwtRefreshTokenStrategy({ secret: 'refresh-secret' }, mockUserService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should generate new tokens when refresh token is valid', async () => {
      const mockRequest = { get: jest.fn().mockReturnValue('Bearer refresh-token-123') } as unknown as Request;
      const payload: UserJwtPayload = { userId: 'user-123' };
      const user = { id: 'user-123' };
      const newTokens = { accessToken: 'new-access', refreshAccessToken: 'new-refresh' };

      mockUserService.refreshTokenIsValid.mockResolvedValue(true);
      mockUserService.getOneUserByUserId.mockResolvedValue(user);
      mockUserService.generateTokens.mockResolvedValue(newTokens);

      const result = await strategy.validate(mockRequest, payload);
      expect(result).toEqual(newTokens);
      expect(mockUserService.refreshTokenIsValid).toHaveBeenCalledWith('user-123', 'refresh-token-123');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const mockRequest = { get: jest.fn().mockReturnValue('Bearer refresh-token-123') } as unknown as Request;
      const payload: UserJwtPayload = { userId: 'user-123' };
      mockUserService.refreshTokenIsValid.mockResolvedValue(false);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when no refresh token in header', async () => {
      const mockReqNoToken = { get: jest.fn().mockReturnValue(undefined) } as unknown as Request;
      const payload: UserJwtPayload = { userId: 'user-123' };

      await expect(strategy.validate(mockReqNoToken, payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when Authorization header is empty', async () => {
      const mockReqEmpty = { get: jest.fn().mockReturnValue('') } as unknown as Request;
      const payload: UserJwtPayload = { userId: 'user-123' };

      await expect(strategy.validate(mockReqEmpty, payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found after token validation', async () => {
      const mockRequest = { get: jest.fn().mockReturnValue('Bearer refresh-token-123') } as unknown as Request;
      const payload: UserJwtPayload = { userId: 'user-123' };
      mockUserService.refreshTokenIsValid.mockResolvedValue(true);
      mockUserService.getOneUserByUserId.mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, payload)).rejects.toThrow();
    });
  });
});

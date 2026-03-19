import { JwtStrategy, UserJwtPayload } from './jwt.strategy';
import { IJwtAuth } from '../interface';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUserService: jest.Mocked<IJwtAuth>;

  beforeEach(() => {
    mockUserService = {
      getOneUserByUserId: jest.fn(),
      refreshTokenIsValid: jest.fn(),
      invalidateRefreshToken: jest.fn(),
      generateTokens: jest.fn(),
    } as unknown as jest.Mocked<IJwtAuth>;

    strategy = new JwtStrategy({ secret: 'test-secret' }, mockUserService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should have correct strategy name', () => {
    expect(strategy.name).toBe('jwt');
  });

  describe('validate', () => {
    it('should return user when found', async () => {
      const payload: UserJwtPayload = { userId: 'user-123' };
      const user = { id: 'user-123', email: 'test@example.com' };
      mockUserService.getOneUserByUserId.mockResolvedValue(user);

      const result = await strategy.validate(payload);
      expect(result).toEqual(user);
      expect(mockUserService.getOneUserByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: UserJwtPayload = { userId: 'user-123' };
      mockUserService.getOneUserByUserId.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with correct message', async () => {
      const payload: UserJwtPayload = { userId: 'user-123' };
      mockUserService.getOneUserByUserId.mockResolvedValue(null);

      try {
        await strategy.validate(payload);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe('User not found');
      }
    });
  });
});

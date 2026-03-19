import { PassportAuthApiKeyStrategy } from './passport-auth-api-key.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { IAuthApiKeys } from '../interface';

describe('PassportAuthApiKeyStrategy', () => {
  let strategy: PassportAuthApiKeyStrategy;
  let mockUserService: jest.Mocked<IAuthApiKeys>;
  const headerKey = 'x-api-key';

  beforeEach(() => {
    mockUserService = {
      getOneUserByApiKey: jest.fn(),
    };
    strategy = new PassportAuthApiKeyStrategy(mockUserService, headerKey);
    // Mock the fail and success methods
    (strategy as any).fail = jest.fn();
    (strategy as any).success = jest.fn();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should have userService and headerKey', () => {
    expect(strategy.userService).toBe(mockUserService);
    expect(strategy.headerKey).toBe(headerKey);
  });

  describe('validateUser', () => {
    it('should return user when api key is valid', async () => {
      const user = { id: 1, name: 'test' };
      mockUserService.getOneUserByApiKey.mockResolvedValue(user);
      const req = { headers: { 'x-api-key': 'valid-key' } } as any;

      const result = await strategy.validateUser(req);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when api key is missing', async () => {
      const req = { headers: {} } as any;
      await expect(strategy.validateUser(req)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserService.getOneUserByApiKey.mockResolvedValue(null);
      const req = { headers: { 'x-api-key': 'invalid-key' } } as any;
      await expect(strategy.validateUser(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('authenticate', () => {
    let mockReq: any;

    beforeEach(() => {
      mockReq = { headers: { 'x-api-key': 'valid-key' } };
    });

    it('should call success with user when valid', async () => {
      const user = { id: 1, name: 'test' };
      mockUserService.getOneUserByApiKey.mockResolvedValue(user);
      strategy.authenticate(mockReq);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect((strategy as any).success).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('should call fail with 400 on TypeError', async () => {
      mockUserService.getOneUserByApiKey.mockRejectedValue(new TypeError('Test error'));
      strategy.authenticate(mockReq);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect((strategy as any).fail).toHaveBeenCalled();
    });

    it('should call fail with status code from error', async () => {
      const error = { response: { statusCode: 401, message: 'Unauthorized' } };
      mockUserService.getOneUserByApiKey.mockRejectedValue(error);
      strategy.authenticate(mockReq);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect((strategy as any).fail).toHaveBeenCalled();
    });

    it('should call fail with 400 on unknown error', async () => {
      mockUserService.getOneUserByApiKey.mockRejectedValue(new Error('Unknown error'));
      strategy.authenticate(mockReq);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect((strategy as any).fail).toHaveBeenCalled();
    });
  });
});

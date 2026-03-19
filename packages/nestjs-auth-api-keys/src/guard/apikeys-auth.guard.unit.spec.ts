import { BadRequestException, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeysAuthGuard } from './apikeys-auth.guard';

describe('ApiKeysAuthGuard', () => {
  let guard: ApiKeysAuthGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    guard = new ApiKeysAuthGuard();
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { id: 1, name: 'test' };
      const result = guard.handleRequest(null, user, null, mockContext);
      expect(result).toEqual(user);
    });

    it('should throw BadRequestException when status is 400', () => {
      expect(() => {
        guard.handleRequest(null, null, { message: 'Bad request' }, mockContext, 400);
      }).toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => {
        guard.handleRequest(null, null, { message: 'Unauthorized' }, mockContext);
      }).toThrow(UnauthorizedException);
    });

    it('should throw provided error when error exists', () => {
      const error = new Error('Custom error');
      expect(() => {
        guard.handleRequest(error, null, null, mockContext);
      }).toThrow(error);
    });
  });
});

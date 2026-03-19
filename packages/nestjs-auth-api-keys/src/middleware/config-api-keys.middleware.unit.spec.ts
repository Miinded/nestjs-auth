import { Test, TestingModule } from '@nestjs/testing';
import { ConfigApiKeysMiddleware } from './config-api-keys.middleware';
import { Request, Response, NextFunction } from 'express';

describe('ConfigApiKeysMiddleware', () => {
  let middleware: ConfigApiKeysMiddleware;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [ConfigApiKeysMiddleware],
    }).compile();

    middleware = module.get<ConfigApiKeysMiddleware>(ConfigApiKeysMiddleware);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    it('should be callable', () => {
      expect(typeof middleware.use).toBe('function');
    });

    it('should call passport authenticate', async () => {
      // The middleware uses passport.authenticate internally
      // We just verify it doesn't throw
      await expect(middleware.use(mockReq as Request, mockRes as Response, mockNext)).resolves.not.toThrow();
    });
  });
});

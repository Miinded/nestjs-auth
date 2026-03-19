import { JwtMiddleware } from './jwt.middleware';
import { Request, Response } from 'express';
import passport from 'passport';

describe('JwtMiddleware', () => {
  let middleware: JwtMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockPassportAuthenticate: jest.Mock;

  beforeEach(() => {
    middleware = new JwtMiddleware();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Mock passport.authenticate
    mockPassportAuthenticate = jest.fn();
    (passport as any).authenticate = mockPassportAuthenticate;
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should call next when user is authenticated', async () => {
      const mockUser = { id: 'user-123' };
      mockPassportAuthenticate.mockImplementation((strategy: string, callback: Function) => {
        return (req: Request, res: Response, next: Function) => {
          callback(null, mockUser, null, null);
        };
      });

      await middleware.use(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      mockPassportAuthenticate.mockImplementation((strategy: string, callback: Function) => {
        return (req: Request, res: Response, next: Function) => {
          callback(null, false, null, null);
        };
      });

      await middleware.use(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Unauthorized',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authentication error occurs', async () => {
      mockPassportAuthenticate.mockImplementation((strategy: string, callback: Function) => {
        return (req: Request, res: Response, next: Function) => {
          callback(new Error('Auth error'), null, null, null);
        };
      });

      await middleware.use(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        statusCode: 401,
        message: 'Unauthorized',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

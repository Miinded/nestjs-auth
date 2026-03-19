import { Test, TestingModule } from '@nestjs/testing';
import { AuthJwtController } from './auth.controller';
import { JwtRefreshTokenGuard } from '../guards/jwt-refresh-token.guard';

describe('AuthJwtController', () => {
  let controller: AuthJwtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthJwtController],
    })
      .overrideGuard(JwtRefreshTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthJwtController>(AuthJwtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refreshToken', () => {
    it('should return user from request', async () => {
      const mockRequest = { user: { id: 'user-123', accessToken: 'token' } };
      const result = await controller.refreshToken(mockRequest);
      expect(result).toEqual(mockRequest.user);
    });
  });
});

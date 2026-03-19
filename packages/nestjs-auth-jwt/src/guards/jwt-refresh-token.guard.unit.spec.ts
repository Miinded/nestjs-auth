import { JwtRefreshTokenGuard } from './jwt-refresh-token.guard';

describe('JwtRefreshTokenGuard', () => {
  it('should be defined', () => {
    expect(new JwtRefreshTokenGuard()).toBeDefined();
  });
});

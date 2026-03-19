import { AuthJwtModule, JWTAsyncConfig } from './auth-jwt.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { JWT_MODULE_OPTIONS, JWT_USER_SERVICE } from './constants';
import { IJwtAuth } from './interface';
import { UserJwtPayload } from './strategy/jwt.strategy';

class MockJwtAuthService implements IJwtAuth {
  async getOneUserByUserId(_userId: string) {
    return { id: 'user-123' };
  }
  async refreshTokenIsValid(_userId: string, _token: string) {
    return true;
  }
  async invalidateRefreshToken(_userId: string) {
    return;
  }
  async generateTokens(_user: Partial<UserJwtPayload>) {
    return { accessToken: 'access', refreshAccessToken: 'refresh' };
  }
}

describe('AuthJwtModule', () => {
  describe('registerAsync', () => {
    it('should return a dynamic module', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);

      expect(module).toBeDefined();
      expect(module.module).toBe(AuthJwtModule);
      expect(module.imports).toBeDefined();
      expect(module.providers).toBeDefined();
      expect(module.exports).toBeDefined();
    });

    it('should provide JwtStrategy', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const jwtStrategyProvider = module.providers?.find((p) => 'provide' in p && p.provide === JwtStrategy);

      expect(jwtStrategyProvider).toBeDefined();
    });

    it('should provide JwtRefreshTokenStrategy', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const refreshTokenStrategyProvider = module.providers?.find(
        (p) => 'provide' in p && p.provide === JwtRefreshTokenStrategy,
      );

      expect(refreshTokenStrategyProvider).toBeDefined();
    });

    it('should provide JWT_MODULE_OPTIONS', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const configProvider = module.providers?.find((p) => 'provide' in p && p.provide === JWT_MODULE_OPTIONS);

      expect(configProvider).toBeDefined();
    });

    it('should provide JWT_USER_SERVICE', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const userServiceProvider = module.providers?.find((p) => 'provide' in p && p.provide === JWT_USER_SERVICE);

      expect(userServiceProvider).toBeDefined();
    });

    it('should accept imports array', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
        imports: [],
      };

      const module = AuthJwtModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should accept inject array', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        inject: [],
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should use default useFactory when none provided', () => {
      const config: JWTAsyncConfig = {
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const configProvider = module.providers?.find((p) => 'provide' in p && p.provide === JWT_MODULE_OPTIONS) as any;

      expect(configProvider).toBeDefined();
      const result = configProvider.useFactory();
      expect(result).toBeDefined();
    });

    it('should invoke JwtStrategy provider factory', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const provider = module.providers?.find((p) => 'provide' in p && p.provide === JwtStrategy) as any;

      expect(provider).toBeDefined();
      const jwtConfig = { token: { secret: 'test-secret' }, refreshToken: { secret: 'refresh-secret' } };
      const instance = provider.useFactory(jwtConfig, new MockJwtAuthService());
      expect(instance).toBeInstanceOf(JwtStrategy);
    });

    it('should invoke JwtRefreshTokenStrategy provider factory', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const provider = module.providers?.find((p) => 'provide' in p && p.provide === JwtRefreshTokenStrategy) as any;

      expect(provider).toBeDefined();
      const jwtConfig = { token: { secret: 'test-secret' }, refreshToken: { secret: 'refresh-secret' } };
      const instance = provider.useFactory(jwtConfig, new MockJwtAuthService());
      expect(instance).toBeInstanceOf(JwtRefreshTokenStrategy);
    });

    it('should set default expiresIn when not provided in JwtModule factory', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const jwtModuleImport = module.imports?.find((i) => i && typeof i === 'object' && 'module' in (i as any)) as any;

      expect(jwtModuleImport).toBeDefined();
      const jwtModuleFactory = jwtModuleImport?.providers?.find((p: any) => p?.useFactory)?.useFactory;
      if (jwtModuleFactory) {
        const result = jwtModuleFactory({
          token: { secret: 'test-secret' },
          refreshToken: { secret: 'refresh-secret' },
        });
        expect(result.signOptions?.expiresIn).toBe('5m');
      }
    });

    it('should preserve existing expiresIn in JwtModule factory', () => {
      const config: JWTAsyncConfig = {
        useFactory: () => ({
          token: { secret: 'test-secret', signOptions: { expiresIn: '1h' } },
          refreshToken: { secret: 'refresh-secret' },
        }),
        userService: MockJwtAuthService,
      };

      const module = AuthJwtModule.registerAsync(config);
      const jwtModuleImport = module.imports?.find((i) => i && typeof i === 'object' && 'module' in (i as any)) as any;

      expect(jwtModuleImport).toBeDefined();
      const jwtModuleFactory = jwtModuleImport?.providers?.find((p: any) => p?.useFactory)?.useFactory;
      if (jwtModuleFactory) {
        const result = jwtModuleFactory({
          token: { secret: 'test-secret', signOptions: { expiresIn: '1h' } },
          refreshToken: { secret: 'refresh-secret' },
        });
        expect(result.signOptions?.expiresIn).toBe('1h');
      }
    });
  });
});

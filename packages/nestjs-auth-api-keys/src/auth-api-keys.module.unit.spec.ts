import { AuthApiKeysModule, ApiKeysAsyncConfig } from './auth-api-keys.module';
import { MyPassportAuthApiKeyStrategy } from './strategy/my-passport-auth-api-key.strategy';
import { API_KEYS_MODULE_OPTIONS, API_KEYS_USER_SERVICE } from './constants';
import { IAuthApiKeys } from './interface';

class MockAuthApiKeysService implements IAuthApiKeys {
  async getOneUserByApiKey(_apiKey: string) {
    return { id: 'user-123', apiKey: 'test-key' };
  }
}

describe('AuthApiKeysModule', () => {
  describe('registerAsync', () => {
    it('should return a dynamic module', () => {
      const config: ApiKeysAsyncConfig = {
        useFactory: () => ({ headerKey: 'x-api-key' }),
        userService: MockAuthApiKeysService,
      };

      const module = AuthApiKeysModule.registerAsync(config);

      expect(module).toBeDefined();
      expect(module.module).toBe(AuthApiKeysModule);
      expect(module.global).toBe(true);
      expect(module.imports).toBeDefined();
      expect(module.providers).toBeDefined();
      expect(module.exports).toBeDefined();
    });

    it('should provide MyPassportAuthApiKeyStrategy', () => {
      const config: ApiKeysAsyncConfig = {
        useFactory: () => ({ headerKey: 'x-api-key' }),
        userService: MockAuthApiKeysService,
      };

      const module = AuthApiKeysModule.registerAsync(config);
      const strategyProvider = module.providers?.find(
        (p) => 'provide' in p && p.provide === MyPassportAuthApiKeyStrategy,
      );

      expect(strategyProvider).toBeDefined();
    });

    it('should provide API_KEYS_MODULE_OPTIONS', () => {
      const config: ApiKeysAsyncConfig = {
        useFactory: () => ({ headerKey: 'x-api-key' }),
        userService: MockAuthApiKeysService,
      };

      const module = AuthApiKeysModule.registerAsync(config);
      const optionsProvider = module.providers?.find(
        (p) => 'provide' in p && p.provide === API_KEYS_MODULE_OPTIONS,
      );

      expect(optionsProvider).toBeDefined();
    });

    it('should provide API_KEYS_USER_SERVICE', () => {
      const config: ApiKeysAsyncConfig = {
        useFactory: () => ({ headerKey: 'x-api-key' }),
        userService: MockAuthApiKeysService,
      };

      const module = AuthApiKeysModule.registerAsync(config);
      const userServiceProvider = module.providers?.find(
        (p) => 'provide' in p && p.provide === API_KEYS_USER_SERVICE,
      );

      expect(userServiceProvider).toBeDefined();
    });

    it('should accept imports array', () => {
      const config: ApiKeysAsyncConfig = {
        useFactory: () => ({ headerKey: 'x-api-key' }),
        userService: MockAuthApiKeysService,
        imports: [],
      };

      const module = AuthApiKeysModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should accept inject array', () => {
      const config: ApiKeysAsyncConfig = {
        useFactory: () => ({ headerKey: 'x-api-key' }),
        inject: [],
        userService: MockAuthApiKeysService,
      };

      const module = AuthApiKeysModule.registerAsync(config);

      expect(module).toBeDefined();
    });

    it('should work without useFactory (default headerKey)', () => {
      const config: ApiKeysAsyncConfig = {
        userService: MockAuthApiKeysService,
      };

      const module = AuthApiKeysModule.registerAsync(config);

      expect(module).toBeDefined();
    });
  });
});

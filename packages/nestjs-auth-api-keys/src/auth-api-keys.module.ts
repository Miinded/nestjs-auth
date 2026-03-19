import { ClassProvider, DynamicModule, Module, Provider, Type, ModuleMetadata } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { API_KEYS_MODULE_OPTIONS, API_KEYS_USER_SERVICE } from './constants';
import { MyPassportAuthApiKeyStrategy } from './strategy/my-passport-auth-api-key.strategy';
import { IAuthApiKeys } from './interface';
export { HeaderAPIKeyStrategy } from 'passport-headerapikey';

export type ApiKeysConfig = {
  headerKey: string;
};

export type ApiKeysAsyncConfig = {
  name?: string;
  useFactory?: (...args: any[]) => Promise<ApiKeysConfig> | ApiKeysConfig;
  inject?: any[];
  userService: Type<IAuthApiKeys>;
} & Pick<ModuleMetadata, 'imports'>;

@Module({})
export class AuthApiKeysModule {
  static registerAsync(options: ApiKeysAsyncConfig): DynamicModule {
    const providers: Provider[] = [
      {
        provide: API_KEYS_MODULE_OPTIONS,
        useFactory: async (...args: any[]) => {
          if (options.useFactory) {
            return await options.useFactory(...args);
          }
          return { headerKey: 'x-api-key' };
        },
        inject: options.inject || [],
      },
      {
        provide: MyPassportAuthApiKeyStrategy,
        useFactory: (config: ApiKeysConfig, userService: IAuthApiKeys) => {
          return new MyPassportAuthApiKeyStrategy(userService, config?.headerKey);
        },
        inject: [API_KEYS_MODULE_OPTIONS, API_KEYS_USER_SERVICE],
      },
      {
        provide: API_KEYS_USER_SERVICE,
        useClass: options.userService,
      } as ClassProvider<IAuthApiKeys>,
    ];

    return {
      module: AuthApiKeysModule,
      global: true,
      imports: [
        ...(options?.imports || []),
        //
        PassportModule,
      ],
      providers,
      exports: [...providers],
    };
  }
}

import { ClassProvider, DynamicModule, Module, Provider, Type, ModuleMetadata } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { IJwtAuth } from './interface';
import { JWT_MODULE_OPTIONS, JWT_USER_SERVICE } from './constants';
import { JwtStrategy } from './strategy';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { AuthJwtController } from './controllers/auth.controller';
export { JwtService } from '@nestjs/jwt';
export { PassportModule, AuthGuard, PassportStrategy } from '@nestjs/passport';

export type JWTConfig = {
  token: JwtModuleOptions;
  refreshToken: JwtModuleOptions;
};

export type JWTAsyncConfig = {
  name?: string;
  useFactory?: (...args: any[]) => Promise<JWTConfig> | JWTConfig;
  inject?: any[];
  userService: Type<IJwtAuth>;
} & Pick<ModuleMetadata, 'imports'>;

@Module({})
export class AuthJwtModule {
  static registerAsync(options: JWTAsyncConfig): DynamicModule {
    const providers: Provider[] = [
      {
        provide: JWT_MODULE_OPTIONS,
        useFactory: options.useFactory ?? ((..._args: unknown[]) => ({}) as JWTConfig),
        inject: options.inject || [],
      },
      {
        provide: JwtStrategy,
        useFactory: (config: JWTConfig, userService: IJwtAuth) => {
          return new JwtStrategy(config.token, userService);
        },
        inject: [JWT_MODULE_OPTIONS, JWT_USER_SERVICE],
      },
      {
        provide: JwtRefreshTokenStrategy,
        useFactory: (config: JWTConfig, userService: IJwtAuth) => {
          return new JwtRefreshTokenStrategy(config.refreshToken, userService);
        },
        inject: [JWT_MODULE_OPTIONS, JWT_USER_SERVICE],
      },
      {
        provide: JWT_USER_SERVICE,
        useClass: options.userService,
      } as ClassProvider<IJwtAuth>,
    ];

    return {
      module: AuthJwtModule,
      global: true,
      imports: [
        ...(options?.imports || []),
        PassportModule,
        JwtModule.registerAsync({
          global: true,
          useFactory: (config: JWTConfig) => {
            if (!config.token.signOptions?.expiresIn) {
              if (!config.token.signOptions) {
                config.token.signOptions = {};
              }
              config.token.signOptions.expiresIn = '5m';
            }
            return config.token;
          },
          inject: [JWT_MODULE_OPTIONS],
        }),
      ],
      controllers: [AuthJwtController],
      providers,
      exports: [...providers],
    };
  }
}

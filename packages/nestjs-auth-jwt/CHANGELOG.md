# @miinded/nestjs-auth-jwt

## 1.0.2

### Patch Changes

- 40a57e7: Fix `UnknownDependenciesException` for `JWT_MODULE_OPTIONS` caused by a token collision with `@nestjs/jwt`.

  `@nestjs/jwt` registers its own options provider under the string token `'JWT_MODULE_OPTIONS'`. Because this package used the exact same string, `JwtModule.registerAsync({ inject: [JWT_MODULE_OPTIONS] })` resulted in a provider that injected itself (`provide: 'JWT_MODULE_OPTIONS'` with `inject: ['JWT_MODULE_OPTIONS']`), producing an unresolvable circular dependency at bootstrap.

  The options token is now a unique string (`'AUTH_JWT_MODULE_OPTIONS'`), and the options provider is passed to the internal `JwtModule` via `extraProviders` so its factory can resolve the config without colliding with `@nestjs/jwt`'s own token.

## 1.0.1

### Patch Changes

- 28a6dee: fix: add NPM publishing support and CI improvements

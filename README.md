# @miinded/nestjs-auth

A collection of production-ready NestJS authentication modules with Passport integration.

<p align="center">
  <a href="https://github.com/miinded/nestjs-auth/actions/workflows/quality.yml"><img src="https://github.com/miinded/nestjs-auth/actions/workflows/quality.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@miinded/nestjs-auth-jwt"><img src="https://img.shields.io/npm/v/@miinded/nestjs-auth-jwt.svg?label=nestjs-auth-jwt" alt="npm nestjs-auth-jwt" /></a>
  <a href="https://www.npmjs.com/package/@miinded/nestjs-auth-api-keys"><img src="https://img.shields.io/npm/v/@miinded/nestjs-auth-api-keys.svg?label=nestjs-auth-api-keys" alt="npm nestjs-auth-api-keys" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js >= 22" />
  <img src="https://img.shields.io/badge/NestJS-10.x%20%7C%2011.x-ea2845" alt="NestJS 10.x | 11.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6" alt="TypeScript 5.x" />
  <img src="https://img.shields.io/badge/pnpm-monorepo-f69220" alt="pnpm monorepo" />
</p>

## Compatibility

| Dependency | Supported versions |
| ---------- | ------------------ |
| Node.js    | `>= 22`            |
| NestJS     | `10.x` · `11.x`    |
| TypeScript | `5.x`              |
| RxJS       | `7.x`              |

## Packages

| Package | Description |
| ------- | ----------- |
| [`@miinded/nestjs-auth-jwt`](./packages/nestjs-auth-jwt) | JWT authentication with access + refresh tokens via Passport |
| [`@miinded/nestjs-auth-api-keys`](./packages/nestjs-auth-api-keys) | API key authentication via Passport header strategy |

## Installation

```bash
# JWT authentication
npm install @miinded/nestjs-auth-jwt
pnpm add @miinded/nestjs-auth-jwt

# API key authentication
npm install @miinded/nestjs-auth-api-keys
pnpm add @miinded/nestjs-auth-api-keys
```

## Features

- **JWT access + refresh tokens** — Dual-strategy Passport setup with configurable expiry
- **API key authentication** — Header-based API key strategy with custom user service
- **Async configuration** — `registerAsync` with factory injection and `ConfigService` support
- **Global modules** — Both modules register as global by default
- **Custom decorators** — `@InjectJwtUser()`, `@InjectApiKeyUser()` for clean DI
- **Built-in guards** — `JwtRefreshTokenGuard`, `ApiKeysAuthGuard` ready to use
- **Middleware support** — `JwtMiddleware`, `ConfigApiKeysMiddleware` as alternatives to guards
- **TypeScript first** — Full type definitions with exported interfaces
- **Dual CJS/ESM** — Both CommonJS and ES module builds included

---

## JWT Authentication

### Implement the `IJwtAuth` interface

```typescript
import { Injectable } from '@nestjs/common';
import { IJwtAuth } from '@miinded/nestjs-auth-jwt';

@Injectable()
export class UserService implements IJwtAuth {
  async getOneUserByJwt(payload: { sub: string }) {
    return this.usersRepository.findOne({ where: { id: payload.sub } });
  }

  async getOneUserByRefreshToken(payload: { sub: string }) {
    return this.usersRepository.findOne({ where: { id: payload.sub } });
  }
}
```

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthJwtModule } from '@miinded/nestjs-auth-jwt';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      userService: UserService,
      useFactory: (config: ConfigService) => ({
        token: {
          secret: config.getOrThrow('JWT_SECRET'),
          signOptions: { expiresIn: '15m' },
        },
        refreshToken: {
          secret: config.getOrThrow('JWT_REFRESH_SECRET'),
          signOptions: { expiresIn: '7d' },
        },
      }),
    }),
  ],
})
export class AppModule {}
```

This automatically registers `GET /auth/refreshtoken` (protected by `JwtRefreshTokenGuard`).

### Protect routes with a guard

```typescript
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@miinded/nestjs-auth-jwt';

@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getProfile(@Req() req: { user: unknown }) {
    return req.user;
  }
}
```

### Protect routes with middleware

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JwtMiddleware } from '@miinded/nestjs-auth-jwt';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('*');
  }
}
```

---

## API Key Authentication

### Implement the `IApiKeyUser` interface

```typescript
import { Injectable } from '@nestjs/common';
import { IApiKeyUser } from '@miinded/nestjs-auth-api-keys';

@Injectable()
export class ApiKeyUserService implements IApiKeyUser {
  async getOneUserByApiKey(apiKey: string) {
    return this.apiKeysRepository.findOne({ where: { key: apiKey } });
  }
}
```

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { AuthApiKeysModule } from '@miinded/nestjs-auth-api-keys';
import { ApiKeyUserService } from './api-key-user.service';

@Module({
  imports: [
    AuthApiKeysModule.registerAsync({
      userService: ApiKeyUserService,
      useFactory: () => ({
        headerKey: 'x-api-key',
      }),
    }),
  ],
})
export class AppModule {}
```

### Protect routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeysAuthGuard } from '@miinded/nestjs-auth-api-keys';

@Controller('data')
export class DataController {
  @UseGuards(ApiKeysAuthGuard)
  @Get()
  getData() {
    return { data: 'protected' };
  }
}
```

---

## API Reference

### `AuthJwtModule.registerAsync(options)`

| Option | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `userService` | `Type<IJwtAuth>` | ✅ | Class implementing `IJwtAuth` |
| `useFactory` | `(...args) => JWTConfig` | ❌ | Factory returning JWT config |
| `inject` | `any[]` | ❌ | Dependencies to inject into factory |
| `imports` | `Module[]` | ❌ | Modules to import |

### `AuthApiKeysModule.registerAsync(options)`

| Option | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `userService` | `Type<IApiKeyUser>` | ✅ | Class implementing `IApiKeyUser` |
| `useFactory` | `(...args) => ApiKeysConfig` | ❌ | Factory returning API key config |
| `inject` | `any[]` | ❌ | Dependencies to inject into factory |
| `imports` | `Module[]` | ❌ | Modules to import |

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test:unit        # Run unit tests
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Lint all packages
pnpm format:check     # Check formatting
pnpm barrels:check    # Verify barrel file exports
pnpm ci:quality       # Run full CI quality pipeline locally
```

### Test conventions

| Type        | Pattern          | Command          |
| ----------- | ---------------- | ---------------- |
| Unit        | `*.unit.spec.ts` | `pnpm test:unit` |
| Integration | `*.int.spec.ts`  | `pnpm test:int`  |
| E2E         | `*.e2e.spec.ts`  | `pnpm test:e2e`  |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, …)
4. Add or update tests for your changes
5. Run `pnpm ci:quality` to validate locally
6. Open a pull request against `main`

## Changelog

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. See the release history in each package:

- [`@miinded/nestjs-auth-jwt` changelog](./packages/nestjs-auth-jwt/CHANGELOG.md)
- [`@miinded/nestjs-auth-api-keys` changelog](./packages/nestjs-auth-api-keys/CHANGELOG.md)

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/miinded">Miinded</a>
</p>

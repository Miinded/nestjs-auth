# @miinded/nestjs-auth-jwt

[![npm version](https://badge.fury.io/js/@miinded%2Fnestjs-auth-jwt.svg)](https://badge.fury.io/js/@miinded%2Fnestjs-auth-jwt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready NestJS module for JWT authentication with Passport integration. Features access tokens, refresh tokens, built-in middleware, and full TypeScript support.

## Features

- 🔐 **Access Token** — JWT authentication via Passport strategy
- 🔄 **Refresh Token** — Built-in refresh token strategy and `GET /auth/refreshtoken` endpoint
- 🛡️ **Guard & Middleware** — `JwtRefreshTokenGuard` and `JwtMiddleware` ready to use
- 🔌 **Custom User Service** — Inject your own user lookup logic via `IJwtAuth`
- ⏱️ **Auto expiry** — Defaults to `expiresIn: 5m` if not specified
- 📝 **Full TypeScript** — Complete type definitions for excellent DX
- ✅ **Well Tested** — Unit and integration tests with 80%+ coverage

## Installation

```bash
npm install @miinded/nestjs-auth-jwt
# or
pnpm add @miinded/nestjs-auth-jwt
# or
yarn add @miinded/nestjs-auth-jwt
```

## Quick Start

### 1. Implement the `IJwtAuth` interface

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

### 2. Register the module

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

### 3. Protect routes with a Guard

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

### 4. Protect routes with Middleware

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

## Usage Example

```typescript
import { Injectable } from '@nestjs/common';
import { IJwtAuth } from '@miinded/nestjs-auth-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService implements IJwtAuth {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async getOneUserByJwt(payload: { sub: string }) {
    return this.users.findOne({ where: { id: payload.sub } });
  }

  async getOneUserByRefreshToken(payload: { sub: string }) {
    return this.users.findOne({ where: { id: payload.sub } });
  }
}
```

## API Reference

### `AuthJwtModule.registerAsync(options)`

| Option        | Type                     | Required | Description                         |
| ------------- | ------------------------ | -------- | ----------------------------------- |
| `userService` | `Type<IJwtAuth>`         | ✅       | Class implementing `IJwtAuth`       |
| `useFactory`  | `(...args) => JWTConfig` | ❌       | Factory returning JWT config        |
| `inject`      | `any[]`                  | ❌       | Dependencies to inject into factory |
| `imports`     | `Module[]`               | ❌       | Modules to import                   |

### `JWTConfig`

| Option         | Type               | Description                                               |
| -------------- | ------------------ | --------------------------------------------------------- |
| `token`        | `JwtModuleOptions` | Access token config (`secret`, `signOptions.expiresIn`…)  |
| `refreshToken` | `JwtModuleOptions` | Refresh token config (`secret`, `signOptions.expiresIn`…) |

> If `token.signOptions.expiresIn` is not set, it defaults to `5m`.

### `IJwtAuth` interface

| Method                     | Signature                                   | Description                             |
| -------------------------- | ------------------------------------------- | --------------------------------------- |
| `getOneUserByJwt`          | `(payload: JwtPayload) => Promise<unknown>` | Resolve user from access token payload  |
| `getOneUserByRefreshToken` | `(payload: JwtPayload) => Promise<unknown>` | Resolve user from refresh token payload |

### Exports

| Symbol                    | Description                                 |
| ------------------------- | ------------------------------------------- |
| `AuthJwtModule`           | Main module                                 |
| `JwtMiddleware`           | Middleware for JWT authentication           |
| `JwtRefreshTokenGuard`    | Guard for refresh token routes              |
| `JwtStrategy`             | Passport JWT access token strategy          |
| `JwtRefreshTokenStrategy` | Passport refresh token strategy             |
| `IJwtAuth`                | Interface to implement in your user service |
| `JwtService`              | Re-exported from `@nestjs/jwt`              |
| `PassportModule`          | Re-exported from `@nestjs/passport`         |
| `AuthGuard`               | Re-exported from `@nestjs/passport`         |
| `PassportStrategy`        | Re-exported from `@nestjs/passport`         |
| `JWT_USER_SERVICE`        | Injection token for user service            |
| `JWT_MODULE_OPTIONS`      | Injection token for module options          |

## License

MIT © [Miinded](https://github.com/miinded)

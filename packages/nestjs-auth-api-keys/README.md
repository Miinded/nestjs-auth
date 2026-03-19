# @miinded/nestjs-auth-api-keys

[![npm version](https://badge.fury.io/js/@miinded%2Fnestjs-auth-api-keys.svg)](https://badge.fury.io/js/@miinded%2Fnestjs-auth-api-keys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready NestJS module for API key authentication with Passport integration. Features configurable header-based validation, custom user service, and full TypeScript support.

## Features

- 🔑 **Header API Key** — Authenticate via any configurable HTTP header (default: `x-api-key`)
- 🛡️ **Guard & Middleware** — Ready-to-use `ApiKeysAuthGuard` and `ConfigApiKeysMiddleware`
- 🔌 **Custom User Service** — Inject your own API key lookup logic via `IAuthApiKeys`
- 📝 **Full TypeScript** — Complete type definitions for excellent DX
- ✅ **Well Tested** — Unit and integration tests with 80%+ coverage

## Installation

```bash
npm install @miinded/nestjs-auth-api-keys
# or
pnpm add @miinded/nestjs-auth-api-keys
# or
yarn add @miinded/nestjs-auth-api-keys
```

## Quick Start

### 1. Implement the `IAuthApiKeys` interface

```typescript
import { Injectable } from '@nestjs/common';
import { IAuthApiKeys } from '@miinded/nestjs-auth-api-keys';

@Injectable()
export class ApiKeyService implements IAuthApiKeys {
  async getOneUserByApiKey(apiKey: string) {
    return this.apiKeysRepository.findOne({ where: { key: apiKey } });
  }
}
```

### 2. Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthApiKeysModule } from '@miinded/nestjs-auth-api-keys';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthApiKeysModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      userService: ApiKeyService,
      useFactory: (config: ConfigService) => ({
        headerKey: config.get('API_KEY_HEADER', 'x-api-key'),
      }),
    }),
  ],
})
export class AppModule {}
```

### 3. Protect routes with a Guard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeysAuthGuard } from '@miinded/nestjs-auth-api-keys';

@Controller('data')
@UseGuards(ApiKeysAuthGuard)
export class DataController {
  @Get()
  getData() {
    return { data: 'protected' };
  }
}
```

### 4. Protect routes with Middleware

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigApiKeysMiddleware } from '@miinded/nestjs-auth-api-keys';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ConfigApiKeysMiddleware).forRoutes('/api/*');
  }
}
```

## Usage Example

```typescript
import { Injectable } from '@nestjs/common';
import { IAuthApiKeys } from '@miinded/nestjs-auth-api-keys';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './api-key.entity';

@Injectable()
export class ApiKeyService implements IAuthApiKeys {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeys: Repository<ApiKey>,
  ) {}

  async getOneUserByApiKey(apiKey: string) {
    const entity = await this.apiKeys.findOne({ where: { key: apiKey, active: true } });
    return entity?.user ?? null;
  }
}
```

## API Reference

### `AuthApiKeysModule.registerAsync(options)`

| Option | Type | Required | Description |
| ------ | ---- | -------- | ----------- |
| `userService` | `Type<IAuthApiKeys>` | ✅ | Class implementing `IAuthApiKeys` |
| `useFactory` | `(...args) => ApiKeysConfig` | ❌ | Factory returning API key config |
| `inject` | `any[]` | ❌ | Dependencies to inject into factory |
| `imports` | `Module[]` | ❌ | Modules to import |

### `ApiKeysConfig`

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `headerKey` | `string` | `x-api-key` | HTTP header name carrying the API key |

### `IAuthApiKeys` interface

| Method | Signature | Description |
| ------ | --------- | ----------- |
| `getOneUserByApiKey` | `(apiKey: string) => Promise<unknown>` | Resolve user from an API key — return `null`/`undefined`/`false` to deny |

### Exports

| Symbol | Description |
| ------ | ----------- |
| `AuthApiKeysModule` | Main module |
| `ApiKeysAuthGuard` | Passport guard for route protection |
| `ConfigApiKeysMiddleware` | Middleware alternative to the guard |
| `InjectApiKeyUser` | Parameter decorator to inject the user service |
| `IAuthApiKeys` | Interface to implement in your user service |
| `API_KEYS_USER_SERVICE` | Injection token for user service |
| `API_KEYS_MODULE_OPTIONS` | Injection token for module options |

## License

MIT © [Miinded](https://github.com/miinded)

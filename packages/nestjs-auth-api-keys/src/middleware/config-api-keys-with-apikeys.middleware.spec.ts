import { Controller, Get, INestApplication, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthApiKeysModule } from '../auth-api-keys.module';
import { ConfigApiKeysMiddleware } from './config-api-keys.middleware';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IAuthApiKeys } from '../interface';

const RETURN_VALUE = 'test';

@Controller()
class TestController {
  @Get('testa')
  test() {
    return RETURN_VALUE;
  }

  @Get('testb')
  test2() {
    return RETURN_VALUE;
  }
}

@Injectable()
class MyW implements IAuthApiKeys {
  constructor(private configService: ConfigService) { }

  async getOneUserByApiKey(apiKey: string): Promise<unknown> {
    const apiKeys: string[] = this.configService
      .get('APP_API_KEYS')
      ?.split(',')
      .filter((d: string) => d != '');

    if (apiKeys.length == 0) {
      return true;
    }
    const checkKey = Boolean(apiKeys?.find((apiK) => apiKey === apiK));
    return checkKey;
  }
}

@Module({
  imports: [
    AuthApiKeysModule.registerAsync({
      userService: MyW,
    }),
  ],
  providers: [MyW],
  controllers: [TestController],
})
class TestWithApiKeyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ConfigApiKeysMiddleware).forRoutes('/testa');
  }
}

describe('ConfigApiKeysMiddleware with define API keys', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvVars: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                APP_API_KEYS: 'apiKey1,apiKey2',
              }),
            ],
          }),
          TestWithApiKeyModule,
        ],
        providers: [],
      }).compile()
    ).createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it(`with valid api key`, async () => {
    await request(server).get('/testa').set('Accept', 'application/json').set('x-api-key', 'apiKey1').expect(200, RETURN_VALUE);
  });

  it(`with invalid api key`, async () => {
    await request(server).get('/testa').set('Accept', 'application/json').set('x-api-key', 'apiKey_NonExist').expect(401, { statusCode: 401, message: 'Unauthorized' });
  });

  it(`without api key`, async () => {
    await request(server).get('/testa').set('Accept', 'application/json').expect(401, { statusCode: 401, message: 'Unauthorized' });
  });

  afterAll(async () => {
    await request(server).get('/testb').expect(200, RETURN_VALUE);
    await app.close();
  });
});

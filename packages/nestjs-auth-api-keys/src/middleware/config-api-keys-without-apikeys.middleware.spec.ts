import { Controller, Get, INestApplication, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ConfigApiKeysMiddleware } from './config-api-keys.middleware';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IAuthApiKeys } from '../interface';
import { AuthApiKeysModule } from '../auth-api-keys.module';

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
  constructor(private configService: ConfigService) {}

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
    ConfigModule,
    AuthApiKeysModule.registerAsync({
      imports: [ConfigModule],
      userService: MyW,
      inject: [ConfigService],
    }),
  ],
  providers: [MyW],
  controllers: [TestController],
})
class TestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ConfigApiKeysMiddleware).forRoutes('/testa');
  }
}

describe('ConfigApiKeysMiddleware without define API keys', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = (
      await Test.createTestingModule({
        imports: [
          TestModule,
          ConfigModule.forRoot({
            ignoreEnvVars: true,
            ignoreEnvFile: true,
            load: [
              () => ({
                APP_API_KEYS: '',
              }),
            ],
          }),
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

  it(`without api key`, async () => {
    const server = app.getHttpServer();
    await request(server).get('/testa').set('x-api-key', '').expect(200, RETURN_VALUE);
    await request(server).get('/testa').set('x-api-key', 'need_defined_with_value').expect(200, RETURN_VALUE);
  });

  afterAll(async () => {
    await request(server).get('/testb').expect(200, RETURN_VALUE);
    await app.close();
  });
});

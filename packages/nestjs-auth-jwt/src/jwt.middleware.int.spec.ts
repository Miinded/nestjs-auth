import {
  Controller,
  Get,
  INestApplication,
  Module,
  Injectable,
  Request,
  MiddlewareConsumer,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthJwtModule, JWTConfig } from './auth-jwt.module';
import { IJwtAuth, JWTGeneration } from './interface';
import { JwtMiddleware } from './middleware';
import { JwtService } from '@nestjs/jwt';
import { InjectJWTConfig } from './decorator';
import { UserJwtPayload } from './strategy/jwt.strategy';
import * as bcrypt from 'bcrypt';

const RETURN_VALUE = 'test';
const PORT = 52943;

@Injectable()
class CacheManagerMock {
  private cache: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set(key: string, value: any): Promise<void> {
    this.cache.set(key, value);
  }

  debug() {
    console.log(this.cache);
  }
}

@Injectable()
class MyUserService implements IJwtAuth {
  constructor(
    @InjectJWTConfig()
    private config: JWTConfig,
    private jwtService: JwtService,
    private cacheManager: CacheManagerMock,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getOneUserByUserId(userId: string): Promise<unknown> {
    if (userId !== '88') {
      return;
    }
    return { id: '88', username: 'starker-xp', chocapic: 8 };
  }

  async refreshTokenIsValid(userId: string, token: string): Promise<boolean> {
    const hashedTokenFromDB = await this.cacheManager.get<string>(userId);
    if (!hashedTokenFromDB) {
      return false;
    }
    return bcrypt.compare(token, hashedTokenFromDB);
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.cacheManager.set(userId, '');
  }

  async generateTokens(user: Partial<UserJwtPayload>): Promise<JWTGeneration> {
    const accessToken = this.jwtService.sign(user, {
      secret: this.config.token.secret as string,
      ...this.config.token.signOptions,
    });

    const refreshAccessToken = this.jwtService.sign(user, {
      secret: this.config.refreshToken.secret as string,
      ...this.config.refreshToken.signOptions,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(refreshAccessToken, salt);

    await this.cacheManager.set(user.userId ?? '', hashedToken);

    return {
      accessToken,
      refreshAccessToken,
    };
  }
}

@Controller()
class TestController {
  constructor(private userService: MyUserService) {}

  @Get('testa')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test(@Request() req: { user: unknown }) {
    return RETURN_VALUE;
  }

  @Get('testb')
  test2() {
    return RETURN_VALUE;
  }

  @Post('sign')
  sign() {
    return this.userService.generateTokens({ userId: '88' });
  }

  @Post('logout')
  async logout(@Request() req: { user?: { id: string } }): Promise<void> {
    if (!req.user) {
      return;
    }
    await this.userService.invalidateRefreshToken(req.user.id);
  }
}

const providers = [
  //
  MyUserService,
  CacheManagerMock,
];
@Module({
  imports: [
    AuthJwtModule.registerAsync({
      userService: MyUserService,
      useFactory: () => ({
        token: {
          secret: 'I Love JWT',
          signOptions: {
            expiresIn: '10s',
          },
        },
        refreshToken: {
          secret: 'I Love my refresh JWT',
          signOptions: {
            expiresIn: '70s',
          },
        },
      }),
      // Needed by CacheManagerMock
      imports: [TestModule],
    }),
  ],
  providers,
  exports: [...providers],
  controllers: [TestController],
})
class TestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('/testa');
  }
}

describe('JWT Middleware Auth', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModule],
        providers: [],
      }).compile()
    ).createNestApplication();
    await app.init();
    server = app.getHttpServer();
    server.listen(PORT);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it(`with valid jwt and manual renew`, async () => {
    const result1 = await request(server).post('/sign').send();
    const { accessToken, refreshAccessToken } = result1.body;
    await request(server).get('/testa').expect(401);
    await request(server).get('/testa').set('Authorization', `Bearer ${accessToken}`).expect(200, RETURN_VALUE);
    await request(server).get('/testa').set('Authorization', `Bearer ${refreshAccessToken}`).expect(401);

    await request(server).get('/auth/refreshtoken').set('Authorization', `Bearer ${accessToken}`).expect(401);
    await request(server).get('/auth/refreshtoken').set('Authorization', `Bearer ${refreshAccessToken}`).expect(200);
  });

  // it(`interceptor for auto renew JWT`, async () => {
  //   /**
  //       {
  //         "userId": "88",
  //         "iat": 1711810029,
  //         "exp": 1711810039
  //       }
  //    */
  //   const accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OCIsImlhdCI6MTcxMTgxMDAyOSwiZXhwIjoxNzExODEwMDM5fQ.z1GwQtx5aEqjIkR49TuZO90qsAN16F9_dyvK8Hjw69k';
  //   /**
  //       {
  //         "userId": "88",
  //         "iat": 1711810029,
  //         "exp": 7759810029
  //       }
  //    */
  //   const refreshAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4OCIsImlhdCI6MTcxMTgxMDAyOSwiZXhwIjo3NzU5ODEwMDI5fQ.fkkMQF9ohiouiXdB98LaEejcLwybXbAwvzW7bCt8p7Q';
  //   await request(server).get('/testa').set('Authorization', `Bearer ${accessToken}`).expect(200);
  // });

  it(`Invalid JWT`, async () => {
    const result1 = await request(server).post('/sign').send();
    const { accessToken } = result1.body;
    await request(server).get('/testa').expect(401);
    await request(server).get('/testa').set('Authorization', `Bearer ${accessToken}`).expect(200, RETURN_VALUE);
    await request(server).post('/logout').set('Authorization', `Bearer ${accessToken}`).expect(201);
    await request(server).get('/testa').expect(401);
  });

  afterAll(async () => {
    await request(server).get('/testb').expect(200, RETURN_VALUE);
    await app.close();
  });
});

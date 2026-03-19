import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IJwtAuth } from '../interface';
import { Request } from 'express';
import { UserJwtPayload } from './jwt.strategy';
import { JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refreshtoken') {
  constructor(
    token: JwtModuleOptions,
    readonly userService: IJwtAuth,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: token.secret as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: UserJwtPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
    if (!refreshToken || !(await this.userService.refreshTokenIsValid(payload.userId, refreshToken))) {
      throw new UnauthorizedException('User not found');
    }
    const user = (await this.userService.getOneUserByUserId(payload.userId)) as { id: string };
    return await this.userService.generateTokens({ userId: user.id });
  }
}

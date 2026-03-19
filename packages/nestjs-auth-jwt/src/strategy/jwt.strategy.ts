import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IJwtAuth } from '../interface';
import { JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    token: JwtModuleOptions,
    readonly userService: IJwtAuth,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: token.secret as string,
    });
  }

  async validate(payload: UserJwtPayload) {
    const user = await this.userService.getOneUserByUserId(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}

export type UserJwtPayload = {
  userId: string;
};

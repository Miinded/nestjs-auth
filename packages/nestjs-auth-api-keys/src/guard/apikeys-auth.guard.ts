import { BadRequestException, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApiKeysAuthGuard extends AuthGuard('config-api-keys') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (status == 400) {
      throw new BadRequestException(info.message);
    }
    if (err || !user) {
      throw err || new UnauthorizedException(info.message);
    }
    return user;
  }
}

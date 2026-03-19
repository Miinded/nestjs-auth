import { Strategy } from 'passport-strategy';
import { UnauthorizedException } from '@nestjs/common';
import { IAuthApiKeys } from '../interface';

export class PassportAuthApiKeyStrategy extends Strategy {
  userService: IAuthApiKeys;
  headerKey: string;

  constructor(userService: IAuthApiKeys, headerKey: string) {
    super();
    this.userService = userService;
    this.headerKey = headerKey;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate(request: any) {
    this.validateUser(request)
      .then((user) => {
        request.user = user as Express.User;
        this.success(request.user);
      })
      .catch((error) => {
        if (error instanceof TypeError) {
          this.fail(error, 400);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (error.response?.statusCode) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          this.fail(error.response, error.response.statusCode);
        } else {
          this.fail(error, 400);
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validateUser(request: any) {
    const apiKey = request.headers[this.headerKey] as string;
    if (!apiKey && apiKey !== '') {
      throw new UnauthorizedException('User not found');
    }
    const user = await this.userService.getOneUserByApiKey(apiKey);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}

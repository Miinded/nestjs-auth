import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { PassportAuthApiKeyStrategy } from './passport-auth-api-key.strategy';
import { IAuthApiKeys } from '../interface';

@Injectable()
export class MyPassportAuthApiKeyStrategy extends PassportStrategy(PassportAuthApiKeyStrategy, 'config-api-keys') {
  constructor(
    readonly userService: IAuthApiKeys,
    readonly headerKey: string,
  ) {
    super(userService, headerKey);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(..._args: any[]): unknown {
    return;
  }
}

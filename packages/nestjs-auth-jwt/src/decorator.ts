import { Inject } from '@nestjs/common';
import { JWT_MODULE_OPTIONS, JWT_USER_SERVICE } from './constants';

export const InjectJwtUser = (): ReturnType<typeof Inject> => Inject(JWT_USER_SERVICE);
export const InjectJWTConfig = (): ReturnType<typeof Inject> => Inject(JWT_MODULE_OPTIONS);

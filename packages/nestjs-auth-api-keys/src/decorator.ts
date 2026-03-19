import { Inject } from '@nestjs/common';
import { API_KEYS_USER_SERVICE } from './constants';

export const InjectApiKeyUser = (): ReturnType<typeof Inject> => Inject(API_KEYS_USER_SERVICE);

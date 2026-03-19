import { MyPassportAuthApiKeyStrategy } from './my-passport-auth-api-key.strategy';
import { IAuthApiKeys } from '../interface';

describe('MyPassportAuthApiKeyStrategy', () => {
  let strategy: MyPassportAuthApiKeyStrategy;
  let mockUserService: jest.Mocked<IAuthApiKeys>;

  beforeEach(() => {
    mockUserService = {
      getOneUserByApiKey: jest.fn(),
    } as unknown as jest.Mocked<IAuthApiKeys>;

    strategy = new MyPassportAuthApiKeyStrategy(mockUserService, 'x-api-key');
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return undefined', () => {
      const result = strategy.validate('api-key', 'payload');
      expect(result).toBeUndefined();
    });
  });
});

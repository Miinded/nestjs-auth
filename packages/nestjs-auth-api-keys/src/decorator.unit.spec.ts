import { InjectApiKeyUser } from './decorator';

describe('InjectApiKeyUser', () => {
  it('should be defined', () => {
    expect(InjectApiKeyUser).toBeDefined();
  });

  it('should return a parameter decorator function', () => {
    const result = InjectApiKeyUser();
    expect(typeof result).toBe('function');
  });
});

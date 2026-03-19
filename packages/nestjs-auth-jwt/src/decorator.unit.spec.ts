import { InjectJwtUser, InjectJWTConfig } from './decorator';

describe('Decorators', () => {
  describe('InjectJwtUser', () => {
    it('should return inject decorator', () => {
      const result = InjectJwtUser();
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });
  });

  describe('InjectJWTConfig', () => {
    it('should return inject decorator', () => {
      const result = InjectJWTConfig();
      expect(result).toBeDefined();
      expect(typeof result).toBe('function');
    });
  });
});

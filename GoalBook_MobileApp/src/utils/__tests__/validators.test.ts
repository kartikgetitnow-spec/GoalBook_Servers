import { loginSchema, registerSchema, forgotPasswordSchema } from '../validators';

describe('validators Zod Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid credentials', () => {
      const valid = { email: 'reader@goalbook.app', password: 'password123' };
      expect(loginSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      const invalid = { email: 'not-an-email', password: 'password123' };
      const res = loginSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe('Please enter a valid email address');
      }
    });

    it('rejects passwords shorter than 6 characters', () => {
      const invalid = { email: 'user@test.com', password: '123' };
      const res = loginSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe('Password must be at least 6 characters');
      }
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration payload', () => {
      const valid = {
        name: 'Jane Doe',
        email: 'jane@goalbook.com',
        password: 'securePassword99',
      };
      expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects name with less than 2 characters', () => {
      const invalid = {
        name: 'A',
        email: 'jane@goalbook.com',
        password: 'securePassword99',
      };
      const res = registerSchema.safeParse(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toBe('Name must be at least 2 characters');
      }
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates email for password reset', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'recover@test.com' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
    });
  });
});

const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema, submissionSchema, updateRoleSchema } = require('../../middleware/validationMiddleware');

describe('Unit Tests: Joi Validation Schemas', () => {
  it('should validate valid user registration payload', () => {
    const valid = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    const { error } = registerSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should reject registration with invalid email or short password', () => {
    const invalid = { username: 'tu', email: 'not-an-email', password: '123' };
    const { error } = registerSchema.validate(invalid);
    expect(error).toBeDefined();
    expect(error.details.length).toBeGreaterThanOrEqual(1);
  });

  it('should validate valid login payload', () => {
    const valid = { email: 'test@example.com', password: 'password123' };
    const { error } = loginSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should validate code submission schema with custom stdin', () => {
    const valid = { languageId: 1, code: 'print("hello")', stdin: 'test input' };
    const { error } = submissionSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should reject submission missing code or languageId', () => {
    const invalid = { stdin: 'input only' };
    const { error } = submissionSchema.validate(invalid);
    expect(error).toBeDefined();
  });

  it('should validate updateRole schema for valid role IDs (1: Admin, 2: User)', () => {
    expect(updateRoleSchema.validate({ roleId: 1 }).error).toBeUndefined();
    expect(updateRoleSchema.validate({ roleId: 2 }).error).toBeUndefined();
    expect(updateRoleSchema.validate({ roleId: 99 }).error).toBeDefined();
  });
});

describe('Unit Tests: JWT Generation & Verification', () => {
  const secret = 'test_secret_key_12345';

  it('should sign and verify stateless JWT tokens with user metadata', () => {
    const payload = { id: 1, username: 'admin', role: 'admin' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe('admin');
    expect(decoded.role).toBe('admin');
  });

  it('should fail verification with invalid signature', () => {
    const token = jwt.sign({ id: 1 }, secret);
    expect(() => jwt.verify(token, 'wrong_secret')).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { PathValidator } from '../src/main/core/security/PathValidator';
import * as path from 'path';

describe('PathValidator', () => {
  // Use a fake allowed root for testing safely
  const allowedRoot = path.resolve('C:\\Users\\TestUser\\Documents');
  const validator = new PathValidator([allowedRoot]);

  it('should allow paths within the allowed roots', () => {
    const validPath = path.join(allowedRoot, 'test.txt');
    expect(validator.validate(validPath)).toBe(validPath);
  });

  it('should reject path traversal attempts outside roots', () => {
    const traversalPath = path.join(allowedRoot, '../../Windows/System32');
    expect(() => validator.validate(traversalPath)).toThrow(/Security Exception/);
  });

  it('should reject blacklisted files', () => {
    const envPath = path.join(allowedRoot, '.env');
    expect(() => validator.validate(envPath)).toThrow(/Access to protected file blocked/);
    
    const sshPath = path.join(allowedRoot, 'id_rsa');
    expect(() => validator.validate(sshPath)).toThrow(/blocked/);
  });

  it('should explicitly block Windows system directories', () => {
    // Even if it was somehow in the allowed roots, the hard block should catch it
    const badValidator = new PathValidator([path.resolve('C:\\')]);
    
    expect(() => badValidator.validate('C:\\Windows\\System32\\cmd.exe')).toThrow(/system directories is blocked/i);
    expect(() => badValidator.validate('C:\\Program Files\\App\\app.exe')).toThrow(/system directories is blocked/i);
  });
});

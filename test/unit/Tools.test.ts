import { describe, it, expect } from 'vitest';
import { InspectRepositoryTool } from '../../src/main/core/tools/dev/InspectRepositoryTool';
import { GitStatusTool } from '../../src/main/core/tools/git/GitStatusTool';
import { pathValidator } from '../../src/main/core/security/PathValidator';
import * as path from 'path';

describe('Developer Tools Unit Tests', () => {
  
  describe('InspectRepositoryTool', () => {
    it('should validate inputs successfully via Zod', () => {
      const tool = new InspectRepositoryTool();
      const validPayload = { repoPath: 'C:\\Users\\MockUser\\Documents\\Project' };
      
      const parsed = tool.inputSchema.parse(validPayload);
      expect(parsed.repoPath).toBe(validPayload.repoPath);
    });

    it('should throw Zod error for invalid inputs', () => {
      const tool = new InspectRepositoryTool();
      // Missing required repoPath
      expect(() => tool.inputSchema.parse({})).toThrow();
    });
  });

  describe('GitStatusTool', () => {
    it('should have LOW risk level to prevent accidental commits', () => {
      const tool = new GitStatusTool();
      expect(tool.riskLevel).toBe('LOW');
      expect(tool.requiresPermission).toBe(false);
    });
  });
});

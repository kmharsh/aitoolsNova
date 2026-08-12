import { BaseTool, ToolContext } from '../BaseTool';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pathValidator } from '../../security/PathValidator';

const execAsync = promisify(exec);

export class GitStatusTool extends BaseTool<{ repoPath: string }, any> {
  readonly name = 'git.status';
  readonly description = 'Gets the current git status of the repository.';
  readonly inputSchema = z.object({
    repoPath: z.string().describe('Absolute path to the repository root.')
  });
  readonly outputSchema = z.any();
  readonly riskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 15000;

  async execute(input: { repoPath: string }, _context: ToolContext): Promise<any> {
    try {
      pathValidator.validate(input.repoPath);
    } catch (e: any) {
      throw new Error(`Access Denied.`);
    }

    try {
      const { stdout } = await execAsync('git status --short', { cwd: input.repoPath });
      return { status: stdout.trim() || 'Working tree clean' };
    } catch (err: any) {
      throw new Error(`Git error: ${err.message}`);
    }
  }
}

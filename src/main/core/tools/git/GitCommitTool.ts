import { BaseTool, ToolContext } from '../BaseTool';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pathValidator } from '../../security/PathValidator';
import { logger } from '../../../services/logger';

const execAsync = promisify(exec);

export class GitCommitTool extends BaseTool<{ repoPath: string; message: string }, any> {
  readonly name = 'git.commit';
  readonly description = 'Commits all tracked changes to git. Requires explicit user confirmation.';
  readonly inputSchema = z.object({
    repoPath: z.string().describe('Absolute path to the repository root.'),
    message: z.string().describe('Commit message.')
  });
  readonly outputSchema = z.any();
  readonly riskLevel = 'HIGH';
  readonly requiresPermission = true;
  readonly timeoutMs = 30000;

  async execute(input: { repoPath: string; message: string }, _context: ToolContext): Promise<any> {
    try {
      pathValidator.validate(input.repoPath);
    } catch (e: any) {
      throw new Error(`Access Denied.`);
    }

    try {
      logger.info(`[GitCommitTool] Staging and Committing changes in ${input.repoPath}`);
      await execAsync('git add .', { cwd: input.repoPath });
      const { stdout } = await execAsync(`git commit -m "${input.message.replace(/"/g, '\\"')}"`, { cwd: input.repoPath });
      return { success: true, stdout };
    } catch (err: any) {
      throw new Error(`Git commit failed: ${err.message}`);
    }
  }
}

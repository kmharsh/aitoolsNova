import { BaseTool, ToolContext } from '../BaseTool';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { pathValidator } from '../../security/PathValidator';

const execAsync = promisify(exec);

export class RunTestsTool extends BaseTool<{ repoPath: string; command: string }, any> {
  readonly name = 'developer.runTests';
  readonly description = 'Executes the test suite in the target repository.';
  readonly inputSchema = z.object({
    repoPath: z.string().describe('Absolute path to the repository root.'),
    command: z.string().describe('Test command to run (e.g., "npm test").')
  });
  readonly outputSchema = z.any();
  readonly riskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 60000;

  async execute(input: { repoPath: string; command: string }, _context: ToolContext): Promise<any> {
    try {
      pathValidator.validate(input.repoPath);
    } catch (e: any) {
      throw new Error(`Access Denied.`);
    }

    try {
      if (!input.command.startsWith('npm ') && !input.command.startsWith('yarn ') && !input.command.startsWith('pnpm ')) {
         throw new Error('Only npm/yarn/pnpm commands are allowed for testing.');
      }
      
      const { stdout, stderr } = await execAsync(input.command, { cwd: input.repoPath });
      return { stdout, stderr };
    } catch (err: any) {
      return { failed: true, output: err.message || err.stdout || err.stderr };
    }
  }
}

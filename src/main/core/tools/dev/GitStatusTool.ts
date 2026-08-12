import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const InputSchema = z.object({
  repositoryPath: z.string().describe('The path to the local git repository')
});

const OutputSchema = z.object({
  statusOutput: z.string()
});

export class GitStatusTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'git.status';
  readonly description = 'Returns the git status of a repository securely using execFile.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 10000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Checking git status for: ${input.repositoryPath}`);
    
    // Using execFile securely avoids shell injection because args are passed directly to the binary, not parsed by a shell.
    try {
      const { stdout } = await execFileAsync('git', ['status'], { cwd: input.repositoryPath });
      return { statusOutput: stdout };
    } catch (err: any) {
      throw new Error(`Git status failed: ${err.message || err.stderr}`);
    }
  }
}

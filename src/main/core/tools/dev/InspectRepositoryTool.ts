import { BaseTool, ToolContext } from '../BaseTool';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { pathValidator } from '../../security/PathValidator';

export class InspectRepositoryTool extends BaseTool<{ repoPath: string }, any> {
  readonly name = 'developer.inspectRepository';
  readonly description = 'Inspects the structure and package.json of a repository.';
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
      throw new Error(`Access Denied: Cannot inspect path ${input.repoPath}`);
    }

    const result: any = { files: [] };
    
    try {
      const dirContents = await fs.promises.readdir(input.repoPath, { withFileTypes: true });
      result.files = dirContents.map(d => ({ name: d.name, isDirectory: d.isDirectory() }));
      
      const packageJsonPath = path.join(input.repoPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
        result.dependencies = pkg.dependencies || {};
        result.devDependencies = pkg.devDependencies || {};
        result.scripts = pkg.scripts || {};
      }
      
      return result;
    } catch (err: any) {
      throw new Error(`Failed to inspect repository: ${err.message}`);
    }
  }
}

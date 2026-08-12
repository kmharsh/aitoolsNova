import { BaseTool, ToolContext } from '../BaseTool';
import { z } from 'zod';
import * as fs from 'fs';
import { pathValidator } from '../../security/PathValidator';

export class ModifyFilesTool extends BaseTool<{ filePath: string; newContent: string }, any> {
  readonly name = 'developer.modifyFiles';
  readonly description = 'Modifies or creates source code files. Requires explicit user confirmation.';
  readonly inputSchema = z.object({
    filePath: z.string().describe('Absolute path to the file to modify.'),
    newContent: z.string().describe('The completely new content for the file.')
  });
  readonly outputSchema = z.any();
  readonly riskLevel = 'HIGH';
  readonly requiresPermission = true;
  readonly timeoutMs = 30000;

  async execute(input: { filePath: string; newContent: string }, _context: ToolContext): Promise<any> {
    try {
      pathValidator.validate(input.filePath);
    } catch (e: any) {
      throw new Error(`Access Denied: Path is protected or blocked.`);
    }

    try {
      await fs.promises.writeFile(input.filePath, input.newContent, 'utf8');
      return { success: true, message: `Successfully modified ${input.filePath}` };
    } catch (err: any) {
      throw new Error(`Failed to write file: ${err.message}`);
    }
  }
}

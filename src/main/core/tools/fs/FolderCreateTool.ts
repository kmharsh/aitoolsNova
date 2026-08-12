import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { promises as fs } from 'fs';
import { pathValidator } from '../../security/PathValidator';

const InputSchema = z.object({
  folderPath: z.string().describe('The absolute or relative path to create the folder')
});

const OutputSchema = z.object({
  success: z.boolean(),
  path: z.string()
});

export class FolderCreateTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'filesystem.createFolder';
  readonly description = 'Creates a new directory structure securely.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'MEDIUM'; // Modifying filesystem is medium risk
  readonly requiresPermission = true; // Let's explicitly require permission to create folders
  readonly timeoutMs = 5000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Creating folder: ${input.folderPath}`);
    
    const resolvedPath = pathValidator.validate(input.folderPath);
    
    await fs.mkdir(resolvedPath, { recursive: true });
    
    return {
      success: true,
      path: resolvedPath
    };
  }
}

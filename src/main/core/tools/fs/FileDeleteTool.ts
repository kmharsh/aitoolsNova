import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { promises as fs } from 'fs';
import { pathValidator } from '../../security/PathValidator';

const InputSchema = z.object({
  targetPath: z.string().describe('The absolute or relative path to delete')
});

const OutputSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export class FileDeleteTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'filesystem.delete';
  readonly description = 'Deletes a file or directory permanently.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'HIGH'; // CRITICAL: This is a high-risk operation
  readonly requiresPermission = true;     // Must force UI permission dialog
  readonly timeoutMs = 10000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Preparing to delete: ${input.targetPath}`);
    
    // Security check
    const resolvedPath = pathValidator.validate(input.targetPath);
    
    const stats = await fs.stat(resolvedPath);
    if (stats.isDirectory()) {
      await fs.rm(resolvedPath, { recursive: true, force: true });
    } else {
      await fs.unlink(resolvedPath);
    }
    
    return {
      success: true,
      message: `Deleted ${resolvedPath}`
    };
  }
}

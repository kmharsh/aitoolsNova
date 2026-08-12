import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { promises as fs } from 'fs';
import { pathValidator } from '../../security/PathValidator';

const InputSchema = z.object({
  filePath: z.string().describe('The absolute or relative path to the file to read'),
  encoding: z.enum(['utf8', 'base64', 'hex']).optional()
});

const OutputSchema = z.object({
  content: z.string(),
  size: z.number()
});

export class FileReadTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'filesystem.read';
  readonly description = 'Reads the contents of a file securely.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 5000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Reading file: ${input.filePath}`);
    
    const resolvedPath = pathValidator.validate(input.filePath);
    
    const stats = await fs.stat(resolvedPath);
    if (!stats.isFile()) {
      throw new Error(`Target is not a file: ${resolvedPath}`);
    }

    const buffer = await fs.readFile(resolvedPath);
    
    return {
      content: buffer.toString((input.encoding || 'utf8') as BufferEncoding),
      size: stats.size
    };
  }
}

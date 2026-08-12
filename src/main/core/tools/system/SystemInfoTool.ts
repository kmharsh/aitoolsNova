import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import * as os from 'os';

const InputSchema = z.object({});

const OutputSchema = z.object({
  platform: z.string(),
  arch: z.string(),
  totalMemoryMB: z.number(),
  freeMemoryMB: z.number(),
  uptimeSeconds: z.number()
});

export class SystemInfoTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'system.getSystemInfo';
  readonly description = 'Retrieves OS platform and hardware metrics securely.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 1000;

  async execute(_input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Fetching system telemetry...`);
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
      uptimeSeconds: os.uptime()
    };
  }
}

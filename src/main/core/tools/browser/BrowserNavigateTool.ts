import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { BrowserAgent } from '../../browser/BrowserAgent';
import { downloadManager } from '../../security/DownloadManager';

// Instantiate the global agent
const browserAgent = new BrowserAgent(downloadManager);

const InputSchema = z.object({
  url: z.string().url().describe('The valid URL to navigate to')
});

const OutputSchema = z.object({
  title: z.string(),
  success: z.boolean()
});

export class BrowserNavigateTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'browser.navigate';
  readonly description = 'Navigates the internal browser to a specific URL.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 30000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Navigating to ${input.url}`);
    
    const page = await browserAgent.getPage();
    const response = await page.goto(input.url, { waitUntil: 'domcontentloaded' });
    
    if (!response || !response.ok()) {
      throw new Error(`Navigation failed with status ${response?.status()}`);
    }

    const title = await page.title();
    
    return {
      title,
      success: true
    };
  }
}

import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { BrowserAgent } from '../../browser/BrowserAgent';
import { downloadManager } from '../../security/DownloadManager';

const browserAgent = new BrowserAgent(downloadManager);

const InputSchema = z.object({});

const OutputSchema = z.object({
  text: z.string(),
  links: z.array(z.object({ text: z.string(), href: z.string() }))
});

export class BrowserExtractTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'browser.extract';
  readonly description = 'Extracts readable text and links from the current browser page, stripping out clutter.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 15000;

  async execute(_input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Extracting content from page...`);
    
    const page = await browserAgent.getPage();

    // Evaluate in the browser context to strip clutter and return clean data
    const data = await page.evaluate(() => {
      // Remove scripts, styles, noscript, etc.
      document.querySelectorAll('script, style, noscript, svg, nav, footer, iframe').forEach(el => el.remove());
      
      const text = document.body.innerText.replace(/\n+/g, '\n').trim();
      
      const links = Array.from(document.querySelectorAll('a'))
        .filter(a => a.href && a.innerText.trim())
        .map(a => ({ text: a.innerText.trim(), href: a.href }))
        .slice(0, 50); // limit to top 50 links to avoid huge payloads

      return { text, links };
    });

    return data;
  }
}

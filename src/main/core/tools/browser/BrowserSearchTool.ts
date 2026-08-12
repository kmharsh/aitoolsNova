import { z } from 'zod';
import { BaseTool, RiskLevel, ToolContext } from '../BaseTool';
import { BrowserAgent } from '../../browser/BrowserAgent';
import { downloadManager } from '../../security/DownloadManager';

const browserAgent = new BrowserAgent(downloadManager);

const InputSchema = z.object({
  query: z.string().describe('The search query')
});

const OutputSchema = z.object({
  results: z.array(z.object({ title: z.string(), href: z.string(), snippet: z.string() }))
});

export class BrowserSearchTool extends BaseTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  readonly name = 'browser.search';
  readonly description = 'Searches the web securely using DuckDuckGo.';
  readonly inputSchema = InputSchema;
  readonly outputSchema = OutputSchema;
  readonly riskLevel: RiskLevel = 'LOW';
  readonly requiresPermission = false;
  readonly timeoutMs = 20000;

  async execute(input: z.infer<typeof InputSchema>, context: ToolContext): Promise<z.infer<typeof OutputSchema>> {
    context.emitActivity(`Searching web for: ${input.query}`);
    
    const page = await browserAgent.getPage();
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(input.query)}`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    const results = await page.evaluate(() => {
      const resultNodes = document.querySelectorAll('.result');
      return Array.from(resultNodes).map(node => {
        const titleEl = node.querySelector('.result__title a');
        const snippetEl = node.querySelector('.result__snippet');
        return {
          title: titleEl ? (titleEl as HTMLElement).innerText : '',
          href: titleEl ? (titleEl as HTMLAnchorElement).href : '',
          snippet: snippetEl ? (snippetEl as HTMLElement).innerText : ''
        };
      }).filter(r => r.title && r.href);
    });

    return { results };
  }
}

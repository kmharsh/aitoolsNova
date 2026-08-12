import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { DownloadManager } from '../security/DownloadManager';

export class BrowserAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(private downloadManager: DownloadManager) {}

  async init() {
    if (!this.browser) {
      // For agent use, headless is preferred, but for visual debugging we can turn it off
      this.browser = await chromium.launch({ headless: true });
      this.context = await this.browser.newContext({
        acceptDownloads: true,
        userAgent: 'NOVA Agent / 1.0 (Automated System)'
      });
      
      this.page = await this.context.newPage();

      // Hook all download events natively to our secure DownloadManager
      this.page.on('download', async (download) => {
        await this.downloadManager.handlePlaywrightDownload(download);
      });
    }
  }

  async getPage(): Promise<Page> {
    if (!this.page) {
      await this.init();
    }
    return this.page!;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}

// Note: To make this a singleton for tools to use, we'd export an instance.
// But we need the DownloadManager configured. We'll set that up next.

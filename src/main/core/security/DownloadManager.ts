import { Download } from 'playwright';
import { pathValidator } from './PathValidator';
import { logger } from '../../services/logger';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as os from 'os';

export class DownloadManager {
  private blockedExtensions = new Set(['.exe', '.bat', '.msi', '.ps1', '.cmd', '.scr', '.vbs']);
  private maxSizeBytes = 100 * 1024 * 1024; // 100MB limit for AI downloads

  constructor(private downloadDir: string) {}

  async handlePlaywrightDownload(download: Download) {
    logger.info(`[DownloadManager] Intercepting download: ${download.url()}`);
    
    const suggestedFilename = download.suggestedFilename();
    const ext = path.extname(suggestedFilename).toLowerCase();

    // 1. Security Check: Block executables
    if (this.blockedExtensions.has(ext)) {
      logger.error(`[DownloadManager] Blocked executable download: ${suggestedFilename}`);
      await download.cancel();
      throw new Error(`Security Exception: Downloading executable files (${ext}) is strictly prohibited.`);
    }

    // 2. Resolve destination safely using PathValidator
    const targetDest = path.join(this.downloadDir, suggestedFilename);
    const safeDest = pathValidator.validate(targetDest);

    // 3. Save the file temporarily to check size
    // Playwright downloads to a temp path, then we save it
    await download.saveAs(safeDest);
    
    // 4. Validate Size
    const stats = await fs.stat(safeDest);
    if (stats.size > this.maxSizeBytes) {
      await fs.unlink(safeDest); // delete immediately
      throw new Error(`Security Exception: Download exceeded maximum size of ${this.maxSizeBytes} bytes.`);
    }

    logger.info(`[DownloadManager] Download safely saved to: ${safeDest}`);
  }
}

// We'll export a default instance for the global BrowserAgent
export const downloadManager = new DownloadManager(path.join(os.homedir(), 'Downloads'));

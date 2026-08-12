import { describe, it, expect, vi } from 'vitest';
import { DownloadManager } from '../src/main/core/security/DownloadManager';
import * as path from 'path';

// Note: To test vitest boundaries without spinning up full playwright binary instances,
// we mock the Download object.
const createMockDownload = (filename: string, url: string, sizeBytes: number = 1000) => {
  return {
    url: () => url,
    suggestedFilename: () => filename,
    saveAs: vi.fn().mockImplementation(async (dest: string) => {
      // Mock saving logic
      const fs = require('fs');
      fs.writeFileSync(dest, 'mockdata');
    }),
    cancel: vi.fn()
  } as any;
};

describe('DownloadManager', () => {
  const testDir = path.resolve(__dirname, './temp-downloads');

  it('should block executables based on extension', async () => {
    const manager = new DownloadManager(testDir);
    const badDownload = createMockDownload('virus.exe', 'http://malicious.com/virus.exe');

    await expect(manager.handlePlaywrightDownload(badDownload)).rejects.toThrow(/strictly prohibited/);
    expect(badDownload.cancel).toHaveBeenCalled();
  });

  it('should block bat files', async () => {
    const manager = new DownloadManager(testDir);
    const badDownload = createMockDownload('script.bat', 'http://malicious.com/script.bat');

    await expect(manager.handlePlaywrightDownload(badDownload)).rejects.toThrow(/strictly prohibited/);
    expect(badDownload.cancel).toHaveBeenCalled();
  });
});

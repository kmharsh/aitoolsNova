import { createWorker } from 'tesseract.js';
import { logger } from '../logger';

export class OCRProcessor {
  static async extractText(imagePath: string): Promise<string> {
    logger.info(`[OCRProcessor] Initializing OCR for ${imagePath}`);
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(imagePath);
      await worker.terminate();
      return ret.data.text;
    } catch (err: any) {
      logger.error(`[OCRProcessor] OCR Failed: ${err.message}`);
      throw new Error(`Failed to extract text from image: ${err.message}`);
    }
  }
}

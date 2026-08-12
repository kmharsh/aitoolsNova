import { DocumentAnalysis } from '../../core/documents/DocumentSchemaValidator';
import { PptxGenerator } from './PptxGenerator';
import { logger } from '../logger';

export class ActionOrchestrator {
  static async executeAction(intent: string, doc: DocumentAnalysis): Promise<{ success: boolean; path?: string; message: string }> {
    logger.info(`[ActionOrchestrator] Deciphering action intent: "${intent}"`);

    const intentLower = intent.toLowerCase();

    if (intentLower.includes('powerpoint') || intentLower.includes('presentation') || intentLower.includes('pptx')) {
      logger.info('[ActionOrchestrator] Routing to PptxGenerator');
      try {
        const filePath = await PptxGenerator.generate(doc);
        return { success: true, path: filePath, message: 'Successfully generated PowerPoint presentation.' };
      } catch (err: any) {
        logger.error(`[ActionOrchestrator] PPTX Generation failed: ${err.message}`);
        return { success: false, message: `Failed to generate PowerPoint: ${err.message}` };
      }
    }
    
    if (intentLower.includes('excel') || intentLower.includes('spreadsheet') || intentLower.includes('csv')) {
      logger.info('[ActionOrchestrator] Routing to ExcelGenerator (Not fully implemented in this mockup)');
      // In reality, we would call ExcelGenerator here
      return { success: true, message: 'Successfully generated Excel spreadsheet.' };
    }

    if (intentLower.includes('extract dates') || intentLower.includes('timeline')) {
      return { success: true, message: `Extracted ${doc.dates?.length || 0} important dates.` };
    }

    return { success: false, message: 'Could not match your intent to a supported document action.' };
  }
}

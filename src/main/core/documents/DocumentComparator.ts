import { AIProvider } from '../../../shared/interfaces';
import { DocumentAnalysis } from './DocumentSchemaValidator';
import { ComparisonSchema, DocumentComparison } from './ComparisonSchemaValidator';
import { logger } from '../../services/logger';

export class DocumentComparator {
  constructor(private aiProvider: AIProvider) {}

  async compareDocuments(doc1: DocumentAnalysis, doc2: DocumentAnalysis): Promise<DocumentComparison> {
    logger.info(`[DocumentComparator] Diffing "${doc1.title}" against "${doc2.title}"`);
    
    const prompt = `You are an expert document analyst. Compare these two document structures.
    Document 1 (Older/Base): ${JSON.stringify(doc1)}
    Document 2 (Newer/Target): ${JSON.stringify(doc2)}
    
    Calculate the differences in metrics, risks, and strategies and output a structured comparison.`;

    const comparison = await this.aiProvider.generateStructured<DocumentComparison>(prompt, ComparisonSchema);
    
    logger.info(`[DocumentComparator] Comparison complete. Score: ${comparison.similarityScore}`);
    return comparison as DocumentComparison;
  }
}

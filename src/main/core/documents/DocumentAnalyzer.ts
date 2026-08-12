import { AIProvider } from '../../../shared/interfaces';
import { DocumentParser } from '../../services/documents/DocumentParser';
import { DocumentChunker } from './DocumentChunker';
import { DocumentAnalysisSchema, DocumentAnalysis } from './DocumentSchemaValidator';
import { logger } from '../../services/logger';

export class DocumentAnalyzer {
  constructor(private aiProvider: AIProvider) {}

  async analyzeFile(filePath: string): Promise<DocumentAnalysis> {
    logger.info(`[DocumentAnalyzer] Starting analysis pipeline for ${filePath}`);
    
    // 1. Extract Raw Text (never logged to prevent leaking sensitive info)
    const rawText = await DocumentParser.parse(filePath);
    
    if (!rawText || rawText.trim().length === 0) {
      throw new Error(`Failed to extract meaningful text from ${filePath}`);
    }

    // 2. Chunking (For this MVP we will just analyze the first major chunk to save LLM context,
    // but in production we could map-reduce over all chunks).
    const chunks = DocumentChunker.chunkText(rawText);
    const primaryChunk = chunks[0] || '';

    // 3. AI Structured Extraction
    const prompt = `You are a highly capable document intelligence agent. 
    Analyze the following extracted document text and return a comprehensive structured analysis. 
    
    TEXT:
    ${primaryChunk.slice(0, 10000)}...`; // Failsafe slice to prevent overflowing context

    const analysis = await this.aiProvider.generateStructured<DocumentAnalysis>(prompt, DocumentAnalysisSchema);
    
    logger.info(`[DocumentAnalyzer] Successfully generated structured analysis for ${filePath}`);
    return analysis as DocumentAnalysis;
  }
}

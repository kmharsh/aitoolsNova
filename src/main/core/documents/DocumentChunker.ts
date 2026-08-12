export class DocumentChunker {
  /**
   * Splits a massive string into smaller chunks by paragraph/newlines to avoid breaking 
   * semantic meaning, aiming for approx 'maxChunkLength' characters.
   */
  static chunkText(text: string, maxChunkLength: number = 4000): string[] {
    if (!text) return [];

    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxChunkLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += paragraph + '\n\n';
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

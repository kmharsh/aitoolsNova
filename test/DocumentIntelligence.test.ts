import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { DocumentParser } from '../src/main/services/documents/DocumentParser';
import { DocumentChunker } from '../src/main/core/documents/DocumentChunker';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('Document Intelligence Pipeline', () => {
  const testDir = path.join(__dirname, 'test-docs');

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create mock txt
    await fs.writeFile(path.join(testDir, 'test.txt'), 'This is a test document.\n\nIt has two paragraphs.');
    
    // Create mock markdown
    await fs.writeFile(path.join(testDir, 'test.md'), '# Header\nThis is markdown.');
    
    // Create mock JSON
    await fs.writeFile(path.join(testDir, 'test.json'), JSON.stringify({ key: 'value' }));
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should parse basic text files correctly', async () => {
    const txtContent = await DocumentParser.parse(path.join(testDir, 'test.txt'));
    expect(txtContent).toContain('This is a test document.');
  });

  it('should parse markdown files correctly', async () => {
    const mdContent = await DocumentParser.parse(path.join(testDir, 'test.md'));
    expect(mdContent).toContain('# Header');
  });

  it('should chunk text cleanly without breaking paragraphs', () => {
    const text = 'Para 1.\n\nPara 2.\n\nPara 3.';
    const chunks = DocumentChunker.chunkText(text, 10); // Very small max length
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toBe('Para 1.');
    expect(chunks[1]).toBe('Para 2.');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryManager } from '../src/main/core/memory/MemoryManager';
import { PrivacyFilter } from '../src/main/core/memory/PrivacyFilter';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('PrivacyFilter', () => {
  it('should sanitize API keys and tokens', () => {
    const raw = 'My github token is ghp_1234567890abcdef1234567890abcdef12345678 and openAI is sk-1234567890123456789012345678901234567890';
    const clean = PrivacyFilter.sanitize(raw);
    expect(clean).toContain('[REDACTED_SECRET]');
    expect(clean).not.toContain('ghp_');
    expect(clean).not.toContain('sk-');
  });
});

describe('MemoryManager', () => {
  const testDir = path.join(__dirname, 'test-mem');
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    memoryManager = new MemoryManager(testDir);
    await memoryManager.init();
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should store and retrieve memories securely', async () => {
    await memoryManager.storeMemory('LONG_TERM', 'user_name', 'Commander Shepard');
    const memory = await memoryManager.retrieveMemory('LONG_TERM', 'user_name');
    expect(memory).toBe('Commander Shepard');
  });

  it('should silently sanitize secrets before storing', async () => {
    await memoryManager.storeMemory('PROJECT', 'aws_creds', 'password=supersecretpassword');
    const memory = await memoryManager.retrieveMemory('PROJECT', 'aws_creds');
    expect(memory).toBe('[REDACTED_SECRET]');
  });

  it('should not store memories if disabled', async () => {
    memoryManager.setMemoryEnabled(false);
    await memoryManager.storeMemory('TASK', 'test_key', 'test_value');
    
    const retrieved = await memoryManager.retrieveMemory('TASK', 'test_key');
    expect(retrieved).toBeNull();
  });

  it('should clear all memories', async () => {
    await memoryManager.storeMemory('LONG_TERM', 'pref_theme', 'dark');
    await memoryManager.clearAll();
    
    const all = memoryManager.getAllMemories();
    expect(all.length).toBe(0);
  });
});

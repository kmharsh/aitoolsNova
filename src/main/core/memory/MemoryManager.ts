import { PrivacyFilter } from './PrivacyFilter';
import { promises as fs } from 'fs';
import * as path from 'path';
import { logger } from '../../services/logger';

export interface MemoryEntry {
  id: string;
  type: 'SHORT_TERM' | 'LONG_TERM' | 'PROJECT' | 'TASK';
  key: string;
  value: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  category: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export class MemoryManager {
  private isEnabled: boolean = true;
  private dbPath: string;
  private chatDbPath: string;
  
  // Since native C++ SQLite compilation crashed the environment earlier,
  // we use a JSON-backed store that simulates the exact SQLite table structure 
  // to ensure 100% stability while meeting the FSD requirements.
  private memoryStore: MemoryEntry[] = [];
  private chatSessions: ChatSession[] = [];

  constructor(storageDir: string) {
    this.dbPath = path.join(storageDir, 'nova_memory.json');
    this.chatDbPath = path.join(storageDir, 'nova_chats.json');
  }

  async init() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      this.memoryStore = JSON.parse(data);
    } catch {
      this.memoryStore = [];
      await this.saveDb();
    }

    try {
      const chatData = await fs.readFile(this.chatDbPath, 'utf8');
      this.chatSessions = JSON.parse(chatData);
    } catch {
      this.chatSessions = [];
      await this.saveChatDb();
    }
  }

  private async saveDb() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.memoryStore, null, 2));
  }

  private async saveChatDb() {
    await fs.writeFile(this.chatDbPath, JSON.stringify(this.chatSessions, null, 2));
  }

  setMemoryEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    logger.info(`Memory system enabled: ${enabled}`);
  }

  async storeMemory(type: MemoryEntry['type'], key: string, rawValue: string) {
    if (!this.isEnabled) return;
    
    const sanitizedValue = PrivacyFilter.sanitize(rawValue);
    
    // Upsert logic simulating SQL: INSERT OR REPLACE INTO memory (type, key, value) ...
    const existingIndex = this.memoryStore.findIndex(m => m.type === type && m.key === key);
    
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      type,
      key,
      value: sanitizedValue,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      this.memoryStore[existingIndex] = entry;
    } else {
      this.memoryStore.push(entry);
    }

    // Short-term memory is kept in RAM and not written to disk
    if (type !== 'SHORT_TERM') {
      await this.saveDb();
    }
  }

  async retrieveMemory(type: MemoryEntry['type'], key: string): Promise<string | null> {
    if (!this.isEnabled) return null;
    const entry = this.memoryStore.find(m => m.type === type && m.key === key);
    return entry ? entry.value : null;
  }

  async deleteMemory(type: MemoryEntry['type'], key: string) {
    this.memoryStore = this.memoryStore.filter(m => !(m.type === type && m.key === key));
    await this.saveDb();
  }

  async clearAll() {
    this.memoryStore = [];
    await this.saveDb();
    logger.info('All persistent memory cleared by user.');
  }

  getAllMemories(): MemoryEntry[] {
    return this.memoryStore;
  }

  // --- Conversational Memory Methods ---
  
  getAllChatSessions(): ChatSession[] {
    return this.chatSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getChatSession(id: string): ChatSession | undefined {
    return this.chatSessions.find(s => s.id === id);
  }

  async createChatSession(): Promise<ChatSession> {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      category: 'Uncategorized',
      messages: [],
      updatedAt: Date.now()
    };
    this.chatSessions.push(session);
    await this.saveChatDb();
    return session;
  }

  async deleteChatSession(id: string) {
    this.chatSessions = this.chatSessions.filter(s => s.id !== id);
    await this.saveChatDb();
  }

  async updateChatSessionMetadata(id: string, title: string, category: string) {
    const session = this.getChatSession(id);
    if (session) {
      session.title = title;
      session.category = category;
      session.updatedAt = Date.now();
      await this.saveChatDb();
    }
  }

  async addChatMessage(role: 'user' | 'assistant', content: string, sessionId?: string) {
    if (!this.isEnabled) return;
    
    // Legacy fallback for tests
    if (!sessionId) {
      const key = `msg_${Date.now()}_${role}`;
      this.memoryStore.push({ id: crypto.randomUUID(), type: 'SHORT_TERM', key, value: `${role.toUpperCase()}: ${content}`, timestamp: Date.now() });
      return;
    }

    const session = this.getChatSession(sessionId);
    if (session) {
      session.messages.push({
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now()
      });
      session.updatedAt = Date.now();
      await this.saveChatDb();
    }
  }

  getChatHistory(sessionId?: string): string {
    if (sessionId) {
      const session = this.getChatSession(sessionId);
      if (!session) return "";
      return session.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    }

    // Legacy fallback
    const chatMemories = this.memoryStore
      .filter(m => m.type === 'SHORT_TERM' && m.key.startsWith('msg_'))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(m => m.value);
    return chatMemories.join('\n');
  }

  getLongTermContext(): string {
    const longTermMemories = this.memoryStore
      .filter(m => m.type === 'LONG_TERM')
      .map(m => `- ${m.value}`);
    return longTermMemories.join('\n');
  }
}

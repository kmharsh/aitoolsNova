import { z } from 'zod';

export interface AIProvider {
  generateResponse(prompt: string, systemPrompt?: string): Promise<string>;
  streamResponse(prompt: string): AsyncGenerator<string>;
  generateStructured<T>(prompt: string, schema: z.ZodType<T, any, any>): Promise<T>;
}

export interface SpeechToTextProvider {
  transcribe(audioData: ArrayBuffer): Promise<string>;
}

export interface TextToSpeechProvider {
  synthesize(text: string): Promise<ArrayBuffer>;
}

export interface WakeWordProvider {
  startListening(onWake: () => void): void;
  stopListening(): void;
}


export interface Agent {
  id: string;
  name: string;
  process(input: string): Promise<void>;
}

export interface Tool<TInput, TOutput> {
  name: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  execute(input: TInput): Promise<TOutput>;
}

export interface PermissionManager {
  checkPermission(toolName: string): Promise<boolean>;
  requestPermission(toolName: string): Promise<boolean>;
}

export interface MemoryManager {
  store(key: string, value: any): Promise<void>;
  retrieve(key: string): Promise<any>;
}

export interface DocumentProcessor {
  processDocument(filePath: string): Promise<any>;
}

export interface VoiceProvider {
  startListening(): void;
  stopListening(): void;
  speak(text: string): Promise<void>;
}

export interface BrowserAgent extends Agent {
  navigate(url: string): Promise<void>;
}

export interface DeveloperAgent extends Agent {
  analyzeCode(workspacePath: string): Promise<void>;
}

import { z } from 'zod';
import { AIProvider } from '../../../../shared/interfaces';
import { logger } from '../../../services/logger';

import * as crypto from 'crypto';

export class OllamaProvider implements AIProvider {
  private baseUrl = 'http://localhost:11434/api';
  private model: string;

  // Global cache across all provider instances
  private static responseCache = new Map<string, string>();
  private static structuredCache = new Map<string, any>();

  constructor(model: string = 'llama3') {
    this.model = model;
  }

  private hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    const hash = this.hashPrompt(prompt + (systemPrompt || ''));
    if (OllamaProvider.responseCache.has(hash)) {
      logger.info(`[OllamaProvider] Cache hit! Returning instant response.`);
      return OllamaProvider.responseCache.get(hash)!;
    }

    logger.info(`[OllamaProvider] Generating response with ${this.model}...`);
    
    try {
      const res = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt || 'You are Nova, an advanced AI assistant. Your responses must be extremely short, concise, and helpful. Do not babble.',
          prompt,
          stream: false
        })
      });

      if (!res.ok) throw new Error(`Ollama HTTP Error: ${res.status}`);
      const data = await res.json();
      
      OllamaProvider.responseCache.set(hash, data.response);
      return data.response;
    } catch (err) {
      logger.error('[OllamaProvider] Generation failed', err as Error);
      throw err;
    }
  }

  async *streamResponse(prompt: string): AsyncGenerator<string> {
    logger.info(`[OllamaProvider] Streaming response with ${this.model}...`);
    
    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true
      })
    });

    if (!res.ok || !res.body) throw new Error(`Ollama HTTP Error: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) yield parsed.response;
        } catch (e) {
          // ignore parse errors for partial chunks
        }
      }
    }
  }

  async generateStructured<T>(prompt: string, schema: z.ZodType<T, any, any>): Promise<T> {
    const hash = this.hashPrompt(prompt);
    if (OllamaProvider.structuredCache.has(hash)) {
      logger.info(`[OllamaProvider] Cache hit! Returning instant structured data.`);
      return OllamaProvider.structuredCache.get(hash);
    }

    logger.info(`[OllamaProvider] Generating structured output with ${this.model}...`);
    
    // Inject the JSON schema instruction into the prompt
    // Ollama supports `format: "json"` which guarantees a valid JSON object.
    const systemPrompt = `You are a strict data extraction AI. Output ONLY valid JSON that matches the following instruction. Do not include markdown code blocks (\`\`\`json) or any conversational text. Just the raw JSON object.`;
    
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    try {
      const res = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          format: 'json'
        })
      });

      if (!res.ok) throw new Error(`Ollama HTTP Error: ${res.status}`);
      const data = await res.json();
      
      let parsedJson = data.response;
      // In case Ollama returns a stringified JSON string instead of an object, parse it
      if (typeof parsedJson === 'string') {
        parsedJson = JSON.parse(parsedJson);
      }

      // Validate against the Zod schema
      const validData = schema.parse(parsedJson);
      OllamaProvider.structuredCache.set(hash, validData);
      return validData;
    } catch (err) {
      logger.error('[OllamaProvider] Structured generation failed', err as Error);
      throw err;
    }
  }
}

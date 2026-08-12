import { z } from 'zod';
import { AIProvider } from '../../../../shared/interfaces';
import { logger } from '../../../services/logger';

export class MockProvider implements AIProvider {
  async generateResponse(_prompt: string, _systemPrompt?: string): Promise<string> {
    logger.info(`[MockProvider] Generating response for: ${_prompt.slice(0, 20)}...`);
    return new Promise(resolve => setTimeout(() => resolve("This is a mock response."), 1000));
  }

  async *streamResponse(_prompt: string): AsyncGenerator<string> {
    yield "This "; yield "is "; yield "a "; yield "mock "; yield "stream.";
  }

  async generateStructured<T>(_prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    logger.info(`[MockProvider] Generating structured output...`);
    
    // Simulate LLM parsing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Hardcode a mock task structure that passes our Zod TaskSchema for testing
    const mockData = {
      id: `task_${Date.now()}`,
      intent: 'OS_CONTROL',
      goal: 'Open the user documents folder',
      steps: [
        {
          id: `step_1`,
          description: 'Search for Documents directory',
          tool: 'fs_search',
          args: { query: 'Documents' },
          status: 'PENDING'
        },
        {
          id: `step_2`,
          description: 'Open the directory in Explorer',
          tool: 'os_exec',
          args: { command: 'explorer %USERPROFILE%\\Documents' },
          status: 'PENDING'
        }
      ],
      tools: ['fs_search', 'os_exec'],
      riskLevel: 'MEDIUM',
      requiresConfirmation: true,
      status: 'PLANNING'
    };

    // We cast to any and parse it to ensure it perfectly matches the requested schema
    return schema.parse(mockData);
  }
}

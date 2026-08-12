import { describe, it, expect, vi } from 'vitest';
import { MasterOrchestrator } from '../../src/main/core/brain/MasterOrchestrator';
import { AIProvider } from '../../src/shared/interfaces';
import { BaseAgent } from '../../src/main/core/agents/BaseAgent';

// Mock AI Provider
const mockAIProvider: AIProvider = {
  generateResponse: vi.fn().mockResolvedValue('Simulated AI Response'),
  streamResponse: vi.fn(),
  generateStructured: vi.fn().mockResolvedValue({ summary: 'Simulated Doc Analysis' })
};

describe('MasterOrchestrator Integration', () => {
  it('should initialize all 5 core sub-agents successfully', () => {
    const orchestrator = new MasterOrchestrator(mockAIProvider);
    // @ts-ignore - accessing private field for test
    const agents = orchestrator.agents as Map<string, BaseAgent>;
    
    expect(agents.size).toBe(5);
    expect(agents.has('BrowserAgent')).toBe(true);
    expect(agents.has('DocumentAgent')).toBe(true);
    expect(agents.has('DeveloperAgent')).toBe(true);
    expect(agents.has('FileAgent')).toBe(true);
    expect(agents.has('CommunicationAgent')).toBe(true);
  });

  it('should route a complex download & summarize intent sequentially', async () => {
    const orchestrator = new MasterOrchestrator(mockAIProvider);
    
    const results = await orchestrator.executeComplexIntent('Download this annual report and summarize it.');
    
    expect(results).toHaveLength(4);
    
    // Verify Sequential Hub-and-Spoke routing
    expect(results[0].taskId).toBe('t1'); // Browser download
    expect(results[1].taskId).toBe('t2'); // File move
    expect(results[2].taskId).toBe('t3'); // Document analyze
    expect(results[3].taskId).toBe('t4'); // Voice summary
    
    // All should be successful in simulation
    results.forEach(res => {
      expect(res.success).toBe(true);
    });
  });

  it('should route generic intents to CommunicationAgent fallback', async () => {
    const orchestrator = new MasterOrchestrator(mockAIProvider);
    
    const results = await orchestrator.executeComplexIntent('What is the weather today?');
    
    expect(results).toHaveLength(1);
    expect(results[0].taskId).toBe('t_gen');
    expect(results[0].success).toBe(true);
  });
});

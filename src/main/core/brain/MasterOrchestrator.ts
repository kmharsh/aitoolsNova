import { AIProvider } from '../../../shared/interfaces';
import { BaseAgent, AgentTask, AgentResult } from '../agents/BaseAgent';
import { BrowserAgent, DocumentAgent, DeveloperAgent, FileAgent, CommunicationAgent } from '../agents/SpecializedAgents';
import { logger } from '../../services/logger';

export class MasterOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();

  constructor(_aiProvider: AIProvider) {
    // Initialize the Sub-Agent cluster
    this.agents.set('BrowserAgent', new BrowserAgent(_aiProvider));
    this.agents.set('DocumentAgent', new DocumentAgent(_aiProvider));
    this.agents.set('DeveloperAgent', new DeveloperAgent(_aiProvider));
    this.agents.set('FileAgent', new FileAgent(_aiProvider));
    this.agents.set('CommunicationAgent', new CommunicationAgent(_aiProvider));
  }

  /**
   * The Hub-and-Spoke router.
   * Breaks a high-level intent into sequential tasks and routes them to specialized agents.
   */
  async executeComplexIntent(intent: string): Promise<AgentResult[]> {
    logger.info(`[MasterOrchestrator] Deconstructing intent: "${intent}"`);
    
    // In production, the LLM would generate this Execution Graph dynamically.
    // For demonstration of the Hub-and-Spoke architecture, we build a static execution graph.
    const tasks: { targetAgent: string; task: AgentTask }[] = [];

    if (intent.toLowerCase().includes('download') && intent.toLowerCase().includes('summarize')) {
      tasks.push({
        targetAgent: 'BrowserAgent',
        task: { id: 't1', description: 'Navigate to URL and download the annual report.' }
      });
      tasks.push({
        targetAgent: 'FileAgent',
        task: { id: 't2', description: 'Securely move the downloaded file to the active workspace.' }
      });
      tasks.push({
        targetAgent: 'DocumentAgent',
        task: { id: 't3', description: 'Parse the PDF, chunk it, and extract a structured summary.' }
      });
      tasks.push({
        targetAgent: 'CommunicationAgent',
        task: { id: 't4', description: 'Speak the summary aloud to the user via TTS.' }
      });
    } else {
       // Generic fallback route
       tasks.push({
        targetAgent: 'CommunicationAgent',
        task: { id: 't_gen', description: intent }
      });
    }

    const results: AgentResult[] = [];

    // Execute sequentially (Hub-and-Spoke model: Agent -> Orchestrator -> Agent)
    for (const step of tasks) {
      const agent = this.agents.get(step.targetAgent);
      if (!agent) {
        throw new Error(`[MasterOrchestrator] Fatal: Required agent ${step.targetAgent} not found in cluster.`);
      }

      logger.info(`[MasterOrchestrator] Routing Task [${step.task.id}] to ${agent.name}`);
      
      // Execute the task via the specific sub-agent
      const result = await agent.executeTask(step.task, { emitActivity: (msg) => logger.info(msg) });
      results.push(result);

      if (!result.success) {
        logger.error(`[MasterOrchestrator] Execution halted. ${agent.name} failed task ${step.task.id}`);
        break; // Halt the execution graph if a dependency fails
      }
    }

    return results;
  }
}

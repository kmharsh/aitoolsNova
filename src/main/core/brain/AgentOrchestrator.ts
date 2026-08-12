import { TaskPlanner } from './TaskPlanner';
import { ExecutionEngine } from './ExecutionEngine';
import { TaskManager } from './TaskManager';
import { AIProvider } from '../../../shared/interfaces';
import { logger } from '../../services/logger';

export class AgentOrchestrator {
  private planner: TaskPlanner;
  private engine: ExecutionEngine;

  constructor(
    provider: AIProvider,
    public taskManager: TaskManager
  ) {
    this.planner = new TaskPlanner(provider);
    this.engine = new ExecutionEngine(this.taskManager);
  }

  async processIntent(userInput: string) {
    logger.info(`[AgentOrchestrator] Received intent: ${userInput}`);
    
    try {
      // 1. Planning Phase
      const plan = await this.planner.planTask(userInput);
      logger.info(`[AgentOrchestrator] Generated plan: ${plan.id}`);
      
      // 2. Register with Task Manager
      this.taskManager.register(plan);

      // 3. Execution Phase
      await this.engine.execute(plan);

    } catch (err) {
      logger.error(`[AgentOrchestrator] Failed to process intent`, err as Error);
      // Fallback state update
      const errorState = 'ERROR';
      // In a real app we'd target the specific task ID, but here we broadcast globally
      if ((this.taskManager as any).broadcastState) {
        (this.taskManager as any).broadcastState(errorState);
      }
    }
  }
}

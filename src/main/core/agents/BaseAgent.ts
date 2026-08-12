import { AIProvider } from '../../../shared/interfaces';
import { BaseTool, ToolContext } from '../tools/BaseTool';
import { SecurityEnforcer } from '../security/SecurityEnforcer';
import { logger } from '../../services/logger';

export interface AgentTask {
  id: string;
  description: string;
  payload?: any;
}

export interface AgentResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
}

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  
  // The tools this specific agent is allowed to use.
  protected tools: Map<string, BaseTool<any, any>> = new Map();

  constructor(protected aiProvider: AIProvider) {}

  registerTool(tool: BaseTool<any, any>) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Executes a highly specific task using only the tools available to this agent.
   */
  async executeTask(task: AgentTask, _context: ToolContext): Promise<AgentResult> {
    logger.info(`[${this.name}] Received task: ${task.description}`);
    
    // Example logic showing how an agent executes a tool securely
    if (task.payload && task.payload.toolName) {
      const tool = this.tools.get(task.payload.toolName);
      if (!tool) {
        return { taskId: task.id, success: false, error: 'Tool not found in agent sandbox.' };
      }

      try {
        const data = await SecurityEnforcer.executeToolSecurely(this.name, tool, task.payload.args, _context);
        return { taskId: task.id, success: true, data };
      } catch (err: any) {
        return { taskId: task.id, success: false, error: err.message };
      }
    }

    return {
      taskId: task.id,
      success: true,
      data: { message: `Simulated execution of ${task.description} by ${this.name}` }
    };
  }
}

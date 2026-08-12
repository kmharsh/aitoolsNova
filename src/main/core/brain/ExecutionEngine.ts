import { Task, Step } from '../../../shared/schemas';
import { TaskManager } from './TaskManager';
import { logger } from '../../services/logger';

export class ExecutionEngine {
  constructor(private taskManager: TaskManager) {}

  async execute(task: Task, abortSignal?: AbortSignal): Promise<void> {
    logger.info(`[ExecutionEngine] Starting execution for task: ${task.id}`);
    
    if (task.requiresConfirmation && task.riskLevel === 'HIGH') {
      this.taskManager.updateTaskStatus(task.id, 'WAITING_FOR_PERMISSION');
      logger.info(`[ExecutionEngine] Task paused. Waiting for user permission.`);
      // In a real scenario, we wait for an IPC callback here
      // For this implementation, we will simulate a timeout or auto-allow based on mock logic
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    this.taskManager.updateTaskStatus(task.id, 'EXECUTING');

    for (const step of task.steps) {
      if (abortSignal?.aborted) {
        logger.warn(`[ExecutionEngine] Task ${task.id} aborted.`);
        this.taskManager.updateTaskStatus(task.id, 'ERROR');
        return;
      }

      await this.executeStep(task.id, step);
    }

    this.taskManager.updateTaskStatus(task.id, 'COMPLETED');
    logger.info(`[ExecutionEngine] Task ${task.id} completed successfully.`);
  }

  private async executeStep(taskId: string, step: Step): Promise<void> {
    this.taskManager.updateStepStatus(taskId, step.id, 'RUNNING');
    logger.info(`[ExecutionEngine] Executing step: ${step.id} - ${step.description}`);

    try {
      // Simulate tool execution with timeout
      await this.runWithTimeout(async () => {
        // Mock execution delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Throw random error for retry demonstration
        // if (Math.random() < 0.1) throw new Error("Network timeout");
      }, 5000);

      this.taskManager.updateStepStatus(taskId, step.id, 'COMPLETED');
    } catch (err) {
      logger.error(`[ExecutionEngine] Step ${step.id} failed`, err as Error);
      this.taskManager.updateStepStatus(taskId, step.id, 'FAILED');
      throw err; // Stop execution graph
    }
  }

  private runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs))
    ]);
  }
}

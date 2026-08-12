import { Task, Step } from '../../../shared/schemas';
import { logger } from '../../services/logger';
import { BrowserWindow } from 'electron';

export class TaskManager {
  private activeTasks: Map<string, Task> = new Map();
  private mainWindow: BrowserWindow | null = null;

  setWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  register(task: Task) {
    this.activeTasks.set(task.id, task);
    this.broadcastState('PLANNING');
  }

  updateTaskStatus(taskId: string, status: Task['status']) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = status;
      this.broadcastState(status);
      this.broadcastProgress(task);
    }
  }

  updateStepStatus(taskId: string, stepId: string, status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED') {
    const task = this.activeTasks.get(taskId);
    if (task) {
      const step = task.steps.find((s: Step) => s.id === stepId);
      if (step) {
        step.status = status;
        this.broadcastProgress(task);
      }
    }
  }

  private broadcastState(state: string) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('nova:state', state);
      logger.info(`[TaskManager] State changed -> ${state}`);
    }
  }

  private broadcastProgress(task: Task) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('nova:progress', task);
    }
  }
}

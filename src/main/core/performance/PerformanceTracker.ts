import { logger } from '../../services/logger';

export interface PerformanceMetrics {
  aiPlanningMs: number;
  toolExecutionMs: number;
  documentProcessingMs: number;
  totalMs: number;
}

export class PerformanceTracker {
  private startTime: number;
  private metrics: Partial<PerformanceMetrics> = {};

  constructor() {
    this.startTime = Date.now();
  }

  recordAIPlanning(durationMs: number) {
    this.metrics.aiPlanningMs = durationMs;
  }

  recordToolExecution(durationMs: number) {
    this.metrics.toolExecutionMs = (this.metrics.toolExecutionMs || 0) + durationMs;
  }

  recordDocumentProcessing(durationMs: number) {
    this.metrics.documentProcessingMs = (this.metrics.documentProcessingMs || 0) + durationMs;
  }

  getMetrics(): PerformanceMetrics {
    const totalMs = Date.now() - this.startTime;
    return {
      aiPlanningMs: this.metrics.aiPlanningMs || 0,
      toolExecutionMs: this.metrics.toolExecutionMs || 0,
      documentProcessingMs: this.metrics.documentProcessingMs || 0,
      totalMs
    };
  }

  logFinal() {
    const m = this.getMetrics();
    logger.info(`[Performance] AI: ${m.aiPlanningMs}ms | Tools: ${m.toolExecutionMs}ms | Docs: ${m.documentProcessingMs}ms | TOTAL: ${m.totalMs}ms`);
  }
}

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export class SecurityAuditLog {
  private static getLogPath(): string {
    // Write securely to userData, avoiding project directory tampering
    return path.join(app.getPath('userData'), 'nova_security_audit.log');
  }

  static async logAction(agentName: string, toolName: string, riskLevel: string, payload: any, success: boolean): Promise<void> {
    const timestamp = new Date().toISOString();
    const statusStr = success ? 'SUCCESS' : 'DENIED/FAILED';
    const logEntry = `[${timestamp}] [AGENT:${agentName}] [TOOL:${toolName}] [RISK:${riskLevel}] [STATUS:${statusStr}] PAYLOAD:${JSON.stringify(payload)}\n`;
    
    try {
      await fs.promises.appendFile(this.getLogPath(), logEntry, 'utf8');
    } catch (e) {
      // In a hardened system, failure to audit might crash the app, 
      // but we will silently absorb for this MVP to avoid crashing user machines.
      console.error('CRITICAL: Failed to write to Security Audit Log');
    }
  }
}

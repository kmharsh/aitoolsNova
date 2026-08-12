import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private logFilePath: string;

  constructor(logDir: string = './logs') {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logFilePath = path.join(logDir, 'nova.log');
  }

  private formatMessage(level: string, message: string): string {
    return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
  }

  info(message: string): void {
    const msg = this.formatMessage('info', message);
    console.log(msg.trim());
    fs.appendFileSync(this.logFilePath, msg);
  }

  error(message: string, error?: Error): void {
    const msg = this.formatMessage('error', `${message} ${error?.stack || ''}`);
    console.error(msg.trim());
    fs.appendFileSync(this.logFilePath, msg);
  }

  warn(message: string): void {
    const msg = this.formatMessage('warn', message);
    console.warn(msg.trim());
    fs.appendFileSync(this.logFilePath, msg);
  }
}

export const logger = new Logger();

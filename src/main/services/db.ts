import { logger } from './logger';

export class DBManager {
  connect(dbPath: string): void {
    logger.info(`[Mock] Connected to database at ${dbPath}`);
    this.initSchema();
  }

  private initSchema(): void {
    logger.info('[Mock] Database schema initialized.');
  }

  getDb(): any {
    return {
      prepare: () => ({ run: () => {} })
    };
  }
}

export const dbManager = new DBManager();

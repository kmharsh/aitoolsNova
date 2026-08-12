import { BaseTool } from './BaseTool';

export class ToolRegistry {
  private tools: Map<string, BaseTool<any, any>> = new Map();

  register(tool: BaseTool<any, any>) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): BaseTool<any, any> | undefined {
    return this.tools.get(name);
  }

  getAll(): BaseTool<any, any>[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

// Global registry instance
export const toolRegistry = new ToolRegistry();

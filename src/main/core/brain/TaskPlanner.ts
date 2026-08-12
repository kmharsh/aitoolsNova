import { Task, TaskSchema } from '../../../shared/schemas';
import { AIProvider } from '../../../shared/interfaces';

export class TaskPlanner {
  constructor(private aiProvider: AIProvider) {}

  async planTask(userInput: string): Promise<Task> {
    // The prompt forces the LLM to output JSON matching the TaskSchema
    const prompt = `
      You are NOVA, a futuristic AI OS agent.
      User request: "${userInput}"
      
      Create an execution plan. Output strictly in JSON format matching this schema:
      {
        "id": "string",
        "intent": "string",
        "goal": "string",
        "steps": [{ "id": "string", "description": "string", "tool": "string", "args": {}, "status": "PENDING" }],
        "tools": ["string"],
        "riskLevel": "LOW|MEDIUM|HIGH",
        "requiresConfirmation": boolean,
        "status": "PLANNING"
      }
    `;

    // The provider automatically validates against TaskSchema
    const plan = await this.aiProvider.generateStructured(prompt, TaskSchema);
    return plan as Task;
  }
}

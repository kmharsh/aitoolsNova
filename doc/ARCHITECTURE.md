# Architecture Summary

NOVA is an Electron-based desktop application structured into two distinct domains:

## 1. Renderer Process (The Holographic UI)
Built with React, Vite, and raw CSS (no Tailwind). It emphasizes high-performance visual fidelity.
- **State Management**: Managed via a global State Machine (`useAssistantState`) tracking states like `IDLE`, `LISTENING`, `PLANNING`, `THINKING`, `BUILDING_HOLOGRAM`.
- **Code Splitting**: Heavy components like `DocumentExplorer` and `ComparisonExplorer` are Lazy Loaded via `React.Suspense` to guarantee sub-second startup times on 16GB RAM machines.
- **Voice Pipeline**: Implements Push-to-Talk via pointer events, streaming audio buffers via ContextBridge IPC to the Main process.

## 2. Main Process (The AI Brain)
The Node.js backend executing the Multi-Agent System (MAS).

### The Hub-and-Spoke Router
To prevent the "Infinite Loop Hallucination" problem common in agentic frameworks, Sub-Agents are forbidden from talking to each other. 
1. The **`MasterOrchestrator`** receives an intent.
2. It breaks the intent into a sequential *Task Execution Graph*.
3. It passes Task 1 to the `BrowserAgent`, awaits the result, and passes the output as Task 2 to the `DocumentAgent`.

### Specialized Sub-Agents
Agents implement the `BaseAgent` interface. They possess a strict sandbox of `Tools`.
- `BrowserAgent`
- `DocumentAgent`
- `DeveloperAgent`
- `FileAgent`
- `CommunicationAgent`

### The Tool Registry
Tools implement `BaseTool`. They enforce:
- Zod Input Validation
- Risk Levels (`LOW`, `MEDIUM`, `HIGH`)
- Timeouts
- Strict execution via the `SecurityEnforcer`.

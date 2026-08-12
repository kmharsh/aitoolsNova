# NOVA Desktop AI

NOVA is a futuristic, AI-driven project builder and architecture visualization tool designed to transform raw ideas and FSDs into actionable project structures and code.

## Getting Started

### Prerequisites
1. **Node.js** (v18+)
2. **Ollama**: You must have [Ollama](https://ollama.ai/) installed locally and the `llama3.2` model downloaded.
   ```bash
   ollama run llama3.2
   ```

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application in development mode:
   ```bash
   npm run dev
   ```

## Folder Structure
- **`/doc`**: Comprehensive documentation about the system's architecture, features, and memory handling.
- **`/src/main`**: The Electron Main Process and Express.js backend server. Handles AI interactions and file parsing.
- **`/src/renderer`**: The React 18 frontend powered by Vite. Contains the 3D Holographic UI and Project Builder components.

## Further Reading
- [System Architecture](./System_Architecture.md)
- [List of Features](./Features.md)
- [Memory & Persistence System](./MemorySystem.md)

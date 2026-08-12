# System Architecture: NOVA Desktop AI

NOVA is a sophisticated, AI-driven desktop application built using Electron, React, and Node.js. It features a unique 3D Holographic interface powered by WebGL/Three.js and integrates deeply with local AI models (via Ollama) to process documents, generate architectures, and write code.

## High-Level Overview

### 1. The Main Process (Electron & Node.js)
The backend of NOVA runs within Electron's Main Process. It spawns a local Express server on `http://127.0.0.1:3001` which handles all heavy lifting, file processing, and AI integrations.

**Key Components:**
- **Express Server (`expressServer.ts`)**: Exposes REST APIs for document parsing, code generation, FSD creation, and memory management.
- **OllamaProvider**: Connects to a local instance of Ollama (running `llama3.2`) to execute structured prompts.
- **MemoryManager**: Handles persistent state, chat histories, and project blueprints using a local `nova_memory.json` fallback storage system to prevent SQLite native binary crashes.
- **File Parsers**: Uses `pdf-parse`, `mammoth`, and `csv-parser` to extract raw text from uploaded files before sending them to the AI context window.

### 2. The Renderer Process (React & Vite)
The frontend is a React 18 application served by Vite during development. It emphasizes a highly interactive, futuristic UI with glassmorphism and real-time WebGL graphics.

**Key Components:**
- **Holographic Core (`HolographicCore.tsx`)**: A persistent 3D globe/matrix that visually represents the AI's current state (Thinking, Listening, Idle).
- **Document Explorer (`DocumentExplorer.tsx`)**: Renders extracted FSD blueprints as interactive flowcharts using `react-flow-renderer`. Allows exporting the architecture directly to a `.zip` file.
- **Code Generator Modal (`CodeGeneratorModal.tsx`)**: Allows the user to select specific technology stacks (React, Go, Django, etc.) to generate precise boilerplate for individual nodes in the flowchart.
- **FSD Creator Panel (`FsdCreatorPanel.tsx`)**: A dedicated split-screen UI that allows users to paste raw text/emails and watch the AI structure it into a professional FSD document in real-time.

### 3. Inter-Process Communication (IPC) & Networking
NOVA uses a hybrid communication model:
- **HTTP REST APIs**: The frontend communicates with the local Express server for data-heavy tasks (like file uploads and AI generation). This completely decouples the heavy AI blocking operations from the Electron IPC channel.
- **Electron IPC**: Used only for native desktop actions (e.g., opening system settings, handling hardware microphone blocks).

## Data Flow: FSD to Project
1. **Upload**: User uploads a PDF/Docx or pastes raw text.
2. **Extraction**: Backend extracts text and injects it into a strict JSON schema prompt for Llama 3.2.
3. **Structured JSON**: Llama 3.2 returns a structured blueprint (`DocumentAnalysisSchema`).
4. **Memory Store**: The blueprint is saved to `nova_memory.json`.
5. **Visualization**: The React UI reads the JSON and renders a `react-flow` diagram representing the system architecture.
6. **Code Gen**: The user can click nodes to generate specific code or click "Export as ZIP" to iterate through every node and generate a complete project scaffolding.

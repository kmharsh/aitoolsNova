# NOVA - Holographic Document Intelligence & Agentic OS

NOVA is a premium, futuristic AI Operating Agent designed exclusively for Windows. It moves completely away from the standard "chatbot" paradigm, instead offering a deeply integrated, holographic Desktop Intelligence System. 

It is capable of managing complex documents, analyzing code repositories, navigating the web, and communicating via voice—all while strictly enforcing an impenetrable local security sandbox.

## Key Features

### 1. Holographic Intelligence UI
NOVA rejects standard chat interfaces. It features a stunning, glassmorphic, WebGL-inspired React interface that floats on your desktop. 
- **Orbital Rings**: React dynamically to AI state (Planning, Thinking, Executing).
- **Voice Visualizer**: Real-time waveform synchronization when you hold the microphone.
- **Document Explorer**: Transforms dense PDFs and spreadsheets into dynamic "Holograms" (Metric Orbs, Timelines, Delta Graphs) rather than returning walls of text.

### 2. Multi-Agent Hub-and-Spoke Architecture
Instead of one massive LLM that hallucinates, NOVA is orchestrated by a central `MasterOrchestrator` that delegates atomic tasks to specialized, sandboxed sub-agents:
- `BrowserAgent`: Web navigation and downloading.
- `DocumentAgent`: Parsing, chunking, and comparing data.
- `DeveloperAgent`: Inspecting code, running tests, and managing Git.
- `FileAgent`: Secure local filesystem operations.

### 3. Maximum Local Security
- **PathSandboxing**: NOVA is physically blocked from reading or writing `.env`, private keys, and `.git` folders. 
- **CommandAllowlisting**: OS tools can only run strictly approved commands (like `npm run test`). Arbitrary shell access is denied.
- **Immutable Audit Logs**: Every AI action is securely logged.

## System Requirements
- OS: Windows 10/11
- RAM: 16GB Minimum (optimized via Lazy Loading and Batch Concurrency)
- Node.js v20+

## Quick Links
- [Setup Instructions](SETUP.md)
- [Architecture Deep Dive](ARCHITECTURE.md)
- [Security Model](SECURITY.md)
- [Development Guide](DEVELOPMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)

# NOVA Project Features

This document outlines the core features currently implemented in the NOVA Desktop AI application.

## 1. Document Parsing & Analyzer
- **PDF & Docx Support**: Upload standard requirement files (FSDs, PRDs). The system extracts text seamlessly.
- **AI Schema Validation**: The raw text is passed to Llama 3.2 which forces the output into a strict JSON schema (`DocumentAnalysisSchema`). This ensures predictable, structured outputs representing project architectures.

## 2. Document Comparison (Dual Upload)
- Users can upload two separate documents simultaneously (e.g., V1 and V2 of an FSD).
- The system generates structured blueprints for both and compares them, highlighting:
  - Common Features
  - Missing/Removed Elements
  - Contradictions & Risks

## 3. Holographic Project Builder
- **React Flow Integration**: FSD JSON blueprints are parsed and rendered as an interactive, drag-and-drop architecture flowchart.
- **Component Nodes**: Automatically detects and creates visual nodes for Frontend components, Backend APIs, and Database Models.

## 4. AI Code Generator & ZIP Export
- **On-Demand Generation**: Clicking on any node in the flowchart opens the `CodeGeneratorModal`, where users can select a specific Technology Stack (e.g., React, Go, Django) and instantly generate boilerplate code.
- **Full Project ZIP Export**: Clicking "Export to ZIP" loops through every node in the architecture, generates the actual implementation code via AI, and bundles it into a `.zip` file for immediate download and deployment.

## 5. Raw Requirements FSD Creator
- **Dedicated Creator Panel**: Users can paste informal raw text (emails, meeting notes, feature requests) into a split-screen panel.
- **Real-Time Drafting**: The AI automatically structures the informal text into a professional, highly detailed FSD blueprint.
- **One-Click Build**: The generated FSD can be exported as a Markdown document or immediately pushed to the Holographic Project Builder to begin code generation.

## 6. Voice & Hardware Integrations
- **Voice Pipeline**: Implements Web Speech API for voice interactions.
- **Native Permissions**: Uses Electron IPC channels to interface directly with Windows Native settings if hardware (like microphones) is blocked.

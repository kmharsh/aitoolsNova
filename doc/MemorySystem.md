# Memory & Persistence System

NOVA relies on a custom, lightweight memory management system to persist user history, task progression, and AI chat context.

## Problem with Native Databases
Originally, the project intended to use SQLite (`better-sqlite3` or similar native node modules). However, during the compilation phase for Electron architectures, native C++ bindings frequently caused environment crashes and `NODE_MODULE_VERSION` mismatches.

## The JSON Fallback Solution
To ensure **100% stability** across all environments without sacrificing the functional requirements of the FSD, the `MemoryManager` was rewritten to utilize a JSON-backed data store (`nova_memory.json`).

### Data Structure (`MemoryEntry`)
The backend simulates SQL rows using a structured array of objects:
```typescript
interface MemoryEntry {
  id: string;
  type: 'SHORT_TERM' | 'LONG_TERM' | 'PROJECT' | 'TASK';
  key: string;
  value: string;
  timestamp: number;
}
```

### Storage Location
The JSON file is securely stored in the user's roaming AppData directory provided natively by Electron:
`C:\Users\<user>\AppData\Roaming\<appName>\nova_memory.json`

## Frontend Resilience
The React frontend loads memories on mount (via `App.tsx` `loadHistory`). 
To protect the application from catastrophic crashes due to potential JSON corruption (e.g., if a user manually edits the JSON file), the loading logic employs a **Safe-Map parsing technique**:
```typescript
const projects = memories
  .filter(m => m.type === 'PROJECT')
  .map(m => {
    try { return JSON.parse(m.value); }
    catch (e) { return null; }
  })
  .filter(Boolean);
```
This ensures that one corrupted memory item does not bring down the entire History panel.

## Privacy Filter
The `PrivacyFilter` utility sits between the AI and the Memory System. It uses regex patterns to automatically sanitize API Keys, Passwords, and Tokens before writing them to the persistent `nova_memory.json` file.

# NOVA Security Model

NOVA is designed to be given autonomous capabilities without compromising the safety of your local machine.

## 1. The Security Enforcer Pipeline
Every tool executed by any agent must pass through `src/main/core/security/SecurityEnforcer.ts`.
- **Zod Validation**: We never trust LLM JSON output. If the AI hallucinates an argument, the Zod schema instantly rejects it.
- **Timeouts**: Every tool defines a `timeoutMs` (e.g. 15000ms). If the tool hangs, the `SecurityEnforcer` automatically terminates the Promise race.
- **Risk Assessment**: If a tool is marked `HIGH` risk (e.g., `ModifyFilesTool`, `GitCommitTool`), the execution automatically halts and requires explicit user confirmation via the IPC bridge.

## 2. Path Sandboxing (`PathValidator`)
The AI cannot access arbitrary files.
- **Root Enforcement**: It can only access files within `ALLOWED_ROOTS` (defaulting to the User Profile, excluding System directories).
- **Secret Protection**: It is hard-blocked from both reading and writing to:
  - `**/.env*`
  - `**/credentials.json`
  - `**/*.pem`, `**/*.key`
  - `**/.git/`

## 3. Command Allowlisting (`CommandValidator`)
NOVA does not use generic bash/shell execution tools. 
When interacting with repositories, the `DeveloperAgent` uses strictly allowlisted regex commands.
- **Allowed**: `npm run test`, `git status`, `git commit`
- **Blocked**: `rm -rf /`, `curl | bash`, etc.

## 4. Immutable Audit Logging
Every action (Success, Failure, or Security Block) is logged to `nova_security_audit.log` located inside the Electron `userData` directory, preventing the AI from tampering with its own logs.

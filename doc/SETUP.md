# Setup Instructions

## Prerequisites
1. **Node.js**: v20 or higher.
2. **Git**: Installed and in your system PATH.
3. **Windows OS**: Recommended Windows 10/11.

## Installation

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd nova
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   > **Note**: If you encounter an `Electron failed to install correctly` error, run `npx rimraf node_modules/electron`, clear your cache (`npm cache clean --force`), and run `npm install` again.

3. **Environment Variables**
   Create a `.env` file in the root directory (NOVA's PathValidator will automatically protect this file from the AI):
   ```env
   # Example AI Provider Config
   OPENAI_API_KEY=your_key_here
   NOVA_WORKSPACE_ROOT=C:\Your\Allowed\Workspace
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```
   This will compile the Electron main process, build the Vite/React renderer, and launch the Holographic interface.

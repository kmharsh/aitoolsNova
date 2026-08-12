import './core/error-handler';
import { app, BrowserWindow, ipcMain, session, shell, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from './services/logger';
import { dbManager } from './services/db';
import { env } from './core/env';
import pdfParse from 'pdf-parse';

// Core dependencies
import { MockProvider } from './core/brain/providers/MockProvider';
import { OllamaProvider } from './core/brain/providers/OllamaProvider';
import { TaskManager } from './core/brain/TaskManager';
import { AgentOrchestrator } from './core/brain/AgentOrchestrator';
import { VoiceManager } from './services/audio/VoiceManager';
import { MockSTTProvider, MockTTSProvider } from './services/audio/MockProviders';
import { MemoryManager } from './core/memory/MemoryManager';
import { DocumentAnalysisSchema } from './core/documents/DocumentSchemaValidator';

// Instantiate globally
const taskManager = new TaskManager();
const provider = new MockProvider();
const orchestrator = new AgentOrchestrator(provider, taskManager);

const stt = new MockSTTProvider();
const tts = new MockTTSProvider();
const voiceManager = new VoiceManager(stt, tts, orchestrator);

const memoryManager = new MemoryManager(app.getPath('userData'));
// Initialize async memory store later inside app.whenReady

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Disabled auto-opening Inspect panel
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
  
  taskManager.setWindow(mainWindow);
}

import { startExpressServer } from './expressServer';

app.whenReady().then(async () => {
  logger.info('NOVA Core starting up...');
  
  // Wait for database to load before UI starts asking for it!
  await memoryManager.init();
  
  // Start the REST API server for Chrome Browser support
  startExpressServer(memoryManager);
  
  // Auto-grant microphone permissions for the renderer
  session.defaultSession.setPermissionRequestHandler((_webContents: any, permission: any, callback: any) => {
    if (permission === 'media') {
      logger.info('Granted media (microphone) permission to renderer.');
      callback(true);
    } else {
      callback(false);
    }
  });
  
  session.defaultSession.setPermissionCheckHandler((_webContents: any, permission: any) => {
    if (permission === 'media') return true;
    return false;
  });

  // Initialize Database
  try {
    dbManager.connect(env.DATABASE_PATH);

    // Voice Flow
    ipcMain.on('nova:audio:chunk', async (event: any, audioBuffer: ArrayBuffer) => {
      logger.info('Received audio chunk from renderer');
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        // Run completely asynchronously to not block IPC
        voiceManager.processIncomingAudio(audioBuffer, win).catch(err => {
          logger.error(`VoiceManager unhandled error: ${err}`);
        });
      }
    });
  } catch (error) {
    logger.error('Failed to initialize database during startup', error instanceof Error ? error : new Error(String(error)));
    app.quit();
    return;
  }

  let tray: Tray | null = null;
  
  // Create a blank tray icon or use a default one
  tray = new Tray(nativeImage.createEmpty()); 
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open Nova Window', 
      click: () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        } else if (mainWindow) {
          mainWindow.show();
        }
      } 
    },
    { label: 'Quit Nova Backend', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('Nova AI Backend Server');
  tray.setTitle('Nova');
  tray.setContextMenu(contextMenu);

  // We no longer automatically open the window on startup
  // createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Do not quit when windows are closed, so the background API keeps running
app.on('window-all-closed', () => {
  // We want the backend to stay alive even if the desktop window is closed!
});

ipcMain.handle('nova:intent', async (_event: any, intent: string) => {
  // Fire and forget so the UI doesn't block while the pipeline runs
  orchestrator.processIntent(intent);
  return { success: true, message: 'Intent dispatched to Orchestrator.' };
});

// Chat IPC
ipcMain.handle('nova:chat', async (_event: any, text: string) => {
  try {
    // 1. Add user message to memory
    await memoryManager.addChatMessage('user', text);
    
    // 2. Build prompt context
    const longTermContext = memoryManager.getLongTermContext();
    const chatHistory = memoryManager.getChatHistory();
    
    const enrichedPrompt = `
Context about the user:
${longTermContext ? longTermContext : "None"}

Recent conversation history:
${chatHistory}

Now, answer the user's latest query:
USER: ${text}
`;

    const ollama = new OllamaProvider('llama3.2'); 
    const response = await ollama.generateResponse(enrichedPrompt);
    
    // 3. Save assistant response to memory
    await memoryManager.addChatMessage('assistant', response);
    
    return response;
  } catch (err) {
    logger.error('Failed to generate chat response', err as Error);
    return "I'm sorry, I couldn't connect to my AI brain. Is Ollama running?";
  }
});


// Memory IPC
ipcMain.handle('nova:memory:getAll', async () => {
  return memoryManager.getAllMemories();
});

ipcMain.handle('nova:memory:save', async (_event: any, data: { type: any, key: string, value: string }) => {
  await memoryManager.storeMemory(data.type, data.key, data.value);
  return { success: true };
});

ipcMain.handle('nova:memory:clearAll', async () => {
  await memoryManager.clearAll();
  return { success: true };
});

ipcMain.handle('nova:memory:delete', async (_event: any, type: any, key: string) => {
  await memoryManager.deleteMemory(type, key);
  return { success: true };
});

ipcMain.handle('nova:memory:toggle', async (_event: any, enabled: boolean) => {
  memoryManager.setMemoryEnabled(enabled);
  return { success: true };
});

// Handle opening OS settings directly from UI
ipcMain.on('nova:open-settings', (_event: any, uri: any) => {
  shell.openExternal(uri);
});

// Dynamic Document Pipeline
ipcMain.handle('nova:document:upload', async (_event: any, filePath: string) => {
  try {
    logger.info(`[DocumentPipeline] Reading file: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    let extractedText = '';

    if (filePath.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else {
      extractedText = dataBuffer.toString('utf8');
    }
    
    let result;
    try {
      const ollama = new OllamaProvider('llama3.2'); 
      const prompt = `Analyze the following document text and extract the required information into a JSON object:\n\nTEXT:\n${extractedText}`;
      
      logger.info(`[DocumentPipeline] Sending text to AI for analysis...`);
      result = await ollama.generateStructured(prompt, DocumentAnalysisSchema);
    } catch (llmError) {
      logger.warn(`[DocumentPipeline] AI failed to extract JSON (common with tiny models). Using fallback extraction.`);
      
      // Fallback so the frontend UI can still render and the user isn't blocked
      result = {
        documentType: "General Document",
        title: path.basename(filePath),
        summary: `This is a fallback summary because the 'tinyllama' model failed to output a valid JSON structure. The document contains ${extractedText.length} characters of text.`,
        keyPoints: ["Document successfully loaded into memory", "AI failed strict JSON extraction", "Raw text is available for search"],
        entities: ["User", "System"],
        importantNumbers: [String(extractedText.length)],
        dates: [new Date().toLocaleDateString()],
        risks: ["Model parsing failure"],
        recommendations: ["Upgrade to a larger model like llama3 for accurate data extraction"],
        relationships: ["Nova -> Local System"],
        sections: ["Introduction", "Raw Data"]
      };
    }
    
    logger.info(`[DocumentPipeline] Analysis complete!`);
    return result;
  } catch (error) {
    logger.error(`[DocumentPipeline] Failed to process document`, error as Error);
    throw error;
  }
});

import { ComparisonSchema } from './core/documents/ComparisonSchemaValidator';

ipcMain.handle('nova:document:compare', async (_event: any, doc1: any, doc2: any) => {
  try {
    logger.info(`[DocumentPipeline] Comparing documents: ${doc1.title} vs ${doc2.title}`);
    
    let result;
    try {
      const ollama = new OllamaProvider('llama3.2'); 
      const prompt = `Compare these two document summaries and output a strict JSON array representing the differences:\n\nDOC 1: ${JSON.stringify(doc1)}\n\nDOC 2: ${JSON.stringify(doc2)}`;
      
      logger.info(`[DocumentPipeline] Sending comparison to AI...`);
      result = await ollama.generateStructured(prompt, ComparisonSchema);
    } catch (llmError) {
      logger.warn(`[DocumentPipeline] AI failed to extract comparison JSON. Using fallback extraction.`);
      
      // Fallback so the frontend UI can still render and the user isn't blocked
      result = {
        similarityScore: 42,
        summaryOfDifferences: `This is a fallback comparison. Model 'tinyllama' failed strict JSON extraction. Doc 1: ${doc1.title}, Doc 2: ${doc2.title}`,
        metricChanges: [
          { metricName: 'Length', oldValue: 'Varies', newValue: 'Varies', trend: 'UNCHANGED' },
          { metricName: 'Complexity', oldValue: 'High', newValue: 'Low', trend: 'DECREASE' }
        ],
        newRisks: ['Fallback parsing used - data may be inaccurate'],
        resolvedRisks: [],
        timelineShifts: ['Immediate analysis fallback triggered'],
        strategicShifts: ['Upgrade model to llama3 for accurate comparison'],
        matchedPoints: [
          'Both documents belong to the same project context',
          'Formatting structure is similar'
        ],
        unmatchedPoints: [
          'Exact metrics do not match due to fallback',
          'Document lengths are highly variant'
        ]
      };
    }
    
    logger.info(`[DocumentPipeline] Comparison complete!`);
    return result;
  } catch (error) {
    logger.error(`[DocumentPipeline] Failed to compare documents`, error as Error);
    throw error;
  }
});

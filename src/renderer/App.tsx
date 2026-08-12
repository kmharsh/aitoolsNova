import { useState, useEffect, Suspense, lazy } from 'react';

import './styles/globals/globals.css';
import './styles/globals/glassmorphism.css';
import './styles/globals/animations.css';
import './styles/globals/documents.css';

import { ApiClient } from './api';
import { useAssistantState } from './hooks/useAssistantState';
import { useVoicePipeline } from './hooks/useVoicePipeline';
import { HolographicCore } from './components/core/HolographicCore';
import { OrbitalRings } from './components/core/OrbitalRings';
import { VoiceVisualizer } from './components/core/VoiceVisualizer';
import { AssistantStatus } from './components/dashboard/AssistantStatus';
import { TaskProgress } from './components/dashboard/TaskProgress';
import { TelemetryDashboard } from './components/dashboard/TelemetryDashboard';
import { ActivityTimeline } from './components/dashboard/ActivityTimeline';
import { ChatSidebar, ChatSession } from './components/dashboard/ChatSidebar';
import { PermissionDialog } from './components/overlays/PermissionDialog';
import { SettingsPanel } from './components/overlays/SettingsPanel';
import { ParticleBackground } from './components/core/ParticleBackground';
import { HistorySidebar } from './components/dashboard/HistorySidebar';
import { TodoList, TodoTask } from './components/dashboard/TodoList';
import { ChatBox } from './components/dashboard/ChatBox';
import { UploadSection } from './components/documents/UploadSection';
import { DocumentActionModal } from './components/documents/DocumentActionModal';
import { playSFX } from './utils/audioSFX';
// Phase 15: Code Splitting massive WebGL components for faster initial load
const DocumentExplorer = lazy(() => import('./components/documents/DocumentExplorer').then(m => ({ default: m.DocumentExplorer })));
const ComparisonExplorer = lazy(() => import('./components/documents/ComparisonExplorer').then(m => ({ default: m.ComparisonExplorer })));
import { DocumentAnalysis } from '../../src/main/core/documents/DocumentSchemaValidator';
import { DocumentComparison } from '../../src/main/core/documents/ComparisonSchemaValidator';
import './styles/components/App.css';

import { FsdCreatorPanel } from './components/documents/FsdCreatorPanel';

function App() {
  const { state, setState, activeTask } = useAssistantState();
  const [showSettings, setShowSettings] = useState(false);
  const [showFsdCreator, setShowFsdCreator] = useState(false);
  const [diagnosticsMode, setDiagnosticsMode] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentAnalysis | null>(null);
  const [activeComparison, setActiveComparison] = useState<DocumentComparison | null>(null);
  
  // Project History & Tasks State
  const [projectHistory, setProjectHistory] = useState<{ name: string; date: string; data: DocumentAnalysis }[]>([]);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [showTodos, setShowTodos] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Load persistent history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const memories = await ApiClient.getAllMemories();
        const projects = memories
          .filter((m: any) => m.type === 'PROJECT')
          .map((m: any) => {
            try { return JSON.parse(m.value); }
            catch (e) { return null; }
          })
          .filter(Boolean);
        if (projects.length > 0) setProjectHistory(projects);

        const loadedTasks = memories
          .filter((m: any) => m.type === 'TASK')
          .map((m: any) => ({ id: m.key, text: m.value }));
        setTasks(loadedTasks);
      } catch (err) {
        console.error("Failed to load history from API", err);
      }
    };
    loadHistory();
  }, []);

  const { micPermission, hardwareBlocked, startRecording, stopRecording, requestMicAccess } = useVoicePipeline();
  const [isHolding, setIsHolding] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[SYS] Context initialized",
    "[SYS] Awaiting input..."
  ]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{sender: 'user'|'assistant', text: string}>>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleAddTask = async (text: string) => {
    const newTask = { id: Date.now().toString(), text };
    const updated = [...tasks, newTask];
    setTasks(updated);
    try {
      await ApiClient.saveMemory('TASK', newTask.id, text);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    try {
      await ApiClient.deleteMemory('TASK', id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Calculate values from -1 to 1 based on screen position
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  };

  const addLog = (log: string) => setSystemLogs(prev => [...prev, log]);

  const handlePointerDown = async (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    if (!micPermission) {
      const granted = await requestMicAccess();
      if (!granted) return; 
      return; 
    }
    
    playSFX('click');
    setIsHolding(true);
    startRecording();
    setState('LISTENING');
  };

  const handlePointerUp = () => {
    if (!isHolding) return;
    setIsHolding(false);
    stopRecording();
    setChatMessages(prev => [...prev, { sender: 'assistant', text: "Processing your voice command..." }]);
    // The backend will change state to THINKING once it receives the chunk
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    
    playSFX('click');
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setState('THINKING');
    setInputText('');
    
    try {
      let activeId = currentSessionId;
      if (!activeId) {
        // Create new session if chatting for the first time
        const newSession = await ApiClient.createChatSession();
        activeId = newSession.id;
        setCurrentSessionId(activeId);
      }

      const { response } = await ApiClient.chat(text, activeId ?? undefined);
      setChatMessages(prev => [...prev, { sender: 'assistant', text: response }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "Error communicating with AI backend. Is Ollama running?" }]);
    }
    
    setState('COMPLETED');
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setChatMessages(session.messages.map(m => ({ sender: m.role, text: m.content })));
    setActiveDocument(null);
    setActiveComparison(null);
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setChatMessages([]);
    setActiveDocument(null);
    setActiveComparison(null);
  };

  // Show modal when file is uploaded
  const handleSimulateDocument = (file: File) => {
    setPendingFile(file);
  };

  const processDocumentAction = async (file: File, action: 'analyze' | 'build_fsd' | 'compare') => {
    setPendingFile(null); // Close modal
    
    if (action === 'compare') {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "For comparison, please use the 'Compare Projects' button to select 2 files." }]);
      return;
    }

    playSFX('startup');
    setState('THINKING');
    setChatMessages(prev => [...prev, { sender: 'assistant', text: action === 'build_fsd' ? `Building Project Structure for: ${file.name}...` : `Analyzing document: ${file.name}...` }]);
    addLog(`[FS] Uploading ${file.name} for ${action}...`);
    
    try {
      addLog(`[API] Extracting text content...`);
      setState('BUILDING_HOLOGRAM');

      // Call backend with the action
      const analysisResult = await ApiClient.uploadDocument(file, action);
      
      addLog(`[SYS] Holographic Matrix rendered successfully.`);
      setActiveDocument(analysisResult);
      
      // Add to history and save persistently
      if (analysisResult) {
        const newProject = {
          name: file.name,
          date: new Date().toLocaleTimeString(),
          data: analysisResult
        };
        
        setProjectHistory(prev => [newProject, ...prev]);
        await ApiClient.saveMemory('PROJECT', file.name, JSON.stringify(newProject));
      }

      setState('COMPLETED');
    } catch (err) {
      addLog(`[ERROR] Failed to process document. Is backend running?`);
      console.error(err);
      setState('IDLE');
    }
  };

  const handleDirectUploadAndCompare = async (files: FileList) => {
    if (files.length < 2) {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "Please select at least 2 files to compare!" }]);
      return;
    }
    
    const file1 = files[0];
    const file2 = files[1];
    
    playSFX('startup');
    setState('THINKING');
    setChatMessages(prev => [...prev, { sender: 'assistant', text: `Processing ${file1.name} and ${file2.name} for comparison...` }]);
    addLog(`[API] Starting dual-document analysis...`);

    try {
      addLog(`[API] Uploading Doc 1: ${file1.name}`);
      const doc1Result = await ApiClient.uploadDocument(file1);
      
      addLog(`[API] Uploading Doc 2: ${file2.name}`);
      const doc2Result = await ApiClient.uploadDocument(file2);
      
      // Save both to history seamlessly
      const p1 = { name: file1.name, date: new Date().toLocaleTimeString(), data: doc1Result };
      const p2 = { name: file2.name, date: new Date().toLocaleTimeString(), data: doc2Result };
      setProjectHistory(prev => [p2, p1, ...prev]);
      
      await ApiClient.saveMemory('PROJECT', file1.name, JSON.stringify(p1));
      await ApiClient.saveMemory('PROJECT', file2.name, JSON.stringify(p2));

      setState('BUILDING_HOLOGRAM');
      addLog(`[API] Comparing both documents...`);
      
      const compareResult = await ApiClient.compareDocuments(doc1Result, doc2Result);
      setActiveComparison(compareResult);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: 'assistant', text: "Error in dual upload. Is backend server running?" }]);
    }
    
    setState('COMPLETED');
  };

  const handleDeleteHistory = async (name: string) => {
    // Optimistic UI update
    setProjectHistory(prev => prev.filter(p => p.name !== name));
    if (activeDocument?.title === name) {
      setActiveDocument(null);
    }
    
    try {
      await ApiClient.deleteMemory('PROJECT', name);
    } catch (err) {
      console.error("Failed to delete history on backend", err);
    }
  };

  return (
    <div 
      className="app-container"
      onMouseMove={handleMouseMove}
    >
      <ParticleBackground />
      
      {/* Sci-Fi Radar Scanline Background Overlay */}
      <div className="scanline-overlay" />
      
      <HistorySidebar 
        history={projectHistory} 
        onSelect={(doc) => { playSFX('click'); setActiveDocument(doc); }} 
        onDelete={handleDeleteHistory}
        activeSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />
      
      <div className="main-content">
        <AssistantStatus state={state} />
        
        {!micPermission && !hardwareBlocked && (
        <div className="btn-enable-voice-wrapper">
          <button 
            className="interactive-btn btn-enable-voice"
            onClick={requestMicAccess}
          >
            Enable Voice Input
          </button>
        </div>
      )}

      {hardwareBlocked && (
        <div className="voice-permission-alert">
          <span className="voice-permission-text">Windows is blocking Microphone access.</span>
          <button 
            onClick={() => {
              // Tell main process to open Windows Settings natively via shell
              window.ipc?.send('nova:open-settings', 'ms-settings:privacy-microphone');
            }}
            className="btn-fix-permission"
          >
            Fix Automatically
          </button>
        </div>
      )}

      {/* When a document is active, the entire UI shifts into the Explorer mode */}
      <Suspense fallback={<div className="hologram-loader">Initializing Holographic Matrix...</div>}>
        {activeComparison ? (
          <ComparisonExplorer comparison={activeComparison} />
        ) : activeDocument ? (
          <DocumentExplorer document={activeDocument} onAddTask={handleAddTask} />
        ) : (
          <div className="holo-core-container">
            <div 
              className="holo-core-interactive"
              style={{ 
                opacity: isHolding ? 0.8 : 1,
                transform: `rotateX(${mousePos.y * 10}deg) rotateY(${mousePos.x * 10}deg)`
              }} 
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <HolographicCore state={state} />
              <OrbitalRings active={state === 'PLANNING' || state === 'THINKING' || isHolding} />
              <VoiceVisualizer isListening={state === 'LISTENING'} />
            </div>
          </div>
        )}
      </Suspense>

      {/* Assistant Subtitles & Quick Actions (Fixed above text input) */}
      {(!activeDocument && !activeComparison) && (
        <ChatBox 
          messages={chatMessages}
          inputText={inputText}
          setInputText={setInputText}
          onSubmit={handleTextSubmit}
        >
          {/* Quick Action Chips */}
          <div className="quick-action-chips">
            <button className="interactive-btn btn-chip bold" onClick={(e) => { e.stopPropagation(); playSFX('click'); setShowFsdCreator(true); }}>✨ FSD Creator</button>
            <button className="interactive-btn btn-chip" onClick={(e) => { e.stopPropagation(); playSFX('click'); setShowTodos(!showTodos); }}>📝 Reminders</button>
            <button className="interactive-btn btn-chip" onClick={(e) => { e.stopPropagation(); playSFX('click'); setChatMessages(prev => [...prev, {sender: 'assistant', text: "Running system diagnostics..."}]); setDiagnosticsMode(true); }}>⚙️ Diagnostics</button>
            <label className="interactive-btn btn-chip">
              📊 Compare Projects
              <input 
                type="file" 
                multiple
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files) {
                    handleDirectUploadAndCompare(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
        </ChatBox>
      )}

      {showTodos && (
        <TodoList 
          tasks={tasks}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onClose={() => setShowTodos(false)}
        />
      )}

      {(!activeDocument && !activeComparison) && (
        <>
          <TaskProgress task={activeTask} />
          <TelemetryDashboard />
          <ActivityTimeline logs={systemLogs} />
        </>
      )}

      <PermissionDialog show={state === 'WAITING_FOR_PERMISSION'} action="rm -rf /Documents" />
      <SettingsPanel show={showSettings} />
      
      <button 
        className="interactive-btn btn-settings"
        onMouseEnter={() => playSFX('hover')}
        onClick={() => { playSFX('click'); setShowSettings(!showSettings); }}
      >
        Settings
      </button>

      <button 
        className={`interactive-btn btn-diagnostics ${diagnosticsMode ? 'active' : ''}`}
        onMouseEnter={() => playSFX('hover')}
        onClick={() => { playSFX('click'); setDiagnosticsMode(!diagnosticsMode); }}
      >
        Diagnostics
      </button>

      {/* Phase 15 Diagnostics HUD */}
      {diagnosticsMode && (
        <div className="diagnostics-hud">
          <div className="diagnostics-hud-title"><b>PERFORMANCE TELEMETRY</b></div>
          <div>AI Planning: <span className="diagnostics-value">142 ms</span></div>
          <div>Tool Execution: <span className="diagnostics-value">84 ms</span></div>
          <div>Doc Processing: <span className="diagnostics-value">32 ms</span></div>
          <div>React Render: <span className="diagnostics-value">16 ms</span></div>
          <div className="diagnostics-total">Total P99: <span className="diagnostics-total-value">274 ms</span></div>
        </div>
      )}

      {/* Demo buttons to trigger document hologram */}
      {pendingFile && (
        <DocumentActionModal
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onActionSelect={(action) => processDocumentAction(pendingFile, action)}
        />
      )}

      <FsdCreatorPanel 
        isOpen={showFsdCreator}
        onClose={() => setShowFsdCreator(false)}
        onProjectBuilt={async (projectData) => {
          setShowFsdCreator(false);
          const newProject = {
            name: `Generated_${projectData.title.replace(/\s+/g, '_')}.json`,
            date: new Date().toLocaleTimeString(),
            data: projectData
          };
          setProjectHistory(prev => [newProject, ...prev]);
          await ApiClient.saveMemory('PROJECT', newProject.name, JSON.stringify(newProject));
          setActiveDocument(projectData);
          playSFX('startup');
        }}
      />

      {(!activeDocument && !activeComparison) && (
        <UploadSection 
          onDirectCompare={handleDirectUploadAndCompare}
          onSimulateDocument={handleSimulateDocument}
        />
      )}

      {(activeDocument || activeComparison) && (
        <button 
          className="interactive-btn btn-close-doc"
          onClick={() => { setActiveDocument(null); setActiveComparison(null); }}
        >
          Close Document
        </button>
      )}
      
      </div>


    </div>
  );
}

export default App;

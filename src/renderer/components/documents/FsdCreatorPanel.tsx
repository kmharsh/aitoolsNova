import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api';
import { useVoicePipeline } from '../../hooks/useVoicePipeline';

interface FsdCreatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectBuilt: (projectData: any) => void;
}

import '../../styles/components/FsdCreatorPanel.css';

export const FsdCreatorPanel: React.FC<FsdCreatorPanelProps> = ({ isOpen, onClose, onProjectBuilt }) => {
  const [requirements, setRequirements] = useState('');
  const { isDictating, transcript, startDictation, stopDictation, clearTranscript } = useVoicePipeline();

  // Sync voice transcript to text area
  useEffect(() => {
    if (transcript) {
      setRequirements(prev => (prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + transcript).trim());
      clearTranscript();
    }
  }, [transcript]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFsd, setGeneratedFsd] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      setError('Please enter some requirements first.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const data = await ApiClient.generateFsd(requirements);
      setGeneratedFsd(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate FSD. Is the backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportMd = () => {
    if (!generatedFsd) return;
    const mdContent = `# ${generatedFsd.title}\n\n## Summary\n${generatedFsd.summary}\n\n## Key Points\n${generatedFsd.keyPoints?.map((k:string) => `- ${k}`).join('\n')}\n\n## Architecture Blueprint\n- **Project Name:** ${generatedFsd.fsdBlueprint?.projectName}\n- **Architecture:** ${generatedFsd.fsdBlueprint?.architecture}\n\n### Frontend\n${generatedFsd.fsdBlueprint?.frontendComponents?.map((k:string) => `- ${k}`).join('\n')}\n\n### Backend Endpoints\n${generatedFsd.fsdBlueprint?.backendEndpoints?.map((k:string) => `- ${k}`).join('\n')}\n\n### Database Models\n${generatedFsd.fsdBlueprint?.databaseModels?.map((k:string) => `- ${k}`).join('\n')}`;
    
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedFsd.title.replace(/\s+/g, '_')}_FSD.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fcp-overlay">
      <div className="fcp-container">
        {/* Header */}
        <div className="fcp-header">
          <h2 className="fcp-title">
            <span>📝 AI FSD Creator Panel</span>
          </h2>
          <button onClick={onClose} className="fcp-close-btn">&times;</button>
        </div>
        
        {/* Main Split Body */}
        <div className="fcp-body">
          
          {/* Left Panel: Raw Input */}
          <div className="fcp-left-panel">
            <div className="fcp-panel-header">
              <div>
                <h3 className="fcp-panel-title">1. Enter Raw Requirements</h3>
                <p className="fcp-panel-subtitle">Paste your notes, or use Voice Dictation to build the FSD.</p>
              </div>
              <button 
                onClick={isDictating ? stopDictation : startDictation}
                className={`fcp-dictate-btn ${isDictating ? 'active' : 'inactive'}`}
              >
                {isDictating ? '🛑 Stop Dictation' : '🎙️ Talk to Build'}
              </button>
            </div>
            
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. 'I want to build a library management system where users can login, search books, and librarians can manage inventory. It needs a database to store books and users.'"
              className="fcp-textarea"
            />
            
            {error && <div className="fcp-error">{error}</div>}
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="fcp-generate-btn"
            >
              {isGenerating ? 'Generating Blueprint...' : '⚡ Generate Professional FSD'}
            </button>
          </div>

          {/* Right Panel: FSD Preview */}
          <div className="fcp-right-panel">
            <h3 className="fcp-panel-title" style={{ marginBottom: '15px' }}>2. Document Preview</h3>
            
            <div className="fcp-preview-container">
              {!generatedFsd && !isGenerating && (
                <div className="fcp-empty-state">
                  Document preview will appear here
                </div>
              )}
              
              {isGenerating && (
                <div className="fcp-loading-state">
                  <div className="fcp-loading-icon">⚙️</div>
                  <div>Analyzing requirements and drafting document...</div>
                </div>
              )}

              {generatedFsd && !isGenerating && (
                <div className="fcp-doc-content">
                  <h1 className="fcp-doc-title">{generatedFsd.title}</h1>
                  
                  <div className="fcp-doc-badges">
                    <span className="fcp-badge-type">Type: {generatedFsd.documentType}</span>
                    <span className="fcp-badge-clearance">Clearance: {generatedFsd.securityClearance}</span>
                  </div>

                  <h3 className="fcp-section-title">Executive Summary</h3>
                  <p>{generatedFsd.summary}</p>

                  <h3 className="fcp-section-title">Key Features</h3>
                  <ul style={{ paddingLeft: '20px' }}>
                    {generatedFsd.keyPoints?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                  </ul>

                  <h3 className="fcp-section-title">Architecture Blueprint</h3>
                  <div className="fcp-arch-blueprint">
                    <p><strong>Project Code:</strong> {generatedFsd.fsdBlueprint?.projectName}</p>
                    <p><strong>Architecture Pattern:</strong> {generatedFsd.fsdBlueprint?.architecture}</p>
                    
                    <h4 className="fcp-arch-subtitle">Frontend</h4>
                    <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                      {generatedFsd.fsdBlueprint?.frontendComponents?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                    </ul>

                    <h4 className="fcp-arch-subtitle">Backend API</h4>
                    <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                      {generatedFsd.fsdBlueprint?.backendEndpoints?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                    </ul>

                    <h4 className="fcp-arch-subtitle">Database Entities</h4>
                    <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                      {generatedFsd.fsdBlueprint?.databaseModels?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {generatedFsd && !isGenerating && (
              <div className="fcp-actions">
                <button onClick={handleExportMd} className="fcp-export-md">
                  📄 Export as Markdown (.md)
                </button>
                <button onClick={() => onProjectBuilt(generatedFsd)} className="fcp-analyze-btn">
                  🚀 Build Project (Send to Explorer)
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

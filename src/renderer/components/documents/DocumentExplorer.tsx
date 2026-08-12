import React, { useState } from 'react';
import { HolographicSummary, MetricOrb, RiskIndicator, EntityNode, Timeline } from './HolographicComponents';
import { KnowledgeGraph } from './KnowledgeGraph';
import { AnimatedArchitectureFlow } from './AnimatedArchitectureFlow';
import { InteractiveERDiagram } from './InteractiveERDiagram';
// Re-using the Zod schema type from backend
import { DocumentAnalysis } from '../../../../src/main/core/documents/DocumentSchemaValidator';
import { ApiClient } from '../../api';
import '../../styles/components/DocumentExplorer.css';

interface ExplorerProps {
  document: DocumentAnalysis | null;
  onAddTask?: (task: string) => void;
}

export const DocumentExplorer: React.FC<ExplorerProps> = ({ document, onAddTask }) => {
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [mockupHtml, setMockupHtml] = useState('');
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  
  if (!document) return null;

  // Determine layout based on inferred type from LLM
  const typeStr = (document.documentType || '').toLowerCase();
  
  let Layout;
  if (typeStr.includes('financial') || typeStr.includes('invoice') || typeStr.includes('report')) {
    Layout = (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {document.importantNumbers?.map((num, i) => <MetricOrb key={i} label="Metric" value={num} />)}
        </div>
        <RiskIndicator risks={document.risks || []} />
      </div>
    );
  } else if (typeStr.includes('resume') || typeStr.includes('legal') || typeStr.includes('contract')) {
    Layout = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3 style={{ color: 'var(--nova-teal)' }}>Timeline & Dates</h3>
          <Timeline dates={document.dates || []} />
        </div>
        <div>
          <h3 style={{ color: 'var(--nova-teal)' }}>Entities & Parties</h3>
          <div>
            {document.entities?.map((ent, i) => <EntityNode key={i} label={ent} />)}
          </div>
          <RiskIndicator risks={document.risks || []} />
        </div>
      </div>
    );
  } else if (document.fsdBlueprint) {
    Layout = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ color: 'var(--nova-green)', borderBottom: '1px solid var(--nova-green)', paddingBottom: '10px' }}>
          🏗️ FSD Project Blueprint: {document.fsdBlueprint.projectName}
        </h3>
        
        {document.fsdBlueprint.architecture && (
          <div className="holo-panel" style={{ background: 'rgba(0, 255, 170, 0.08)', border: '1px solid var(--nova-green)' }}>
            <h4 style={{ color: 'var(--nova-green)' }}>System Architecture</h4>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>{document.fsdBlueprint.architecture}</p>
          </div>
        )}
        
        {document.fsdBlueprint.systemDesign && document.fsdBlueprint.systemDesign.length > 0 && (
          <div className="holo-panel" style={{ background: 'rgba(0, 255, 170, 0.05)' }}>
            <h4 style={{ color: 'var(--nova-green)' }}>System Design Patterns</h4>
            <ul style={{ color: '#ccc' }}>
              {document.fsdBlueprint.systemDesign.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="holo-panel" style={{ background: 'rgba(0, 255, 170, 0.05)' }}>
            <h4 style={{ color: 'var(--nova-green)' }}>Frontend Components</h4>
            <ul style={{ color: '#ccc' }}>
              {document.fsdBlueprint.frontendComponents?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
          <div className="holo-panel" style={{ background: 'rgba(0, 255, 170, 0.05)' }}>
            <h4 style={{ color: 'var(--nova-green)' }}>Backend Endpoints</h4>
            <ul style={{ color: '#ccc' }}>
              {document.fsdBlueprint.backendEndpoints?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
          <div className="holo-panel" style={{ background: 'rgba(0, 255, 170, 0.05)' }}>
            <h4 style={{ color: 'var(--nova-green)' }}>Database Models</h4>
            <ul style={{ color: '#ccc' }}>
              {document.fsdBlueprint.databaseModels?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
          <div className="holo-panel" style={{ background: 'rgba(0, 255, 170, 0.05)' }}>
            <h4 style={{ color: 'var(--nova-green)' }}>Business Logic</h4>
            <ul style={{ color: '#ccc' }}>
              {document.fsdBlueprint.businessLogic?.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
        </div>
        
        {/* Animated Architecture Flowchart */}
        <AnimatedArchitectureFlow blueprint={document.fsdBlueprint} />
        
        {/* Interactive ER Diagram */}
        <InteractiveERDiagram databaseModels={document.fsdBlueprint.databaseModels || []} />
      </div>
    );
  } else {
    // Generic fallback
    Layout = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="holo-panel" style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--nova-teal)' }}>Key Points</h3>
            <ul style={{ color: '#ccc' }}>
              {document.keyPoints?.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--nova-teal)', textAlign: 'center' }}>Knowledge Graph</h3>
            <KnowledgeGraph entities={document.entities} relationships={document.relationships} />
          </div>
        </div>
      </div>
    );
  }

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${document.title}. ${document.summary}`);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyText = () => {
    const textToCopy = `Title: ${document.title}\nSummary: ${document.summary}\nKey Points:\n${document.keyPoints?.map(p => '- ' + p).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    alert('Document content copied to clipboard!');
  };

  const generateMermaidGraph = (bp: any) => {
    if (!bp) return '';
    let graph = '\n## System Architecture Flowchart\n```mermaid\ngraph LR\n';
    bp.frontendComponents?.forEach((c: string, i: number) => { graph += `  F${i}["${c}"]\n`; });
    bp.backendEndpoints?.forEach((c: string, i: number) => { graph += `  B${i}["${c}"]\n`; });
    bp.databaseModels?.forEach((c: string, i: number) => { graph += `  D${i}["${c}"]\n`; });
    
    bp.frontendComponents?.forEach((_: any, fi: number) => {
      bp.backendEndpoints?.forEach((_: any, bi: number) => {
        graph += `  F${fi} --> B${bi}\n`;
      });
    });
    bp.backendEndpoints?.forEach((_: any, bi: number) => {
      bp.databaseModels?.forEach((_: any, di: number) => {
        graph += `  B${bi} --> D${di}\n`;
      });
    });
    graph += '```\n';
    return graph;
  };

  const generateTextFlow = (bp: any) => {
    if (!bp) return '';
    let text = '\n<h2>System Architecture Flowchart</h2><pre style="background:#f4f4f4;padding:15px;border-radius:8px;">\n';
    text += '[ FRONTEND COMPONENTS ]\n';
    bp.frontendComponents?.forEach((c: string) => { text += `  ├─ ${c}\n`; });
    text += '       │\n       ▼ (API Calls)\n';
    text += '[ BACKEND ENDPOINTS ]\n';
    bp.backendEndpoints?.forEach((c: string) => { text += `  ├─ ${c}\n`; });
    text += '       │\n       ▼ (Queries)\n';
    text += '[ DATABASE MODELS ]\n';
    bp.databaseModels?.forEach((c: string) => { text += `  ├─ ${c}\n`; });
    text += '</pre>\n';
    return text;
  };

  const handleExportMarkdown = () => {
    let markdown = `# ${document.title}\n\n## Summary\n${document.summary}\n\n## Key Points\n${document.keyPoints?.map(p => '- ' + p).join('\n')}`;
    
    if (document.fsdBlueprint) {
      markdown += `\n\n## Project Architecture\n${document.fsdBlueprint.architecture || 'Not specified'}`;
      markdown += generateMermaidGraph(document.fsdBlueprint);
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDoc = () => {
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${document.title}</title></head>
      <body>
        <h1>${document.title}</h1>
        <h2>Summary</h2>
        <p>${document.summary}</p>
        <h2>Key Points</h2>
        <ul>${document.keyPoints?.map(p => `<li>${p}</li>`).join('')}</ul>
    `;
    
    if (document.fsdBlueprint) {
      htmlContent += `
        <h2>Project Architecture</h2>
        <p>${document.fsdBlueprint.architecture || 'Not specified'}</p>
        
        <h2>System Design Patterns</h2>
        <ul>${document.fsdBlueprint.systemDesign?.map(d => `<li>${d}</li>`).join('') || '<li>None</li>'}</ul>

        ${generateTextFlow(document.fsdBlueprint)}

        <h2>Frontend Components</h2>
        <ul>${document.fsdBlueprint.frontendComponents?.map(c => `<li>${c}</li>`).join('')}</ul>
        
        <h2>Backend Endpoints</h2>
        <ul>${document.fsdBlueprint.backendEndpoints?.map(e => `<li>${e}</li>`).join('')}</ul>
        
        <h2>Database Models</h2>
        <ul>${document.fsdBlueprint.databaseModels?.map(m => `<li>${m}</li>`).join('')}</ul>
      `;
    }
    
    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateMockup = async () => {
    if (!document.fsdBlueprint) return;
    setIsGeneratingMockup(true);
    setMockupHtml('');
    try {
      const res = await ApiClient.generateMockup(document.title, document.fsdBlueprint.frontendComponents || []);
      setMockupHtml(res.html);
    } catch (e: any) {
      alert('Failed to generate mockup: ' + e.message);
    } finally {
      setIsGeneratingMockup(false);
    }
  };

  const handleAutoBuildLocal = async () => {
    if (!document.fsdBlueprint) {
      alert('No FSD Blueprint found to build.');
      return;
    }
    
    setIsExportingZip(true);
    setExportProgress('Starting Autonomous Build on Local Disk...');
    
    try {
      const res = await ApiClient.buildProjectLocal(document);
      if (res.success) {
        alert(`Project built successfully at:\n${res.path}\n\nInstall Output:\n${res.installOutput}`);
      } else {
        alert('Build failed.');
      }
    } catch (e: any) {
      alert('Error building project locally: ' + e.message);
    } finally {
      setIsExportingZip(false);
      setExportProgress('');
    }
  };

  const handleDeployToGithub = async () => {
    if (!githubToken.trim()) {
      alert('Please enter a GitHub Personal Access Token first.');
      return;
    }
    
    setIsDeploying(true);
    setExportProgress('Deploying to GitHub...');
    try {
      const res = await ApiClient.deployToGithub(document, githubToken);
      if (res.success) {
        alert(`Successfully deployed to GitHub!\nRepo URL: ${res.url}`);
        setShowGithubModal(false);
      }
    } catch (e: any) {
      alert('Deploy failed: ' + e.message);
    } finally {
      setIsDeploying(false);
      setExportProgress('');
    }
  };

  const handleExportZip = async () => {
    if (!document.fsdBlueprint) {
      alert('No FSD Blueprint found to export.');
      return;
    }

    setIsExportingZip(true);
    setExportProgress('Initializing ZIP Builder...');

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const front = zip.folder("frontend");
      const back = zip.folder("backend");
      const db = zip.folder("database");
      
      front?.file("package.json", JSON.stringify({ name: "frontend", dependencies: { react: "^18.0.0" } }, null, 2));
      back?.file("package.json", JSON.stringify({ name: "backend", dependencies: { express: "^4.19.2" } }, null, 2));
      
      const generateCode = async (prompt: string) => {
        const res = await fetch('http://127.0.0.1:3001/api/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok) throw new Error('AI API failed');
        const data = await res.json();
        return data.reply;
      };

      // Generate frontend components
      const frontComps = document.fsdBlueprint.frontendComponents || [];
      for (let i = 0; i < frontComps.length; i++) {
        const c = frontComps[i];
        const name = c.replace(/[^a-zA-Z0-9]/g, '');
        setExportProgress(`Generating Frontend: ${name} (${i+1}/${frontComps.length})`);
        const code = await generateCode(`Write a raw React component for ${c} named ${name}. Output only the code.`);
        front?.file(`src/components/${name}.tsx`, code);
      }
      
      // Generate backend endpoints
      const backEnds = document.fsdBlueprint.backendEndpoints || [];
      for (let i = 0; i < backEnds.length; i++) {
        const c = backEnds[i];
        const name = c.replace(/[^a-zA-Z0-9]/g, '') || `route_${i}`;
        setExportProgress(`Generating Backend: ${name} (${i+1}/${backEnds.length})`);
        const code = await generateCode(`Write a raw Express.js route for the endpoint ${c}. Output only the code.`);
        back?.file(`src/routes/${name}.js`, code);
      }
      
      // Generate database models
      const dbModels = document.fsdBlueprint.databaseModels || [];
      for (let i = 0; i < dbModels.length; i++) {
        const c = dbModels[i];
        const name = c.replace(/[^a-zA-Z0-9]/g, '');
        setExportProgress(`Generating Model: ${name} (${i+1}/${dbModels.length})`);
        const code = await generateCode(`Write a raw Mongoose schema model for ${c} named ${name}. Output only the code.`);
        db?.file(`models/${name}.js`, code);
      }
      
      setExportProgress('Compressing project files...');
      zip.file("README.md", `# ${document.title}\n\n${document.summary}\n\n## Architecture\n${document.fsdBlueprint.architecture || ''}\n`);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/\\s+/g, '_')}_Project_Code.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error exporting ZIP. Please check console.');
    } finally {
      setIsExportingZip(false);
      setExportProgress('');
    }
  };

  const handleForceReanalyze = () => {
    alert("Re-analyze request sent. (In a real app, this would trigger the upload pipeline again)");
  };

  return (
    <div className="document-explorer">
      <div className="de-header">
        <div className="de-brand">
          NOVA // DOCUMENT INTELLIGENCE
        </div>
        <div className="de-type-badge">
          {document.documentType.toUpperCase()}
        </div>
      </div>

      <div className="de-summary-container">
        <div className="de-summary-main">
          <HolographicSummary title={document.title} summary={document.summary} />
        </div>
        {document.securityClearance && (
          <div style={{
            padding: '15px 25px',
            background: document.securityClearance === 'HIGH RISK' ? 'rgba(255, 0, 0, 0.1)' : document.securityClearance === 'CONFIDENTIAL' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(0, 255, 170, 0.1)',
            border: `1px solid ${document.securityClearance === 'HIGH RISK' ? '#ff3333' : document.securityClearance === 'CONFIDENTIAL' ? '#ffa500' : 'var(--nova-teal)'}`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: `0 0 15px ${document.securityClearance === 'HIGH RISK' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 170, 0.2)'}`
          }}>
            <span style={{ fontSize: '24px', marginBottom: '5px' }}>🛡️</span>
            <span style={{ fontSize: '10px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Clearance</span>
            <span style={{ 
              color: document.securityClearance === 'HIGH RISK' ? '#ff3333' : document.securityClearance === 'CONFIDENTIAL' ? '#ffa500' : 'var(--nova-green)',
              fontWeight: 'bold',
              letterSpacing: '2px',
              marginTop: '5px'
            }}>
              {document.securityClearance}
            </span>
          </div>
        )}
      </div>

      {document.actionItems && document.actionItems.length > 0 && (
        <div className="holo-panel" style={{ marginTop: '20px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--nova-cyan)' }}>
          <h3 style={{ color: 'var(--nova-cyan)', borderBottom: '1px solid rgba(0, 255, 255, 0.3)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📝</span> Auto-Extracted Action Items
          </h3>
          <div className="flex-col gap-2" style={{ marginTop: '15px' }}>
            {document.actionItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#eee', fontSize: '14px', flex: 1 }}>{item}</span>
                {onAddTask && (
                  <button 
                    onClick={() => {
                      onAddTask(item);
                      alert('Task added to Nova Todo List!');
                    }}
                    className="btn btn-primary interactive-btn"
                  >
                    ➕ Add to Nova
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="de-actions">
        <button onClick={handleReadAloud} className="de-action-btn interactive-btn">
          🔊 Read Aloud
        </button>
        <button onClick={handleCopyText} className="de-action-btn interactive-btn">
          📋 Copy Text
        </button>
        <button onClick={handleExportMarkdown} className="de-action-btn interactive-btn">
          📥 Export .md
        </button>
        <button onClick={handleExportDoc} className="de-action-btn doc-export interactive-btn">
          📝 Export .doc
        </button>
        <button onClick={handleForceReanalyze} className="de-action-btn reanalyze interactive-btn">
          🪄 Re-Analyze
        </button>
      </div>
      
      {Layout}

      {document.fsdBlueprint && (
        <>
          <div className="de-deploy-container">
            <button disabled={isGeneratingMockup} onClick={handleGenerateMockup} className="de-mockup-btn interactive-btn">
              {isGeneratingMockup ? '⏳ Generating UI...' : '🎨 Generate UI Mockup'}
            </button>
            
            <button disabled={isExportingZip} onClick={handleAutoBuildLocal} className="de-autobuild-btn interactive-btn">
              🚀 Auto-Build Locally
            </button>
            
            <button disabled={isExportingZip} onClick={handleExportZip} className="de-export-btn interactive-btn">
              📦 Export Project Code (.zip)
            </button>
            
            <button disabled={isDeploying} onClick={() => setShowGithubModal(true)} className="de-github-btn interactive-btn">
              {isDeploying ? '⏳ Deploying...' : '🐙 Deploy to GitHub'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            {exportProgress ? (
              <div className="de-progress-text">
                {exportProgress}
              </div>
            ) : (
              <div className="de-hint-text">
                Auto-generates raw React & Node.js code based on FSD blueprint via Local AI.
              </div>
            )}
          </div>

          {showGithubModal && (
            <div className="de-github-modal-overlay">
              <div className="de-github-modal">
                <h3 style={{ color: '#fff', margin: '0 0 15px 0' }}>🐙 GitHub Deployment</h3>
                <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>Enter your GitHub Personal Access Token (PAT) with repo permissions to automatically create a repository and push the generated code.</p>
                <input 
                  type="password" 
                  value={githubToken} 
                  onChange={e => setGithubToken(e.target.value)} 
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="de-github-input"
                />
                <div className="flex-center gap-3">
                  <button onClick={() => setShowGithubModal(false)} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleDeployToGithub} className="btn" style={{ background: '#fff', color: '#000' }}>Deploy Now</button>
                </div>
              </div>
            </div>
          )}

          {mockupHtml && (
            <div className="holo-panel" style={{ marginTop: '30px', background: 'rgba(255, 255, 255, 0.05)', padding: '0', overflow: 'hidden' }}>
              <h3 style={{ color: '#ffaa00', padding: '15px', margin: 0, borderBottom: '1px solid rgba(255, 170, 0, 0.3)' }}>🎨 UI/UX Mockup Preview</h3>
              <iframe 
                srcDoc={mockupHtml} 
                style={{ width: '100%', height: '600px', border: 'none', background: '#fff' }} 
                sandbox="allow-scripts"
                title="Mockup Preview"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

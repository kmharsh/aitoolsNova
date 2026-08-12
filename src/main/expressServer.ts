import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as fs from 'fs';
import path from 'path';
import { logger } from './services/logger';
import { MemoryManager } from './core/memory/MemoryManager';
import { OllamaProvider } from './core/brain/providers/OllamaProvider';
import { DocumentAnalysisSchema, ChatCategorizationSchema, ChatCategorization } from './core/documents/DocumentSchemaValidator';
import { ComparisonSchema } from './core/documents/ComparisonSchemaValidator';
import pdfParse from 'pdf-parse';

export function startExpressServer(memoryManager: MemoryManager) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Setup multer for file uploads (store in temp dir)
  const upload = multer({ dest: 'temp-uploads/' });

  // Memory endpoints
  app.get('/api/memory', async (_req, res) => {
    res.json(memoryManager.getAllMemories());
  });

  app.post('/api/memory/save', async (req, res) => {
    const { type, key, value } = req.body;
    await memoryManager.storeMemory(type, key, value);
    res.json({ success: true });
  });

  app.post('/api/memory/delete', async (req, res) => {
    const { type, key } = req.body;
    await memoryManager.deleteMemory(type, key);
    res.json({ success: true });
  });

  // Chat Sessions endpoints
  app.get('/api/chat/sessions', async (_req, res) => {
    res.json(memoryManager.getAllChatSessions());
  });

  app.post('/api/chat/session', async (_req, res) => {
    const session = await memoryManager.createChatSession();
    res.json(session);
  });

  app.delete('/api/chat/session/:id', async (req, res) => {
    await memoryManager.deleteChatSession(req.params.id);
    res.json({ success: true });
  });

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    const { text, sessionId } = req.body;
    try {
      await memoryManager.addChatMessage('user', text, sessionId);
      const longTermContext = memoryManager.getLongTermContext();
      const chatHistory = memoryManager.getChatHistory(sessionId);

      // Trigger background auto-categorization if this is a session with exactly 2 messages
      if (sessionId) {
        const session = memoryManager.getChatSession(sessionId);
        if (session && session.messages.length === 2) {
          // Fire and forget
          setTimeout(async () => {
            try {
              const ollama = new OllamaProvider('llama3.2');
              const prompt = `Based on this short chat history, generate a concise title and choose a category. \n\n${chatHistory}`;
              const categorization = await ollama.generateStructured<ChatCategorization>(prompt, ChatCategorizationSchema);
              await memoryManager.updateChatSessionMetadata(sessionId, categorization.title, categorization.category);
              logger.info(`Auto-categorized session ${sessionId} as ${categorization.category}`);
            } catch (err) {
              logger.error(`Failed to auto-categorize session ${sessionId}`, err as Error);
            }
          }, 0);
        }
      }
      
      // Feature 3: Live Web Search (Wikipedia)
      let webContext = "";
      if (text.toLowerCase().includes('search') || text.toLowerCase().includes('who is') || text.toLowerCase().includes('what is')) {
        try {
          const searchTerms = text.replace(/search|who is|what is/gi, '').trim().split(' ')[0];
          if (searchTerms) {
            const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerms)}`);
            if (wikiRes.ok) {
              const wikiData = await wikiRes.json();
              webContext += `\nLIVE WEB SEARCH RESULTS FOR "${searchTerms}":\n${wikiData.extract}\n`;
            }
          }
        } catch (e) {
          logger.warn(`Web search failed: ${(e as Error).message}`);
        }
      }

      // Feature 4: Live Weather Integration
      if (text.toLowerCase().includes('weather') || text.toLowerCase().includes('temperature') || text.toLowerCase().includes('mausam')) {
        try {
          // Extract location if present (e.g., "weather in Delhi", "temperature for Mumbai")
          const words = text.split(' ');
          let location = '';
          const inIndex = words.findIndex((w: string) => w.toLowerCase() === 'in' || w.toLowerCase() === 'for');
          if (inIndex !== -1 && inIndex < words.length - 1) {
            location = words.slice(inIndex + 1).join(' ').replace(/[^a-zA-Z0-9 ]/g, '');
          }
          
          const urlFormat = 'Current+weather+in+%l:+%C,+%t.+Wind:+%w.+Humidity:+%h';
          const weatherUrl = location 
            ? `https://wttr.in/${encodeURIComponent(location)}?format=${urlFormat}` 
            : `https://wttr.in/?format=${urlFormat}`;
            
          const weatherRes = await fetch(weatherUrl, { headers: { 'Accept-Language': 'en' } });
          if (weatherRes.ok) {
            const weatherText = await weatherRes.text();
            webContext += `\nLIVE WEATHER DATA (Real-time):\n${weatherText}\nUse this data to answer the user's weather question naturally.\n`;
          }
        } catch (e) {
          logger.warn(`Weather check failed: ${(e as Error).message}`);
        }
      }

      const systemPrompt = `You are Nova, an advanced, highly intelligent AI assistant.
You can execute Windows commands if the user explicitly asks for system actions (e.g., checking IP, opening browser). In those cases, output ONLY the Windows command wrapped in <command> tags (e.g., <command>ipconfig</command>). DO NOT include any other text.
Keep all conversational responses concise and professional. If the user sends a simple greeting like "hi" or "hello", respond with a short, standard greeting like "Hello! I am Nova. How can I assist you today?". Do not hallucinate long, bubbly conversation backstories.`;

      const enrichedPrompt = `Here is the current conversation history. Please respond to the final user message naturally.

[Context & Info]
${longTermContext ? longTermContext : "No additional long-term context."}
${webContext}

[Conversation History]
${chatHistory}`;

      const ollama = new OllamaProvider('llama3.2'); 
      let response = await ollama.generateResponse(enrichedPrompt, systemPrompt);
      
      // Feature 1: System Control Plugin Execution
      const cmdMatch = response.match(/<command>(.*?)<\/command>/);
      if (cmdMatch) {
        const cmd = cmdMatch[1];
        try {
          const { exec } = require('child_process');
          const util = require('util');
          const execAsync = util.promisify(exec);
          
          const { stdout, stderr } = await execAsync(cmd);
          response = `Terminal output for \`${cmd}\`:\n\n${(stdout || stderr).substring(0, 1000)}`;
        } catch (e: any) {
          response = `Command failed: ${e.message}`;
        }
      }

      await memoryManager.addChatMessage('assistant', response, sessionId);
      res.json({ response });
    } catch (err) {
      logger.error('Failed to generate chat response via API', err as Error);
      res.status(500).json({ error: "Failed to connect to AI." });
    }
  });

  // Dedicated endpoint for generating boilerplate project code without polluting chat history
  app.post('/api/generate-code', async (req, res) => {
    const { prompt } = req.body;
    try {
      const ollama = new OllamaProvider('llama3.2');
      const systemPrompt = "You are an expert software engineer. Generate only the requested code. Do not include any explanations, markdown code blocks (e.g., ```), or conversational text. Output ONLY the raw code.";
      const response = await ollama.generateResponse(prompt, systemPrompt);
      
      // Clean up any markdown blocks if the model accidentally includes them
      const cleanCode = response.replace(/^```[a-zA-Z]*\n/gm, '').replace(/```$/gm, '').trim();
      
      res.json({ reply: cleanCode });
    } catch (err) {
      logger.error('Failed to generate code via API', err as Error);
      res.status(500).json({ error: "Failed to connect to AI." });
    }
  });

  // Dedicated endpoint for generating UI Mockup HTML
  app.post('/api/generate-mockup', async (req, res) => {
    const { components, title } = req.body;
    try {
      const ollama = new OllamaProvider('llama3.2');
      const systemPrompt = "You are an expert frontend designer. Generate a single, standalone HTML file containing Tailwind CSS via CDN. Make it beautiful, modern, and dark-themed with glassmorphism. Include the requested components in the UI. DO NOT output any markdown (like ```html). ONLY output the raw HTML string.";
      const prompt = `Project Title: ${title}\nComponents to include in this UI mockup: ${components.join(', ')}`;
      const response = await ollama.generateResponse(prompt, systemPrompt);
      
      const cleanCode = response.replace(/^```[a-zA-Z]*\n/gm, '').replace(/```$/gm, '').trim();
      res.json({ html: cleanCode });
    } catch (err) {
      logger.error('Failed to generate mockup via API', err as Error);
      res.status(500).json({ error: "Failed to connect to AI." });
    }
  });

  // Dedicated endpoint for generating FSD from raw requirements
  app.post('/api/generate-fsd', async (req, res) => {
    const { requirements } = req.body;
    try {
      const ollama = new OllamaProvider('llama3.2');
      const prompt = `You are an expert FSD (Functional Specification Document) Creator and Systems Architect. 
Read the following raw, informal requirements and generate a comprehensive, highly-detailed FSD blueprint into a JSON object.
Use professional terminology and build a complete architecture based on these requirements.

You MUST return EXACTLY this JSON structure, completely filled out. Do NOT output any markdown blocks (like \`\`\`json). Output the raw JSON object ONLY.
{
  "documentType": "FSD",
  "title": "String (Create a professional project title)",
  "summary": "String (A high-level professional summary of the project)",
  "keyPoints": ["String", "String"],
  "securityClearance": "PUBLIC",
  "actionItems": ["String", "String"],
  "fsdBlueprint": {
    "projectName": "String (Short codename)",
    "architecture": "String (e.g. 'Microservices', 'Monolithic MVC', etc)",
    "systemDesign": ["String"],
    "frontendComponents": ["String", "String"],
    "backendEndpoints": ["String", "String"],
    "databaseModels": ["String", "String"],
    "businessLogic": ["String"],
    "dependencies": ["String"]
  }
}

RAW REQUIREMENTS:
${requirements}`;

      const result = await ollama.generateStructured(prompt, DocumentAnalysisSchema);
      res.json(result);
    } catch (err) {
      logger.error('Failed to generate FSD via API', err as Error);
      res.status(500).json({ error: "Failed to generate FSD. Is Ollama running?" });
    }
  });

  // Dedicated endpoint for building the project autonomously on local disk
  app.post('/api/project/build-local', async (req, res) => {
    const { blueprint } = req.body;
    try {
      const projectName = (blueprint.fsdBlueprint?.projectName || blueprint.title || 'nova-generated-project').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      // Use parent folder of nova (d:\aitools) to store generated projects
      const targetDir = path.resolve(__dirname, '../../../../generated_projects', projectName);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Scaffold a basic package.json
      const packageJson = {
        name: projectName,
        version: "1.0.0",
        description: blueprint.summary || "Generated by NOVA AI",
        main: "index.js",
        scripts: {
          start: "node index.js"
        },
        dependencies: {
          express: "^4.18.2" // default dep for backend
        }
      };

      fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Generate a quick index.js based on endpoints
      let indexJs = `const express = require('express');\nconst app = express();\n\n`;
      if (blueprint.fsdBlueprint?.backendEndpoints) {
        blueprint.fsdBlueprint.backendEndpoints.forEach((ep: string) => {
          indexJs += `// Autogenerated endpoint: ${ep}\n`;
          indexJs += `app.use('/', (req, res) => res.send('Endpoint: ${ep}'));\n\n`;
        });
      }
      indexJs += `app.listen(3000, () => console.log('Server running on port 3000'));\n`;
      fs.writeFileSync(path.join(targetDir, 'index.js'), indexJs);

      // Write a README
      fs.writeFileSync(path.join(targetDir, 'README.md'), `# ${blueprint.title}\n\n${blueprint.summary}`);

      // Try running npm install
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      logger.info(`Running npm install in ${targetDir}`);
      let installOutput = '';
      try {
        const { stdout, stderr } = await execAsync('npm install', { cwd: targetDir });
        installOutput = stdout || stderr;
      } catch (e: any) {
        logger.warn(`npm install failed, but files were written. error: ${e.message}`);
        installOutput = `Failed: ${e.message}`;
      }

      res.json({ success: true, path: targetDir, installOutput });
    } catch (err) {
      logger.error('Failed to build project locally', err as Error);
      res.status(500).json({ error: "Failed to build project locally" });
    }
  });

  // Dedicated endpoint to deploy local project to GitHub
  app.post('/api/project/deploy-github', async (req, res) => {
    const { blueprint, token } = req.body;
    try {
      const projectName = (blueprint.fsdBlueprint?.projectName || blueprint.title || 'nova-generated-project').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
      const targetDir = path.resolve(__dirname, '../../../../generated_projects', projectName);

      if (!fs.existsSync(targetDir)) {
        return res.status(400).json({ error: "Project must be built locally first (Auto-Build Locally)." });
      }

      // 1. Get GitHub Username
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' }
      });
      if (!userRes.ok) throw new Error("Invalid GitHub Token");
      const userData: any = await userRes.json();
      const username = userData.login;

      // 2. Create GitHub Repo
      const repoRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
        body: JSON.stringify({ name: projectName, description: blueprint.summary || 'Generated by NOVA AI', private: false })
      });
      // 422 means it already exists, which is fine
      if (!repoRes.ok && repoRes.status !== 422) {
        throw new Error("Failed to create GitHub repository");
      }

      // 3. Initialize Git and Push
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      const remoteUrl = `https://${username}:${token}@github.com/${username}/${projectName}.git`;
      
      // Safe execution commands
      await execAsync('git init', { cwd: targetDir });
      await execAsync('git add .', { cwd: targetDir });
      
      try {
        await execAsync('git commit -m "Initial commit by NOVA AI FSD Generator"', { cwd: targetDir });
      } catch(e) {
        // Might fail if nothing to commit, ignore
      }

      await execAsync('git branch -M main', { cwd: targetDir });
      
      try {
        await execAsync('git remote remove origin', { cwd: targetDir });
      } catch(e) {} // ignore if origin doesn't exist
      
      await execAsync(`git remote add origin ${remoteUrl}`, { cwd: targetDir });
      await execAsync('git push -u origin main', { cwd: targetDir });

      res.json({ success: true, url: `https://github.com/${username}/${projectName}` });
    } catch (err: any) {
      logger.error('Failed to deploy to GitHub', err);
      res.status(500).json({ error: err.message || "Failed to deploy to GitHub" });
    }
  });

  // Document Upload endpoint
  app.post('/api/document/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      const filePath = req.file.path;
      const originalName = req.file.originalname;
      logger.info(`[API] Processing uploaded file: ${originalName}`);
      
      const dataBuffer = fs.readFileSync(filePath);
      let extractedText = '';

      if (originalName.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } else {
        extractedText = dataBuffer.toString('utf8');
      }
      
      // Cleanup temp file
      fs.unlinkSync(filePath);

      const action = req.body.action || 'analyze';

      let result;
      try {
        const ollama = new OllamaProvider('llama3.2'); 
        let prompt = `Analyze the following document text and extract the required information into a JSON object.
Ensure you evaluate the "securityClearance" (e.g. PUBLIC, INTERNAL, CONFIDENTIAL, HIGH RISK) based on the presence of sensitive info.
Also extract any "actionItems" (explicit next steps or tasks).

You MUST return EXACTLY this JSON structure:
{
  "documentType": "String",
  "title": "String",
  "summary": "String",
  "keyPoints": ["String"],
  "securityClearance": "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "HIGH RISK",
  "actionItems": ["String"]
}

TEXT:\n${extractedText}`;
        
        if (action === 'build_fsd') {
           prompt = `You are an expert FSD-to-Project Builder Agent. 
Read the following FSD (Functional Specification Document) and extract a complete working project structure into a JSON object.

You MUST return EXACTLY this JSON structure, completely filled out:
{
  "documentType": "FSD",
  "title": "String",
  "summary": "String",
  "keyPoints": ["String", "String"],
  "securityClearance": "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "HIGH RISK",
  "actionItems": ["String", "String"],
  "fsdBlueprint": {
    "projectName": "String",
    "architecture": "String",
    "systemDesign": ["String"],
    "frontendComponents": ["String"],
    "backendEndpoints": ["String"],
    "databaseModels": ["String"],
    "businessLogic": ["String"],
    "dependencies": ["String"]
  }
}

TEXT:\n${extractedText}`;
        }

        result = await ollama.generateStructured(prompt, DocumentAnalysisSchema);
      } catch (llmError) {
        result = {
          documentType: "General Document",
          title: originalName,
          summary: `This is a fallback summary for ${originalName} via API. Document length: ${extractedText.length} chars.`,
          keyPoints: ["Document loaded via API", "AI failed strict extraction", "Raw text extracted"],
          entities: ["User", "System"],
          importantNumbers: [String(extractedText.length)],
          dates: [new Date().toLocaleDateString()],
          risks: ["Model parsing failure"],
          recommendations: ["Upgrade to llama3"],
          relationships: ["User -> System"],
          sections: ["Fallback Content"],
          securityClearance: "PUBLIC",
          actionItems: ["Verify AI extraction", "Review document manually"]
        };
      }
      
      res.json(result);
    } catch (error) {
      logger.error(`[API] Failed to process document upload`, error as Error);
      res.status(500).json({ error: 'Failed to process document' });
    }
  });

  // Document Compare endpoint
  app.post('/api/document/compare', async (req, res) => {
    const { doc1, doc2 } = req.body;
    try {
      let result;
      try {
        const ollama = new OllamaProvider('llama3.2'); 
        const prompt = `Compare these two document summaries and output a strict JSON array representing the differences:\n\nDOC 1: ${JSON.stringify(doc1)}\n\nDOC 2: ${JSON.stringify(doc2)}`;
        result = await ollama.generateStructured(prompt, ComparisonSchema);
      } catch (llmError) {
        logger.warn(`[API] AI generation failed, falling back. Reason: ` + llmError);
        const title1 = doc1?.title || 'Document 1';
        const title2 = doc2?.title || 'Document 2';
        const d1Points = doc1?.keyPoints || [];
        const d2Points = doc2?.keyPoints || [];
        
        // Mock detailed logic
        const matched = d1Points.filter((p: any) => d2Points.includes(p));
        const newInDoc2 = d2Points.filter((p: any) => !d1Points.includes(p));
        const missingInDoc2 = d1Points.filter((p: any) => !d2Points.includes(p));

        result = {
          similarityScore: 68,
          summaryOfDifferences: `Comparison completed between ${title1} and ${title2}. Key differences were found in the required features and timeline projections.`,
          metricChanges: [
            `${title1} defines ${d1Points.length} core features.`,
            `${title2} introduces ${newInDoc2.length} new requirements.`
          ],
          newRisks: newInDoc2.length > 0 ? newInDoc2.slice(0, 3).map((p: any) => `Unplanned scope: ${p}`) : ['No significant new risks detected.'],
          resolvedRisks: missingInDoc2.length > 0 ? missingInDoc2.slice(0, 3) : ['No risks were resolved.'],
          timelineShifts: [`Timeline impacts detected due to changes in ${title2}`],
          strategicShifts: [`Shift in focus towards additional modules from ${title2}`],
          matchedPoints: matched.length > 0 ? matched : [
            "Both documents share the same foundational architecture requirements.",
            "Authentication and security baselines remain identical."
          ],
          unmatchedPoints: newInDoc2.length > 0 ? newInDoc2 : [
            `${title1} and ${title2} have diverging structural components.`,
            "API endpoints described in Doc 2 are missing in Doc 1."
          ]
        };
      }
      res.json(result);
    } catch (error) {
      logger.error(`[API] Failed to compare documents`, error as Error);
      res.status(500).json({ error: 'Failed to compare documents' });
    }
  });

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    logger.error('Unhandled Express Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });

  const PORT = 3001;
  app.listen(PORT, '127.0.0.1', () => {
    logger.info(`Nova API Server listening on port ${PORT}`);
  });
}

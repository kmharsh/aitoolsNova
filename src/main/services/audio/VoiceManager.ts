import { SpeechToTextProvider, TextToSpeechProvider } from '../../../shared/interfaces';
import { AgentOrchestrator } from '../../core/brain/AgentOrchestrator';
import { logger } from '../logger';
import { BrowserWindow } from 'electron';

export class VoiceManager {
  private stt: SpeechToTextProvider;
  private tts: TextToSpeechProvider;
  private _orchestrator: AgentOrchestrator;
  
  // Audio state
  private isListening = false;

  constructor(
    stt: SpeechToTextProvider,
    tts: TextToSpeechProvider,
    orchestrator: AgentOrchestrator
  ) {
    this.stt = stt;
    this.tts = tts;
    this._orchestrator = orchestrator;
  }

  async processIncomingAudio(audioBuffer: ArrayBuffer, window: BrowserWindow) {
    if (this.isListening) {
      logger.warn('VoiceManager is already processing a request. Dropping audio frame.');
      return;
    }
    
    this.isListening = true;
    window.webContents.send('nova:state', { intent: 'Processing Voice...', state: 'THINKING' });

    try {
      // 1. Transcribe Audio
      logger.info('VoiceManager: Transcribing audio...');
      const transcript = await this.stt.transcribe(audioBuffer);
      logger.info(`VoiceManager: Transcript -> "${transcript}"`);

      window.webContents.send('nova:state', { intent: `Executing: ${transcript}`, state: 'EXECUTING' });

      // 2. Route to Agent Orchestrator
      // The orchestrator handles planning and tool execution.
      // We trigger the intent processing natively here.
      this._orchestrator.processIntent(transcript);
      const resultText = `I am processing your command: ${transcript}`;

      // 3. Synthesize Response
      window.webContents.send('nova:state', { intent: 'Synthesizing speech...', state: 'COMPLETED' });
      const audioResponse = await this.tts.synthesize(resultText);

      // 4. Send back to Renderer to play
      window.webContents.send('nova:audio:response', {
        buffer: audioResponse,
        text: resultText
      });
      
    } catch (err) {
      logger.error(`VoiceManager Error: ${err}`);
      window.webContents.send('nova:state', { intent: 'Error processing voice.', state: 'ERROR' });
    } finally {
      this.isListening = false;
      setTimeout(() => {
        window.webContents.send('nova:state', { intent: 'Awaiting instruction...', state: 'IDLE' });
      }, 5000); // return to idle after 5 seconds
    }
  }
}

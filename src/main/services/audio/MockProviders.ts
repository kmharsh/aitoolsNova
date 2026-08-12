import { SpeechToTextProvider, TextToSpeechProvider } from '../../../shared/interfaces';
import { logger } from '../logger';

export class MockSTTProvider implements SpeechToTextProvider {
  async transcribe(audioData: ArrayBuffer): Promise<string> {
    logger.info(`[MockSTT] Processing ${audioData.byteLength} bytes of audio...`);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "This is a simulated transcription of your voice command.";
  }
}

export class MockTTSProvider implements TextToSpeechProvider {
  async synthesize(text: string): Promise<ArrayBuffer> {
    logger.info(`[MockTTS] Synthesizing speech for: ${text}`);
    // Simulate synthesis time
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return empty buffer as mock audio
    return new ArrayBuffer(0);
  }
}

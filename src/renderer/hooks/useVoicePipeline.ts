import { useEffect, useRef, useState } from 'react';

// Use standard window.ipc for Electron bridge
declare global {
  interface Window {
    ipc: {
      send: (channel: string, data: any) => void;
      on: (channel: string, func: (data: any) => void) => () => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    }
  }
}

export function useVoicePipeline() {
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [hardwareBlocked, setHardwareBlocked] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestMicAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      streamRef.current = stream;
      setHardwareBlocked(false);
      return true;
    } catch (err) {
      console.warn('Real microphone access denied/unavailable. Falling back to simulated voice mode.', err);
      setHardwareBlocked(true);
      setMicPermission(true); // Fallback to mock mode
      return false;
    }
  };

  useEffect(() => {
    // Listen for TTS responses from Main Process to play them
    const cleanup = window.ipc?.on('nova:audio:response', (payload: { buffer: ArrayBuffer, text: string }) => {
      console.log('Received TTS response:', payload.text);
      if (payload.buffer.byteLength > 0) {
        // Normally we'd use Web Audio API to decode the buffer
        // const audioCtx = new AudioContext();
        // audioCtx.decodeAudioData(payload.buffer).then(buffer => ... play ...);
        // But since we are mocking and returning 0 bytes, we just log it.
      }
    });

    return () => {
      cleanup?.();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = () => {
    if (!streamRef.current) return;
    
    mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        const arrayBuffer = await e.data.arrayBuffer();
        window.ipc?.send('nova:audio:chunk', arrayBuffer);
      }
    };
    // Collect 1-second chunks
    mediaRecorderRef.current.start(1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const [isDictating, setIsDictating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startDictation = () => {
    if (recognitionRef.current) {
      setIsDictating(true);
      recognitionRef.current.start();
    } else {
      alert('Speech Recognition is not supported in this environment.');
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsDictating(false);
    }
  };

  const clearTranscript = () => setTranscript('');

  return { 
    micPermission, 
    hardwareBlocked, 
    startRecording, 
    stopRecording, 
    requestMicAccess,
    isDictating,
    transcript,
    startDictation,
    stopDictation,
    clearTranscript
  };
}

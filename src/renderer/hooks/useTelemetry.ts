import { useState, useEffect } from 'react';

export interface TelemetryData {
  ai: {
    model: string;
    tokensPerSecond: number;
    contextUsage: number;
    contextMax: number;
    temperature: number;
  };
  network: {
    latency: number;
    throughputMb: number;
  };
  workspace: {
    activeDir: string;
    dbSizeMb: number;
    filesIndexed: number;
  };
  swarm: {
    activeWorkers: number;
    taskQueue: number;
  };
  security: {
    permissions: string[];
  };
}

export const useTelemetry = () => {
  const [data, setData] = useState<TelemetryData>({
    ai: { model: 'llama3.2', tokensPerSecond: 42.5, contextUsage: 1250, contextMax: 8192, temperature: 0.7 },
    network: { latency: 12, throughputMb: 1.2 },
    workspace: { activeDir: 'nova-core-agent', dbSizeMb: 45.2, filesIndexed: 342 },
    swarm: { activeWorkers: 2, taskQueue: 0 },
    security: { permissions: ['Filesystem', 'Microphone', 'Terminal'] },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // Simulate minor fluctuations
        const tps = Math.max(0, prev.ai.tokensPerSecond + (Math.random() * 4 - 2));
        const latency = Math.max(5, prev.network.latency + (Math.random() * 10 - 5));
        const throughput = prev.network.throughputMb + (Math.random() * 0.1);
        
        // Randomly simulate context increasing and queue changes
        const isGenerating = Math.random() > 0.5;
        const ctxUsage = isGenerating ? Math.min(prev.ai.contextMax, prev.ai.contextUsage + Math.floor(Math.random() * 10)) : prev.ai.contextUsage;
        
        // Simulate workers being busy if queue exists
        const workers = prev.swarm.taskQueue > 0 ? Math.floor(Math.random() * 4) + 1 : (Math.random() > 0.8 ? 1 : 0);

        return {
          ...prev,
          ai: { ...prev.ai, tokensPerSecond: Number(tps.toFixed(1)), contextUsage: ctxUsage },
          network: { ...prev.network, latency: Math.floor(latency), throughputMb: Number(throughput.toFixed(2)) },
          swarm: { ...prev.swarm, activeWorkers: workers }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
};

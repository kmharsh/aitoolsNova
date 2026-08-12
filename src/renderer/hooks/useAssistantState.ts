import { useState, useEffect } from 'react';
import { AssistantState } from '../../shared/types';
import { Task } from '../../shared/schemas';

export function useAssistantState() {
  const [state, setState] = useState<AssistantState>('IDLE');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if ((window as any).novaAPI) {
      (window as any).novaAPI.onAgentState((newState: AssistantState) => {
        setState(newState);
      });
      (window as any).novaAPI.onAgentProgress((task: Task) => {
        setActiveTask(task);
      });
    }
  }, []);

  return { state, setState, activeTask, setActiveTask };
}

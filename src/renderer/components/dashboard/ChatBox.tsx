import React, { memo, useRef, useEffect } from 'react';
import { playSFX } from '../../utils/audioSFX';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
}

export const ChatBox = memo(({ messages, inputText, setInputText, onSubmit, children }: ChatBoxProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        zIndex: 1000
      }}>
        {/* Assistant Subtitles -> Chat History */}
        <div 
          ref={scrollRef}
          style={{
            width: '600px',
            maxHeight: '250px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '10px 20px',
            background: 'transparent',
            scrollbarWidth: 'none',
          }}
        >
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? 'rgba(0, 255, 170, 0.15)' : 'rgba(20, 25, 30, 0.85)',
              color: msg.sender === 'user' ? '#00ffaa' : '#f0f0f0',
              padding: '12px 18px',
              borderRadius: '16px',
              maxWidth: '85%',
              textAlign: 'left',
              fontSize: '15px',
              border: msg.sender === 'user' ? '1px solid rgba(0, 255, 170, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}>
              {msg.text}
            </div>
          ))}
        </div>
        {children}
      </div>

      {/* Text Chat Input Bar */}
      <form 
        onSubmit={onSubmit}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          display: 'flex',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}
      >
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message to Nova..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#333',
            fontSize: '16px',
            padding: '0 15px',
            outline: 'none',
            fontWeight: 500
          }}
        />
        <button 
          type="submit"
          className="interactive-btn"
          onMouseEnter={() => playSFX('hover')}
          style={{
            background: 'var(--nova-teal)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'black'
          }}
        >
          ➤
        </button>
      </form>
    </>
  );
});

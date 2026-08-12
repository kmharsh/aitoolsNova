import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over an interactive element
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'label' ||
        target.classList.contains('interactive-btn') ||
        target.closest('.interactive-btn')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Main Cursor Dot */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--nova-cyan)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate(${position.x - 4}px, ${position.y - 4}px) scale(${isClicked ? 0.5 : 1})`,
          transition: 'transform 0.1s ease-out, background-color 0.2s',
          boxShadow: '0 0 10px var(--nova-cyan)'
        }}
      />
      {/* Trailing Ring */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '40px',
          height: '40px',
          border: `2px solid ${isHovering ? 'var(--nova-teal)' : 'var(--nova-cyan)'}`,
          backgroundColor: isHovering ? 'rgba(0, 255, 170, 0.1)' : 'transparent',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: `translate(${position.x - 20}px, ${position.y - 20}px) scale(${isHovering ? 1.5 : (isClicked ? 0.8 : 1)})`,
          transition: 'transform 0.15s ease-out, border-color 0.2s, background-color 0.2s',
          opacity: 0.6
        }}
      />
    </>
  );
};

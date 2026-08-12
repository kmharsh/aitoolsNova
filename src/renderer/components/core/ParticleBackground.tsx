import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
}

export const ParticleBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000 }); // start offscreen

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize particles
    const particleCount = 40;
    const initialParticles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    
    let currentParticles = initialParticles;

    const animate = () => {
      currentParticles = currentParticles.map(p => {
        let { x, y, vx, vy } = p;
        const { x: mx, y: my } = mouseRef.current;
        
        // Repulsion logic
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          vx += (dx / dist) * force * 0.2;
          vy += (dy / dist) * force * 0.2;
        }

        // Apply velocity
        x += vx;
        y += vy;
        
        // Friction / drag
        vx *= 0.99;
        vy *= 0.99;

        // Restore natural speed slightly
        vx += (Math.random() - 0.5) * 0.05;
        vy += (Math.random() - 0.5) * 0.05;

        // Screen wrap
        if (x < 0) x = window.innerWidth;
        if (x > window.innerWidth) x = 0;
        if (y < 0) y = window.innerHeight;
        if (y > window.innerHeight) y = 0;

        return { ...p, x, y, vx, vy };
      });

      setParticles(currentParticles);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <div 
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: 'var(--nova-cyan)',
            borderRadius: '50%',
            opacity: p.opacity,
            boxShadow: '0 0 8px var(--nova-cyan)'
          }}
        />
      ))}
      {/* Ambient Gradient Follower */}
      <div 
        style={{
          position: 'absolute',
          left: mouseRef.current.x - 300,
          top: mouseRef.current.y - 300,
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 60%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'left 0.1s ease-out, top 0.1s ease-out'
        }}
      />
    </div>
  );
};

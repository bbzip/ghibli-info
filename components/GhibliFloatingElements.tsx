import React, { useEffect, useState } from 'react';

const GhibliFloatingElements: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 跟踪鼠标位置
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
      {/* 小煤炭精灵 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div 
          key={`soot-${i}`}
          className="absolute"
          style={{
            left: `${10 + (i * 20)}%`,
            top: `${70 + (Math.sin(i) * 10)}%`,
            transform: `translateX(${mousePosition.x * 0.02}px) translateY(${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.8s ease-out'
          }}
        >
          <div className="w-16 h-16 relative animate-float" style={{ animationDelay: `${i * 2}s` }}>
            {/* 煤炭精灵身体 */}
            <div className="absolute w-10 h-10 bg-black rounded-full opacity-90"></div>
            
            {/* 眼睛 */}
            <div className="absolute w-2 h-1 bg-white rounded-full top-3 left-2 opacity-90"></div>
            <div className="absolute w-2 h-1 bg-white rounded-full top-3 left-6 opacity-90"></div>
            
            {/* 手臂 */}
            <div className="absolute w-4 h-1 bg-black rounded-full top-5 left-[-3px] opacity-90 transform -rotate-45"></div>
            <div className="absolute w-4 h-1 bg-black rounded-full top-5 left-9 opacity-90 transform rotate-45"></div>
            
            {/* 腿 */}
            <div className="absolute w-1 h-4 bg-black rounded-full top-9 left-3 opacity-90"></div>
            <div className="absolute w-1 h-4 bg-black rounded-full top-9 left-6 opacity-90"></div>
          </div>
        </div>
      ))}

      {/* 另一种煤炭精灵 - 手举起来的姿势 */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div 
          key={`soot2-${i}`}
          className="absolute"
          style={{
            left: `${55 + (i * 25)}%`,
            top: `${75 + (Math.sin(i) * 5)}%`,
            transform: `translateX(${mousePosition.x * 0.015}px) translateY(${mousePosition.y * 0.015}px)`,
            transition: 'transform 0.8s ease-out',
            zIndex: 15
          }}
        >
          <div className="w-16 h-16 relative animate-float" style={{ animationDelay: `${i * 1.5 + 1}s`, animationDuration: '7s' }}>
            {/* 煤炭精灵身体 */}
            <div className="absolute w-10 h-10 bg-black rounded-full opacity-90"></div>
            
            {/* 眼睛 */}
            <div className="absolute w-2 h-1 bg-white rounded-full top-3 left-2 opacity-90"></div>
            <div className="absolute w-2 h-1 bg-white rounded-full top-3 left-6 opacity-90"></div>
            
            {/* 手臂 - 举起来 */}
            <div className="absolute w-1 h-4 bg-black rounded-full top-1 left-3 opacity-90 transform -rotate-12"></div>
            <div className="absolute w-1 h-4 bg-black rounded-full top-1 left-6 opacity-90 transform rotate-12"></div>
            
            {/* 腿 */}
            <div className="absolute w-1 h-3 bg-black rounded-full top-9 left-3 opacity-90"></div>
            <div className="absolute w-1 h-3 bg-black rounded-full top-9 left-6 opacity-90"></div>
          </div>
        </div>
      ))}

      {/* 漂浮的树叶 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={`leaf-${i}`}
          className="absolute"
          style={{
            left: `${(i * 20) + 5}%`,
            top: `${(i * 15) + 10}%`,
            transform: `translateX(${mousePosition.x * 0.01 * (i + 1)}px) translateY(${mousePosition.y * 0.01 * (i + 1)}px)`,
            transition: 'transform 1s ease-out',
            zIndex: 5
          }}
        >
          <div 
            className="animate-float"
            style={{ 
              animationDuration: `${12 + i * 4}s`,
              animationDelay: `${i * 1.5}s`,
              transform: 'rotate(' + (i * 30) + 'deg)'
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 2C8 2 2 8 15 28C28 8 22 2 15 2Z" fill="#8db48e" opacity="0.8" />
            </svg>
          </div>
        </div>
      ))}

      {/* 漂浮的光点 */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div 
          key={`light-${i}`}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 4 + 2}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default GhibliFloatingElements; 
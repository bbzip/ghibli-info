import React, { useEffect, useState } from 'react';

const GhibliBackground: React.FC = () => {
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
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 bg-gradient-to-b from-[#a8ccd7] to-[#f9f7f3]">
      {/* 云朵层 */}
      <div 
        className="absolute w-full h-full z-[-5]"
        style={{
          backgroundImage: `url('/images/ghibli-clouds.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateX(${mousePosition.x * 0.01}px) translateY(${mousePosition.y * 0.01}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* 远景山丘 */}
      <div 
        className="absolute bottom-0 w-full h-[40%] z-[-4]"
        style={{
          backgroundImage: `url('/images/ghibli-distant-hills.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          transform: `translateX(${mousePosition.x * 0.02}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* 前景草地 */}
      <div 
        className="absolute bottom-0 w-full h-[30%] z-[-3]"
        style={{
          backgroundImage: `url('/images/ghibli-grass.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          transform: `translateX(${mousePosition.x * 0.04}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />
      
      {/* 浮动的灰尘精灵 */}
      <div className="dust-sprites">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white opacity-60 animate-float"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GhibliBackground; 
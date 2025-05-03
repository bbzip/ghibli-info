import React, { useEffect, useState } from 'react';

const MouseFollower: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<{x: number, y: number, size: number, opacity: number}[]>([]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
      
      // 添加新的轨迹点
      setMouseTrail(prev => {
        // 创建新轨迹点
        const newPoint = {
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 8 + 4, // 随机大小
          opacity: 0.8 // 初始不透明度
        };
        
        // 保留最新的15个点，并降低旧点的不透明度
        const updatedTrail = [...prev, newPoint]
          .slice(-15)
          .map((point, index, array) => ({
            ...point,
            opacity: point.opacity * 0.92 // 每一帧降低不透明度
          }))
          .filter(point => point.opacity > 0.1); // 移除太透明的点
        
        return updatedTrail;
      });
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
      setMouseTrail([]);
    };
    
    // 每60ms进行一次更新，模拟轨迹消失效果
    const intervalId = setInterval(() => {
      if (mouseTrail.length > 0) {
        setMouseTrail(prev => 
          prev.map(point => ({
            ...point,
            opacity: point.opacity * 0.95,
            size: point.size * 1.01 // 轻微增大尺寸
          })).filter(point => point.opacity > 0.1)
        );
      }
    }, 60);
    
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(intervalId);
    };
  }, [isVisible, mouseTrail.length]);

  return (
    <>
      {/* 鼠标轨迹效果 */}
      {mouseTrail.map((point, index) => (
        <div 
          key={`trail-${index}`}
          className="fixed pointer-events-none z-50 rounded-full mix-blend-screen"
          style={{
            left: `${point.x}px`,
            top: `${point.y}px`,
            width: `${point.size}px`,
            height: `${point.size}px`,
            opacity: point.opacity,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: `0 0 ${point.size * 2}px rgba(255, 255, 255, 0.8)`,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s ease-out'
          }}
        />
      ))}
      
      {/* 主光环效果 */}
      <div 
        className={`fixed pointer-events-none z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* 外环光晕 */}
        <div className="absolute w-8 h-8 rounded-full bg-white opacity-15 animate-pulse"
          style={{
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(142, 202, 230, 0.3)',
            animationDuration: '2s',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* 内部光点 */}
        <div className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(142,202,230,0.8) 70%, rgba(142,202,230,0) 100%)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* 随机方向的光线 */}
        {Array.from({ length: 3 }).map((_, i) => {
          const angle = Math.random() * 360;
          const length = Math.random() * 5 + 5;
          return (
            <div 
              key={`ray-${i}`}
              className="absolute opacity-40"
              style={{
                width: `${length}px`,
                height: '1px',
                background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                transform: `rotate(${angle}deg) translateX(4px)`,
                transformOrigin: 'left center'
              }}
            />
          );
        })}
      </div>
    </>
  );
};

export default MouseFollower; 
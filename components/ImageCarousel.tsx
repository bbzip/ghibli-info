import { useTranslation } from 'next-i18next';
import React, { useRef, useState, useEffect } from 'react';

interface ExampleImage {
  original: string;
  transformed: string;
  title?: string;
  transformedTitle?: string;
}

interface ImageCarouselProps {
  examples: ExampleImage[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ examples }) => {
  const { t } = useTranslation('common');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current!.offsetLeft);
    setScrollLeft(scrollContainerRef.current!.scrollLeft);
    scrollContainerRef.current!.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    scrollContainerRef.current!.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    scrollContainerRef.current!.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current!.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current!.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    // Add grab cursor to indicate draggable area
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  }, []);

  return (
    <div className="relative w-full my-8">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto space-x-6 snap-x pb-6 scrollbar-hide"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {examples.map((example, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[280px] bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-xl border border-white/30 snap-center transition-transform hover:scale-105 duration-300"
          >
            <div className="mb-3">
              <img
                src={example.original}
                className="rounded-xl shadow-inner border border-orange-200 object-cover w-full h-60"
                alt={t('preview.before')}
              />
              <p className="text-xs text-center text-gray-500 mt-2">{t('preview.before')}</p>
            </div>
            
            <div>
              <img
                src={example.transformed}
                className="rounded-xl shadow-inner border border-orange-200 object-cover w-full h-60"
                alt={t('preview.after')}
              />
              <p className="text-xs text-center text-orange-500 font-medium mt-2">{t('preview.after')}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4 text-xs text-gray-500">
        <p>{t('locale') === 'zh' ? '👈 向左右滑动查看更多案例 👉' : '👈 Swipe left or right to see more examples 👉'}</p>
      </div>
    </div>
  );
};

export default ImageCarousel; 
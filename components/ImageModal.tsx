import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling of the body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300">
      <div
        ref={modalRef}
        className="relative max-w-5xl max-h-[90vh] bg-white/90 rounded-3xl shadow-2xl p-2 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-gray-200 transition"
        >
          <X size={20} />
        </button>
        
        <div className="overflow-auto max-h-[calc(90vh-20px)] rounded-2xl">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-auto object-contain"
          />
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full">
          Right-click to save image
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 
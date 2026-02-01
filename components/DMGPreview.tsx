
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DmgConfig } from '../types';

interface DMGPreviewProps {
  config: DmgConfig;
  onUpdate: (updates: Partial<DmgConfig>) => void;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type DragType = 'app' | 'folder' | 'viewport' | ResizeDirection;

const DMGPreview: React.FC<DMGPreviewProps> = ({ config, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const [dragging, setDragging] = useState<DragType | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isScaled, setIsScaled] = useState(true);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight,
        });
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!isScaled || viewportSize.width === 0) return 1;
    const padding = 100;
    const availableW = viewportSize.width - padding;
    const availableH = viewportSize.height - padding;
    
    const scaleW = availableW / config.windowSize.width;
    const scaleH = availableH / config.windowSize.height;
    
    return Math.min(1, scaleW, scaleH);
  }, [isScaled, viewportSize, config.windowSize]);

  const handleMouseDown = (e: React.MouseEvent, type: DragType) => {
    if (type === 'viewport') {
      if (!isScaled) {
        setIsPanning(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    } else {
      e.stopPropagation();
      setDragging(type);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const dx = (e.clientX - lastMousePos.x) / scale;
      const dy = (e.clientY - lastMousePos.y) / scale;

      // Handle Resizing
      if (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].includes(dragging)) {
        let newWidth = config.windowSize.width;
        let newHeight = config.windowSize.height;

        if (dragging.includes('e')) newWidth += dx;
        if (dragging.includes('w')) newWidth -= dx;
        if (dragging.includes('s')) newHeight += dy;
        if (dragging.includes('n')) newHeight -= dy;

        onUpdate({ 
          windowSize: { 
            width: Math.max(400, Math.min(1200, newWidth)), 
            height: Math.max(300, Math.min(800, newHeight)) 
          } 
        });
      } 
      // Handle Icon Dragging
      else if (containerRef.current && (dragging === 'app' || dragging === 'folder')) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / scale);
        const y = Math.round((e.clientY - rect.top) / scale);

        if (dragging === 'app') {
          onUpdate({ appPosition: { x, y } });
        } else if (dragging === 'folder') {
          onUpdate({ applicationFolderPosition: { x, y } });
        }
      }
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isPanning && viewportRef.current) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      viewportRef.current.scrollLeft -= dx;
      viewportRef.current.scrollTop -= dy;
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setIsPanning(false);
  };

  return (
    <div className="flex flex-col items-center w-full h-full relative select-none min-h-0">
      <div className="w-full flex justify-between items-center mb-4 px-2 shrink-0">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">DMG Stage</h3>
          <p className="text-[10px] text-gray-400 font-mono">
            {Math.round(config.windowSize.width)}x{Math.round(config.windowSize.height)}px {scale < 1 && isScaled ? `(Scaled ${Math.round(scale * 100)}%)` : '(1:1)'}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setIsScaled(true)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${isScaled ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Scale to Fit
          </button>
          <button 
            onClick={() => setIsScaled(false)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${!isScaled ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            True Pixels
          </button>
        </div>
      </div>

      <div 
        ref={viewportRef}
        onMouseDown={(e) => handleMouseDown(e, 'viewport')}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 w-full bg-gray-200/50 rounded-[2rem] border-2 border-dashed border-gray-300 overflow-auto custom-scrollbar relative flex ${isScaled ? 'items-center justify-center' : 'cursor-grab active:cursor-grabbing block'}`}
      >
        <div className={`relative ${isScaled ? '' : 'm-24'} transition-all flex flex-col items-start`} style={{ transform: isScaled ? `scale(${scale})` : 'none', transformOrigin: 'center center' }}>
          
          <div 
            ref={containerRef}
            className="relative bg-white rounded-xl overflow-visible macos-shadow pointer-events-auto"
            style={{ 
              width: `${config.windowSize.width}px`, 
              height: `${config.windowSize.height}px`,
              backgroundImage: config.background ? `url(${config.background})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0
            }}
          >
            {/* Native Window Resize Handles */}
            <div className="absolute inset-0 pointer-events-none z-30">
              <div onMouseDown={(e) => handleMouseDown(e, 'n')} className="absolute -top-1 left-0 w-full h-2 cursor-n-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 's')} className="absolute -bottom-1 left-0 w-full h-2 cursor-s-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 'w')} className="absolute top-0 -left-1 h-full w-2 cursor-w-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 'e')} className="absolute top-0 -right-1 h-full w-2 cursor-e-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 'nw')} className="absolute -top-1 -left-1 w-4 h-4 cursor-nw-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 'ne')} className="absolute -top-1 -right-1 w-4 h-4 cursor-ne-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 'sw')} className="absolute -bottom-1 -left-1 w-4 h-4 cursor-sw-resize pointer-events-auto" />
              <div onMouseDown={(e) => handleMouseDown(e, 'se')} className="absolute -bottom-1 -right-1 w-4 h-4 cursor-se-resize pointer-events-auto" />
            </div>

            {/* Fake macOS Title Bar */}
            <div className="absolute top-0 left-0 w-full h-8 bg-white/90 backdrop-blur-md flex items-center px-4 border-b border-gray-200/50 z-10 pointer-events-none overflow-hidden rounded-t-xl">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 text-center text-[13px] font-medium text-gray-700">
                {config.title}
              </div>
            </div>

            {/* Draggable App Icon */}
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'app')}
              className="absolute cursor-move flex flex-col items-center group pointer-events-auto z-20"
              style={{ 
                left: config.appPosition.x, 
                top: config.appPosition.y,
                transform: 'translate(-50%, -50%)',
                transition: dragging ? 'none' : 'all 0.1s'
              }}
            >
              <div 
                className="rounded-2xl shadow-xl overflow-hidden mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white/20 group-hover:scale-105 transition-transform"
                style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-1/2 h-1/2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <span className="text-[13px] font-medium text-gray-800 bg-white/60 backdrop-blur px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                {config.title}
              </span>
            </div>

            {/* Draggable Applications Folder */}
            <div 
              onMouseDown={(e) => handleMouseDown(e, 'folder')}
              className="absolute cursor-move flex flex-col items-center group pointer-events-auto z-20"
              style={{ 
                left: config.applicationFolderPosition.x, 
                top: config.applicationFolderPosition.y,
                transform: 'translate(-50%, -50%)',
                transition: dragging ? 'none' : 'all 0.1s'
              }}
            >
              <div 
                className="mb-2 bg-[#007aff]/10 border-2 border-white/20 group-hover:scale-105 transition-transform rounded-2xl flex items-center justify-center shadow-lg"
                style={{ width: `${config.iconSize}px`, height: `${config.iconSize}px` }}
              >
                <svg className="w-3/4 h-3/4 text-[#007aff]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-gray-800 bg-white/60 backdrop-blur px-2 py-0.5 rounded shadow-sm">
                Applications
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isScaled && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg border border-white/10 flex items-center gap-2 pointer-events-none z-50">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6 3V11m0-5.5a1.5 1.5 0 013 0v5m0 0V11" />
          </svg>
          Drag edges/corners to resize • Drag viewport to pan
        </div>
      )}
    </div>
  );
};

export default DMGPreview;

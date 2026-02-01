
import React, { useRef, useState } from 'react';
import { DmgConfig } from '../types';

interface ConfigEditorProps {
  config: DmgConfig;
  onUpdate: (updates: Partial<DmgConfig>) => void;
}

const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStageOpen, setIsStageOpen] = useState(true);

  const jsonOutput = JSON.stringify({
    bundle: {
      dmg: {
        background: config.background?.startsWith('data:') ? "./assets/dmg-background.png" : (config.background || null),
        windowSize: { width: Math.round(config.windowSize.width), height: Math.round(config.windowSize.height) },
        appPosition: { x: Math.round(config.appPosition.x), y: Math.round(config.appPosition.y) },
        applicationFolderPosition: { x: Math.round(config.applicationFolderPosition.x), y: Math.round(config.applicationFolderPosition.y) }
      }
    }
  }, null, 2);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdate({ background: result });
        matchDimensions(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const matchDimensions = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      onUpdate({
        windowSize: {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
      });
    };
    img.src = imageUrl;
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">
        <section className="transition-all duration-200">
          <div 
            className="flex items-center justify-between cursor-pointer group mb-3"
            onClick={() => setIsStageOpen(!isStageOpen)}
          >
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Stage & Background
            </h4>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${!isStageOpen ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isStageOpen && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">Background Image</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={config.background?.startsWith('data:') ? 'Local file uploaded' : (config.background || '')}
                    placeholder="URL or upload file..."
                    onChange={(e) => onUpdate({ background: e.target.value })}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors flex items-center justify-center"
                    title="Upload Image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {config.background && (
                  <button 
                    onClick={() => matchDimensions(config.background!)}
                    className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-bold border border-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Auto-fit Window to Image
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500">Width ({Math.round(config.windowSize.width)}px)</label>
                  </div>
                  <input 
                    type="range" 
                    min="400" 
                    max="1200" 
                    value={config.windowSize.width}
                    onChange={(e) => onUpdate({ windowSize: { ...config.windowSize, width: parseInt(e.target.value) } })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500">Height ({Math.round(config.windowSize.height)}px)</label>
                  </div>
                  <input 
                    type="range" 
                    min="300" 
                    max="800" 
                    value={config.windowSize.height}
                    onChange={(e) => onUpdate({ windowSize: { ...config.windowSize, height: parseInt(e.target.value) } })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Identity & Icon
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">DMG Title</label>
              <input 
                type="text" 
                value={config.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Icon Size ({config.iconSize}px)</label>
              <input 
                type="range" 
                min="32" 
                max="256" 
                value={config.iconSize}
                onChange={(e) => onUpdate({ iconSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="mt-4 flex flex-col min-h-[180px] shrink-0 border-t pt-4 border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          tauri.conf.json Snippet
        </h4>
        <div className="relative flex-1 bg-[#1e1e1e] rounded-xl overflow-hidden shadow-inner group min-h-0">
          <pre className="absolute inset-0 p-4 text-[13px] text-gray-300 font-mono overflow-auto custom-scrollbar">
            <code>{jsonOutput}</code>
          </pre>
          <button 
            onClick={() => navigator.clipboard.writeText(jsonOutput)}
            className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Copy JSON"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ConfigEditor;

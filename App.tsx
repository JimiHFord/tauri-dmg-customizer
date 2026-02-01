
import React, { useState } from 'react';
import { DmgConfig } from './types';
import { INITIAL_CONFIG, GUIDE_STEPS } from './constants';
import DMGPreview from './components/DMGPreview';
import ConfigEditor from './components/ConfigEditor';

const App: React.FC = () => {
  const [config, setConfig] = useState<DmgConfig>(INITIAL_CONFIG);
  const [activeStep, setActiveStep] = useState(0);
  const [isGuideMinimized, setIsGuideMinimized] = useState(false);

  const updateConfig = (updates: Partial<DmgConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f7] overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-gray-200 flex items-center px-8 justify-between shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Tauri DMG Customizer</h1>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-widest">macOS Packaging Workshop</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <a href="https://tauri.app/v1/guides/distribution/packaging#macos" target="_blank" rel="noreferrer" className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">Documentation</a>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">Build Your DMG</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0">
        
        {/* Left Section: Visual Preview */}
        <div className="w-2/3 flex flex-col h-full bg-gray-100/50 rounded-3xl border border-gray-200 p-6 overflow-hidden">
          <DMGPreview config={config} onUpdate={updateConfig} />
        </div>

        {/* Right Section: Config Editor & Steps */}
        <div className="w-1/3 flex flex-col gap-6 h-full min-h-0">
          {/* Config Editor */}
          <div className="bg-white rounded-3xl p-6 macos-shadow border border-gray-100 flex-1 min-h-0 flex flex-col overflow-hidden">
            <ConfigEditor config={config} onUpdate={updateConfig} />
          </div>

          {/* Guide Steps */}
          <div className={`bg-white rounded-3xl p-6 macos-shadow border border-gray-100 flex flex-col transition-all duration-300 ${isGuideMinimized ? 'h-16 shrink-0' : 'h-1/3 shrink-0'}`}>
            <div className="flex justify-between items-center mb-4 cursor-pointer select-none" onClick={() => setIsGuideMinimized(!isGuideMinimized)}>
               <div className="flex items-center gap-2">
                 <h4 className="text-sm font-bold text-gray-700">How-To Guide</h4>
                 <svg className={`w-4 h-4 text-gray-400 transition-transform ${isGuideMinimized ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
               {!isGuideMinimized && (
                 <div className="flex gap-1">
                   {GUIDE_STEPS.map((_, i) => (
                     <div key={i} className={`w-6 h-1 rounded-full transition-colors ${i === activeStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
                   ))}
                 </div>
               )}
            </div>
            
            {!isGuideMinimized && (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 text-sm">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
                    <h5 className="text-sm font-bold text-blue-800 mb-1">{GUIDE_STEPS[activeStep].title}</h5>
                    <p className="text-xs text-blue-700 leading-relaxed mb-3">
                      {GUIDE_STEPS[activeStep].description}
                    </p>
                    {GUIDE_STEPS[activeStep].codeSnippet && (
                      <div className="relative group">
                        <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto max-h-32">
                          <pre className="text-[11px] text-gray-300 font-mono">
                            <code>{GUIDE_STEPS[activeStep].codeSnippet}</code>
                          </pre>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(GUIDE_STEPS[activeStep].codeSnippet || '')}
                          className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy Code"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setActiveStep(prev => Math.min(GUIDE_STEPS.length - 1, prev + 1))}
                    disabled={activeStep === GUIDE_STEPS.length - 1}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                  >
                    Next Step
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info Bar */}
      <footer className="h-10 bg-white border-t border-gray-200 px-8 flex items-center justify-between text-[10px] text-gray-400 font-medium shrink-0">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Simulator Ready</span>
          <span>Target: x86_64-apple-darwin / aarch64-apple-darwin</span>
        </div>
        <div className="flex gap-4">
          <span>Made for Tauri Developers</span>
          <span className="text-gray-300">|</span>
          <span>v2.0.0-beta.0 compatible</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

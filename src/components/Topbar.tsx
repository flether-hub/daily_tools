import { useState } from 'react';
import { Key, RefreshCw, ChevronRight } from 'lucide-react';
import { LogEntry, Tool } from '../types';

export function Topbar({ logs, apiKey, setApiKey, keyStatus, onRefreshKey, currentTool }: { logs: LogEntry[], apiKey: string, setApiKey: (k: string) => void, keyStatus: 'gray' | 'green' | 'red' | 'blue', onRefreshKey: () => void, currentTool: Tool }) {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setIsEditingKey(false);
  };

  const statusColor = keyStatus === 'green' ? 'bg-emerald-500' : keyStatus === 'red' ? 'bg-red-500' : keyStatus === 'blue' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400';

  const toolNames = {
    image: 'ImageEditor',
    markdown: 'DocBuilder',
    compare: 'SpecMatch'
  };

  return (
    <div className="print:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-3 mr-6">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
          <rect width="32" height="32" rx="8" fill="url(#paint0_linear)"/>
          <path d="M16 8L22.9282 12V20L16 24L9.0718 20V12L16 8Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M16 16L22.9282 12M16 16L9.0718 12M16 16V24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16" cy="16" r="2" fill="white"/>
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5"/>
              <stop offset="1" stopColor="#7C3AED"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent whitespace-nowrap tracking-tight">DailyTools Pro</h1>
          <ChevronRight size={18} className="text-slate-400" />
          <span className="text-lg font-semibold text-slate-700">{toolNames[currentTool]}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden h-full flex items-center border-l border-slate-200 pl-6">
        <div className="flex items-center w-full">
          {logs.length > 0 ? (
            <span key={logs[logs.length - 1].id} className={`truncate animate-in fade-in duration-300 ${logs[logs.length - 1].type === 'error' ? 'text-red-500 font-medium' : 'text-slate-600'}`}>
              [{logs[logs.length - 1].timestamp.toLocaleTimeString()}] {logs[logs.length - 1].message}
            </span>
          ) : (
            <span className="text-slate-400 italic animate-in fade-in duration-300">Ready</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-6 pl-6 border-l border-slate-200">
        {isEditingKey ? (
          <div className="flex items-center gap-2">
            <input 
              type="password" 
              value={tempKey} 
              onChange={e => setTempKey(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:border-indigo-500"
              placeholder="Enter API Key"
            />
            <button onClick={handleSaveKey} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">Save</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={onRefreshKey} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors" title="Re-validate API Key">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setIsEditingKey(true)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-medium whitespace-nowrap transition-colors" title={apiKey ? 'Edit API Key' : 'Set API Key'}>
              <div className="relative flex items-center justify-center p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <Key size={18} className={keyStatus === 'green' ? 'text-emerald-500' : keyStatus === 'red' ? 'text-red-500' : keyStatus === 'blue' ? 'text-blue-500' : 'text-slate-500'} />
                <div className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`}></div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

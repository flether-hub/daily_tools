import { useState } from 'react';
import { Image, FileText, GitCompare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tool } from '../types';

export function Sidebar({ currentTool, setTool }: { currentTool: Tool, setTool: (t: Tool) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-48'} bg-slate-900 flex flex-col items-center py-8 relative transition-all duration-300 flex-shrink-0 z-20`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-slate-800 text-slate-400 rounded-full p-1.5 hover:text-white hover:bg-slate-700 border border-slate-600 z-30 shadow-md transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex flex-col gap-4 w-full px-3">
        <button onClick={() => setTool('image')} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors ${currentTool === 'image' ? 'bg-slate-800 text-white' : 'text-slate-400'} ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`} title="图片处理">
          <Image size={24} className="text-blue-400 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap">图片处理</span>}
        </button>
        <button onClick={() => setTool('markdown')} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors ${currentTool === 'markdown' ? 'bg-slate-800 text-white' : 'text-slate-400'} ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`} title="Markdown">
          <FileText size={24} className="text-emerald-400 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap">Markdown</span>}
        </button>
        <button onClick={() => setTool('compare')} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors ${currentTool === 'compare' ? 'bg-slate-800 text-white' : 'text-slate-400'} ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`} title="需求对比">
          <GitCompare size={24} className="text-orange-400 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium whitespace-nowrap">需求对比</span>}
        </button>
      </div>
    </div>
  );
}

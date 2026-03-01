import { useState } from 'react';
import { Image, FileText, GitCompare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tool } from '../types';

export function Sidebar({ currentTool, setTool }: { currentTool: Tool, setTool: (t: Tool) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`print:hidden ${isCollapsed ? 'w-20' : 'w-48'} bg-[#f0f4f9] flex flex-col items-center py-8 relative transition-all duration-300 flex-shrink-0 z-20 border-r border-slate-200/50`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white text-slate-500 rounded-full p-1.5 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 z-30 shadow-sm transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex flex-col gap-2 w-full px-3">
        <button onClick={() => setTool('image')} className={`flex items-center gap-3 p-3 rounded-full transition-colors ${currentTool === 'image' ? 'bg-[#e1e5ea] text-slate-900 font-semibold' : 'text-slate-700 hover:bg-[#e1e5ea]/50'} ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`} title="图片处理">
          <Image size={22} className="text-blue-500 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">图片处理</span>}
        </button>
        <button onClick={() => setTool('markdown')} className={`flex items-center gap-3 p-3 rounded-full transition-colors ${currentTool === 'markdown' ? 'bg-[#e1e5ea] text-slate-900 font-semibold' : 'text-slate-700 hover:bg-[#e1e5ea]/50'} ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`} title="Markdown">
          <FileText size={22} className="text-emerald-500 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Markdown</span>}
        </button>
        <button onClick={() => setTool('compare')} className={`flex items-center gap-3 p-3 rounded-full transition-colors ${currentTool === 'compare' ? 'bg-[#e1e5ea] text-slate-900 font-semibold' : 'text-slate-700 hover:bg-[#e1e5ea]/50'} ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`} title="需求对比">
          <GitCompare size={22} className="text-orange-500 flex-shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">需求对比</span>}
        </button>
      </div>
    </div>
  );
}

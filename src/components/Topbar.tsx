import { useState } from 'react';
import { Key } from 'lucide-react';
import { LogEntry } from '../types';

export function Topbar({ logs, apiKey, setApiKey, keyStatus }: { logs: LogEntry[], apiKey: string, setApiKey: (k: string) => void, keyStatus: 'gray' | 'green' | 'red' }) {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setIsEditingKey(false);
  };

  const statusColor = keyStatus === 'green' ? 'bg-emerald-500' : keyStatus === 'red' ? 'bg-red-500' : 'bg-gray-400';

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-4 mr-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">DailyTools Pro</h1>
      </div>

      <div className="flex-1 overflow-hidden h-full flex items-center relative border-l border-slate-200 pl-6">
        <div className="absolute whitespace-nowrap animate-marquee flex gap-12">
          {logs.slice(-10).map(log => (
            <span key={log.id} className={`${log.type === 'error' ? 'text-red-500 font-medium' : 'text-slate-600'}`}>
              [{log.timestamp.toLocaleTimeString()}] {log.message}
            </span>
          ))}
          {logs.length === 0 && <span className="text-slate-400 italic">暂无日志...</span>}
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
              placeholder="输入 API Key"
            />
            <button onClick={handleSaveKey} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">保存</button>
          </div>
        ) : (
          <button onClick={() => setIsEditingKey(true)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-medium whitespace-nowrap transition-colors" title={apiKey ? '修改 API Key' : '设置 API Key'}>
            <div className="relative flex items-center justify-center p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <Key size={18} className={keyStatus === 'green' ? 'text-emerald-500' : keyStatus === 'red' ? 'text-red-500' : 'text-slate-500'} />
              <div className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`}></div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

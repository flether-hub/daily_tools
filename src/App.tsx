import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ImageEditor } from './components/ImageEditor';
import { MarkdownEditor } from './components/MarkdownEditor';
import { DatasheetCompare } from './components/DatasheetCompare';
import { Tool, LogEntry } from './types';

export default function App() {
  const [currentTool, setCurrentTool] = useState<Tool>('image');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [keyStatus, setKeyStatus] = useState<'gray' | 'green' | 'red'>('gray');

  const addLog = (message: string, type: 'info' | 'error' = 'info') => {
    const id = Date.now() + Math.random();
    setLogs(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    
    if (type === 'info') {
      setTimeout(() => {
        setLogs(prev => prev.filter(log => log.id !== id));
      }, 3000);
    }
  };

  useEffect(() => {
    if (!apiKey) {
      setKeyStatus('gray');
      return;
    }
    
    const testKey = async () => {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        addLog('Validating API Key with Gemini API (gemini-3-flash-preview)...', 'info');
        await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'hi'
        });
        setKeyStatus('green');
        addLog('API Key validated successfully.', 'info');
      } catch (error: any) {
        setKeyStatus('red');
        addLog(`Gemini API Validation Error: ${error.message}`, 'error');
      }
    };
    
    testKey();
  }, [apiKey]);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      <Sidebar currentTool={currentTool} setTool={setCurrentTool} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar logs={logs} apiKey={apiKey} setApiKey={handleSetApiKey} keyStatus={keyStatus} />
        <main className="flex-1 overflow-hidden relative">
          {currentTool === 'image' && <ImageEditor addLog={addLog} />}
          {currentTool === 'markdown' && <MarkdownEditor />}
          {currentTool === 'compare' && <DatasheetCompare apiKey={apiKey} addLog={addLog} />}
        </main>
      </div>
    </div>
  );
}

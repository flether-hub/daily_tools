import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

interface CompareResult {
  feature: string;
  requirement: string;
  datasheet: string;
  gap: boolean;
}

export function DatasheetCompare({ apiKey, addLog }: { apiKey: string, addLog: (msg: string, type: 'info'|'error') => void }) {
  const [reqFile, setReqFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!reqFile || !dataFile) {
      addLog('请上传两个文件。', 'error');
      return;
    }
    if (!apiKey) {
      addLog('请先设置 Gemini API Key。', 'error');
      return;
    }

    setLoading(true);
    addLog('开始对比...', 'info');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const reqBase64 = await fileToBase64(reqFile);
      const dataBase64 = await fileToBase64(dataFile);

      addLog('文件处理完毕，正在发送至 Gemini API...', 'info');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: '你是一个产品经理助手。请对比用户需求文档和产品规格书。提取出功能点、用户需求是什么、规格书里怎么写的，以及是否存在差异（如果规格书没有满足需求则gap为true，否则为false）。' },
            { inlineData: { data: reqBase64.split(',')[1], mimeType: reqFile.type || 'text/plain' } },
            { inlineData: { data: dataBase64.split(',')[1], mimeType: dataFile.type || 'text/plain' } }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                requirement: { type: Type.STRING },
                datasheet: { type: Type.STRING },
                gap: { type: Type.BOOLEAN }
              },
              required: ['feature', 'requirement', 'datasheet', 'gap']
            }
          }
        }
      });

      const jsonStr = response.text || '[]';
      const parsed = JSON.parse(jsonStr) as CompareResult[];
      setResults(parsed);
      addLog('对比完成。', 'info');
    } catch (error: any) {
      console.error(error);
      addLog(`对比出错: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">需求与规格书对比</h2>
      
      <div className="flex gap-8 mb-8">
        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReqFile(e.target.files?.[0] || null)} accept=".txt,.md,.pdf" />
          <Upload className="text-slate-400 mb-2" size={32} />
          <p className="text-slate-700 font-medium">上传用户需求</p>
          <p className="text-sm text-slate-500 mt-1">{reqFile ? reqFile.name : 'PDF, TXT, MD'}</p>
        </div>
        
        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setDataFile(e.target.files?.[0] || null)} accept=".txt,.md,.pdf" />
          <Upload className="text-slate-400 mb-2" size={32} />
          <p className="text-slate-700 font-medium">上传产品规格书</p>
          <p className="text-sm text-slate-500 mt-1">{dataFile ? dataFile.name : 'PDF, TXT, MD'}</p>
        </div>
      </div>

      <button 
        onClick={handleCompare}
        disabled={loading || !reqFile || !dataFile}
        className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed self-start mb-8 transition-colors"
      >
        {loading ? '对比中...' : '生成对比'}
      </button>

      {results.length > 0 && (
        <div className="flex-1 overflow-auto border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200">功能</th>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200">需求</th>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200">规格书参数</th>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200 w-24">状态</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={`border-b border-slate-100 ${r.gap ? 'bg-red-50' : 'bg-white'}`}>
                  <td className="p-4 text-slate-800">{r.feature}</td>
                  <td className="p-4 text-slate-600">{r.requirement}</td>
                  <td className="p-4 text-slate-600">{r.datasheet}</td>
                  <td className="p-4">
                    {r.gap ? (
                      <span className="flex items-center gap-1 text-red-600 font-medium text-sm"><AlertCircle size={16}/> 不满足</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm"><CheckCircle2 size={16}/> 满足</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

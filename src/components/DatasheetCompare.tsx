import { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import * as XLSX from 'xlsx';

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

  const handleExportExcel = () => {
    if (results.length === 0) return;
    
    const worksheetData = results.map(r => ({
      'Feature': r.feature,
      'Requirement': r.requirement,
      'Datasheet Spec': r.datasheet,
      'Status': r.gap ? 'Gap' : 'Met'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comparison");
    
    // Auto-size columns
    const maxWidths = [
      { wch: 20 }, // Feature
      { wch: 40 }, // Requirement
      { wch: 40 }, // Datasheet Spec
      { wch: 10 }  // Status
    ];
    worksheet['!cols'] = maxWidths;

    XLSX.writeFile(workbook, "SpecMatch_Comparison.xlsx");
    addLog('Exported comparison to Excel successfully.', 'info');
  };

  const handleCompare = async () => {
    if (!reqFile || !dataFile) {
      addLog('Please upload both files.', 'error');
      return;
    }
    if (!apiKey) {
      addLog('Please set Gemini API Key first.', 'error');
      return;
    }

    setLoading(true);
    addLog('Starting comparison...', 'info');

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const reqBase64 = await fileToBase64(reqFile);
      const dataBase64 = await fileToBase64(dataFile);

      addLog(`Sending request to Gemini API (Model: gemini-3-flash-preview)...`, 'info');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: 'You are an expert product manager and systems engineer. Your task is to perform an EXHAUSTIVE and COMPREHENSIVE comparison between the provided user requirements document and the product datasheet. \n\nCRITICAL INSTRUCTIONS:\n1. You MUST extract EVERY SINGLE requirement, feature, specification, constraint, and capability mentioned in the requirements document.\n2. Do NOT summarize or group them too broadly. Break them down into individual, testable line items.\n3. For each extracted requirement, find the corresponding specification or capability in the datasheet.\n4. Determine if there is a gap. A gap exists (gap: true) IF AND ONLY IF the datasheet explicitly fails to meet the requirement, or if the datasheet completely lacks information to verify the requirement.\n5. Your output must be a highly detailed, exhaustive array covering 100% of the requirements.\n6. CRITICAL: DO NOT TRANSLATE ANY TEXT. Keep the exact original text from the source documents. If the requirement is in Chinese, the output must be in Chinese. If the specification is in English, the output must be in English. Do not translate between languages, even if the two documents are in different languages.' },
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
      addLog('Received successful response from Gemini API.', 'info');
    } catch (error: any) {
      console.error(error);
      addLog(`Gemini API Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-end items-center mb-6">
        {results.length > 0 && (
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download size={18} /> Export Excel
          </button>
        )}
      </div>
      
      <div className="flex gap-8 mb-8">
        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setReqFile(e.target.files?.[0] || null)} accept=".txt,.md,.pdf" />
          <Upload className="text-slate-400 mb-2" size={32} />
          <p className="text-slate-700 font-medium">Upload Requirements</p>
          <p className="text-sm text-slate-500 mt-1">{reqFile ? reqFile.name : 'PDF, TXT, MD'}</p>
        </div>
        
        <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setDataFile(e.target.files?.[0] || null)} accept=".txt,.md,.pdf" />
          <Upload className="text-slate-400 mb-2" size={32} />
          <p className="text-slate-700 font-medium">Upload Datasheet</p>
          <p className="text-sm text-slate-500 mt-1">{dataFile ? dataFile.name : 'PDF, TXT, MD'}</p>
        </div>
      </div>

      <button 
        onClick={handleCompare}
        disabled={loading || !reqFile || !dataFile}
        className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed self-start mb-8 transition-colors"
      >
        {loading ? 'Comparing...' : 'Generate Comparison'}
      </button>

      {results.length > 0 && (
        <div className="flex-1 overflow-auto border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200">Feature</th>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200">Requirement</th>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200">Datasheet Spec</th>
                <th className="p-4 font-semibold text-slate-700 border-b border-slate-200 w-24">Status</th>
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
                      <span className="flex items-center gap-1 text-red-600 font-medium text-sm"><AlertCircle size={16}/> Gap</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm"><CheckCircle2 size={16}/> Met</span>
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

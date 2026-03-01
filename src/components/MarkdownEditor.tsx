import { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { Download, Printer } from 'lucide-react';

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# 欢迎使用 Markdown 编辑器\n\n在此处开始输入...');
  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownloadWord = () => {
    if (!previewRef.current) return;
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>
      ${previewRef.current.innerHTML}
      </body></html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.doc';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="flex h-full w-full print:block">
      <div className="w-1/2 h-full border-r border-slate-200 p-4 flex flex-col print:hidden">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">编辑器</h2>
        <textarea
          className="flex-1 w-full p-4 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>
      <div className="w-1/2 h-full p-4 flex flex-col bg-slate-50 print:w-full print:bg-white print:p-0">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-lg font-semibold text-slate-800">预览</h2>
          <div className="flex gap-2">
            <button onClick={handleDownloadWord} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download size={16} /> 下载 Word
            </button>
            <button onClick={handlePrintPdf} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Printer size={16} /> 打印 PDF
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-xl p-8 shadow-sm print:overflow-visible print:border-none print:shadow-none print:p-0">
          <div ref={previewRef} className="prose max-w-none">
            <Markdown>{markdown}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

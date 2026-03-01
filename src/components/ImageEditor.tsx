import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { removeBackground } from '@imgly/background-removal';
import { Upload, Crop as CropIcon, Eraser, Wand2, Download, RefreshCcw } from 'lucide-react';

export function ImageEditor({ addLog }: { addLog: (msg: string, type: 'info'|'error') => void }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<'crop' | 'erase' | 'none'>('none');
  const [crop, setCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(e.target.files[0]);
      addLog('图片已上传', 'info');
      setMode('none');
    }
  };

  const applyCrop = () => {
    if (!imgRef.current || !crop) return;
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    setImageSrc(canvas.toDataURL('image/png'));
    setMode('none');
    addLog('图片已裁剪', 'info');
  };

  const handleRemoveBackground = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    addLog('开始抠图 (可能需要一点时间下载模型)...', 'info');
    try {
      const blob = await removeBackground(imageSrc);
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
      addLog('抠图成功', 'info');
    } catch (error: any) {
      console.error(error);
      addLog(`抠图失败: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (mode === 'erase' && imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = imageSrc;
    }
  }, [mode, imageSrc]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    erase(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (mode === 'erase' && canvasRef.current) {
      setImageSrc(canvasRef.current.toDataURL('image/png'));
    }
  };

  const erase = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'erase' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const downloadImage = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = imageSrc;
    link.click();
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">图片处理</h2>
        
        {imageSrc && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
            <button onClick={() => setMode(mode === 'crop' ? 'none' : 'crop')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'crop' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>
              <CropIcon size={16}/> 裁剪
            </button>
            <button onClick={() => setMode(mode === 'erase' ? 'none' : 'erase')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'erase' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>
              <Eraser size={16}/> 擦除
            </button>
            <button onClick={handleRemoveBackground} disabled={isProcessing} className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-50">
              <Wand2 size={16}/> {isProcessing ? '处理中...' : '抠图'}
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button onClick={downloadImage} className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
              <Download size={16}/> 导出
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative">
        {!imageSrc ? (
          <div className="text-center">
            <label className="cursor-pointer flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 transition-colors">
              <Upload size={48} className="text-slate-400 mb-4" />
              <span className="text-slate-600 font-medium">点击上传图片</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        ) : (
          <div className="relative w-full h-full overflow-auto p-4 flex items-center justify-center">
            {mode === 'crop' && (
              <div className="flex flex-col items-center gap-4">
                <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                  <img ref={imgRef} src={imageSrc} alt="Crop preview" className="max-w-full max-h-[60vh] object-contain" />
                </ReactCrop>
                <button onClick={applyCrop} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">应用裁剪</button>
              </div>
            )}
            
            {mode === 'erase' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-slate-700">画笔大小: {eraserSize}px</span>
                  <input type="range" min="5" max="100" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} className="w-32" />
                </div>
                <canvas 
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={erase}
                  className="max-w-full max-h-[60vh] object-contain cursor-crosshair border border-slate-300 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyEgSRC0AQBXVh0CUq21xgAAAABJRU5ErkJggg==')]"
                />
              </div>
            )}

            {mode === 'none' && (
              <img src={imageSrc} alt="Preview" className="max-w-full max-h-[70vh] object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyEgSRC0AQBXVh0CUq21xgAAAABJRU5ErkJggg==')]" />
            )}
            
            <button onClick={() => {setImageSrc(null); setMode('none');}} className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full text-slate-600 hover:text-red-600 hover:bg-white shadow-sm transition-all">
              <RefreshCcw size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

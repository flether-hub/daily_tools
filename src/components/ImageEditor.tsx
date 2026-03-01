import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { removeBackground } from '@imgly/background-removal';
import { Upload, Crop as CropIcon, Eraser, Sparkles, Download, RefreshCcw, ImagePlus, Wand2, Undo2 } from 'lucide-react';

export function ImageEditor({ addLog }: { addLog: (msg: string, type: 'info'|'error') => void }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<'crop' | 'erase' | 'none'>('none');
  const [crop, setCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);

  const saveToHistory = (currentSrc: string | null) => {
    if (currentSrc) {
      setHistory(prev => [...prev, currentSrc]);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousSrc = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setImageSrc(previousSrc);
      addLog('Undo successful', 'info');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        saveToHistory(imageSrc);
        setImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(e.target.files[0]);
      addLog('Image uploaded successfully', 'info');
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

    saveToHistory(imageSrc);
    setImageSrc(canvas.toDataURL('image/png'));
    setMode('none');
    addLog('Image cropped successfully', 'info');
  };

  const handleRemoveBackground = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    addLog('Starting background removal model...', 'info');
    try {
      const blob = await removeBackground(imageSrc);
      const url = URL.createObjectURL(blob);
      saveToHistory(imageSrc);
      setImageSrc(url);
      addLog('Background removed successfully', 'info');
    } catch (error: any) {
      console.error(error);
      addLog(`Background removal failed: ${error.message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimpleRemoveBackground = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Sample top-left pixel as background color
      const r = data[0];
      const g = data[1];
      const b = data[2];
      const tolerance = 40; // 0-255

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - r;
        const dg = data[i + 1] - g;
        const db = data[i + 2] - b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        if (distance < tolerance) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      ctx.putImageData(imageData, 0, 0);
      saveToHistory(imageSrc);
      setImageSrc(canvas.toDataURL('image/png'));
      addLog('Background removed (Color Key)', 'info');
    };
    img.src = imageSrc;
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
    if (!isDrawing) return;
    setIsDrawing(false);
    if (mode === 'erase' && canvasRef.current) {
      saveToHistory(imageSrc);
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

  const getEraserCursor = () => {
    const svg = `<svg width="${eraserSize}" height="${eraserSize}" xmlns="http://www.w3.org/2000/svg"><circle cx="${eraserSize/2}" cy="${eraserSize/2}" r="${eraserSize/2 - 1}" fill="none" stroke="black" stroke-width="1"/><circle cx="${eraserSize/2}" cy="${eraserSize/2}" r="${eraserSize/2 - 2}" fill="none" stroke="white" stroke-width="1"/></svg>`;
    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${eraserSize/2} ${eraserSize/2}, auto`;
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center justify-end mb-6">
        
        {imageSrc && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
            <button onClick={handleUndo} disabled={history.length === 0} className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Undo Last Action">
              <Undo2 size={16} /> Undo
            </button>
            <label className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer" title="Replace Image">
              <ImagePlus size={16} /> Replace
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button onClick={() => setMode(mode === 'crop' ? 'none' : 'crop')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'crop' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>
              <CropIcon size={16}/> Crop
            </button>
            <button onClick={() => setMode(mode === 'erase' ? 'none' : 'erase')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'erase' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}>
              <Eraser size={16}/> Erase
            </button>
            <button onClick={handleSimpleRemoveBackground} className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors" title="Fast remove background (Color Key)">
              <Wand2 size={16} /> Remove BG
            </button>
            <button onClick={handleRemoveBackground} disabled={isProcessing} className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-50" title="Use AI to automatically remove background">
              <Sparkles size={16} className="text-amber-500" /> {isProcessing ? 'Processing AI...' : 'AI Remove BG'}
            </button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button onClick={downloadImage} className="px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
              <Download size={16}/> Export
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative">
        {!imageSrc ? (
          <div className="text-center">
            <label className="cursor-pointer flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 transition-colors">
              <Upload size={48} className="text-slate-400 mb-4" />
              <span className="text-slate-600 font-medium">Click to upload image</span>
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
                <button onClick={applyCrop} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">Apply Crop</button>
              </div>
            )}
            
            {mode === 'erase' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                  <span className="text-sm font-medium text-slate-700">Brush Size: {eraserSize}px</span>
                  <input type="range" min="5" max="100" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} className="w-32" />
                </div>
                <canvas 
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onMouseMove={erase}
                  style={{ cursor: getEraserCursor() }}
                  className="max-w-full max-h-[60vh] object-contain border border-slate-300 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyEgSRC0AQBXVh0CUq21xgAAAABJRU5ErkJggg==')]"
                />
              </div>
            )}

            {mode === 'none' && (
              <img src={imageSrc} alt="Preview" className="max-w-full max-h-[70vh] object-contain bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyEgSRC0AQBXVh0CUq21xgAAAABJRU5ErkJggg==')]" />
            )}
            
            <button onClick={() => {saveToHistory(imageSrc); setImageSrc(null); setMode('none');}} className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full text-slate-600 hover:text-red-600 hover:bg-white shadow-sm transition-all" title="Clear Image">
              <RefreshCcw size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

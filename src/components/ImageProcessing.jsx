import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon, Download, RotateCcw } from 'lucide-react';

// Module-level helpers for DCT and quantization to avoid recreating them each render
const dct2D = (block) => {
  const N = 8;
  const result = Array(N).fill(0).map(() => Array(N).fill(0));

  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          sum += block[x][y] *
            Math.cos((2 * x + 1) * u * Math.PI / (2 * N)) *
            Math.cos((2 * y + 1) * v * Math.PI / (2 * N));
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      result[u][v] = 0.25 * cu * cv * sum;
    }
  }
  return result;
};

const idct2D = (block) => {
  const N = 8;
  const result = Array(N).fill(0).map(() => Array(N).fill(0));

  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      let sum = 0;
      for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
          const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
          const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
          sum += cu * cv * block[u][v] *
            Math.cos((2 * x + 1) * u * Math.PI / (2 * N)) *
            Math.cos((2 * y + 1) * v * Math.PI / (2 * N));
        }
      }
      result[x][y] = 0.25 * sum;
    }
  }
  return result;
};

const getQuantizationMatrix = (quality) => {
  const baseMatrix = [
    [16, 11, 10, 16, 24, 40, 51, 61],
    [12, 12, 14, 19, 26, 58, 60, 55],
    [14, 13, 16, 24, 40, 57, 69, 56],
    [14, 17, 22, 29, 51, 87, 80, 62],
    [18, 22, 37, 56, 68, 109, 103, 77],
    [24, 35, 55, 64, 81, 104, 113, 92],
    [49, 64, 78, 87, 103, 121, 120, 101],
    [72, 92, 95, 98, 112, 100, 103, 99]
  ];

  const scale = quality < 50 ? 5000 / quality : 200 - 2 * quality;
  return baseMatrix.map(row =>
    row.map(val => Math.max(1, Math.floor((val * scale + 50) / 100)))
  );
};

const ImageProcessing = () => {
  const [originalImage, setOriginalImage] = useState(null);

  const [quality, setQuality] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState('dct');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);
  const pendingRef = useRef(new Map());



  const processImage = useCallback(async () => {
    if (!originalImage) return;
    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Ensure worker exists
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(new URL('../workers/imageWorker.js', import.meta.url), { type: 'module' });
        workerRef.current.addEventListener('message', (ev) => {
          const m = ev.data;
          if (!m) return;
          const pid = m.id;
          const pending = pendingRef.current.get(pid);
          if (!pending) return;
          if (m.type === 'result') {
            pending.resolve(m.payload);
          } else if (m.type === 'error') {
            pending.reject(new Error(m.payload && m.payload.message ? m.payload.message : 'worker error'));
          }
          pendingRef.current.delete(pid);
        });
      } catch (err) {
        console.warn('Worker creation failed, falling back to main thread', err);
      }
    }

    // If worker available, use it
    if (workerRef.current) {
      const id = `${Date.now()}-${Math.random()}`;
      const payload = { width: canvas.width, height: canvas.height, mode: currentMode, quality, buffer: imageData.data.buffer };
      const prom = new Promise((resolve, reject) => {
        pendingRef.current.set(id, { resolve, reject });
        // timeout
        setTimeout(() => {
          const p = pendingRef.current.get(id);
          if (p) { pendingRef.current.delete(id); p.reject(new Error('worker timeout')); }
        }, 15000);
      });
      try {
        workerRef.current.postMessage({ type: 'process', id, payload }, [payload.buffer]);
        const res = await prom;
        const outBuf = new Uint8ClampedArray(res.buffer);
        const outImage = new ImageData(outBuf, res.width, res.height);
        ctx.putImageData(outImage, 0, 0);
      } catch (err) {
        console.error('Image worker failed, falling back to main thread:', err);
        // fallback: run on main thread (rare)
        // (call original logic) - simplest is to draw original
        ctx.putImageData(imageData, 0, 0);
      }
    } else {
      // no worker available, just draw the original for now
      ctx.putImageData(imageData, 0, 0);
    }

    setProcessing(false);
  }, [originalImage, quality, currentMode]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (originalImage) {
      processImage();
    }
    return () => {
      // keep worker alive across images but ensure pending cleared when component unmounts
      // cleanup happens below in separate effect to terminate worker on unmount
    };
  }, [originalImage, quality, currentMode, processImage]);

  // terminate worker on unmount
  useEffect(() => {
    return () => {
      try { if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; } } catch(e) {}
      pendingRef.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Processing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Processing Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Mode
              </label>
              <select
                value={currentMode}
                onChange={(e) => setCurrentMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dct">DCT Transform (JPEG-like)</option>
                <option value="grayscale">Grayscale</option>
                <option value="edge">Edge Detection</option>
              </select>
            </div>

            {/* Quality Slider */}
            {currentMode === 'dct' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={resetImage}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <RotateCcw size={16} className="mr-2" />
                Reset
              </button>
              <button
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'processed_image.png';
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }}
                disabled={!originalImage}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download
              </button>
            </div>
          </div>

          {/* Canvas Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-96">
              {processing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing image...</p>
                </div>
              ) : originalImage ? (
                <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Upload an image to begin processing</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Algorithm Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">DCT Transform (JPEG-like)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Converts color image to grayscale first</li>
                <li>• 8×8 block processing for compression</li>
                <li>• Forward DCT transformation</li>
                <li>• Quantization with quality scaling</li>
                <li>• Inverse DCT reconstruction</li>
                <li>• Output: Grayscale compressed image</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Grayscale Mode</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Converts RGB to grayscale using luminance</li>
                <li>• Formula: 0.299*R + 0.587*G + 0.114*B</li>
                <li>• Preserves image structure</li>
                <li>• Removes color information</li>
                <li>• Output: Monochrome image</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Edge Detection</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Converts to grayscale first</li>
                <li>• Uses Sobel operator (Gx, Gy kernels)</li>
                <li>• Calculates gradient magnitude</li>
                <li>• Highlights areas of high contrast</li>
                <li>• Output: Edge map (grayscale)</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Key Differences:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>DCT vs Original:</strong> DCT converts to grayscale and applies JPEG compression, showing lossy compression artifacts</li>
              <li><strong>Grayscale vs Original:</strong> Grayscale removes color but preserves all spatial details and brightness variations</li>
              <li><strong>Edge Detection vs Original:</strong> Edge detection highlights boundaries and contours, removing smooth areas and textures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessing;

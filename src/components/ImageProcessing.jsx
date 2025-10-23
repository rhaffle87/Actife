import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, RotateCcw } from 'lucide-react';

const ImageProcessing = () => {
  const [originalImage, setOriginalImage] = useState(null);

  const [quality, setQuality] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [currentMode, setCurrentMode] = useState('dct');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // DCT Implementation (from transform.js)
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

  const processImage = async () => {
    if (!originalImage) return;

    setProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Draw original image
    ctx.drawImage(originalImage, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (currentMode === 'dct') {
      // Convert to grayscale for DCT demo
      const grayscale = new Uint8ClampedArray(data.length / 4);
      for (let i = 0; i < data.length; i += 4) {
        grayscale[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      }

      // Process 8x8 blocks
      const qMatrix = getQuantizationMatrix(quality);
      const processed = new Uint8ClampedArray(grayscale.length);

      for (let by = 0; by < Math.floor(canvas.height / 8); by++) {
        for (let bx = 0; bx < Math.floor(canvas.width / 8); bx++) {
          const block = Array(8).fill(0).map(() => Array(8).fill(0));

          // Extract 8x8 block
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              const idx = (by * 8 + y) * canvas.width + (bx * 8 + x);
              block[y][x] = grayscale[idx] - 128; // Center around 0
            }
          }

          // DCT
          const dctBlock = dct2D(block);

          // Quantization
          const quantized = dctBlock.map((row, y) =>
            row.map((val, x) => Math.round(val / qMatrix[y][x]) * qMatrix[y][x])
          );

          // IDCT
          const idctBlock = idct2D(quantized);

          // Put back
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              const idx = (by * 8 + y) * canvas.width + (bx * 8 + x);
              processed[idx] = Math.max(0, Math.min(255, idctBlock[y][x] + 128));
            }
          }
        }
      }

      // Create processed image data
      const processedData = new Uint8ClampedArray(data.length);
      for (let i = 0; i < processed.length; i++) {
        const val = processed[i];
        processedData[i * 4] = val;     // R
        processedData[i * 4 + 1] = val; // G
        processedData[i * 4 + 2] = val; // B
        processedData[i * 4 + 3] = 255; // A
      }

      const processedImageData = new ImageData(processedData, canvas.width, canvas.height);
      ctx.putImageData(processedImageData, 0, 0);
    }

    setProcessing(false);
  };

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
  }, [originalImage, quality, currentMode]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Discrete Cosine Transform (DCT)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 8×8 block processing</li>
                <li>• Forward DCT transformation</li>
                <li>• Quantization with quality scaling</li>
                <li>• Inverse DCT reconstruction</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">JPEG-like Compression</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Standard quantization matrix</li>
                <li>• Quality-based compression</li>
                <li>• Lossy compression demonstration</li>
                <li>• Real-time parameter adjustment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessing;

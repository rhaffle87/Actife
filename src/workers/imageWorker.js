// imageWorker.js - performs CPU-heavy image processing off the main thread
self.onmessage = async function(e) {
  const msg = e.data;
  if (!msg || msg.type !== 'process') return;
  const { id, payload } = msg;
  const { width, height, mode, quality, buffer } = payload;
  try {
    // Recreate ImageData from transferred buffer
    const input = new Uint8ClampedArray(buffer);

    // Helpers (small, duplicated from main thread implementation)
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
      return baseMatrix.map(row => row.map(val => Math.max(1, Math.floor((val * scale + 50) / 100))));
    };

    const widthI = width, heightI = height;
    let output = new Uint8ClampedArray(input.length);

    if (mode === 'dct') {
      // grayscale
      const grayscale = new Uint8ClampedArray(widthI * heightI);
      for (let i = 0; i < input.length; i += 4) {
        grayscale[i / 4] = Math.round(0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2]);
      }
      const qMatrix = getQuantizationMatrix(quality);
      const processed = new Uint8ClampedArray(grayscale.length);
      const blocksX = Math.floor(widthI / 8), blocksY = Math.floor(heightI / 8);
      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          const block = Array(8).fill(0).map(() => Array(8).fill(0));
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              const idx = (by * 8 + y) * widthI + (bx * 8 + x);
              block[y][x] = grayscale[idx] - 128;
            }
          }
          const dctBlock = dct2D(block);
          const quantized = dctBlock.map((row, y) => row.map((val, x) => Math.round(val / qMatrix[y][x]) * qMatrix[y][x]));
          const idctBlock = idct2D(quantized);
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              const idx = (by * 8 + y) * widthI + (bx * 8 + x);
              processed[idx] = Math.max(0, Math.min(255, idctBlock[y][x] + 128));
            }
          }
        }
      }
      for (let i = 0; i < processed.length; i++) {
        const v = processed[i];
        output[i * 4] = v; output[i * 4 + 1] = v; output[i * 4 + 2] = v; output[i * 4 + 3] = 255;
      }
    } else if (mode === 'grayscale') {
      for (let i = 0; i < input.length; i += 4) {
        const gray = Math.round(0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2]);
        output[i] = gray; output[i + 1] = gray; output[i + 2] = gray; output[i + 3] = input[i + 3];
      }
    } else if (mode === 'edge') {
      const grayscale = new Uint8ClampedArray(widthI * heightI);
      for (let i = 0; i < input.length; i += 4) grayscale[i / 4] = Math.round(0.299 * input[i] + 0.587 * input[i + 1] + 0.114 * input[i + 2]);
      const sobelX = [[-1,0,1],[-2,0,2],[-1,0,1]];
      const sobelY = [[-1,-2,-1],[0,0,0],[1,2,1]];
      const edges = new Uint8ClampedArray(widthI * heightI);
      for (let y = 1; y < heightI - 1; y++) {
        for (let x = 1; x < widthI - 1; x++) {
          let gx = 0, gy = 0;
          for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) {
            const pixel = grayscale[(y + ky) * widthI + (x + kx)];
            gx += pixel * sobelX[ky + 1][kx + 1];
            gy += pixel * sobelY[ky + 1][kx + 1];
          }
          const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
          edges[y * widthI + x] = mag;
        }
      }
      for (let i = 0; i < edges.length; i++) { const v = edges[i]; output[i*4]=v; output[i*4+1]=v; output[i*4+2]=v; output[i*4+3]=255; }
    }

    // Post back using transferable buffer
    self.postMessage({ type: 'result', id, payload: { buffer: output.buffer, width, height } }, [output.buffer]);
  } catch (err) {
    self.postMessage({ type: 'error', id, payload: { message: err && err.message ? err.message : String(err) } });
  }
};

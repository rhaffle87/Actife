// asfWorker.js - small sandboxed worker to evaluate ASF code safely
// Message: { type: 'eval', payload: { code, lat, lng } }
// Responds: { type: 'result', payload: { value } }

self.onmessage = function(e) {
  const msg = e.data;
  if (!msg) return;

  // single-point eval (backwards-compatible)
  if (msg.type === 'eval') {
    const { code, lat, lng } = msg.payload;
    try {
      // Wrap code into a function and execute
      // eslint-disable-next-line no-new-func
      const fn = new Function('lat','lng', 'with(Math){ ' + code + ' }');
      const value = fn(lat, lng);
      self.postMessage({ type: 'result', payload: { value: Number(value) || 0 } });
    } catch (err) {
      self.postMessage({ type: 'error', payload: { message: err.message } });
    }
    return;
  }

  // batched sampling over arrays of lat/lng (for pre-sampling rasters)
  if (msg.type === 'sampleBatch') {
    const { code, lats, lngs, nx, ny } = msg.payload;
    try {
      // create function from supplied code. Code runs with (lat,lng) and may reference Math
      // eslint-disable-next-line no-new-func
      const fn = new Function('lat','lng', 'with(Math){ ' + code + ' }');

      // lats/lngs may be transferred as ArrayBuffer - ensure typed arrays
      const latArr = (lats instanceof Float64Array) ? lats : new Float64Array(lats);
      const lngArr = (lngs instanceof Float64Array) ? lngs : new Float64Array(lngs);
      const n = (nx || 0) * (ny || 0) || latArr.length;
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        try {
          const v = fn(latArr[i], lngArr[i]);
          out[i] = Number(v) || 0;
        } catch (err) {
          out[i] = 0;
        }
      }
      // transfer the resulting buffer back to main thread
      self.postMessage({ type: 'result', payload: { buffer: out.buffer, nx, ny } }, [out.buffer]);
    } catch (err) {
      self.postMessage({ type: 'error', payload: { message: err && err.message ? err.message : String(err) } });
    }
    return;
  }
};

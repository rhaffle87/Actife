// asfWorker.js - small sandboxed worker to evaluate ASF code safely
// Message: { type: 'eval', payload: { code, lat, lng } }
// Responds: { type: 'result', payload: { value } }

self.onmessage = function(e) {
  const msg = e.data;
  if (!msg) return;
  if (msg.type === 'eval') {
    const { code, lat, lng } = msg.payload;
    try {
      // Wrap code into a function and execute
      // NOTE: still arbitrary code, but running inside worker reduces impact on main thread
      // eslint-disable-next-line no-new-func
      const fn = new Function('lat','lng', 'with(Math){ ' + code + ' }');
      const value = fn(lat, lng);
      self.postMessage({ type: 'result', payload: { value: Number(value) || 0 } });
    } catch (err) {
      self.postMessage({ type: 'error', payload: { message: err.message } });
    }
  }
};

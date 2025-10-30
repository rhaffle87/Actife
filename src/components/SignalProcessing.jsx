import { useState, useRef, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SignalProcessing = () => {
  const [signalType, setSignalType] = useState("sine");
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(1);
  const [samplingRate, setSamplingRate] = useState(100);
  const [duration, setDuration] = useState(2);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [filterType, setFilterType] = useState("none");
  const [cutoffFreq, setCutoffFreq] = useState(5);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef(null);
  const [freqChartData, setFreqChartData] = useState(null);

  // Helper: next power of 2
  const nextPowerOf2 = (n) => Math.pow(2, Math.ceil(Math.log2(n)));

  // Generate time-domain signal
  const generateSignal = () => {
    const N = Math.floor(samplingRate * duration);
    let signal = new Array(N).fill(0);

    switch (signalType) {
      case "sine":
        for (let i = 0; i < N; i++) {
          const ti = i / samplingRate;
          signal[i] = amplitude * Math.sin(2 * Math.PI * frequency * ti);
        }
        break;
      case "square":
        for (let i = 0; i < N; i++) {
          const ti = i / samplingRate;
          signal[i] = amplitude * Math.sign(Math.sin(2 * Math.PI * frequency * ti));
        }
        break;
      case "triangle":
        for (let i = 0; i < N; i++) {
          const ti = i / samplingRate;
          const phase = (ti * frequency) % 1;
          signal[i] = amplitude * (phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase);
        }
        break;
      case "sawtooth":
        for (let i = 0; i < N; i++) {
          const ti = i / samplingRate;
          signal[i] = amplitude * (2 * ((ti * frequency) % 1) - 1);
        }
        break;
      case "gaussian":
        for (let i = 0; i < N; i++) {
          const ti = i / samplingRate;
          signal[i] = amplitude * Math.exp(-0.5 * Math.pow((ti - duration / 2) / 0.1, 2));
        }
        break;
      default:
        break;
    }

    // Add noise
    if (noiseLevel > 0) {
      for (let i = 0; i < N; i++)
        signal[i] += noiseLevel * (Math.random() - 0.5) * 2;
    }

    return { signal };
  };

  // FFT (recursive Cooley–Tukey)
  const fft = (signal) => {
    let N = signal.length;
    const pow2 = nextPowerOf2(N);
    if (pow2 !== N) {
      signal = [...signal, ...Array(pow2 - N).fill(0)];
      N = pow2;
    }

    if (N <= 1) {
      return signal.map((v) =>
        typeof v === "number" ? { real: v, imag: 0 } : v
      );
    }

    const complexSignal = signal.map((v) =>
      typeof v === "number" ? { real: v, imag: 0 } : v
    );

    const even = fft(complexSignal.filter((_, i) => i % 2 === 0));
    const odd = fft(complexSignal.filter((_, i) => i % 2 === 1));

    const result = new Array(N);
    for (let k = 0; k < N / 2; k++) {
      const angle = (-2 * Math.PI * k) / N;
      const w = { real: Math.cos(angle), imag: Math.sin(angle) };
      const e = even[k];
      const o = odd[k];
      if (!e || !o) continue;
      const wr = w.real * o.real - w.imag * o.imag;
      const wi = w.real * o.imag + w.imag * o.real;

      result[k] = { real: e.real + wr, imag: e.imag + wi };
      result[k + N / 2] = { real: e.real - wr, imag: e.imag - wi };
    }

    return result;
  };

  // Inverse FFT
  const ifft = (fftSignal) => {
    const N = fftSignal.length;
    const conjugated = fftSignal.map((c) => ({ real: c.real, imag: -c.imag }));
    const fftConj = fft(conjugated);
    return fftConj.map((c) => ({
      real: c.real / N,
      imag: -c.imag / N,
    }));
  };

  // Frequency-domain filtering
  const applyFilter = (fftSignal, freqs) => {
    if (filterType === "none") return fftSignal;

    const filtered = fftSignal.map((c, i) => {
      const freq = Math.abs(freqs[i]);
      let gain = 1;
      switch (filterType) {
        case "lowpass":
          gain = freq <= cutoffFreq ? 1 : 0.05;
          break;
        case "highpass":
          gain = freq >= cutoffFreq ? 1 : 0.05;
          break;
        case "bandpass":
          gain =
            freq >= cutoffFreq * 0.8 && freq <= cutoffFreq * 1.2 ? 1 : 0.05;
          break;
        default:
          break;
      }
      return { real: c.real * gain, imag: c.imag * gain };
    });

    return filtered;
  };

  // Main processing
  const processSignal = useCallback(async () => {
    setProcessing(true);
    try {
      const { signal } = generateSignal();
      const fftResult = fft(signal);

      const freqs = Array.from({ length: fftResult.length }, (_, i) =>
        i * samplingRate / fftResult.length
      );
      const magnitudes = fftResult.map((c) =>
        Math.sqrt(c.real * c.real + c.imag * c.imag)
      );

      const filteredFFT = applyFilter(fftResult, freqs);
      const filteredMagnitudes = filteredFFT.map((c) =>
        Math.sqrt(c.real * c.real + c.imag * c.imag)
      );

      const filteredTime = ifft(filteredFFT).map((c) => c.real);

      // Prepare frequency domain chart data
      const freqChartData = {
        labels: freqs.slice(0, Math.floor(freqs.length / 2)),
        datasets: [
          {
            label: "Original Magnitude",
            data: magnitudes.slice(0, Math.floor(magnitudes.length / 2)),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            pointRadius: 0,
          },
          {
            label: "Filtered Magnitude",
            data: filteredMagnitudes.slice(0, Math.floor(filteredMagnitudes.length / 2)),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            pointRadius: 0,
          },
        ],
      };

      setFreqChartData(freqChartData);

      // Draw canvas visualization
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = 800;
        canvas.height = 400;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Original signal
        ctx.strokeStyle = "rgb(75, 192, 192)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < signal.length; i++) {
          const x = (i / signal.length) * canvas.width;
          const y =
            canvas.height / 2 - (signal[i] / amplitude) * (canvas.height / 4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Filtered signal
        ctx.strokeStyle = "rgb(255, 99, 132)";
        ctx.beginPath();
        for (let i = 0; i < filteredTime.length; i++) {
          const x = (i / filteredTime.length) * canvas.width;
          const y =
            canvas.height / 2 -
            (filteredTime[i] / amplitude) * (canvas.height / 4);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    } finally {
      setProcessing(false);
    }
  }, [
    signalType,
    frequency,
    amplitude,
    samplingRate,
    duration,
    noiseLevel,
    filterType,
    cutoffFreq,
  ]);

  // Initial render
  useEffect(() => {
    processSignal();
  }, []); // only once

  // Initial canvas placeholder
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = 800;
      canvas.height = 400;
      ctx.fillStyle = "rgba(156, 163, 175, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6B7280";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Processing initial signal...",
        canvas.width / 2,
        canvas.height / 2
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Signal Processing
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Signal Parameters</h2>

            {/* Signal Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signal Type
              </label>
              <select
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sine">Sine Wave</option>
                <option value="square">Square Wave</option>
                <option value="triangle">Triangle Wave</option>
                <option value="sawtooth">Sawtooth Wave</option>
                <option value="gaussian">Gaussian Pulse</option>
              </select>
            </div>

            {/* Frequency */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency (Hz)
              </label>
              <input
                type="number"
                min="0.1"
                max="20"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amplitude */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amplitude
              </label>
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={amplitude}
                onChange={(e) => setAmplitude(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sampling Rate */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sampling Rate (Hz)
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                step="50"
                value={samplingRate}
                onChange={(e) => setSamplingRate(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (s)
              </label>
              <input
                type="number"
                min="0.5"
                max="5"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Noise Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Noise Level: {noiseLevel}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Filter Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Filter</option>
                <option value="lowpass">Low-pass</option>
                <option value="highpass">High-pass</option>
                <option value="bandpass">Band-pass</option>
              </select>
            </div>

            {/* Cutoff Frequency */}
            {filterType !== "none" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cutoff Frequency: {cutoffFreq} Hz
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={cutoffFreq}
                  onChange={(e) => setCutoffFreq(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Simulate Button */}
            <div className="mt-6">
              <button
                onClick={processSignal}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {processing ? "Processing..." : "Simulate Signal"}
              </button>
            </div>
          </div>

          {/* Time Domain */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Time Domain</h2>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-96">
              {processing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing signal...</p>
                </div>
              ) : (
                <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" />
              )}
            </div>
          </div>

          {/* Frequency Domain */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Frequency Domain</h2>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-96">
              {freqChartData ? (
                <Line
                  data={freqChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "FFT Magnitude Spectrum",
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Frequency (Hz)",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Magnitude",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <p>Frequency domain visualization</p>
                  <p className="text-sm mt-2">FFT magnitude spectrum</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Signal Processing Algorithms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Fourier Transform (FFT)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cooley-Tukey algorithm implementation</li>
                <li>• O(N log N) complexity</li>
                <li>• Converts time-domain to frequency-domain</li>
                <li>• Real and imaginary components</li>
                <li>• Magnitude and phase spectra</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Digital Filtering</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Frequency domain filtering</li>
                <li>• Low-pass, high-pass, band-pass</li>
                <li>• Cutoff frequency control</li>
                <li>• Inverse FFT reconstruction</li>
                <li>• Real-time parameter adjustment</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Signal Types:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Sine:</strong> Pure sinusoidal wave - single frequency component</li>
              <li><strong>Square:</strong> Contains odd harmonics - rich frequency content</li>
              <li><strong>Triangle:</strong> Contains odd harmonics with 1/n² amplitude decay</li>
              <li><strong>Sawtooth:</strong> Contains all harmonics with 1/n amplitude decay</li>
              <li><strong>Gaussian:</strong> Time-limited pulse with broad frequency spectrum</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalProcessing;

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ColorScience = () => {
  const [gamma, setGamma] = useState(2.2);

  // CIE 1931 Spectrum Locus data (approximated)
  const cieData = {
    wavelengths: Array.from({ length: 81 }, (_, i) => 380 + i * 5),
    x: [0.1741, 0.1661, 0.1587, 0.1520, 0.1458, 0.1404, 0.1355, 0.1312, 0.1274, 0.1241, 0.1212, 0.1187, 0.1165, 0.1146, 0.1130, 0.1116, 0.1104, 0.1094, 0.1085, 0.1077, 0.1070, 0.1064, 0.1059, 0.1055, 0.1051, 0.1048, 0.1045, 0.1043, 0.1041, 0.1040, 0.1039, 0.1038, 0.1038, 0.1038, 0.1039, 0.1040, 0.1041, 0.1043, 0.1045, 0.1047, 0.1050, 0.1053, 0.1057, 0.1061, 0.1066, 0.1072, 0.1078, 0.1085, 0.1093, 0.1101, 0.1110, 0.1120, 0.1130, 0.1141, 0.1152, 0.1164, 0.1176, 0.1189, 0.1202, 0.1216, 0.1230, 0.1245, 0.1260, 0.1276, 0.1292, 0.1309, 0.1326, 0.1344, 0.1362, 0.1381, 0.1400, 0.1420, 0.1440, 0.1461, 0.1482, 0.1504, 0.1526, 0.1549, 0.1572, 0.1596, 0.1620, 0.1645, 0.1670],
    y: [0.0050, 0.0079, 0.0139, 0.0230, 0.0369, 0.0568, 0.0842, 0.1204, 0.1683, 0.2310, 0.3093, 0.4033, 0.5121, 0.6245, 0.7347, 0.8339, 0.9153, 0.9735, 1.0000, 0.9950, 0.9526, 0.8704, 0.7576, 0.6310, 0.5030, 0.3810, 0.2650, 0.1750, 0.1070, 0.0610, 0.0320, 0.0170, 0.0082, 0.0041, 0.0021, 0.0011, 0.0006, 0.0003, 0.0002, 0.0001, 0.0001, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000]
  };

  // SMPTE 240M primaries and white point
  const smptePrimaries = {
    red: [0.630, 0.340],
    green: [0.310, 0.595],
    blue: [0.155, 0.070],
    white: [0.3127, 0.3290]
  };

  // Generate gamma LUT
  const generateGammaLUT = (gammaVal) => {
    const lut = [];
    for (let k = 0; k <= 255; k++) {
      const normalized = k / 255;
      const corrected = Math.pow(normalized, 1 / gammaVal);
      lut.push(Math.round(255 * corrected));
    }
    return lut;
  };

  // CMY spectral data
  const wavelengths = Array.from({ length: 301 }, (_, i) => 400 + i);
  const rgbData = wavelengths.map(w => ({
    R: Math.exp(-0.5 * Math.pow((w - 600) / 30, 2)),
    G: Math.exp(-0.5 * Math.pow((w - 550) / 30, 2)),
    B: Math.exp(-0.5 * Math.pow((w - 450) / 30, 2))
  }));
  const cmyData = rgbData.map(({ R, G, B }) => ({
    C: (G + B) / Math.max(G + B, 1),
    M: (R + B) / Math.max(R + B, 1),
    Y: (R + G) / Math.max(R + G, 1)
  }));

  const cieChartData = {
    datasets: [{
      label: 'CIE 1931 Spectrum Locus',
      data: cieData.x.map((x, i) => ({ x, y: cieData.y[i] })),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      showLine: true,
      pointRadius: 0
    }]
  };

  const gammaLUT = generateGammaLUT(gamma);
  const gammaChartData = {
    labels: Array.from({ length: 256 }, (_, i) => i),
    datasets: [{
      label: 'Gamma Corrected',
      data: gammaLUT,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    }, {
      label: 'Linear',
      data: Array.from({ length: 256 }, (_, i) => i),
      borderColor: 'rgb(54, 162, 235)',
      borderDash: [5, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    }]
  };

  const smpteChartData = {
    datasets: [
      {
        label: 'CIE 1931 Spectrum Locus',
        data: cieData.x.map((x, i) => ({ x, y: cieData.y[i] })),
        borderColor: 'rgb(200, 200, 200)',
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        showLine: true,
        pointRadius: 0
      },
      {
        label: 'SMPTE 240M Gamut',
        data: [
          smptePrimaries.red,
          smptePrimaries.green,
          smptePrimaries.blue,
          smptePrimaries.red
        ].map(([x, y]) => ({ x, y })),
        borderColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        showLine: true,
        pointRadius: 0
      }
    ]
  };

  const cmyChartData = {
    labels: wavelengths,
    datasets: [
      { label: 'R (RGB)', data: rgbData.map(d => d.R), borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.1)' },
      { label: 'G (RGB)', data: rgbData.map(d => d.G), borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.1)' },
      { label: 'B (RGB)', data: rgbData.map(d => d.B), borderColor: 'blue', backgroundColor: 'rgba(0, 0, 255, 0.1)' },
      { label: 'C (CMY)', data: cmyData.map(d => d.C), borderColor: 'cyan', backgroundColor: 'rgba(0, 255, 255, 0.1)' },
      { label: 'M (CMY)', data: cmyData.map(d => d.M), borderColor: 'magenta', backgroundColor: 'rgba(255, 0, 255, 0.1)' },
      { label: 'Y (CMY)', data: cmyData.map(d => d.Y), borderColor: 'yellow', backgroundColor: 'rgba(255, 255, 0, 0.1)' }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Color Science</h1>

        {/* CIE 1931 Spectrum Locus */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">CIE 1931 Spectrum Locus</h2>
          <Scatter
            data={cieChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: 'x' }, min: 0, max: 0.8 },
                y: { title: { display: true, text: 'y' }, min: 0, max: 0.9 }
              }
            }}
          />
        </div>

        {/* Gamma Correction LUT */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Gamma Correction Lookup Table</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gamma: {gamma}
            </label>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={gamma}
              onChange={(e) => setGamma(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <Line
            data={gammaChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: { x: { title: { display: true, text: 'Input' } }, y: { title: { display: true, text: 'Output' } } }
            }}
          />
        </div>

        {/* SMPTE Color Gamut */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">SMPTE 240M Gamut in CIE 1931</h2>
          <Scatter
            data={smpteChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                x: { title: { display: true, text: 'x' }, min: 0, max: 0.8 },
                y: { title: { display: true, text: 'y' }, min: 0, max: 0.9 }
              }
            }}
          />
        </div>

        {/* CMY vs RGB Spectral Sensitivity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">CMY vs RGB Spectral Sensitivity</h2>
          <Line
            data={cmyChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: { x: { title: { display: true, text: 'Wavelength (nm)' } }, y: { title: { display: true, text: 'Sensitivity' } } }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorScience;

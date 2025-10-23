import { useState, useRef, useEffect } from 'react';
import { TrendingUp, Play, RotateCcw, Download } from 'lucide-react';

const LinearRegression = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [model, setModel] = useState({ slope: 0, intercept: 0 });
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState(100);
  const [learningRate, setLearningRate] = useState(0.01);
  const [loss, setLoss] = useState(0);
  const canvasRef = useRef(null);

  // Generate sample data
  const generateData = () => {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 10;
      const y = 2 * x + 1 + (Math.random() - 0.5) * 4; // y = 2x + 1 + noise
      points.push({ x, y });
    }
    setDataPoints(points);
    setModel({ slope: 0, intercept: 0 });
    setLoss(0);
  };

  // Train the model using gradient descent
  const trainModel = async () => {
    if (dataPoints.length === 0) return;

    setIsTraining(true);
    let slope = model.slope;
    let intercept = model.intercept;
    const alpha = learningRate;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let slopeGradient = 0;
      let interceptGradient = 0;
      let totalLoss = 0;

      // Calculate gradients
      for (const point of dataPoints) {
        const prediction = slope * point.x + intercept;
        const error = prediction - point.y;
        slopeGradient += error * point.x;
        interceptGradient += error;
        totalLoss += error * error;
      }

      // Update parameters
      slope -= alpha * slopeGradient / dataPoints.length;
      intercept -= alpha * interceptGradient / dataPoints.length;

      // Update state
      setModel({ slope, intercept });
      setLoss(totalLoss / dataPoints.length);

      // Small delay for visualization
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsTraining(false);
  };

  // Draw the plot
  const drawPlot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up coordinate system
    const padding = 60;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('X', width - padding + 20, height - padding + 5);
    ctx.textAlign = 'left';
    ctx.fillText('Y', padding - 30, padding - 10);

    // Draw data points
    ctx.fillStyle = '#3B82F6';
    for (const point of dataPoints) {
      const x = padding + (point.x / 10) * plotWidth;
      const y = height - padding - (point.y / 15) * plotHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw regression line
    if (dataPoints.length > 0) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const x1 = padding;
      const y1 = height - padding - ((model.slope * 0 + model.intercept) / 15) * plotHeight;
      const x2 = width - padding;
      const y2 = height - padding - ((model.slope * 10 + model.intercept) / 15) * plotHeight;

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Vertical grid lines
    for (let i = 1; i < 10; i++) {
      const x = padding + (i / 10) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 1; i < 15; i++) {
      const y = height - padding - (i / 15) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  useEffect(() => {
    drawPlot();
  }, [dataPoints, model]);

  useEffect(() => {
    generateData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Linear Regression</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Training Parameters</h2>

              {/* Learning Rate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Rate: {learningRate}
                </label>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Epochs */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Epochs: {epochs}
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Model Parameters */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Model Parameters</h3>
                <p className="text-sm text-gray-600">Slope: {model.slope.toFixed(4)}</p>
                <p className="text-sm text-gray-600">Intercept: {model.intercept.toFixed(4)}</p>
                <p className="text-sm text-gray-600">Loss: {loss.toFixed(6)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={generateData}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <TrendingUp size={16} className="mr-2" />
                  Generate Data
                </button>
                <button
                  onClick={trainModel}
                  disabled={isTraining || dataPoints.length === 0}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Play size={16} className="mr-2" />
                  {isTraining ? 'Training...' : 'Train Model'}
                </button>
                <button
                  onClick={() => {
                    setModel({ slope: 0, intercept: 0 });
                    setLoss(0);
                  }}
                  className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={16} className="mr-2" />
                  Reset Model
                </button>
              </div>
            </div>
          </div>

          {/* Plot */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Regression Plot</h2>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="border border-gray-300 rounded"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Data Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-red-500"></div>
                  <span>Regression Line</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Algorithm Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Linear Regression</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Simple linear model: y = mx + b</li>
                <li>• Gradient descent optimization</li>
                <li>• Mean squared error loss function</li>
                <li>• Real-time parameter updates</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Training Process</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Iterative parameter adjustment</li>
                <li>• Learning rate controls step size</li>
                <li>• Epochs determine training duration</li>
                <li>• Loss decreases with better fit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearRegression;

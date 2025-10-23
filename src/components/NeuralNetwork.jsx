import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
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
import { Line as LineChart, Scatter as ScatterChart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NeuralNetwork = () => {
  const [model, setModel] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingData, setTrainingData] = useState([]);
  const [testData, setTestData] = useState([]);

  const [lossHistory, setLossHistory] = useState([]);
  const [epochs, setEpochs] = useState(100);
  const [learningRate, setLearningRate] = useState(0.01);

  // Generate synthetic data
  const generateData = () => {
    const x = [];
    const y = [];
    for (let i = 0; i < 1000; i++) {
      const x1 = (Math.random() - 0.5) * 10;
      const x2 = (Math.random() - 0.5) * 10;
      const x3 = (Math.random() - 0.5) * 10;
      const output = Math.sin(x1) * Math.cos(x2) + x3 * 0.1 + Math.random() * 0.1;
      x.push([x1, x2, x3]);
      y.push(output > 0 ? 1 : 0); // Binary classification
    }
    return { x, y };
  };

  // Create and train model
  const createModel = async () => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [3], units: 5, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 5, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  };

  const trainModel = async () => {
    if (!model) return;

    setIsTraining(true);
    const { x, y } = generateData();
    const xs = tf.tensor2d(x);
    const ys = tf.tensor1d(y);

    const history = [];
    await model.fit(xs, ys, {
      epochs: epochs,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          history.push(logs.loss);
          setLossHistory([...history]);
        }
      }
    });

    // Generate predictions
    const testX = [];
    const testY = [];
    for (let i = 0; i < 200; i++) {
      const x1 = (Math.random() - 0.5) * 10;
      const x2 = (Math.random() - 0.5) * 10;
      const x3 = (Math.random() - 0.5) * 10;
      const output = Math.sin(x1) * Math.cos(x2) + x3 * 0.1;
      testX.push([x1, x2, x3]);
      testY.push(output > 0 ? 1 : 0);
    }


    const predTensor = model.predict(tf.tensor2d(testX));
    await predTensor.data();

    setTrainingData(x.map((point, i) => ({ x: point[0], y: point[1], z: point[2], label: y[i] })));
    setTestData(testX.map((point, i) => ({ x: point[0], y: point[1], z: point[2], label: testY[i] })));


    setIsTraining(false);
  };

  useEffect(() => {
    const initModel = async () => {
      const newModel = await createModel();
      setModel(newModel);
    };
    initModel();
  }, [learningRate]);

  const lossChartData = {
    labels: lossHistory.map((_, i) => i + 1),
    datasets: [{
      label: 'Training Loss',
      data: lossHistory,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const scatterData = {
    datasets: [
      {
        label: 'Training Data',
        data: trainingData.slice(0, 100).map(d => ({ x: d.x, y: d.y })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Test Data',
        data: testData.slice(0, 100).map(d => ({ x: d.x, y: d.y })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Neural Network Playground</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Training Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Epochs: {epochs}
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <button
                onClick={trainModel}
                disabled={isTraining}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isTraining ? 'Training...' : 'Train Model'}
              </button>
            </div>
          </div>

          {/* Loss Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Training Loss</h2>
            {lossHistory.length > 0 ? (
              <LineChart data={lossChartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Train the model to see loss history
              </div>
            )}
          </div>

          {/* Data Visualization */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
            {trainingData.length > 0 ? (
              <ScatterChart data={scatterData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Train the model to visualize data
              </div>
            )}
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Model Architecture</h2>
          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <p className="text-sm text-gray-600">Input</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-semibold">5</span>
              </div>
              <p className="text-sm text-gray-600">Hidden 1</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-yellow-600 font-semibold">5</span>
              </div>
              <p className="text-sm text-gray-600">Hidden 2</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-red-600 font-semibold">1</span>
              </div>
              <p className="text-sm text-gray-600">Output</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralNetwork;

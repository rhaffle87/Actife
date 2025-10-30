import { useState } from 'react';
import { Brain, TrendingUp, Zap, Eye, Hand, Palette, BarChart3, Code } from 'lucide-react';

const MachineLearning = () => {
  const [activeTopic, setActiveTopic] = useState('overview');

  const topics = [
    {
      id: 'overview',
      title: 'Machine Learning Overview',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">What is Machine Learning?</h3>
            <p className="text-blue-800">
              Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions
              from data without being explicitly programmed. It involves algorithms that can identify patterns and make
              predictions on new data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-semibold mb-2">Supervised Learning</h4>
              <p className="text-gray-600 text-sm">
                Learning from labeled data to make predictions. Includes regression and classification.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Zap className="w-8 h-8 text-yellow-600 mb-3" />
              <h4 className="font-semibold mb-2">Unsupervised Learning</h4>
              <p className="text-gray-600 text-sm">
                Finding patterns in unlabeled data through clustering and dimensionality reduction.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Eye className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-semibold mb-2">Computer Vision</h4>
              <p className="text-gray-600 text-sm">
                Enabling computers to interpret and understand visual information from the world.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'linear-regression',
      title: 'Linear Regression',
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">Linear Regression Fundamentals</h3>
            <p className="text-green-800">
              Linear regression is a supervised learning algorithm used to predict a continuous target variable
              based on one or more predictor variables. It assumes a linear relationship between the input and output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Simple Linear Regression</h4>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                y = β₀ + β₁x + ε
              </div>
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                <li>• β₀: Intercept (y when x=0)</li>
                <li>• β₁: Slope (change in y per unit x)</li>
                <li>• ε: Error term</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Multiple Linear Regression</h4>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Extends simple regression to multiple predictors, allowing for more complex relationships.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">Implementation Examples</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• 2D Linear Regression: Height vs Weight prediction</li>
              <li>• 3D Linear Regression: Height, Body Circumference vs Weight</li>
              <li>• 4D Linear Regression: Multiple features including BMI</li>
              <li>• Logistic Regression: Binary classification with sigmoid activation</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'neural-networks',
      title: 'Neural Networks',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Neural Network Architecture</h3>
            <p className="text-purple-800">
              Neural networks are computing systems inspired by biological neural networks. They consist of
              interconnected nodes (neurons) organized in layers that can learn complex patterns from data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Network Components</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>Input Layer:</strong> Receives raw data</li>
                <li><strong>Hidden Layers:</strong> Process and transform data</li>
                <li><strong>Output Layer:</strong> Produces final predictions</li>
                <li><strong>Weights & Biases:</strong> Learnable parameters</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Activation Functions</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>ReLU:</strong> max(0, x) - handles vanishing gradients</li>
                <li><strong>Sigmoid:</strong> 1/(1+e⁻ˣ) - for binary classification</li>
                <li><strong>Tanh:</strong> (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ) - zero-centered</li>
                <li><strong>Softmax:</strong> multi-class probability distribution</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Training Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded">
                <strong>Forward Pass:</strong> Compute predictions
              </div>
              <div className="bg-white p-3 rounded">
                <strong>Loss Calculation:</strong> Measure error (MSE, Cross-entropy)
              </div>
              <div className="bg-white p-3 rounded">
                <strong>Backpropagation:</strong> Update weights via gradients
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'knn',
      title: 'K-Nearest Neighbors',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">KNN Algorithm</h3>
            <p className="text-orange-800">
              K-Nearest Neighbors is a simple, non-parametric classification and regression algorithm.
              It classifies new data points based on the majority vote of their k nearest neighbors in the feature space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">How KNN Works</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Choose k (number of neighbors)</li>
                <li>2. Calculate distance to all training points</li>
                <li>3. Find k nearest neighbors</li>
                <li>4. Majority vote for classification</li>
                <li>5. Average for regression</li>
              </ol>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Distance Metrics</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>Euclidean:</strong> √(Σ(xi-yi)²)</li>
                <li><strong>Manhattan:</strong> Σ|xi-yi|</li>
                <li><strong>Minkowski:</strong> (Σ|xi-yi|^p)^(1/p)</li>
                <li><strong>Hamming:</strong> For categorical data</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Choosing K</h4>
            <p className="text-red-800 text-sm">
              The choice of k affects model performance:
            </p>
            <ul className="text-red-800 text-sm mt-2 space-y-1">
              <li>• Small k: Low bias, high variance (overfitting)</li>
              <li>• Large k: High bias, low variance (underfitting)</li>
              <li>• Optimal k: Balances bias-variance tradeoff</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'computer-vision',
      title: 'Computer Vision',
      icon: Eye,
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Computer Vision with MediaPipe</h3>
            <p className="text-indigo-800">
              MediaPipe provides cross-platform, customizable ML solutions for live and streaming media.
              It offers ready-to-use ML pipelines for computer vision tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Object Detection</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• EfficientDet model for real-time detection</li>
                <li>• Bounding box prediction</li>
                <li>• Category classification</li>
                <li>• Confidence scoring</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Hand Tracking</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 21 landmark points per hand</li>
                <li>• Gesture recognition</li>
                <li>• Real-time tracking</li>
                <li>• Multi-hand support</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Gesture Control Applications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded text-sm">
                <strong>Volume Control:</strong> Thumb-index finger distance
              </div>
              <div className="bg-white p-3 rounded text-sm">
                <strong>Brightness Control:</strong> Index-middle finger distance
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'signal-processing',
      title: 'Signal Processing',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="bg-teal-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-teal-900 mb-4">Digital Signal Processing</h3>
            <p className="text-teal-800">
              Digital Signal Processing involves the analysis and manipulation of signals using mathematical methods.
              Key techniques include transforms and quantization for compression and analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Discrete Cosine Transform (DCT)</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Converts spatial domain to frequency domain</li>
                <li>• Energy compaction property</li>
                <li>• Basis for JPEG compression</li>
                <li>• 2D DCT for image processing</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Quantization</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Lloyd-Max algorithm for optimal quantization</li>
                <li>• Minimizes mean squared error</li>
                <li>• Used in lossy compression</li>
                <li>• Trade-off between quality and compression</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Applications</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Image compression (JPEG, MPEG)</li>
              <li>• Audio compression (MP3, AAC)</li>
              <li>• Video processing and analysis</li>
              <li>• Communications systems</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'color-science',
      title: 'Color Science',
      icon: Palette,
      content: (
        <div className="space-y-6">
          <div className="bg-pink-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-pink-900 mb-4">Color Perception & Measurement</h3>
            <p className="text-pink-800">
              Color science studies how humans perceive color and how to measure and reproduce colors accurately.
              The CIE color system provides standardized methods for color specification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">CIE Color System</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• CIE 1931 color matching functions</li>
                <li>• Chromaticity coordinates (x,y)</li>
                <li>• Spectrum locus for visible colors</li>
                <li>• Color temperature and white point</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Color Spaces</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>RGB:</strong> Additive color model</li>
                <li><strong>CMY/CMYK:</strong> Subtractive color model</li>
                <li><strong>HSV/HSL:</strong> Hue, Saturation, Value/Lightness</li>
                <li><strong>Lab:</strong> Perceptually uniform color space</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Applications in ML</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Color-based object recognition</li>
              <li>• Image segmentation and classification</li>
              <li>• Color correction and enhancement</li>
              <li>• Medical imaging analysis</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const activeTopicData = topics.find(topic => topic.id === activeTopic);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Machine Learning</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Topics</h2>
              <div className="space-y-2">
                {topics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setActiveTopic(topic.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTopic === topic.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{topic.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                {activeTopicData && <activeTopicData.icon className="w-6 h-6 text-blue-600" />}
                <h2 className="text-2xl font-semibold text-gray-900">{activeTopicData?.title}</h2>
              </div>

              {activeTopicData?.content}
            </div>
          </div>
        </div>

        {/* Code Examples Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Python Implementation Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Code className="w-5 h-5 text-gray-600 mb-2" />
              <h4 className="font-medium mb-2">Linear Regression</h4>
              <p className="text-sm text-gray-600">sklearn.linear_model.LinearRegression</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Code className="w-5 h-5 text-gray-600 mb-2" />
              <h4 className="font-medium mb-2">Neural Networks</h4>
              <p className="text-sm text-gray-600">torch.nn, torch.optim</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Code className="w-5 h-5 text-gray-600 mb-2" />
              <h4 className="font-medium mb-2">KNN Classifier</h4>
              <p className="text-sm text-gray-600">sklearn.neighbors.KNeighborsClassifier</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Code className="w-5 h-5 text-gray-600 mb-2" />
              <h4 className="font-medium mb-2">MediaPipe</h4>
              <p className="text-sm text-gray-600">mediapipe.solutions</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Code className="w-5 h-5 text-gray-600 mb-2" />
              <h4 className="font-medium mb-2">Signal Processing</h4>
              <p className="text-sm text-gray-600">numpy, scipy</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Code className="w-5 h-5 text-gray-600 mb-2" />
              <h4 className="font-medium mb-2">Color Science</h4>
              <p className="text-sm text-gray-600">matplotlib, numpy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineLearning;

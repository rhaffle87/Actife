import { Brain, Image, Palette, BarChart3, Zap, Code, Github, BookOpen } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'Neural Networks',
      description: 'Interactive neural network training and visualization',
      color: 'text-blue-500'
    },
    {
      icon: Image,
      title: 'Image Processing',
      description: 'DCT transforms, JPEG compression, and image analysis',
      color: 'text-green-500'
    },
    {
      icon: Palette,
      title: 'Color Science',
      description: 'Color spaces, SMPTE standards, and color transformations',
      color: 'text-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Signal Processing',
      description: 'Fourier transforms, DCT/IDCT, and signal analysis',
      color: 'text-orange-500'
    },
    {
      icon: Zap,
      title: 'Machine Learning',
      description: 'Linear regression, classification, and model training',
      color: 'text-red-500'
    },
    {
      icon: Code,
      title: 'MediaPipe',
      description: 'Computer vision applications and gesture recognition',
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI/ML Interactive Toolkit
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Explore machine learning algorithms, image processing techniques, and computer vision applications
              through interactive web interfaces
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View on GitHub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Features</h2>
          <p className="text-lg text-gray-600">
            Interactive implementations of various AI/ML algorithms and techniques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">About This Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 mb-6">
                  This interactive web application brings together various AI/ML algorithms and computer vision
                  techniques from a comprehensive repository. Each section provides hands-on experience with
                  real implementations that you can interact with directly in your browser.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Whether you're learning about neural networks, exploring image compression algorithms,
                  or experimenting with computer vision applications, this toolkit offers an accessible
                  way to understand and interact with these technologies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="#neural-network"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen size={20} className="mr-2" />
                    Start Learning
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Github size={20} className="mr-2" />
                    View Source
                  </a>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technologies Used</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">TensorFlow.js for neural networks</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Canvas API for image processing</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Math.js for mathematical computations</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Chart.js for data visualization</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">React for interactive UI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

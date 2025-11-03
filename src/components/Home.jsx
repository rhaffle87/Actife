import { Brain, Image, Palette, BarChart3, Zap, Code, Github, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import Aurora from './Aurora';

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
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <div className="relative h-screen items-center flex overflow-hidden">
        <div className=" absolute inset-0 z-0">
          <Aurora
            colorStops={["#007AFF", "#0D0D0D", "#8B5CF6"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
        <div className="absolute inset-0 text-white bg-opacity-100 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              {/* Logo */}
              <div className="mb-8">
                <img
                  src={logo}
                  alt="ACTIFE Logo"
                  className="h-24 md:h-32 mx-auto mb-4 transition-all duration-500 hover:scale-110 hover:brightness-110"
                />
              </div>

              {/* Main Title */}
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Artificial Computing Toolkit for Intelligent Feature Experiments
              </h1>
              <br></br>

              <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-4xl mx-auto">
                Explore machine learning algorithms, image processing techniques, and computer vision applications
                through interactive web interfaces powered by cutting-edge AI technologies
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/tutorials"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Get Started
                </Link>
                <a href="https://github.com/rhaffle87/ai_ml" target="_blank" rel="noopener noreferrer" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                  <Github size={20} />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-50 mb-4">Explore Our Features</h2>
            <p className="text-lg text-blue-50 max-w-2xl mx-auto">
              Interactive implementations of various AI/ML algorithms and techniques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-zinc-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 ${feature.color}`}>
                    <Icon size={24} />
                  </div>
                    <h3 h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      

      {/* About Section */}
      <div className="bg-zinc-900 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-50 mb-8">About This Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-white mb-6">
                  This interactive web application brings together various AI/ML algorithms and computer vision
                  techniques from a comprehensive repository. Each section provides hands-on experience with
                  real implementations that you can interact with directly in your browser.
                </p>
                <p className="text-lg text-white mb-6">
                  Whether you're learning about neural networks, exploring image compression algorithms, or experimenting with computer vision applications, this toolkit offers an accessible
                  way to understand and interact with these technologies.
                </p>
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
                    <span className="text-gray-700">Math.js for math computations</span>
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

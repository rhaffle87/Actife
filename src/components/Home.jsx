import { Brain, Image, Palette, BarChart3, Zap, Code, Github, BookOpen, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import Aurora from './Aurora';
import CardSwap, { Card } from './CardSwap';

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

              <p className="text-lg md:text-xl mb-8 text-white max-w-4xl mx-auto">
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
      <div className="bg-zinc-900 relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Explore Our Features</h2>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Interactive implementations of various AI/ML algorithms and techniques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-zinc-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white mb-4 ${feature.color}`}>
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
      <div className="bg-zinc-900 py-35 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
          
          {/* Description Section (Left for desktop / Top for mobile) */}
          <div className="order-1 lg:order-0 w-full lg:w-1/2 text-center lg:text-left space-y-6 mt-12 lg:mt-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              About This Project
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              This interactive web application brings together various AI/ML algorithms and computer vision techniques from a comprehensive repository. Each section provides hands-on experience with real implementations that you can interact with directly in your browser.
            </p>
          </div>

          {/* Card Stack Section (Right for desktop / Bottom for mobile) */}
          <div className="order-2 lg:order-0 w-full lg:w-1/2 flex justify-center items-center">
            <div className="w-full sm:w-[380px] md:w-[420px] lg:w-[480px]">
              <CardSwap
                width={540}
                height={400}
                cardDistance={50}
                verticalDistance={50}
                delay={5000}
                pauseOnHover={true}
                skewAmount={5}
                easing="elastic"
              >
                {/* Individual Tech Cards with Lucide Icons */}
                <Card customClass="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">TensorFlow.js</h3>
                  <p className="text-sm text-zinc-400 text-center">
                    For neural networks and AI models
                  </p>
                </Card>

                <Card customClass="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Image className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Canvas API</h3>
                  <p className="text-sm text-zinc-400 text-center">
                    For image and signal processing
                  </p>
                </Card>

                <Card customClass="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                    <Calculator className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Math.js</h3>
                  <p className="text-sm text-zinc-400 text-center">
                    For advanced math computations
                  </p>
                </Card>

                <Card customClass="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-12 h-12 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Chart.js</h3>
                  <p className="text-sm text-zinc-400 text-center">
                    For data visualization and plots
                  </p>
                </Card>

                <Card customClass="bg-zinc-800 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <Code className="w-12 h-12 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">React</h3>
                  <p className="text-sm text-zinc-400 text-center">
                    For interactive user interfaces
                  </p>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

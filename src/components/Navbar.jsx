import { useState } from 'react';
import { Menu, X, Home, ChevronDown, User } from 'lucide-react';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const features = [
    { id: 'neural-network', label: 'Neural Networks' },
    { id: 'image-processing', label: 'Image Processing' },
    { id: 'linear-regression', label: 'Linear Regression' },
    { id: 'color-science', label: 'Color Science' },
    { id: 'signal-processing', label: 'Signal Processing' },
    { id: 'loran-c', label: 'LORAN-C Simulator' },
    { id: 'machine-learning', label: 'Machine Learning' },
    { id: 'mediapipe', label: 'MediaPipe' },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">AI/ML Toolkit</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Home size={16} />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveSection('tutorials')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'tutorials'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span>Tutorials</span>
            </button>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsFeaturesOpen(true)}
              onMouseLeave={() => setIsFeaturesOpen(false)}
            >
              <button
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  features.some(f => f.id === activeSection)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>Features</span>
                <ChevronDown size={16} className={`transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFeaturesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-gray-800 rounded-md shadow-lg z-50">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => {
                        setActiveSection(feature.id);
                        setIsFeaturesOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                        activeSection === feature.id ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      {feature.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveSection('credits')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'credits'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <User size={16} />
              <span>Credits</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => {
                  setActiveSection('home');
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeSection === 'home'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('tutorials');
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeSection === 'tutorials'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>Tutorials</span>
              </button>

              {/* Mobile Features Section */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-medium text-gray-400">Features</div>
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveSection(feature.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full text-left px-6 py-2 rounded-md text-base font-medium transition-colors ${
                      activeSection === feature.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span>{feature.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setActiveSection('credits');
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeSection === 'credits'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <User size={16} />
                <span>Credits</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

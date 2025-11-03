import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Home, ChevronDown, User } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFeaturesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink
              to="/"
              className="flex items-center transition-all duration-300 transform hover:scale-105 active:scale-95"
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
            >
              <img
                src={logo}
                alt="AI/ML Toolkit Logo"
                className={`h-10 w-auto transition-all duration-300 ${
                  isLogoHovered ? 'brightness-110 drop-shadow-lg' : 'brightness-100'
                }`}
              />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                }`
              }
            >
              <Home size={16} className="transition-transform duration-300 group-hover:scale-110" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/tutorials"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                }`
              }
            >
              <span>Tutorials</span>
            </NavLink>

            {/* Features Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  features.some(f => f.id === activeSection)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                }`}
              >
                <span>Features</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isFeaturesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFeaturesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
                  <div className="py-2">
                    {features.map((feature, index) => (
                      <NavLink
                        key={feature.id}
                        to={`/${feature.id}`}
                        onClick={() => setIsFeaturesOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 text-sm hover:bg-gray-700 transition-colors duration-150 ${
                            isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                          } ${index !== features.length - 1 ? 'border-b border-gray-700' : ''}`
                        }
                      >
                        {feature.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/credits"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                }`
              }
            >
              <User size={16} className="transition-transform duration-300 group-hover:scale-110" />
              <span>Credits</span>
            </NavLink>
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
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <Home size={16} />
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/tutorials"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span>Tutorials</span>
              </NavLink>

              {/* Mobile Features Section */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-medium text-gray-400">Features</div>
                {features.map((feature) => (
                  <NavLink
                    key={feature.id}
                    to={`/${feature.id}`}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 w-full text-left px-6 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <span>{feature.label}</span>
                  </NavLink>
                ))}
              </div>

              <NavLink
                to="/credits"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <User size={16} />
                <span>Credits</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

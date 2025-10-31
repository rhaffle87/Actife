import { BookOpen, Play, FileText, Video, Code, CheckCircle, ArrowRight } from 'lucide-react';

const Tutorials = ({ setActiveSection }) => {
  const tutorials = [
    {
      id: 'neural-network',
      title: 'Neural Networks',
      description: 'Learn the fundamentals of neural networks, backpropagation, and activation functions',
      icon: Code,
      difficulty: 'Beginner',
      duration: '15 min',
      topics: ['Feedforward Networks', 'Backpropagation', 'Activation Functions', 'Gradient Descent'],
      steps: [
        'Understand basic neuron structure',
        'Learn forward propagation',
        'Implement backpropagation algorithm',
        'Experiment with different activation functions'
      ]
    },
    {
      id: 'image-processing',
      title: 'Image Processing',
      description: 'Explore DCT transforms, JPEG compression, and image analysis techniques',
      icon: FileText,
      difficulty: 'Intermediate',
      duration: '20 min',
      topics: ['DCT Transform', 'JPEG Compression', 'Image Filtering', 'Color Spaces'],
      steps: [
        'Load and display images',
        'Apply DCT transformation',
        'Implement JPEG compression',
        'Experiment with different filters'
      ]
    },
    {
      id: 'linear-regression',
      title: 'Linear Regression',
      description: 'Master linear regression, gradient descent, and model evaluation',
      icon: Play,
      difficulty: 'Beginner',
      duration: '10 min',
      topics: ['Simple Linear Regression', 'Multiple Regression', 'Gradient Descent', 'R² Score'],
      steps: [
        'Generate sample data',
        'Implement linear regression',
        'Train the model',
        'Evaluate performance'
      ]
    },
    {
      id: 'color-science',
      title: 'Color Science',
      description: 'Understand color spaces, SMPTE standards, and color transformations',
      icon: Video,
      difficulty: 'Advanced',
      duration: '25 min',
      topics: ['RGB Color Space', 'SMPTE Standards', 'Color Temperature', 'Gamma Correction'],
      steps: [
        'Explore RGB color model',
        'Learn SMPTE color standards',
        'Implement color space conversions',
        'Apply gamma correction'
      ]
    },
    {
      id: 'signal-processing',
      title: 'Signal Processing',
      description: 'Dive into Fourier transforms, DCT/IDCT, and signal analysis',
      icon: CheckCircle,
      difficulty: 'Intermediate',
      duration: '18 min',
      topics: ['Fourier Transform', 'DCT/IDCT', 'Signal Filtering', 'Frequency Analysis'],
      steps: [
        'Generate different signal types',
        'Apply Fourier transform',
        'Implement DCT/IDCT',
        'Analyze frequency components'
      ]
    },
    {
      id: 'loran-c',
      title: 'LORAN-C Simulator',
      description: 'Learn about LORAN-C navigation system and TDOA positioning',
      icon: ArrowRight,
      difficulty: 'Advanced',
      duration: '30 min',
      topics: ['LORAN-C Principles', 'TDOA Positioning', 'Hyperbola Generation', 'Map Visualization'],
      steps: [
        'Understand LORAN-C basics',
        'Set up master and slave stations',
        'Compute TDOA measurements',
        'Visualize position lines of position'
      ]
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      description: 'Explore various ML algorithms and model training techniques',
      icon: BookOpen,
      difficulty: 'Intermediate',
      duration: '22 min',
      topics: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation', 'Cross-Validation'],
      steps: [
        'Choose appropriate algorithm',
        'Prepare and preprocess data',
        'Train and validate model',
        'Evaluate performance metrics'
      ]
    },
    {
      id: 'mediapipe',
      title: 'MediaPipe',
      description: 'Computer vision applications and gesture recognition',
      icon: Code,
      difficulty: 'Intermediate',
      duration: '20 min',
      topics: ['Face Detection', 'Hand Tracking', 'Pose Estimation', 'Gesture Recognition'],
      steps: [
        'Set up MediaPipe models',
        'Implement face detection',
        'Add hand tracking',
        'Create gesture recognition'
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive Tutorials</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive guides and hands-on tutorials for all AI/ML features.
              Learn by doing with step-by-step instructions and interactive examples.
            </p>
          </div>
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorials.map((tutorial) => {
            const Icon = tutorial.icon;
            return (
              <div key={tutorial.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getDifficultyColor(tutorial.difficulty)}`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{tutorial.duration}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                  <p className="text-gray-600 mb-4">{tutorial.description}</p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tutorial.topics.map((topic, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Learning Steps:</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {tutorial.steps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex w-4 h-4 bg-blue-500 text-white text-xs rounded-full items-center justify-center mr-2 mt-0.5 shrink-0">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={() => setActiveSection(tutorial.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    Start Learning
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Quick Start Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Feature</h3>
                <p className="text-gray-600">
                  Select any feature from the navigation menu above to explore interactive demos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow Tutorials</h3>
                <p className="text-gray-600">
                  Use the step-by-step tutorials to understand how each feature works.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiment</h3>
                <p className="text-gray-600">
                  Modify parameters and see real-time results of your changes.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn & Apply</h3>
                <p className="text-gray-600">
                  Apply what you've learned to build your own AI/ML projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorials;

import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import NeuralNetwork from './components/NeuralNetwork'
import ImageProcessing from './components/ImageProcessing'
import LinearRegression from './components/LinearRegression'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home />
      case 'neural-network':
        return <NeuralNetwork />
      case 'image-processing':
        return <ImageProcessing />
      case 'color-science':
        return <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold text-gray-900">Color Science</h1><p className="mt-4 text-gray-600">Coming soon...</p></div></div>
      case 'signal-processing':
        return <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold text-gray-900">Signal Processing</h1><p className="mt-4 text-gray-600">Coming soon...</p></div></div>
      case 'linear-regression':
        return <LinearRegression />
      case 'machine-learning':
        return <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold text-gray-900">Machine Learning</h1><p className="mt-4 text-gray-600">Coming soon...</p></div></div>
      case 'mediapipe':
        return <div className="min-h-screen bg-gray-50 p-6"><div className="max-w-7xl mx-auto"><h1 className="text-3xl font-bold text-gray-900">MediaPipe</h1><p className="mt-4 text-gray-600">Coming soon...</p></div></div>
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      {renderContent()}
    </div>
  )
}

export default App

import React, { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Tutorials from './components/Tutorials'
import Credits from './components/Credits'

const NeuralNetwork = lazy(() => import('./components/NeuralNetwork'))
const ImageProcessing = lazy(() => import('./components/ImageProcessing'))
const SignalProcessing = lazy(() => import('./components/SignalProcessing'))
const LinearRegression = lazy(() => import('./components/LinearRegression'))
const ColorScience = lazy(() => import('./components/ColorScience'))
const Loranc = lazy(() => import('./components/Loranc'))
const MachineLearning = lazy(() => import('./components/MachineLearning'))
const MediaPipe = lazy(() => import('./components/MediaPipe'))

function App() {
  const location = useLocation()

  // Map pathname to activeSection for Navbar
  const getActiveSection = (pathname) => {
    switch (pathname) {
      case '/':
        return 'home'
      case '/tutorials':
        return 'tutorials'
      case '/neural-network':
        return 'neural-network'
      case '/image-processing':
        return 'image-processing'
      case '/color-science':
        return 'color-science'
      case '/signal-processing':
        return 'signal-processing'
      case '/loran-c':
        return 'loran-c'
      case '/linear-regression':
        return 'linear-regression'
      case '/machine-learning':
        return 'machine-learning'
      case '/mediapipe':
        return 'mediapipe'
      case '/credits':
        return 'credits'
      default:
        return 'home'
    }
  }

  const activeSection = getActiveSection(location.pathname)

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navbar activeSection={activeSection} />
      <Suspense fallback={<div className="p-8 text-center text-gray-600">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/neural-network" element={<NeuralNetwork />} />
          <Route path="/image-processing" element={<ImageProcessing />} />
          <Route path="/color-science" element={<ColorScience />} />
          <Route path="/signal-processing" element={<SignalProcessing />} />
          <Route path="/loran-c" element={<Loranc />} />
          <Route path="/linear-regression" element={<LinearRegression />} />
          <Route path="/machine-learning" element={<MachineLearning />} />
          <Route path="/mediapipe" element={<MediaPipe />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App

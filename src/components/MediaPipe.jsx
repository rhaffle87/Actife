import React, { useState, useRef, useEffect } from 'react';
import { Hand, Eye, Zap, Camera, Volume2, Sun, Code, Play, Square, RotateCcw } from 'lucide-react';

const MediaPipe = () => {
  const [activeTopic, setActiveTopic] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Ready');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // MediaPipe will be loaded dynamically
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);

  useEffect(() => {
    // Load MediaPipe from CDN
    const loadMediaPipe = async () => {
      try {
        // Load MediaPipe Hands
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js';
        script.onload = () => {
          setMediaPipeLoaded(true);
          setStatus('MediaPipe loaded successfully');
        };
        script.onerror = () => {
          setStatus('Failed to load MediaPipe');
        };
        document.head.appendChild(script);
      } catch {
        setStatus('Error loading MediaPipe');
      }
    };

    loadMediaPipe();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setStatus('Camera started');
      return true;
    } catch {
      setStatus('Camera access denied');
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRunning(false);
    setStatus('Camera stopped');
  };

  const startHandTracking = async () => {
    if (!mediaPipeLoaded) {
      setStatus('MediaPipe not loaded yet');
      return;
    }

    const cameraStarted = await startCamera();
    if (!cameraStarted) return;

    try {
      // Initialize MediaPipe Hands
      const hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => {
        drawHandLandmarks(results);
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const processFrame = async () => {
        if (!isRunning) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        await hands.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };

      setIsRunning(true);
      setStatus('Hand tracking started');
      processFrame();

    } catch {
      setStatus('Error starting hand tracking');
    }
  };

  const startObjectDetection = async () => {
    const cameraStarted = await startCamera();
    if (!cameraStarted) return;

    try {
      // For now, just show camera feed with placeholder text
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const processFrame = () => {
        if (!isRunning) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Draw placeholder text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 60);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Object Detection Demo', 20, 30);
        ctx.fillText('MediaPipe Object Detection', 20, 50);
        ctx.fillText('coming soon...', 20, 70);

        requestAnimationFrame(processFrame);
      };

      setIsRunning(true);
      setStatus('Object detection started');
      processFrame();

    } catch {
      setStatus('Error starting object detection');
    }
  };

  const drawHandLandmarks = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas and draw video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand connections
        drawHandConnections(ctx, landmarks);

        // Draw landmarks
        for (let i = 0; i < landmarks.length; i++) {
          const landmark = landmarks[i];
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = i === 0 ? 'red' : 'blue'; // Wrist is red, others blue
          ctx.fill();

          // Label important landmarks
          if (i === 0) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Wrist', x + 8, y - 8);
          } else if (i === 4) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Thumb', x + 8, y - 8);
          } else if (i === 8) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Index', x + 8, y - 8);
          }
        }
      }

      // Display hand count
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 150, 30);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText(`${results.multiHandLandmarks.length} hand(s) detected`, 20, 30);
    }
  };

  const drawHandConnections = (ctx, landmarks) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // index
      [0, 9], [9, 10], [10, 11], [11, 12], // middle
      [0, 13], [13, 14], [14, 15], [15, 16], // ring
      [0, 17], [17, 18], [18, 19], [19, 20], // pinky
      [5, 9], [9, 13], [13, 17] // palm
    ];

    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;

    for (const [start, end] of connections) {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvasRef.current.width, startPoint.y * canvasRef.current.height);
      ctx.lineTo(endPoint.x * canvasRef.current.width, endPoint.y * canvasRef.current.height);
      ctx.stroke();
    }
  };

  const topics = [
    {
      id: 'overview',
      title: 'MediaPipe Overview',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">What is MediaPipe?</h3>
            <p className="text-blue-800">
              MediaPipe is Google's open-source framework for building multimodal applied ML pipelines.
              It provides customizable ML solutions for live and streaming media, enabling developers to
              create cross-platform applications with real-time perception capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Hand className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-semibold mb-2">Hand Tracking</h4>
              <p className="text-gray-600 text-sm">
                Real-time hand and finger tracking with 21 landmark points for gesture recognition.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Eye className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-semibold mb-2">Object Detection</h4>
              <p className="text-gray-600 text-sm">
                Efficient object detection using EfficientDet models with bounding boxes and labels.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Camera className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-semibold mb-2">Face Detection</h4>
              <p className="text-gray-600 text-sm">
                Face detection and landmark estimation for facial analysis and recognition.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'web-demo',
      title: 'Web Camera Demo',
      icon: Camera,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">Interactive MediaPipe Demo</h3>
            <p className="text-green-800">
              Experience MediaPipe's computer vision capabilities directly in your browser.
              Try hand tracking and object detection with real-time camera access.
            </p>
          </div>

          {/* Demo Controls */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-semibold mb-4">Demo Controls</h4>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={startHandTracking}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Play size={16} />
                <span>Start Hand Tracking</span>
              </button>

              <button
                onClick={startObjectDetection}
                disabled={isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Eye size={16} />
                <span>Start Object Detection</span>
              </button>

              <button
                onClick={stopCamera}
                disabled={!isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Square size={16} />
                <span>Stop</span>
              </button>

              <button
                onClick={() => {
                  stopCamera();
                  setStatus('Ready');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Status:</div>
              <div className="text-sm text-gray-600">{status}</div>
            </div>
          </div>

          {/* Video/Canvas Area */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                style={{ display: 'none' }}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg border border-gray-300"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-4">How to Use</h4>
            <div className="space-y-2 text-blue-800">
              <p>1. Click "Start Hand Tracking" or "Start Object Detection" to begin</p>
              <p>2. Allow camera access when prompted</p>
              <p>3. Position yourself in front of the camera</p>
              <p>4. Watch the real-time processing on the canvas</p>
              <p>5. Click "Stop" to end the demo</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'hand-tracking',
      title: 'Hand Tracking',
      icon: Hand,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">Hand Landmark Detection</h3>
            <p className="text-green-800">
              MediaPipe Hands provides accurate hand and finger tracking with 21 3D landmarks per hand.
              It can track multiple hands simultaneously and provides real-time performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Hand Landmarks</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  <div>• Wrist (0)</div>
                  <div>• Thumb CMC (1)</div>
                  <div>• Thumb MCP (2)</div>
                  <div>• Thumb IP (3)</div>
                  <div>• Thumb Tip (4)</div>
                  <div>• Index MCP (5)</div>
                  <div>• Index PIP (6)</div>
                  <div>• Index DIP (7)</div>
                  <div>• Index Tip (8)</div>
                  <div>• Middle MCP (9)</div>
                  <div>• Middle PIP (10)</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 21 hand landmarks with 3D coordinates</li>
                <li>• Multi-hand tracking support</li>
                <li>• Real-time performance (30+ FPS)</li>
                <li>• Handedness classification</li>
                <li>• Gesture recognition capabilities</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Gesture Control Applications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded text-sm">
                <strong>Volume Control:</strong> Distance between thumb and index finger
              </div>
              <div className="bg-white p-3 rounded text-sm">
                <strong>Brightness Control:</strong> Distance between index and middle finger
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'object-detection',
      title: 'Object Detection',
      icon: Eye,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">EfficientDet Object Detection</h3>
            <p className="text-purple-800">
              MediaPipe Object Detection uses EfficientDet models to detect and classify objects in images
              and video streams. It provides bounding boxes, category labels, and confidence scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Model Options</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>EfficientDet-Lite0:</strong> Fast, lightweight model</li>
                <li><strong>EfficientDet-Lite1:</strong> Balanced performance</li>
                <li><strong>EfficientDet-Lite2:</strong> Higher accuracy</li>
                <li>• Lite models optimized for mobile/edge</li>
                <li>• TensorFlow Lite format</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Detection Output</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Bounding box coordinates</li>
                <li>• Object category/class</li>
                <li>• Confidence score</li>
                <li>• Multiple object detection</li>
                <li>• Real-time processing</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Use Cases</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Smart camera applications</li>
              <li>• Inventory management</li>
              <li>• Security and surveillance</li>
              <li>• Augmented reality</li>
              <li>• Quality control systems</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'gesture-control',
      title: 'Gesture Control System',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-orange-900 mb-4">Real-time Gesture Control</h3>
            <p className="text-orange-800">
              A complete gesture control system using MediaPipe Hands for controlling system volume
              and screen brightness through hand gestures. Built with Streamlit and Python.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">System Controls</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Volume Control</div>
                    <div className="text-sm text-gray-600">Thumb ↔ Index finger distance</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Sun className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Brightness Control</div>
                    <div className="text-sm text-gray-600">Index ↔ Middle finger distance</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Technical Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Real-time video processing</li>
                <li>• Automatic calibration</li>
                <li>• PyCaw for audio control</li>
                <li>• Screen brightness control</li>
                <li>• Streamlit web interface</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Calibration Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded">
                <strong>Frame 1-50:</strong> Collect gesture distance samples
              </div>
              <div className="bg-white p-3 rounded">
                <strong>Percentiles:</strong> Calculate 5th and 95th percentiles
              </div>
              <div className="bg-white p-3 rounded">
                <strong>Mapping:</strong> Map distances to control ranges
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'implementation',
      title: 'Implementation',
      icon: Play,
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Python Implementation</h3>
            <p className="text-indigo-800">
              Complete Python implementations using MediaPipe for various computer vision tasks.
              Includes hand tracking, object detection, and gesture control applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Hand Tracking App</h4>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                <div>import mediapipe as mp</div>
                <div>import cv2</div>
                <div>import numpy as np</div>
                <div><br/></div>
                <div>mp_hands = mp.solutions.hands</div>
                <div>hands = mp_hands.Hands()</div>
                <div><br/></div>
                <div># Process video frames</div>
                <div>results = hands.process(frame)</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-3">Object Detection</h4>
              <div className="bg-gray-100 p-4 rounded font-mono text-sm">
                <div>from mediapipe.tasks import vision</div>
                <div><br/></div>
                <div>detector = vision.ObjectDetector.create_from_options(options)</div>
                <div>detection_result = detector.detect(image)</div>
                <div><br/></div>
                <div>for detection in detection_result.detections:</div>
                <div>&nbsp;&nbsp;print(detection.categories[0].category_name)</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Available Scripts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded text-sm">
                <strong>app.py:</strong> Gesture control system with Streamlit
              </div>
              <div className="bg-white p-3 rounded text-sm">
                <strong>object_detector.py:</strong> EfficientDet object detection
              </div>
              <div className="bg-white p-3 rounded text-sm">
                <strong>hand_landmarker.ipynb:</strong> Jupyter notebook examples
              </div>
              <div className="bg-white p-3 rounded text-sm">
                <strong>knn.py:</strong> KNN with gesture data
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeTopicData = topics.find(topic => topic.id === activeTopic);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MediaPipe</h1>

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
                {activeTopicData && React.createElement(activeTopicData.icon, { className: "w-6 h-6 text-blue-600" })}
                <h2 className="text-2xl font-semibold text-gray-900">{activeTopicData?.title}</h2>
              </div>

              {activeTopicData?.content}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">MediaPipe Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Real-time</h4>
              <p className="text-sm text-gray-600">30+ FPS performance</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Code className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Cross-platform</h4>
              <p className="text-sm text-gray-600">Mobile, desktop, web</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Modular</h4>
              <p className="text-sm text-gray-600">Customizable pipelines</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Play className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Ready-to-use</h4>
              <p className="text-sm text-gray-600">Pre-trained models</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPipe;

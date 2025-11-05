# AI/ML Interactive Web Applications

A comprehensive interactive web application showcasing various AI/ML algorithms and concepts, built with React, Vite, and Tailwind CSS. This project demonstrates implementations of neural networks, linear regression, image processing, computer vision, signal processing, color science, and more through an intuitive web interface.

## 🚀 Features

### Neural Networks
- Interactive neural network visualization with PyTorch
- Training visualization with loss curves and decision boundaries
- Customizable network architecture (3-5-5-1 layers)
- Real-time prediction on test data

### Linear Regression
- Multi-dimensional linear regression implementations
- 2D, 3D, and 4D visualization
- BMKG weather data integration
- Logistic regression for classification

### Image Processing
- Hierarchical JPEG compression with DCT transforms
- Interactive quality control
- Progressive decoding visualization
- Real-time image processing

### Computer Vision (MediaPipe)
- Hand gesture recognition
- Hand landmark detection
- Object detection
- Image classification
- Real-time camera integration

### Machine Learning
- Comprehensive ML algorithm demonstrations
- Interactive model training and evaluation
- Performance metrics visualization

### Signal Processing
- Fourier transforms and analysis
- Signal filtering techniques
- Real-time signal processing demos

### Color Science
- Color space conversions (RGB, CMY, SMPTE, etc.)
- Color theory demonstrations
- Interactive color manipulation tools

### Loran-C
- Loran-C navigation system simulation
- Signal propagation modeling
- Positioning accuracy demonstrations

### Tutorials
- Step-by-step guides for AI/ML concepts
- Interactive learning modules
- Code examples and explanations

### Additional Algorithms
- Discrete Cosine Transform (DCT) implementations
- Quantization algorithms
- Wavelet transformations

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend/ML**: Python, PyTorch, TensorFlow, OpenCV
- **Computer Vision**: MediaPipe
- **Visualization**: Chart.js, Matplotlib, Plotly
- **Build Tools**: Vite, ESLint

## 📁 Project Structure

```
ai_ml/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation component
│   │   ├── Home.jsx            # Landing page
│   │   ├── Tutorials.jsx       # Tutorials section
│   │   ├── NeuralNetwork.jsx   # NN visualization
│   │   ├── LinearRegression.jsx # Regression demos
│   │   ├── ImageProcessing.jsx # Image processing tools
│   │   ├── MachineLearning.jsx # ML algorithms
│   │   ├── SignalProcessing.jsx # Signal processing demos
│   │   ├── ColorScience.jsx    # Color science tools
│   │   ├── Loranc.jsx          # Loran-C simulation
│   │   ├── MediaPipe.jsx       # Computer vision demos
│   │   └── CardNav.jsx         # Navigation card component
│   ├── assets/                 # Static assets
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── asset/                      # Public assets (images, icons)
├── random/                     # Miscellaneous files
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_ml
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

### Home
- Overview of all available AI/ML tools and sections
- Quick navigation to different modules

### Tutorials
- Access step-by-step guides for AI/ML concepts
- Interactive learning modules with code examples

### Neural Network Demo
- Navigate to the Neural Network section
- View the interactive training visualization
- Adjust parameters and see real-time updates
- Explore decision boundaries and loss curves

### Linear Regression
- Choose from 2D, 3D, or 4D regression examples
- View scatter plots and fitted lines/planes
- Experiment with different datasets

### Image Processing
- Upload images for JPEG compression
- Adjust quality settings
- See hierarchical decoding in action

### Machine Learning
- Explore comprehensive ML algorithm demonstrations
- Interactive model training and evaluation
- View performance metrics and visualizations

### Signal Processing
- Analyze signals using Fourier transforms
- Apply various filtering techniques
- Real-time signal processing demonstrations

### Color Science
- Experiment with color space conversions
- Learn color theory through interactive tools
- Manipulate colors in different spaces (RGB, CMY, SMPTE)

### Loran-C
- Simulate Loran-C navigation system
- Model signal propagation
- Demonstrate positioning accuracy

### MediaPipe Integration
- Enable camera permissions for real-time demos
- Try hand gesture recognition
- Test object detection capabilities

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with PostCSS. Configuration is in `tailwind.config.js`.

### Vite
Build configuration is in `vite.config.js`. Hot reload is enabled for development.

### Python Integration
Python scripts are executed separately. Ensure all dependencies in `requirements.txt` are installed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- PyTorch for neural network implementations
- MediaPipe for computer vision capabilities
- React and Vite communities
- Academic sources for algorithm implementations

## 📄 Credits

This AI/ML Interactive Toolkit was developed by Rafli Alif as a comprehensive platform for exploring machine learning algorithms, image processing techniques, and computer vision applications.

**Developer:** Rafli Alif
- GitHub: [rhaffle87](https://github.com/rhaffle87/)
- Email: rhaffle87@gmail.com

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

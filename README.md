# AI/ML Interactive Web Application

A comprehensive interactive web application showcasing various AI/ML algorithms and concepts, built with React, Vite, and Tailwind CSS. This project demonstrates implementations of neural networks, linear regression, image processing, and more through an intuitive web interface.

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

### Additional Algorithms
- Discrete Cosine Transform (DCT) implementations
- Fourier transforms
- Quantization algorithms
- Color space conversions (CMY, SMPTE, etc.)
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
│   │   ├── NeuralNetwork.jsx   # NN visualization
│   │   ├── LinearRegression.jsx # Regression demos
│   │   └── ImageProcessing.jsx # Image processing tools
│   ├── assets/                 # Static assets
│   └── main.jsx               # App entry point
├── chapter4/                   # Color science algorithms
├── chapter8/                   # Transform coding algorithms
├── linear_regression/          # Regression implementations
├── mediapipe/                  # Computer vision demos
├── public/                     # Public assets
└── requirements.txt            # Python dependencies
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

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

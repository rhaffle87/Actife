import React from 'react';
import logo from '../assets/logo1.png';
import CreditsImg from '../assets/hero-img.png';

const Credits = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Credits</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">

            {/* Creator Info */}
            <img src={CreditsImg} alt="Rafli Alif" className="sm:w-28 sm:h-28 md:w-35 md:h-35 lg:w-60 lg:h-60 rounded-full mx-auto mb-6 object-cover"/>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rafli Alif</h2>
            <p className="text-gray-600 mb-6">Creator & Developer</p>


            <img
                src={logo}
                alt="ACTIFE Logo"
                className="h-18 md:h-22 mx-auto mb-4 transition-all duration-500 hover:scale-110 hover:brightness-110"
              />
            <p className="text-lg text-gray-700 mb-6 ">
              ACTIFE (Artificial Computing Toolkit for Intelligent Feature Experiments) was developed by Rafli Alif
              as a comprehensive platform for exploring machine learning algorithms, image processing techniques,
              and computer vision applications through interactive web interfaces powered by cutting-edge AI technologies.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/rhaffle87/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                GitHub Profile
              </a>
              <a
                href="mailto:rhaffle87@gmail.com"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;

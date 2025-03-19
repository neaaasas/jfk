// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PersonPage from './pages/PersonPage';
import AboutPage from './pages/AboutPage';
import PDFPage from './pages/PDF';
import Navbar from './components/Navigation/Navbar';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate loading process
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Give a little delay before hiding loading screen
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Router>
      <div className="min-h-screen bg-[#121212] text-white">
        <LoadingScreen isLoading={loading} progress={progress} />
        {!loading && (
          <>
            <Navbar />
            <main className="container mx-auto px-4 pt-4 flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/person/:id" element={<PersonPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pdfs" element={<PDFPage />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
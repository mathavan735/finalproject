import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import CameraMode from './components/CameraMode';
import CCTVMode from './components/CCTVMode';
import FireMode from './components/FireMode';
import SurveillanceMode from './components/SurveillanceMode';
import WildlifeMode from './components/WildlifeMode';
import BlindMode from './components/BlindMode';
import CollegeMode from './components/CollegeMode';
import ExamMode from './components/ExamMode';
import MobileAppBanner from './components/MobileAppBanner';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/camera" element={<CameraMode />} />
        <Route path="/cctv" element={<CCTVMode />} />
        <Route path="/fire" element={<FireMode />} />
        <Route path="/surveillance" element={<SurveillanceMode />} />
        <Route path="/wildlife" element={<WildlifeMode />} />
        <Route path="/blind" element={<BlindMode />} />
        <Route path="/college" element={<CollegeMode />} />
        <Route path="/exam" element={<ExamMode />} />
      </Routes>
      <MobileAppBanner />
    </Router>
  );
}

export default App;
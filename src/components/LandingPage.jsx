import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const modes = [
    {
      title: "Camera Mode",
      description: "Real-time object detection using your camera",
      path: "/camera",
      icon: "🎥",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      title: "CCTV Mode",
      description: "Monitor CCTV feeds with intelligent detection",
      path: "/cctv",
      icon: "📹",
      gradient: "from-cyan-600 to-cyan-800"
    },
    {
      title: "Fire Safety Mode",
      description: "Early fire detection and alerts",
      path: "/fire",
      icon: "🔥",
      gradient: "from-red-600 to-red-800"
    },
    {
      title: "Surveillance Mode",
      description: "Advanced person detection with photo alerts",
      path: "/surveillance",
      icon: "👥",
      gradient: "from-purple-600 to-purple-800"
    },
    {
      title: "Wildlife Safety Mode",
      description: "Detect wild animals in forest areas",
      path: "/wildlife",
      icon: "🦁",
      gradient: "from-green-600 to-green-800"
    },
    {
      title: "Blind Assistance Mode",
      description: "Audio guidance for obstacles and surroundings",
      path: "/blind",
      icon: "🦮",
      gradient: "from-yellow-600 to-yellow-800"
    },
    {
      title: "College Entry Mode",
      description: "Monitor students entering without ID cards",
      path: "/college",
      icon: "🎓",
      gradient: "from-indigo-600 to-indigo-800"
    },
    {
      title: "Exam Monitoring Mode",
      description: "Detect cheating attempts and suspicious behavior",
      path: "/exam",
      icon: "📝",
      gradient: "from-pink-600 to-pink-800"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-6xl w-full mx-auto">
        <div className="logo-container mb-12">
          <img 
            src="/watchdog-logo.png" 
            alt="Watch Dog Logo"
            className="w-64 h-64 object-contain"
          />
        </div>

        <h1 className="text-7xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          24/7 Watch Dog
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 text-center max-w-2xl">
          Intelligent surveillance system with specialized detection modes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {modes.map((mode) => (
            <button
              key={mode.title}
              onClick={() => navigate(mode.path)}
              className={`btn-glow group bg-gradient-to-r ${mode.gradient} p-8 rounded-xl text-center transform transition-all duration-300`}
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl mb-4">{mode.icon}</span>
                <h2 className="text-2xl font-bold mb-2">{mode.title}</h2>
                <p className="text-gray-200">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
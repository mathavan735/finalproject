import React, { useState, useEffect } from 'react';

const MobileAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
      setShowBanner(true);
    }
  }, []);

  const handleDownload = () => {
    // Create a zip file with the app contents
    const downloadUrl = '/download/watchdog.zip';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'watchdog.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex items-center justify-between z-50">
      <div className="flex items-center space-x-4">
        <img src="/watchdog-logo.png" alt="Watch Dog" className="w-10 h-10 rounded-lg" />
        <div>
          <h3 className="font-bold">Watch Dog Mobile</h3>
          <p className="text-sm">Download our app for offline use</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDownload}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50"
        >
          Download App
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-white hover:text-blue-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MobileAppBanner;
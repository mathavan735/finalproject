import React from 'react';

const DetectionPanel = ({ recentAlerts = [], currentDetections = [], targetObject = '', onTargetChange }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg max-w-md">
      {onTargetChange && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-blue-500 mr-2">🎯</span>
            Detection Target
          </h2>
          <input
            type="text"
            value={targetObject}
            onChange={(e) => onTargetChange(e.target.value)}
            placeholder="Enter object to detect (e.g., person, cell phone)"
            className="bg-gray-700 text-white px-4 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-yellow-500 mr-2">🔔</span>
          Recent Alerts
        </h2>
        <div className="space-y-2">
          {recentAlerts.map((alert, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded">
              {alert}
            </div>
          ))}
          {recentAlerts.length === 0 && (
            <div className="bg-gray-700 p-3 rounded text-gray-400">
              No recent alerts
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-green-500 mr-2">📋</span>
          Current Detections
        </h2>
        <div className="space-y-2">
          {currentDetections.map((detection, index) => (
            <div 
              key={index} 
              className={`bg-gray-700 p-3 rounded flex justify-between items-center ${
                targetObject && detection.label.toLowerCase() === targetObject.toLowerCase() 
                  ? 'border-2 border-yellow-500' 
                  : ''
              }`}
            >
              <span>{detection.label}</span>
              <span className="bg-gray-600 px-2 py-1 rounded">
                {detection.confidence}%
              </span>
            </div>
          ))}
          {currentDetections.length === 0 && (
            <div className="bg-gray-700 p-3 rounded text-gray-400">
              No objects detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionPanel;
import React, { useState } from 'react';
import './App.css';

function App() {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Use nouns instead of verbs in endpoints', category: 'Design', completed: false },
    { id: 2, text: 'Use plural nouns for collections', category: 'Design', completed: false },
    { id: 3, text: 'Use proper HTTP status codes (2xx, 4xx, 5xx)', category: 'HTTP', completed: false },
    { id: 4, text: 'Implement proper error handling with consistent format', category: 'HTTP', completed: false },
    { id: 5, text: 'Use HTTP methods correctly (GET, POST, PUT, DELETE)', category: 'HTTP', completed: false },
    { id: 6, text: 'Implement pagination for large datasets', category: 'Performance', completed: false },
    { id: 7, text: 'Add caching headers (Cache-Control, ETag)', category: 'Performance', completed: false },
    { id: 8, text: 'Implement rate limiting', category: 'Security', completed: false },
    { id: 9, text: 'Use HTTPS everywhere', category: 'Security', completed: false },
    { id: 10, text: 'Implement proper authentication (JWT, OAuth)', category: 'Security', completed: false },
    { id: 11, text: 'Version your API (/v1/, /v2/)', category: 'Versioning', completed: false },
    { id: 12, text: 'Provide comprehensive API documentation', category: 'Documentation', completed: false },
    { id: 13, text: 'Use consistent naming conventions', category: 'Design', completed: false },
    { id: 14, text: 'Implement input validation', category: 'Security', completed: false },
    { id: 15, text: 'Use appropriate response formats (JSON)', category: 'Design', completed: false },
  ]);

  const handleToggle = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const getCategoryColor = (category) => {
    const colors = {
      'Design': '#e3f2fd',
      'HTTP': '#f3e5f5',
      'Performance': '#e8f5e8',
      'Security': '#fff3e0',
      'Versioning': '#fce4ec',
      'Documentation': '#e0f2f1'
    };
    return colors[category] || '#f5f5f5';
  };

  const getCategoryTextColor = (category) => {
    const colors = {
      'Design': '#1976d2',
      'HTTP': '#7b1fa2',
      'Performance': '#388e3c',
      'Security': '#f57c00',
      'Versioning': '#c2185b',
      'Documentation': '#00796b'
    };
    return colors[category] || '#666';
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">API RESTful Checklist</h1>
        <p className="subtitle">Best practices pour développer des APIs robustes et maintenables</p>
      </div>
      
      <div className="checklist-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <ul className="checklist">
          {checklist.map((item) => (
            <li
              key={item.id}
              className={`checklist-item ${item.completed ? 'completed' : ''}`}
              onClick={() => handleToggle(item.id)}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggle(item.id)}
                className="checkbox"
              />
              <span className="item-text">{item.text}</span>
              <span 
                className="item-category"
                style={{
                  background: getCategoryColor(item.category),
                  color: getCategoryTextColor(item.category)
                }}
              >
                {item.category}
              </span>
            </li>
          ))}
        </ul>
        
        <div className="stats">
          <div className="stats-text">Progression</div>
          <div className="stats-number">{completedCount}/{totalCount}</div>
          <div className="stats-text">{Math.round(progressPercentage)}% complété</div>
        </div>
      </div>
    </div>
  );
}

export default App;

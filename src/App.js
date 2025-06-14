import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const defaultChecklist = [
    { id: 1, text: 'Use nouns instead of verbs in endpoints', category: 'Design', completed: false },
    { id: 2, text: 'Use plural nouns for collections', category: 'Design', completed: false },
    { id: 13, text: 'Use consistent naming conventions', category: 'Design', completed: false },
    { id: 15, text: 'Use appropriate response formats (JSON)', category: 'Design', completed: false },
    { id: 3, text: 'Use proper HTTP status codes (2xx, 4xx, 5xx)', category: 'HTTP', completed: false },
    { id: 4, text: 'Implement proper error handling with consistent format', category: 'HTTP', completed: false },
    { id: 5, text: 'Use HTTP methods correctly (GET, POST, PUT, DELETE)', category: 'HTTP', completed: false },
    { id: 6, text: 'Implement pagination for large datasets', category: 'Performance', completed: false },
    { id: 7, text: 'Add caching headers (Cache-Control, ETag)', category: 'Performance', completed: false },
    { id: 8, text: 'Implement rate limiting', category: 'Security', completed: false },
    { id: 9, text: 'Use HTTPS everywhere', category: 'Security', completed: false },
    { id: 10, text: 'Implement proper authentication (JWT, OAuth)', category: 'Security', completed: false },
    { id: 14, text: 'Implement input validation', category: 'Security', completed: false },
    { id: 11, text: 'Version your API (/v1/, /v2/)', category: 'Versioning', completed: false },
    { id: 12, text: 'Provide comprehensive API documentation', category: 'Documentation', completed: false },
    { id: 13, text: 'Use consistent naming conventions', category: 'Design', completed: false },
    { id: 14, text: 'Implement input validation', category: 'Security', completed: false },
    { id: 15, text: 'Use appropriate response formats (JSON)', category: 'Design', completed: false },
  ];

  // Load projects from localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('api-checklist-projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing projects, creating default", e);
      }
    }
    // Create default project
    const defaultProject = {
      id: Date.now(),
      name: 'My API Project',
      checklist: defaultChecklist,
      createdAt: new Date().toISOString()
    };
    return [defaultProject];
  });

  // Current active project
  const [currentProjectId, setCurrentProjectId] = useState(() => {
    const saved = localStorage.getItem('api-checklist-current-project');
    if (saved && projects.find(p => p.id === parseInt(saved))) {
      return parseInt(saved);
    }
    return projects[0]?.id || null;
  });

  // Collapsed categories state
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    const saved = localStorage.getItem('api-checklist-collapsed-categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing collapsed categories", e);
      }
    }
    return {};
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const currentProject = projects.find(p => p.id === currentProjectId);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('api-checklist-projects', JSON.stringify(projects));
  }, [projects]);

  // Save current project ID
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('api-checklist-current-project', currentProjectId.toString());
    }
  }, [currentProjectId]);

  // Save collapsed categories
  useEffect(() => {
    localStorage.setItem('api-checklist-collapsed-categories', JSON.stringify(collapsedCategories));
  }, [collapsedCategories]);

  const handleToggle = (id) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === currentProjectId 
          ? {
              ...project,
              checklist: project.checklist.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
              )
            }
          : project
      )
    );
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleProjectNameSubmit = (e) => {
    e.preventDefault();
    if (currentProject && currentProject.name.trim()) {
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === currentProjectId
            ? { ...project, name: currentProject.name.trim() }
            : project
        )
      );
    }
    setIsEditingName(false);
  };

  const updateProjectName = (name) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === currentProjectId
          ? { ...project, name }
          : project
      )
    );
  };

  const createNewProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName.trim(),
        checklist: defaultChecklist.map(item => ({ ...item, completed: false })),
        createdAt: new Date().toISOString()
      };
      setProjects(prev => [...prev, newProject]);
      setCurrentProjectId(newProject.id);
      setNewProjectName('');
      setShowProjectSelector(false);
    }
  };

  const deleteProject = (projectId) => {
    if (projects.length <= 1) {
      alert('You must have at least one project');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      const newProjects = projects.filter(p => p.id !== projectId);
      setProjects(newProjects);
      
      if (currentProjectId === projectId) {
        setCurrentProjectId(newProjects[0].id);
      }
    }
  };

  const resetCurrentProject = () => {
    if (window.confirm('Are you sure you want to reset the current project checklist?')) {
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === currentProjectId
            ? { ...project, checklist: defaultChecklist.map(item => ({ ...item, completed: false })) }
            : project
        )
      );
    }
  };

  if (!currentProject) {
    return <div>Loading...</div>;
  }

  // Group checklist items by category
  const groupedChecklist = currentProject.checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const completedCount = currentProject.checklist.filter(item => item.completed).length;
  const totalCount = currentProject.checklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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

  const getCategoryIcon = (category) => {
    const icons = {
      'Design': '🎨',
      'HTTP': '🌐',
      'Performance': '⚡',
      'Security': '🔒',
      'Versioning': '📋',
      'Documentation': '📚'
    };
    return icons[category] || '📝';
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="project-controls">
          <div className="project-name-section">
            {isEditingName ? (
              <form onSubmit={handleProjectNameSubmit} className="project-name-form">
                <input
                  type="text"
                  value={currentProject.name}
                  onChange={(e) => updateProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="project-name-input"
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                />
              </form>
            ) : (
              <h2 
                className="project-name"
                onClick={() => setIsEditingName(true)}
                title="Click to edit the project name"
              >
                {currentProject.name}
              </h2>
            )}
          </div>
          
          <div className="project-actions">
            <div className="project-selector">
              <button 
                className="project-selector-btn"
                onClick={() => setShowProjectSelector(!showProjectSelector)}
              >
                Projects ({projects.length})
              </button>
              
              {showProjectSelector && (
                <div className="project-dropdown">
                  <div className="project-list">
                    {projects.map(project => (
                      <div key={project.id} className="project-item">
                        <button
                          className={`project-select-btn ${project.id === currentProjectId ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentProjectId(project.id);
                            setShowProjectSelector(false);
                          }}
                        >
                          <span className="project-item-name">{project.name}</span>
                          <span className="project-item-progress">
                            {project.checklist.filter(item => item.completed).length}/{project.checklist.length}
                          </span>
                        </button>
                        {projects.length > 1 && (
                          <button
                            className="delete-project-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            title="Delete project"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="new-project-section">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="New project name..."
                      className="new-project-input"
                      onKeyPress={(e) => e.key === 'Enter' && createNewProject()}
                    />
                    <button 
                      className="create-project-btn"
                      onClick={createNewProject}
                      disabled={!newProjectName.trim()}
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={resetCurrentProject} className="reset-button">
              Reset Project
            </button>
          </div>
        </div>

        <h1 className="title">API RESTful Checklist</h1>
        <p className="subtitle">Best practices to develop robust and maintainable APIs</p>
      </div>
      
      <div className="checklist-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="checklist">
          {Object.entries(groupedChecklist).map(([category, items]) => {
            const categoryCompleted = items.filter(item => item.completed).length;
            const categoryTotal = items.length;
            const categoryProgress = categoryTotal > 0 ? (categoryCompleted / categoryTotal) * 100 : 0;
            const isCollapsed = collapsedCategories[category];

            return (
              <div key={category} className="category-section">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                  style={{
                    background: getCategoryColor(category),
                    color: getCategoryTextColor(category)
                  }}
                >
                  <div className="category-info">
                    <span className="category-icon">{getCategoryIcon(category)}</span>
                    <span className="category-name">{category}</span>
                    <span className="category-progress">
                      {categoryCompleted}/{categoryTotal}
                    </span>
                  </div>
                  <div className="category-controls">
                    <div className="category-progress-bar">
                      <div 
                        className="category-progress-fill"
                        style={{ 
                          width: `${categoryProgress}%`,
                          background: getCategoryTextColor(category)
                        }}
                      ></div>
                    </div>
                    <span className="collapse-icon">
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  </div>
                </div>
                
                {!isCollapsed && (
                  <ul className="category-items">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className={`checklist-item ${item.completed ? 'completed' : ''}`}
                        onClick={() => handleToggle(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggle(item.id);
                          }}
                          className="checkbox"
                        />
                        <span className="item-text">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="stats">
          <div className="stats-text">Progress</div>
          <div className="stats-number">{completedCount}/{totalCount}</div>
          <div className="stats-text">{Math.round(progressPercentage)}% completed</div>
        </div>
      </div>
    </div>
  );
}

export default App;

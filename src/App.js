import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const defaultChecklist = [
    { 
      id: 1, 
      text: 'Use nouns instead of verbs in endpoints', 
      category: 'Design', 
      priority: 'high',
      completed: false,
      description: 'REST endpoints should represent resources (nouns) rather than actions (verbs). This makes your API more intuitive and follows REST principles.',
      example: 'Good: GET /users/123 | Bad: GET /getUser/123',
      references: [
        { title: 'REST API Design Best Practices', url: 'https://restfulapi.net/resource-naming/' },
        { title: 'RESTful Web Services', url: 'https://www.oreilly.com/library/view/restful-web-services/9780596529260/' }
      ]
    },
    { 
      id: 2, 
      text: 'Use plural nouns for collections', 
      category: 'Design', 
      priority: 'high',
      completed: false,
      description: 'Collections of resources should use plural nouns to clearly indicate that multiple items can be returned.',
      example: 'Good: GET /users | Bad: GET /user',
      references: [
        { title: 'REST Resource Naming Guide', url: 'https://restfulapi.net/resource-naming/' },
        { title: 'API Design Patterns', url: 'https://microservices.io/patterns/data/api-composition.html' }
      ]
    },
    { 
      id: 13, 
      text: 'Use consistent naming conventions', 
      category: 'Design', 
      priority: 'medium',
      completed: false,
      description: 'Maintain consistent naming patterns throughout your API (camelCase, snake_case, or kebab-case). Consistency improves developer experience.',
      example: 'Choose one: user_name, userName, or user-name and stick with it',
      references: [
        { title: 'API Naming Conventions', url: 'https://blog.restcase.com/5-basic-rest-api-design-guidelines/' },
        { title: 'Google API Design Guide', url: 'https://cloud.google.com/apis/design/naming_convention' }
      ]
    },
    { 
      id: 15, 
      text: 'Use appropriate response formats (JSON)', 
      category: 'Design', 
      priority: 'high',
      completed: false,
      description: 'JSON is the standard for modern APIs due to its lightweight nature and universal support. Ensure consistent JSON structure across endpoints.',
      example: 'Content-Type: application/json with proper JSON formatting',
      references: [
        { title: 'JSON API Specification', url: 'https://jsonapi.org/' },
        { title: 'REST API Response Format', url: 'https://restfulapi.net/json-jsonp/' }
      ]
    },
    { 
      id: 3, 
      text: 'Use proper HTTP status codes (2xx, 4xx, 5xx)', 
      category: 'HTTP', 
      priority: 'high',
      completed: false,
      description: 'HTTP status codes communicate the result of requests clearly. Use 2xx for success, 4xx for client errors, and 5xx for server errors.',
      example: '200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Server Error',
      references: [
        { title: 'HTTP Status Codes', url: 'https://httpstatuses.com/' },
        { title: 'MDN HTTP Status Codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' },
        { title: 'REST API Status Codes', url: 'https://restfulapi.net/http-status-codes/' }
      ]
    },
    { 
      id: 4, 
      text: 'Implement proper error handling with consistent format', 
      category: 'HTTP', 
      priority: 'high',
      completed: false,
      description: 'Standardize error responses with clear messages, error codes, and helpful information for debugging and user feedback.',
      example: '{"error": {"code": "VALIDATION_ERROR", "message": "Email is required", "field": "email"}}',
      references: [
        { title: 'API Error Handling Best Practices', url: 'https://blog.restcase.com/rest-api-error-codes-101/' },
        { title: 'Problem Details for HTTP APIs', url: 'https://tools.ietf.org/html/rfc7807' }
      ]
    },
    { 
      id: 5, 
      text: 'Use HTTP methods correctly (GET, POST, PUT, DELETE)', 
      category: 'HTTP', 
      priority: 'high',
      completed: false,
      description: 'Each HTTP method has a specific purpose: GET for retrieval, POST for creation, PUT for updates, DELETE for removal. Follow these semantics.',
      example: 'GET /users (list), POST /users (create), PUT /users/123 (update), DELETE /users/123 (remove)',
      references: [
        { title: 'HTTP Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' },
        { title: 'REST HTTP Methods', url: 'https://restfulapi.net/http-methods/' }
      ]
    },
    { 
      id: 6, 
      text: 'Implement pagination for large datasets', 
      category: 'Performance', 
      priority: 'medium',
      completed: false,
      description: 'Prevent performance issues and timeouts by limiting response sizes. Implement cursor-based or offset-based pagination.',
      example: 'GET /users?page=2&limit=20 or GET /users?cursor=abc123&limit=20',
      references: [
        { title: 'API Pagination Best Practices', url: 'https://nordicapis.com/everything-you-need-to-know-about-api-pagination/' },
        { title: 'Cursor vs Offset Pagination', url: 'https://slack.engineering/evolving-api-pagination-at-slack/' }
      ]
    },
    { 
      id: 7, 
      text: 'Add caching headers (Cache-Control, ETag)', 
      category: 'Performance', 
      priority: 'medium',
      completed: false,
      description: 'Implement HTTP caching to reduce server load and improve response times. Use Cache-Control for cache policies and ETags for conditional requests.',
      example: 'Cache-Control: max-age=3600, ETag: "abc123"',
      references: [
        { title: 'HTTP Caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' },
        { title: 'REST API Caching', url: 'https://restfulapi.net/caching/' }
      ]
    },
    { 
      id: 8, 
      text: 'Implement rate limiting', 
      category: 'Security', 
      priority: 'high',
      completed: false,
      description: 'Protect your API from abuse and ensure fair usage by implementing rate limiting. Communicate limits through headers.',
      example: 'X-RateLimit-Limit: 1000, X-RateLimit-Remaining: 999, X-RateLimit-Reset: 1609459200',
      references: [
        { title: 'API Rate Limiting', url: 'https://nordicapis.com/everything-you-need-to-know-about-api-rate-limiting/' },
        { title: 'Rate Limiting Strategies', url: 'https://blog.cloudflare.com/counting-things-a-lot-of-different-things/' }
      ]
    },
    { 
      id: 9, 
      text: 'Use HTTPS everywhere', 
      category: 'Security', 
      priority: 'high',
      completed: false,
      description: 'Encrypt all API communications to protect sensitive data in transit. HTTPS is essential for security and is required by modern browsers.',
      example: 'https://api.example.com instead of http://api.example.com',
      references: [
        { title: 'Why HTTPS Matters', url: 'https://developers.google.com/web/fundamentals/security/encrypt-in-transit/why-https' },
        { title: 'HTTPS Best Practices', url: 'https://httpsiseasy.com/' }
      ]
    },
    { 
      id: 10, 
      text: 'Implement proper authentication (JWT, OAuth)', 
      category: 'Security', 
      priority: 'high',
      completed: false,
      description: 'Secure your API with robust authentication mechanisms. JWT for stateless auth, OAuth for third-party integrations.',
      example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      references: [
        { title: 'JWT Introduction', url: 'https://jwt.io/introduction/' },
        { title: 'OAuth 2.0', url: 'https://oauth.net/2/' },
        { title: 'API Authentication Best Practices', url: 'https://blog.restcase.com/restful-api-authentication-basics/' }
      ]
    },
    { 
      id: 14, 
      text: 'Implement input validation', 
      category: 'Security', 
      priority: 'high',
      completed: false,
      description: 'Validate all input data to prevent injection attacks and ensure data integrity. Use schema validation and sanitization.',
      example: 'Validate email format, check string lengths, sanitize SQL inputs',
      references: [
        { title: 'Input Validation Guide', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html' },
        { title: 'API Security Best Practices', url: 'https://owasp.org/www-project-api-security/' }
      ]
    },
    { 
      id: 11, 
      text: 'Version your API (/v1/, /v2/)', 
      category: 'Versioning', 
      priority: 'medium',
      completed: false,
      description: 'API versioning allows you to evolve your API without breaking existing clients. Use URL versioning, header versioning, or parameter versioning.',
      example: 'https://api.example.com/v1/users or Accept: application/vnd.api+json;version=1',
      references: [
        { title: 'API Versioning Best Practices', url: 'https://restfulapi.net/versioning/' },
        { title: 'API Versioning Strategies', url: 'https://nordicapis.com/api-versioning-methods-a-brief-reference/' }
      ]
    },
    { 
      id: 12, 
      text: 'Provide comprehensive API documentation', 
      category: 'Documentation', 
      priority: 'low',
      completed: false,
      description: 'Good documentation is crucial for API adoption. Include examples, error codes, authentication details, and interactive testing capabilities.',
      example: 'Use tools like Swagger/OpenAPI, Postman, or custom documentation sites',
      references: [
        { title: 'OpenAPI Specification', url: 'https://swagger.io/specification/' },
        { title: 'API Documentation Best Practices', url: 'https://blog.readme.com/api-documentation-best-practices/' },
        { title: 'Postman Documentation', url: 'https://learning.postman.com/docs/publishing-your-api/documenting-your-api/' }
      ]
    },
  ];

  // Function to migrate old checklist items to new format
  const migrateChecklistItem = (item) => {
    const defaultItem = defaultChecklist.find(defaultItem => defaultItem.id === item.id);
    if (defaultItem) {
      return {
        ...defaultItem,
        completed: item.completed // Keep the completion status
      };
    }
    // If item not found in default list, return with empty description
    return {
      ...item,
      description: item.description || 'No description available.',
      example: item.example || '',
      references: item.references || [],
      priority: item.priority || 'medium'
    };
  };

  // Load projects from localStorage
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('api-checklist-projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate existing projects to new format
          const migratedProjects = parsed.map(project => ({
            ...project,
            checklist: project.checklist.map(migrateChecklistItem)
          }));
          return migratedProjects;
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

  // Priority filter state
  const [priorityFilter, setPriorityFilter] = useState('all');

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

  // Expanded items state for showing descriptions
  const [expandedItems, setExpandedItems] = useState(() => {
    const saved = localStorage.getItem('api-checklist-expanded-items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing expanded items", e);
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

  // Save expanded items
  useEffect(() => {
    localStorage.setItem('api-checklist-expanded-items', JSON.stringify(expandedItems));
  }, [expandedItems]);

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

  const toggleCategoryCompletion = (category, e) => {
    e.stopPropagation(); // Prevent category collapse/expand
    
    const categoryItems = currentProject.checklist.filter(item => item.category === category);
    const allCompleted = categoryItems.every(item => item.completed);
    const newCompletionState = !allCompleted;
    
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === currentProjectId 
          ? {
              ...project,
              checklist: project.checklist.map(item =>
                item.category === category 
                  ? { ...item, completed: newCompletionState }
                  : item
              )
            }
          : project
      )
    );
  };

  const toggleItemExpansion = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
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

  // Filter and sort items by priority
  const getFilteredAndSortedItems = (items) => {
    let filteredItems = items;
    
    // Filter by priority if not 'all'
    if (priorityFilter !== 'all') {
      filteredItems = items.filter(item => item.priority === priorityFilter);
    }
    
    // Sort by priority (high -> medium -> low)
    const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
    return filteredItems.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#ff4444',
      'medium': '#ff9800',
      'low': '#4caf50'
    };
    return colors[priority] || '#666';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🟢'
    };
    return icons[priority] || '⚪';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || 'Unknown';
  };

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
        
        <div className="priority-filter">
          <label htmlFor="priority-select" className="filter-label">Filter by priority:</label>
          <select 
            id="priority-select"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-select"
          >
            <option value="all">All priorities</option>
            <option value="high">🔴 High priority</option>
            <option value="medium">🟡 Medium priority</option>
            <option value="low">🟢 Low priority</option>
          </select>
        </div>
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
                    <input
                      type="checkbox"
                      checked={categoryCompleted === categoryTotal && categoryTotal > 0}
                      onChange={(e) => toggleCategoryCompletion(category, e)}
                      className="category-checkbox"
                      title={`${categoryCompleted === categoryTotal && categoryTotal > 0 ? 'Uncheck' : 'Check'} all tasks in ${category}`}
                    />
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
                    {getFilteredAndSortedItems(items).map((item) => {
                      const isExpanded = expandedItems[item.id];
                      return (
                        <li key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                          <div className="item-main" onClick={() => handleToggle(item.id)}>
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
                            <div className="item-priority" title={`${getPriorityLabel(item.priority)} priority`}>
                              <span className="priority-icon">{getPriorityIcon(item.priority)}</span>
                              <span className="priority-text">{getPriorityLabel(item.priority)}</span>
                            </div>
                            <button
                              className="expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItemExpansion(item.id);
                              }}
                              title={isExpanded ? 'Hide details' : 'Show details'}
                            >
                              {isExpanded ? '−' : '+'}
                            </button>
                          </div>
                          
                          {isExpanded && (
                            <div className="item-details">
                              <div className="item-description">
                                <p>{item.description || 'No description available.'}</p>
                                {item.example && (
                                  <div className="item-example">
                                    <strong>Example:</strong> <code>{item.example}</code>
                                  </div>
                                )}
                              </div>
                              
                              {item.references && item.references.length > 0 && (
                                <div className="item-references">
                                  <strong>Learn more:</strong>
                                  <ul>
                                    {item.references.map((ref, index) => (
                                      <li key={index}>
                                        <a 
                                          href={ref.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="reference-link"
                                        >
                                          {ref.title} ↗
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
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

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import LanguageSelector from './components/LanguageSelector';
import defaultChecklist from './data/checklist.json';

function App() {
  const { t } = useTranslation();
  const [githubStars, setGithubStars] = useState(null);
  
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [showVerticalNav, setShowVerticalNav] = useState(false);
  const [verticalNavStyle, setVerticalNavStyle] = useState({ opacity: 0 });
  const appContainerRef = useRef(null);

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

  // Auto-hide import messages after 5 seconds
  useEffect(() => {
    if (importSuccess || importError) {
      const timer = setTimeout(() => {
        setImportSuccess('');
        setImportError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importSuccess, importError]);

  // Fetch GitHub stars
  const fetchGitHubStars = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/your-checklist/your-api-checklist.com');
      const data = await response.json();
      setGithubStars(data.stargazers_count);
    } catch (error) {
      console.error('Error fetching GitHub stars:', error);
      setGithubStars(0);
    }
  };

  // Fetch GitHub stars on component mount
  useEffect(() => {
    fetchGitHubStars();
  }, []);

  // Handle scroll to show/hide vertical navigation
  useEffect(() => {
    const handleScroll = () => {
      const quickNavElement = document.querySelector('.category-navigation');
      if (quickNavElement) {
        const rect = quickNavElement.getBoundingClientRect();
        setShowVerticalNav(rect.bottom < 20); // Show when nav is off-screen
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Position vertical nav
  useEffect(() => {
    const updateNavPosition = () => {
      if (!appContainerRef.current) return;

      const rect = appContainerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      if (windowWidth > 768) {
        const leftPosition = rect.right + 20;
        const navWidth = 50; // Approximate width of the nav bar

        if (leftPosition + navWidth > windowWidth) {
          // If it would overflow, stick it to the right edge
          setVerticalNavStyle({
            right: '20px',
            left: 'auto',
            opacity: showVerticalNav ? 1 : 0,
          });
        } else {
          setVerticalNavStyle({
            left: `${leftPosition}px`,
            right: 'auto',
            opacity: showVerticalNav ? 1 : 0,
          });
        }
      } else {
        // On mobile, let CSS handle the positioning
        setVerticalNavStyle({ opacity: showVerticalNav ? 1 : 0 });
      }
    };

    window.addEventListener('resize', updateNavPosition);
    updateNavPosition();

    return () => window.removeEventListener('resize', updateNavPosition);
  }, [showVerticalNav]);

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

  // Export functions
  const exportToMarkdown = () => {
    const completedCount = currentProject.checklist.filter(item => item.completed).length;
    const totalCount = currentProject.checklist.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    let markdown = `# ${currentProject.name} - API RESTful Checklist\n\n`;
    markdown += `**Progress:** ${completedCount}/${totalCount} (${progressPercentage}% completed)\n\n`;
    markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Group by category
    const grouped = currentProject.checklist.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([category, items]) => {
      const categoryCompleted = items.filter(item => item.completed).length;
      const categoryTotal = items.length;
      const categoryIcon = getCategoryIcon(category);
      
      markdown += `## ${categoryIcon} ${category} (${categoryCompleted}/${categoryTotal})\n\n`;
      
      // Sort by priority
      const sortedItems = getFilteredAndSortedItems(items);
      
      sortedItems.forEach(item => {
        const checkbox = item.completed ? '[x]' : '[ ]';
        const priorityIcon = getPriorityIcon(item.priority);
        markdown += `- ${checkbox} **${item.text}** ${priorityIcon}\n`;
        if (item.description) {
          markdown += `  - ${item.description}\n`;
        }
        if (item.example) {
          markdown += `  - *Example:* \`${item.example}\`\n`;
        }
        if (item.references && item.references.length > 0) {
          markdown += `  - **References:**\n`;
          item.references.forEach(ref => {
            markdown += `    - [${ref.title}](${ref.url})\n`;
          });
        }
        markdown += '\n';
      });
      
      markdown += '\n';
    });
    
    // Download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    const exportData = {
      projectName: currentProject.name,
      exportDate: new Date().toISOString(),
      progress: {
        completed: currentProject.checklist.filter(item => item.completed).length,
        total: currentProject.checklist.length
      },
      checklist: currentProject.checklist.map(item => ({
        id: item.id,
        text: item.text,
        category: item.category,
        priority: item.priority,
        completed: item.completed,
        description: item.description,
        example: item.example,
        references: item.references
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    // Create a printable HTML version
    const completedCount = currentProject.checklist.filter(item => item.completed).length;
    const totalCount = currentProject.checklist.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentProject.name} - API RESTful Checklist</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .progress { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .category { margin: 20px 0; }
          .task { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
          .task.completed { background: #f8fff8; border-left-color: #4caf50; }
          .priority-high { border-left-color: #ff4444; }
          .priority-medium { border-left-color: #ff9800; }
          .priority-low { border-left-color: #4caf50; }
          .task-title { font-weight: bold; }
          .task-description { color: #666; margin: 5px 0; }
          .task-example { background: #f8f9fa; padding: 8px; border-radius: 4px; margin: 5px 0; font-family: monospace; }
          .references { margin-top: 10px; }
          .references a { color: #667eea; text-decoration: none; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>${currentProject.name} - API RESTful Checklist</h1>
        <div class="progress">
          <strong>Progress:</strong> ${completedCount}/${totalCount} tasks completed (${progressPercentage}%)
          <br><strong>Generated:</strong> ${new Date().toLocaleDateString()}
        </div>
    `;
    
    // Group by category
    const grouped = currentProject.checklist.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    
    Object.entries(grouped).forEach(([category, items]) => {
      const categoryCompleted = items.filter(item => item.completed).length;
      const categoryTotal = items.length;
      const categoryIcon = getCategoryIcon(category);
      
      html += `<div class="category">`;
      html += `<h2>${categoryIcon} ${category} (${categoryCompleted}/${categoryTotal})</h2>`;
      
      const sortedItems = getFilteredAndSortedItems(items);
      
      sortedItems.forEach(item => {
        const completedClass = item.completed ? 'completed' : '';
        const priorityClass = `priority-${item.priority}`;
        const checkbox = item.completed ? '✅' : '☐';
        const priorityIcon = getPriorityIcon(item.priority);
        
        html += `<div class="task ${completedClass} ${priorityClass}">`;
        html += `<div class="task-title">${checkbox} ${item.text} ${priorityIcon}</div>`;
        if (item.description) {
          html += `<div class="task-description">${item.description}</div>`;
        }
        if (item.example) {
          html += `<div class="task-example"><strong>Example:</strong> ${item.example}</div>`;
        }
        if (item.references && item.references.length > 0) {
          html += `<div class="references"><strong>References:</strong><br>`;
          item.references.forEach(ref => {
            html += `<a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="reference-link">${ref.title}</a><br>`;
          });
          html += `</div>`;
        }
        html += `</div>`;
      });
      
      html += `</div>`;
    });
    
    html += `</body></html>`;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setShowExportMenu(false);
  };

  // Import function
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset messages
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the imported data structure
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Invalid JSON file format');
        }

        // Handle different possible JSON formats
        let projectName, checklist;
        
        if (importedData.projectName && importedData.checklist) {
          // Standard export format
          projectName = importedData.projectName;
          checklist = importedData.checklist;
        } else if (Array.isArray(importedData)) {
          // Direct checklist array
          projectName = 'Imported Project';
          checklist = importedData;
        } else if (importedData.name && importedData.checklist) {
          // Alternative project format
          projectName = importedData.name;
          checklist = importedData.checklist;
        } else {
          throw new Error('Unrecognized JSON format. Expected a project with name and checklist.');
        }

        if (!Array.isArray(checklist)) {
          throw new Error('Invalid checklist format. Expected an array of checklist items.');
        }

        // Generate unique project name if one already exists
        let finalProjectName = projectName;
        let counter = 1;
        while (projects.some(p => p.name === finalProjectName)) {
          finalProjectName = `${projectName} (${counter})`;
          counter++;
        }

        // Migrate and validate checklist items
        const migratedChecklist = checklist.map((item, index) => {
          if (!item || typeof item !== 'object') {
            throw new Error(`Invalid checklist item at position ${index + 1}`);
          }
          
          // Validate that text exists and is a string
          if (!item.text || typeof item.text !== 'string') {
            throw new Error(`Missing or invalid text for checklist item at position ${index + 1}`);
          }
          
          // Ensure required fields exist with proper validation
          const validatedItem = {
            id: item.id || Date.now() + Math.random() + index,
            text: item.text.trim(),
            category: typeof item.category === 'string' ? item.category : 'Design',
            priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
            completed: Boolean(item.completed),
            description: typeof item.description === 'string' ? item.description : '',
            example: typeof item.example === 'string' ? item.example : '',
            references: Array.isArray(item.references) ? item.references.filter(ref => 
              ref && typeof ref === 'object' && ref.title && ref.url
            ) : []
          };

          // Use the existing migration function to map to default structure if possible
          return migrateChecklistItem(validatedItem);
        });

        // Create new project
        const newProject = {
          id: Date.now(),
          name: finalProjectName,
          checklist: migratedChecklist,
          createdAt: new Date().toISOString()
        };

        // Add project and set as current
        setProjects(prev => [...prev, newProject]);
        setCurrentProjectId(newProject.id);
        setImportSuccess(`Successfully imported "${finalProjectName}"`);
        setShowImportDialog(false);
        setShowExportMenu(false);

      } catch (error) {
        console.error('Import error:', error);
        setImportError(`Import failed: ${error.message}`);
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read the file');
    };

    reader.readAsText(file);
    
    // Reset the input value so the same file can be imported again
    event.target.value = '';
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
      'high': t('priorities.high'),
      'medium': t('priorities.medium'),
      'low': t('priorities.low')
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

  // Function to scroll to a specific category
  const scrollToCategory = (category) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <div className="app-container" ref={appContainerRef}>
      <div className="header">
        <div className="project-controls">
          <div className="project-name-section">
            {isEditingName ? (
              <form onSubmit={handleProjectNameSubmit} className="project-name-form">
                <input
                  type="text"
                  value={currentProject.name}
                  onChange={(e) => updateProjectName(e.target.value)}
                  placeholder={t('projectName')}
                  className="project-name-input"
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                />
              </form>
            ) : (
              <h2 
                className="project-name"
                onClick={() => setIsEditingName(true)}
                title={t('clickToEdit')}
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
                {t('projects')} ({projects.length})
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
                            title={t('deleteProject')}
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
                      placeholder={t('newProjectName')}
                      className="new-project-input"
                      onKeyPress={(e) => e.key === 'Enter' && createNewProject()}
                    />
                    <button 
                      className="create-project-btn"
                      onClick={createNewProject}
                      disabled={!newProjectName.trim()}
                    >
                      {t('create')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={resetCurrentProject} className="reset-button">
              {t('resetProject')}
            </button>
            <button 
              className="import-button"
              onClick={() => setShowImportDialog(true)}
            >
              {t('importProject')}
            </button>
            <div className="export-section">
              <button 
                className="export-button"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                {t('export')}
              </button>
              
              {showExportMenu && (
                <div className="export-dropdown">
                  <button onClick={exportToMarkdown} className="export-option">
                    {t('exportOptions.markdown')}
                  </button>
                  <button onClick={exportToJSON} className="export-option">
                    {t('exportOptions.json')}
                  </button>
                  <button onClick={exportToPDF} className="export-option">
                    {t('exportOptions.pdf')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Import Dialog */}
        {showImportDialog && (
          <div className="import-dialog-overlay" onClick={() => setShowImportDialog(false)}>
            <div className="import-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="import-dialog-header">
                <h3>{t('import.title')}</h3>
                <button 
                  className="import-dialog-close"
                  onClick={() => setShowImportDialog(false)}
                >
                  ×
                </button>
              </div>
              <div className="import-dialog-content">
                <p>{t('import.description')}</p>
                <div className="import-file-section">
                  <input
                    type="file"
                    id="import-file"
                    accept=".json"
                    onChange={importFromJSON}
                    className="import-file-input"
                  />
                  <label htmlFor="import-file" className="import-file-label">
                    {t('import.selectFile')}
                  </label>
                </div>
                {importError && (
                  <div className="import-message import-error">
                    {importError}
                  </div>
                )}
                {importSuccess && (
                  <div className="import-message import-success">
                    {importSuccess}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="title-section">
          <h1 className="title">{t('title')}</h1>
          <LanguageSelector />
        </div>
        <p className="subtitle">{t('subtitle')}</p>
        
        <div className="github-section">
          <a 
            href="https://github.com/your-checklist/your-api-checklist.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="Star us on GitHub!"
          >
            <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="github-text">
              {t('starOnGitHub')}
              {githubStars !== null && (
                <span className="github-stars">⭐ {githubStars}</span>
              )}
            </span>
          </a>
        </div>
        
        <div className="priority-filter">
          <label htmlFor="priority-select" className="filter-label">{t('filterByPriority')}</label>
          <select 
            id="priority-select"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="priority-select"
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="high">{t('highPriority')}</option>
            <option value="medium">{t('mediumPriority')}</option>
            <option value="low">{t('lowPriority')}</option>
          </select>
        </div>
      </div>
      
      <div className="category-navigation">
        <h3 className="category-nav-title">{t('quickNavigation')}</h3>
        <div className="category-nav-buttons">
          {Object.keys(groupedChecklist).map((category) => {
            const categoryItems = groupedChecklist[category];
            const categoryCompleted = categoryItems.filter(item => item.completed).length;
            const categoryTotal = categoryItems.length;
            
            return (
                              <button
                  key={category}
                  className="category-nav-button"
                  onClick={() => scrollToCategory(category)}
                  style={{
                    background: getCategoryColor(category),
                    color: getCategoryTextColor(category)
                  }}
                  title={t('goTo', { category, completed: categoryCompleted, total: categoryTotal })}
                >
                  <span className="category-nav-icon">{getCategoryIcon(category)}</span>
                  <span className="category-nav-name">{category}</span>
                </button>
            );
          })}
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
              <div key={category} className="category-section" id={`category-${category}`}>
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
                      title={`${categoryCompleted === categoryTotal && categoryTotal > 0 ? t('uncheckAll', { category }) : t('checkAll', { category })}`}
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
                              title={isExpanded ? t('hideDetails') : t('showDetails')}
                            >
                              {isExpanded ? '−' : '+'}
                            </button>
                          </div>
                          
                          {isExpanded && (
                            <div className="item-details">
                              <div className="item-description">
                                <p>{item.description || t('noDescription')}</p>
                                {item.example && (
                                  <div className="item-example">
                                    <strong>{t('example')}</strong> <code>{item.example}</code>
                                  </div>
                                )}
                              </div>
                              
                              {item.references && item.references.length > 0 && (
                                <div className="item-references">
                                  <strong>{t('learnMore')}</strong>
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
          <div className="stats-text">{t('progress')}</div>
          <div className="stats-number">{completedCount}/{totalCount}</div>
          <div className="stats-text">{t('completed', { percent: Math.round(progressPercentage) })}</div>
        </div>
      </div>
      
      <footer className="footer">
        <p className="footer-text">
          {t('builtWith')}{' '}
          <a 
            href="https://github.com/s1nyx" 
          target="_blank"
          rel="noopener noreferrer"
            className="footer-link"
          >
            Killian VINCENT
          </a>
        </p>
      </footer>
      
      {/* Vertical Navigation */}
      <div className="vertical-navigation" style={verticalNavStyle}>
        <div className="vertical-nav-buttons">
          {Object.keys(groupedChecklist).map((category) => {
            const categoryItems = groupedChecklist[category];
            const categoryCompleted = categoryItems.filter(item => item.completed).length;
            const categoryTotal = categoryItems.length;
            
            return (
              <button
                key={category}
                className="vertical-nav-button"
                onClick={() => scrollToCategory(category)}
                style={{
                  background: getCategoryColor(category),
                  color: getCategoryTextColor(category)
                }}
                title={t('goTo', { category, completed: categoryCompleted, total: categoryTotal })}
              >
                <span className="vertical-nav-icon">{getCategoryIcon(category)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

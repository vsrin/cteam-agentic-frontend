import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Download, Search, Edit, Play, Trash2, Copy, ArrowLeft } from 'lucide-react';

const AppCatalogView = ({ onCreateNew, onEdit, onDeploy, onBack }) => {
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [integrationFilter, setIntegrationFilter] = useState('All Integrations');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('tile');
  const [hoveredAction, setHoveredAction] = useState(null);

  // Add styles to document head for consistent tile styling
  React.useEffect(() => {
    const styleId = 'app-catalog-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .tile-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        
        .tile {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          height: fit-content;
        }
        
        .tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          border-color: #9ca3af;
        }
        
        .tile-header {
          padding: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .tile-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          flex-shrink: 0;
          border: 1px solid #e5e7eb;
        }
        
        .tile-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a202c;
          margin: 0;
          line-height: 1.3;
        }
        
        .tile-integration {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          background: #f8fafc;
          color: #475569;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid #e5e7eb;
        }
        
        .tile-body {
          padding: 1.25rem;
        }
        
        .tile-description {
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .tile-footer {
          padding: 1rem 1.25rem;
          background: #fafbfc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f1f5f9;
        }
        
        .tile-category {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }
        
        .tile-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-button {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .action-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #475569;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid;
        }
        
        .status-active {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }
        
        .status-testing {
          background: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        }
        
        .status-draft {
          background: #f8fafc;
          color: #475569;
          border-color: #e2e8f0;
        }
        
        @media (max-width: 768px) {
          .tile-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .tile-header {
            padding: 1rem;
          }
          
          .tile-body {
            padding: 1rem;
          }
          
          .tile-footer {
            padding: 0.75rem 1rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cleanup function to remove styles when component unmounts
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Sample app data based on your examples
  const sampleApps = [
    {
      id: 'APP-01',
      name: 'Submission Intake',
      description: 'Integrated 6 AI Agents to perform submission extraction, completeness checking, exposure insights, loss insights, appetite checks, business profile search and property evaluation. All agents offer powerful insights to assist and optimize commercial insurance intake workflow.',
      category: 'Underwriting',
      integration: 'ServiceNow Integration',
      integrationType: 'servicenow',
      status: 'Active',
      updated: '2 days ago',
      agentCount: 6,
      icon: 'submission'
    },
    {
      id: 'APP-02',
      name: 'Audit and Compliance Monitoring',
      description: 'AI Agents are deployed to proactively monitor audit and compliance checks across commercial insurance value chain starting with underwriting workflow.',
      category: 'Compliance',
      integration: 'Standalone Application',
      integrationType: 'standalone',
      status: 'Active',
      updated: '1 week ago',
      agentCount: 4,
      icon: 'audit'
    },
    {
      id: 'APP-03',
      name: 'Contract Compliance Optimizer',
      description: 'Commercial insurance contract compliance domain where domain specific AI agents built on our agentic studio are leveraged to optimize workflow and offer insights.',
      category: 'Compliance',
      integration: 'Standalone Application',
      integrationType: 'standalone',
      status: 'Testing',
      updated: '3 days ago',
      agentCount: 3,
      icon: 'contract'
    },
    {
      id: 'APP-04',
      name: 'Public Sector Underwriting Assistant',
      description: 'Leverages intelligent agents capable of automating information gathering for commercial insurance public sector underwriting and optimize workflows.',
      category: 'Underwriting',
      integration: 'Salesforce Integration',
      integrationType: 'salesforce',
      status: 'Active',
      updated: '5 days ago',
      agentCount: 5,
      icon: 'public'
    },
    {
      id: 'APP-05',
      name: 'Regulatory Compliance Checker',
      description: 'Leverages AI agents utilizing custom tools and knowledge assets to assist underwriters proactively to alert regulatory compliance related insights.',
      category: 'Compliance',
      integration: 'ServiceNow Integration',
      integrationType: 'servicenow',
      status: 'Draft',
      updated: '1 day ago',
      agentCount: 2,
      icon: 'regulatory'
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApps(sampleApps);
      setIsLoading(false);
    }, 500);
  }, []);

  // Helper function to show notifications
  const showNotification = useCallback((message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `${type}-notification`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, type === 'error' ? 4000 : 3000);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle integration filter change
  const handleIntegrationChange = (e) => {
    setIntegrationFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle actions
  const handleEdit = (app) => {
    if (onEdit) {
      onEdit(app);
    } else {
      showNotification(`Opening ${app.name} for editing...`);
    }
  };

  const handleDeploy = (app) => {
    if (onDeploy) {
      onDeploy(app);
    } else {
      showNotification(`Deploying ${app.name}...`);
    }
  };

  const handleClone = (app) => {
    const clonedApp = {
      ...app,
      id: `${app.id}-CLONE`,
      name: `${app.name} (Clone)`,
      status: 'Draft',
      updated: 'Just now'
    };
    setApps([clonedApp, ...apps]);
    showNotification(`${app.name} cloned successfully!`);
  };

  const handleDelete = async (app) => {
    if (window.confirm(`Are you sure you want to delete "${app.name}"?`)) {
      setApps(apps.filter(item => item.id !== app.id));
      showNotification(`${app.name} deleted successfully!`);
    }
  };

  // Filter apps based on search text and filter selections
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const searchMatch =
        searchText === '' ||
        app.name.toLowerCase().includes(searchText.toLowerCase()) ||
        app.description.toLowerCase().includes(searchText.toLowerCase()) ||
        app.category.toLowerCase().includes(searchText.toLowerCase());
      
      const categoryMatch = categoryFilter === 'All Categories' || app.category === categoryFilter;
      const integrationMatch = integrationFilter === 'All Integrations' || app.integration === integrationFilter;
      
      return searchMatch && categoryMatch && integrationMatch;
    });
  }, [apps, searchText, categoryFilter, integrationFilter]);

  // Get current page items
  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApps.slice(indexOfFirstItem, indexOfLastItem);

  // Extract unique categories and integrations for dropdowns
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(apps.map((app) => app.category))];
    return ['All Categories', ...uniqueCategories];
  }, [apps]);

  const integrations = useMemo(() => {
    const uniqueIntegrations = [...new Set(apps.map((app) => app.integration))];
    return ['All Integrations', ...uniqueIntegrations];
  }, [apps]);

  // Get icon for app type
  const getAppIcon = (iconType) => {
    switch (iconType) {
      case 'submission':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'audit':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'contract':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20L12 16L20 20V4C20 3.46957 19.7893 2.96086 19.4142 2.58579C19.0391 2.21071 18.5304 2 18 2H14Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'public':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'regulatory':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 15L9 12L12 9M3 12H9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
    }
  };

  // Get integration icon
  const getIntegrationIcon = (integrationType) => {
    switch (integrationType) {
      case 'servicenow':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1"/>
            <path d="M6 4V8M4 6H8" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      case 'salesforce':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4H10M2 6H10M2 8H10" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      default:
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="table-view">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          Loading applications...
        </div>
      </div>
    );
  }

  return (
    <div className="table-view">
      {/* Back Button */}
      {onBack && (
        <div className="back-container">
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }} />
            Back
          </button>
        </div>
      )}

      <div className="page-header">
        <h1>App Catalog</h1>
        <p>Discover and deploy AI-powered applications built with agents and workflows</p>
      </div>

      {/* Action buttons with view toggle */}
      <div className="page-actions">
        <div className="view-toggle-group">
          <button
            className={`view-toggle-btn ${viewMode === 'tile' ? 'active' : ''}`}
            onClick={() => setViewMode('tile')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="actions-right">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const jsonString = JSON.stringify(filteredApps, null, 2);
              const blob = new Blob([jsonString], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'app_catalog.json';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }}
          >
            <Download style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Export
          </button>
          <button className="btn btn-primary" onClick={onCreateNew}>
            <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            New App
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search apps..."
            className="form-control"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-selects">
          <select className="form-select" value={categoryFilter} onChange={handleCategoryChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className="form-select" value={integrationFilter} onChange={handleIntegrationChange}>
            {integrations.map((integration) => (
              <option key={integration} value={integration}>
                {integration}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional rendering based on view mode */}
      {viewMode === 'list' ? (
        // List View (Table)
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Integration</th>
                <th>Agents</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <button
                        onClick={() => handleEdit(app)}
                        className="tool-id-button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-color)',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: 'inherit',
                          fontFamily: 'inherit',
                          textAlign: 'left'
                        }}
                      >
                        {app.id}
                      </button>
                    </td>
                    <td>{app.name}</td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical' 
                      }}>
                        {app.description}
                      </div>
                    </td>
                    <td>{app.category}</td>
                    <td>{app.integration}</td>
                    <td>{app.agentCount} agents</td>
                    <td>
                      <span className={`status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{app.updated}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Edit */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleEdit(app)}
                            onMouseEnter={() => setHoveredAction(`edit-${app.id}`)}
                            onMouseLeave={() => setHoveredAction(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--secondary-color)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem'
                            }}
                          >
                            <Edit style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          {hoveredAction === `edit-${app.id}` && (
                            <div style={{
                              position: 'absolute',
                              backgroundColor: '#333',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              zIndex: 100,
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginBottom: '5px',
                              whiteSpace: 'nowrap'
                            }}>
                              Edit
                            </div>
                          )}
                        </div>

                        {/* Clone */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleClone(app)}
                            onMouseEnter={() => setHoveredAction(`clone-${app.id}`)}
                            onMouseLeave={() => setHoveredAction(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--secondary-color)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem'
                            }}
                          >
                            <Copy style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          {hoveredAction === `clone-${app.id}` && (
                            <div style={{
                              position: 'absolute',
                              backgroundColor: '#333',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              zIndex: 100,
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginBottom: '5px',
                              whiteSpace: 'nowrap'
                            }}>
                              Clone
                            </div>
                          )}
                        </div>

                        {/* Deploy */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleDeploy(app)}
                            onMouseEnter={() => setHoveredAction(`deploy-${app.id}`)}
                            onMouseLeave={() => setHoveredAction(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--secondary-color)',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem'
                            }}
                          >
                            <Play style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          {hoveredAction === `deploy-${app.id}` && (
                            <div style={{
                              position: 'absolute',
                              backgroundColor: '#333',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              zIndex: 100,
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginBottom: '5px',
                              whiteSpace: 'nowrap'
                            }}>
                              Deploy
                            </div>
                          )}
                        </div>

                        {/* Delete */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleDelete(app)}
                            onMouseEnter={() => setHoveredAction(`delete-${app.id}`)}
                            onMouseLeave={() => setHoveredAction(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#e53e3e',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem'
                            }}
                          >
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          {hoveredAction === `delete-${app.id}` && (
                            <div style={{
                              position: 'absolute',
                              backgroundColor: '#333',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              zIndex: 100,
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginBottom: '5px',
                              whiteSpace: 'nowrap'
                            }}>
                              Delete
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                    {apps.length === 0 ? (
                      <div>
                        No applications found. 
                        <button 
                          onClick={onCreateNew}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--accent-color)', 
                            textDecoration: 'underline', 
                            cursor: 'pointer', 
                            padding: '0 0.25rem' 
                          }}
                        >
                          Create your first app
                        </button>
                      </div>
                    ) : (
                      'No applications match your search criteria.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Enhanced Tile View
        <div className="tile-container">
          {currentItems.length > 0 ? (
            currentItems.map((app) => (
              <div key={app.id} className="tile" onClick={() => handleEdit(app)}>
                {/* Tile Header */}
                <div className="tile-header">
                  <div className="tile-icon">
                    {getAppIcon(app.icon)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h3 className="tile-title">{app.name}</h3>
                    </div>
                    <div className="tile-integration">
                      {getIntegrationIcon(app.integrationType)}
                      {app.integration}
                    </div>
                  </div>
                </div>

                {/* Tile Body */}
                <div className="tile-body">
                  <p className="tile-description">
                    {app.description}
                  </p>
                  
                  {/* App Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '0.375rem',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#1a202c',
                        marginBottom: '0.125rem' 
                      }}>
                        {app.agentCount}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        fontWeight: '500' 
                      }}>
                        AI Agents
                      </div>
                    </div>
                    <div style={{ 
                      width: '1px', 
                      background: '#e5e7eb',
                      margin: '0.25rem 0' 
                    }}></div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#1a202c',
                        marginBottom: '0.125rem' 
                      }}>
                        {Math.ceil(app.agentCount * 1.5)}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        fontWeight: '500' 
                      }}>
                        Tools
                      </div>
                    </div>
                    <div style={{ 
                      width: '1px', 
                      background: '#e5e7eb',
                      margin: '0.25rem 0' 
                    }}></div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        color: '#1a202c',
                        marginBottom: '0.125rem' 
                      }}>
                        {Math.ceil(app.agentCount * 0.8)}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280',
                        fontWeight: '500' 
                      }}>
                        Knowledge Assets
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                  }}>
                    <span>Updated {app.updated}</span>
                    <span style={{ 
                      color: '#6b7280',
                      fontWeight: '500'
                    }}>
                      {app.category}
                    </span>
                  </div>
                </div>

                {/* Tile Footer */}
                <div className="tile-footer">
                  <div className="tile-category">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: app.status === 'Active' ? '#22c55e' : 
                                   app.status === 'Testing' ? '#f59e0b' : '#6b7280'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                        {app.status === 'Active' ? 'Active' : 
                         app.status === 'Testing' ? 'In Progress' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  <div className="tile-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(app);
                      }}
                      title="Configure"
                    >
                      <Edit style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <button
                      className="action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeploy(app);
                      }}
                      title="Deploy"
                      style={{
                        background: '#1a202c',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#1a202c';
                      }}
                    >
                      <Play style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '4rem 2rem',
              color: '#718096'
            }}>
              {apps.length === 0 ? (
                <div>
                  <Search style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3 style={{ marginBottom: '0.5rem' }}>No Applications</h3>
                  <p style={{ marginBottom: '1.5rem' }}>Get started by creating your first application</p>
                  <button onClick={onCreateNew} className="btn btn-primary">
                    <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    New App
                  </button>
                </div>
              ) : (
                'No applications match your search criteria.'
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default AppCatalogView;
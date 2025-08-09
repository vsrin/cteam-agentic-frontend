import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Upload, Database, Search, Edit, Play, Trash2, Copy, ArrowLeft } from 'lucide-react';

const KnowledgeAssetsCatalogView = ({ onCreateNew, onEdit, onTest, onBack }) => {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('tile');
  const [hoveredAction, setHoveredAction] = useState(null);

  // Helper function to show inline notifications
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

  // Fetch knowledge bases function
  const fetchKnowledgeBases = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://16.170.162.72:5001/api/knowledge-bases');
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBases(data);
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      showNotification('Failed to load knowledge bases. Please refresh the page.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  // Fetch knowledge bases on component mount
  useEffect(() => {
    fetchKnowledgeBases();
  }, [fetchKnowledgeBases]);

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

  // Handle edit knowledge asset - route to builder
  const handleEdit = (kb) => {
    onEdit(kb);
  };

  // Handle test knowledge asset - route to builder in test mode
  const handleTest = (kb) => {
    onTest(kb);
  };

  // Handle clone knowledge asset - route to builder with cloned data
  const handleClone = (kb) => {
    const clonedKB = {
      ...kb,
      id: undefined,
      name: `Clone of ${kb.name}`,
      fileCount: 0
    };
    onEdit(clonedKB); // Route to builder with cloned data
  };

  // Handle delete knowledge asset
  const handleDelete = async (kb) => {
    if (window.confirm(`Are you sure you want to delete "${kb.name}"?`)) {
      try {
        const response = await fetch(`http://16.170.162.72:5001/api/knowledge-bases/${kb.id}`, { 
          method: 'DELETE' 
        });
        if (response.ok) {
          setKnowledgeBases(knowledgeBases.filter(item => item.id !== kb.id));
          showNotification('Knowledge base deleted successfully!');
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error('Error deleting knowledge base:', error);
        showNotification('Failed to delete knowledge base. Please try again.', 'error');
      }
    }
  };

  // Filter knowledge bases based on search text and filter selections
  const filteredKnowledgeBases = useMemo(() => {
    return knowledgeBases.filter((kb) => {
      const searchMatch =
        searchText === '' ||
        kb.name.toLowerCase().includes(searchText.toLowerCase()) ||
        kb.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (kb.embeddingModel && kb.embeddingModel.toLowerCase().includes(searchText.toLowerCase()));
      
      const categoryMatch = categoryFilter === 'All Categories' || kb.vectorStore === categoryFilter;
      
      return searchMatch && categoryMatch;
    });
  }, [knowledgeBases, searchText, categoryFilter]);

  // Get current page items (simplified pagination)
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKnowledgeBases.slice(indexOfFirstItem, indexOfLastItem);

  // Extract unique categories for dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(knowledgeBases.map((kb) => kb.vectorStore))];
    return ['All Categories', ...uniqueCategories];
  }, [knowledgeBases]);

  // Get icon for knowledge base type
  const getKnowledgeBaseIcon = () => {
    return (
      <Database className="h-6 w-6" />
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

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
        <h1>Knowledge Assets</h1>
        <p>Browse and manage your knowledge assets for AI-powered retrieval and generation</p>
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
          <button className="btn btn-primary" onClick={onCreateNew}>
            <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Create Knowledge Asset
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search knowledge assets..."
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
        </div>
      </div>

      {/* Conditional rendering based on view mode */}
      {viewMode === 'list' ? (
        // List View (Table)
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Vector Store</th>
                <th>Embedding Model</th>
                <th>Files</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((kb) => (
                  <tr key={kb.id}>
                    <td>
                      <button
                        onClick={() => handleEdit(kb)}
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
                        {kb.name}
                      </button>
                    </td>
                    <td>{kb.description}</td>
                    <td>{kb.vectorStore}</td>
                    <td>{kb.embeddingModel}</td>
                    <td>{kb.fileCount}</td>
                    <td>{formatDate(kb.updatedAt)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Edit */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleEdit(kb)}
                            onMouseEnter={() => setHoveredAction(`edit-${kb.id}`)}
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
                          {hoveredAction === `edit-${kb.id}` && (
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
                            onClick={() => handleClone(kb)}
                            onMouseEnter={() => setHoveredAction(`clone-${kb.id}`)}
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
                          {hoveredAction === `clone-${kb.id}` && (
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

                        {/* Test */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleTest(kb)}
                            onMouseEnter={() => setHoveredAction(`test-${kb.id}`)}
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
                          {hoveredAction === `test-${kb.id}` && (
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
                              Test
                            </div>
                          )}
                        </div>

                        {/* Delete */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => handleDelete(kb)}
                            onMouseEnter={() => setHoveredAction(`delete-${kb.id}`)}
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
                          {hoveredAction === `delete-${kb.id}` && (
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    {knowledgeBases.length === 0 ? (
                      <div>
                        No knowledge assets found. 
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
                          Create your first knowledge asset
                        </button>
                      </div>
                    ) : (
                      'No knowledge assets match your search criteria.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Tile View
        <div className="tile-container">
          {currentItems.length > 0 ? (
            currentItems.map((kb) => (
              <div key={kb.id} className="tile" onClick={() => handleEdit(kb)}>
                {/* Tile Header */}
                <div className="tile-header">
                  <div className="tile-icon">{getKnowledgeBaseIcon()}</div>
                  <div style={{ flex: 1 }}>
                    <h3 className="tile-title">{kb.name}</h3>
                    <div className="tile-id" style={{ fontSize: '0.75rem', color: 'var(--secondary-color)' }}>
                      {kb.embeddingModel}
                    </div>
                  </div>
                  <span className="status-badge status-active">
                    {kb.vectorStore}
                  </span>
                </div>

                {/* Tile Body */}
                <div className="tile-body">
                  <p className="tile-description">{kb.description}</p>
                  <div style={{ 
                    marginTop: '0.75rem', 
                    fontSize: '0.875rem', 
                    color: 'var(--secondary-color)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{kb.fileCount} files</span>
                    <span>{formatDate(kb.updatedAt)}</span>
                  </div>
                </div>

                {/* Tile Footer */}
                <div className="tile-footer">
                  <div className="tile-category">
                    <Upload style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                    Knowledge Asset
                  </div>

                  <div className="tile-actions" onClick={(e) => e.stopPropagation()}>
                    {/* Edit */}
                    <div style={{ position: 'relative' }}>
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(kb);
                        }}
                        onMouseEnter={() => setHoveredAction(`edit-tile-${kb.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                      >
                        <Edit style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      {hoveredAction === `edit-tile-${kb.id}` && (
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

                    {/* Test */}
                    <div style={{ position: 'relative' }}>
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTest(kb);
                        }}
                        onMouseEnter={() => setHoveredAction(`test-tile-${kb.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                      >
                        <Play style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      {hoveredAction === `test-tile-${kb.id}` && (
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
                          Test
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '4rem 2rem',
              color: 'var(--secondary-color)'
            }}>
              {knowledgeBases.length === 0 ? (
                <div>
                  <Database style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3 style={{ marginBottom: '0.5rem' }}>No Knowledge Assets</h3>
                  <p style={{ marginBottom: '1.5rem' }}>Get started by creating your first knowledge asset</p>
                  <button onClick={onCreateNew} className="btn btn-primary">
                    <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    Create Knowledge Asset
                  </button>
                </div>
              ) : (
                'No knowledge assets match your search criteria.'
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

export default KnowledgeAssetsCatalogView;
import React, { useState, useMemo, useEffect } from 'react';
import AddToolView from './AddToolView';
import Pagination from './Pagination';
import api from '../axios/api';

const ToolChestView = () => {
  // State to track if we're in add tool mode
  const [isAddingTool, setIsAddingTool] = useState(false);
  // State to track the selected tool for editing
  const [selectedTool, setSelectedTool] = useState(null);
  // State for tools data
  const [tools, setTools] = useState([]);
  // State for search and filters
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [typeFilter, setTypeFilter] = useState('All Types');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // View mode state (default to tile view)
  const [viewMode, setViewMode] = useState('tile');
  // Tooltip state
  const [hoveredAction, setHoveredAction] = useState(null);
  // Dropdown state for adding tool type
  const [showDropdown, setShowDropdown] = useState(false);
  // State to hold the type of tool being added
  const [currentAddToolType, setCurrentAddToolType] = useState('');
  // Loading state for save operations
  const [isSaving, setIsSaving] = useState(false);

  // Enhanced notification function with better styling and positioning
  const showNotification = (message, type = 'success') => {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.inline-notification');
    existingNotifications.forEach(notification => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    });

    const notification = document.createElement('div');
    notification.className = `inline-notification ${type}-notification`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">
          ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Add inline styles for the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      padding: 0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
      border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
      color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 1.4;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-in-out;
    `;

    // Style the notification content
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 8px;
    `;

    // Style the icon
    const icon = notification.querySelector('.notification-icon');
    icon.style.cssText = `
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
    `;

    // Style the message
    const messageEl = notification.querySelector('.notification-message');
    messageEl.style.cssText = `
      flex: 1;
      margin: 0;
    `;

    // Style the close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      margin-left: 8px;
      opacity: 0.7;
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: inherit;
    `;

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '1';
      closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.opacity = '0.7';
      closeBtn.style.backgroundColor = 'transparent';
    });

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto-remove notification
    const autoRemoveTime = type === 'error' ? 5000 : 4000;
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, autoRemoveTime);
  };

  // Link-like button style
  const actionButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--accent-color, #3182CE)',
    padding: '0',
    margin: '0',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 'inherit',
    fontFamily: 'inherit',
  };

  // Fetch tools from API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await api.get('/admin/tool-chest/');
        if (response.status !== 200 || !response.data) throw new Error('Failed to fetch tools');

        const fetchedTools = response.data.map((tool, index) => ({
          id: tool.tool_id || `TL-${String(index + 1).padStart(3, '0')}`,
          tool_id: tool.tool_id,
          name: tool.tool_name || '',
          description: tool.description || `Automated process using ${tool.tool_name}`,
          category: tool.category || 'Custom',
          creator: tool.creator || 'System Generated',
          type: tool.type || 'github',
          updated: tool.date_added ? new Date(tool.date_added).toISOString().split('T')[0] : '',
          github_url: tool.github_url || '',
          requires_env_vars: tool.requires_env_vars || [],
          dependencies: tool.dependencies || [],
          uses_llm: tool.uses_llm || false,
          default_llm_model: tool.default_llm_model || '',
          default_system_instructions: tool.default_system_instructions || '',
          structured_output: tool.structured_output || false,
          input_schema: tool.input_schema || {},
          output_schema: tool.output_schema || {},
          config: tool.config || {},
          direct_to_user: tool.direct_to_user || false,
          respond_back_to_agent: tool.respond_back_to_agent || false,
          response_type: tool.response_type || '',
          call_back_url: tool.call_back_url || '',
          database_config_uri: tool.database_config_uri || '',
        }));

        setTools(fetchedTools);
      } catch (error) {
        console.error('Error fetching tools:', error);
        showNotification('Failed to load tools. Please refresh the page.', 'error');
      }
    };

    fetchTools();
  }, []);

  // Function to handle adding a new tool
  const handleAddTool = () => {
    setShowDropdown(true);
  };

  // Function to handle clicking on "Github Link" in the dropdown
  const handleAddGithubTool = () => {
    setIsAddingTool(true);
    setSelectedTool(null);
    setCurrentAddToolType('github');
    setShowDropdown(false);
  };

  // Function to handle clicking on "Tool API" in the dropdown
  const handleAddApiTool = () => {
    setIsAddingTool(true);
    setSelectedTool(null);
    setCurrentAddToolType('api');
    setShowDropdown(false);
  };

  // Function to handle editing an existing tool
  const handleEditTool = (tool) => {
    setSelectedTool(tool);
    setIsAddingTool(true);
    setCurrentAddToolType(tool.type);
  };

  // Function to handle going back to the tool list
  const handleBack = () => {
    setIsAddingTool(false);
    setSelectedTool(null);
    setCurrentAddToolType('');
  };

  // Function to handle saving a new or edited tool
  const handleSaveTool = async (toolData) => {
    // Prevent multiple simultaneous saves
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      
      if (selectedTool) {
        // Update existing tool
        const response = await api.put(`/admin/tool-chest/update-tool/${toolData.tool_id}`, toolData);
        
        // Check for successful response status codes
        if (response.status === 200 || response.status === 204) {
          const updatedTools = tools.map((tool) =>
            tool.id === selectedTool.id
              ? { ...toolData, id: tool.id, updated: new Date().toISOString().split('T')[0] }
              : tool
          );
          setTools(updatedTools);
          console.log('Tool updated successfully:', response.data);
          showNotification('Tool updated successfully!', 'success');
          
          // Return to the tool list view after successful update
          setIsAddingTool(false);
          setSelectedTool(null);
          setCurrentAddToolType('');
        } else {
          throw new Error(`Update failed with status: ${response.status}`);
        }
      } else {
        // Add new tool
        const newId = `TL-${String(tools.length + 1).toString().padStart(3, '0')}`;
        const newTool = {
          id: newId,
          tool_id: newId,
          name: toolData.name,
          description: toolData.description,
          category: toolData.category || 'Custom',
          creator: toolData.creator || 'Current User',
          type: toolData.type || currentAddToolType,
          updated: new Date().toISOString().split('T')[0],
          github_url: toolData.github_url || `https://github.com/artifi-ai/tools/${toolData.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...toolData,
        };

        const response = await api.post('/admin/tool-chest/add-tool', newTool);
        
        // Check for successful response status codes
        if (response.status === 200 || response.status === 201) {
          setTools([newTool, ...tools]);
          console.log('Tool added successfully:', response.data);
          showNotification('Tool created successfully!', 'success');
          
          // Return to the tool list view after successful creation
          setIsAddingTool(false);
          setSelectedTool(null);
          setCurrentAddToolType('');
        } else {
          throw new Error(`Creation failed with status: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error saving tool:', error);
      
      // Enhanced error handling with more specific messages
      let errorMessage;
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || error.response.data?.error || 
                      `Server error (${error.response.status}): ${selectedTool ? 'Failed to update tool' : 'Failed to create tool'}`;
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error: Unable to connect to server. Please check your connection and try again.';
      } else {
        // Other error
        errorMessage = selectedTool ? 'Failed to update tool. Please try again.' : 'Failed to create tool. Please try again.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

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

  // Handle type filter change
  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Change items per page
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'tile' : 'list');
  };

  // Enhanced export function with inline notifications instead of browser popups
  const handleExportTools = () => {
    try {
      const jsonString = JSON.stringify(filteredTools, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'tool_catalog.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      // Show inline notification instead of browser popup
      showNotification('Tool catalog exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting tools:', error);
      showNotification('Failed to export tool catalog. Please try again.', 'error');
    }
  };

  // Filter tools based on search text and filter selections using useMemo for performance
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const searchMatch =
        searchText === '' ||
        tool.id.toLowerCase().includes(searchText.toLowerCase()) ||
        tool.name.toLowerCase().includes(searchText.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchText.toLowerCase());
      const categoryMatch = categoryFilter === 'All Categories' || tool.category === categoryFilter;
      const typeMatch = typeFilter === 'All Types' || tool.type === typeFilter;
      return searchMatch && categoryMatch && typeMatch;
    });
  }, [tools, searchText, categoryFilter, typeFilter]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTools.slice(indexOfFirstItem, indexOfLastItem);

  // Extract unique categories and types for dropdowns
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(tools.map((tool) => tool.category))];
    return ['All Categories', ...uniqueCategories];
  }, [tools]);

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(tools.map((tool) => tool.type))];
    return ['All Types', ...uniqueTypes];
  }, [tools]);

  // Helper function to get icon for tool type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Python':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 7V15M8 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case 'API':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0436 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33397 21.9434 7.02299C21.932 5.71201 21.4057 4.46016 20.4792 3.53368C19.5527 2.60719 18.3009 2.08082 16.9899 2.06941C15.6789 2.05801 14.4159 2.56198 13.47 3.47L11.75 5.18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3935 9.60707C11.7643 9.26331 11.0685 9.05886 10.3534 9.00765C9.63822 8.95643 8.92037 9.05961 8.24866 9.31017C7.57696 9.56073 6.96689 9.95292 6.46 10.46L3.46 13.46C2.54919 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59434 19.5398 3.52082 20.4663C4.44731 21.3928 5.69917 21.9192 7.01015 21.9306C8.32113 21.942 9.58415 21.438 10.53 20.53L12.24 18.82"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  };

  // If we're in add/edit tool mode, show the add tool view
  if (isAddingTool) {
    return (
      <AddToolView
        onBack={handleBack}
        onSave={handleSaveTool}
        initialToolData={selectedTool}
        type={selectedTool ? selectedTool.type : currentAddToolType}
        isSaving={isSaving}
        showNotification={showNotification} // Pass the notification function to AddToolView
      />
    );
  }

  // Otherwise, show the tool list view
  return (
    <div className="table-view">
      <div className="page-header">
        <h1>Tool Chest</h1>
        <p>Specialized tools and APIs for insurance processing</p>
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

        <div className="actions-right flex items-center space-x-4">
          <button className="btn btn-secondary" onClick={handleExportTools}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 11.5L8 2M8 11.5L5 9M8 11.5L11 9M13 14.5H3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-primary" onClick={() => setShowDropdown(!showDropdown)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 3.33333V12.6667M3.33333 8H12.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add Tool
            </button>
            {showDropdown && (
              <div
                className="dropdown"
                style={{
                  position: 'absolute',
                  zIndex: 10,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  marginTop: '5px',
                  right: 0,
                }}
              >
                <button
                  className="btn btn-light btn-sm"
                  style={{ display: 'block', width: '100%', textAlign: 'left' }}
                  onClick={handleAddGithubTool}
                >
                  Github Link
                </button>
                <button
                  className="btn btn-light btn-sm"
                  style={{ display: 'block', width: '100%', textAlign: 'left' }}
                  onClick={handleAddApiTool}
                >
                  Tool API
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tools..."
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
          <select className="form-select" value={typeFilter} onChange={handleTypeChange}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
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
                <th>Creator</th>
                <th>Type</th>
                <th>Updated</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((tool) => (
                  <tr key={tool.id}>
                    <td>
                      <button
                        onClick={() => handleEditTool(tool)}
                        className="tool-id-button"
                        style={actionButtonStyle}
                      >
                        {tool.id}
                      </button>
                    </td>
                    <td>{tool.name}</td>
                    <td>{tool.description}</td>
                    <td>{tool.category}</td>
                    <td>{tool.creator}</td>
                    <td>
                      <span className="type-badge">{tool.type}</span>
                    </td>
                    <td>{tool.updated}</td>
                    <td className="link-cell">
                      <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className="github-link">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: '6px' }}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                            fill="currentColor"
                          />
                        </svg>
                        GitHub
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No tools match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Tile View (Modified to remove tool ID)
        <div className="tile-container">
          {currentItems.length > 0 ? (
            currentItems.map((tool) => (
              <div key={tool.id} className="tile" onClick={() => handleEditTool(tool)}>
                {/* Tile Header */}
                <div className="tile-header tool-tile-header">
                  <div className="tile-icon">{getTypeIcon(tool.type)}</div>
                  <div>
                    <h3 className="tile-title">{tool.name}</h3>
                    <span className={`status-badge status-active`}>
                      {tool.type}
                    </span>
                  </div>
                </div>

                {/* Tile Body */}
                <div className="tile-body">
                  <p className="tile-description">{tool.description}</p>
                </div>

                {/* Tile Footer */}
                <div className="tile-footer">
                  <div className="tile-category">
                    <span className="category-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M7.5 13.5L2.5 8.5L7.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.5 13.5L8.5 8.5L13.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {tool.category}
                  </div>

                  <div className="tile-actions" onClick={(e) => e.stopPropagation()}>
                    {/* GitHub Link */}
                    <div className="tooltip-container">
                      <a
                        href={tool.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button"
                        onMouseEnter={() => setHoveredAction(`github-${tool.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        aria-label="GitHub"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                            fill="currentColor"
                          />
                        </svg>
                      </a>
                      {hoveredAction === `github-${tool.id}` && <div className="tooltip-text">GitHub</div>}
                    </div>

                    {/* Edit Button */}
                    <div className="tooltip-container">
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTool(tool);
                        }}
                        onMouseEnter={() => setHoveredAction(`edit-${tool.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        aria-label="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M11.0399 2.29004L13.7099 5.00004C13.8999 5.19004 13.8999 5.50004 13.7099 5.69004L7.70994 11.69L4.85994 12.12C4.41994 12.19 4.03994 11.82 4.10994 11.38L4.53994 8.53004L10.5399 2.53004C10.7299 2.34004 11.0399 2.34004 11.2299 2.53004H11.0399V2.29004Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.89001 3.12012L12.88 6.11012"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {hoveredAction === `edit-${tool.id}` && <div className="tooltip-text">Edit</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No tools match your search criteria.</div>
          )}
        </div>
      )}

      {/* Add Pagination Component */}
      <Pagination
        totalItems={filteredTools.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default ToolChestView;
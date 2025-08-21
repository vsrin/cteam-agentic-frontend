import React, { useState, useEffect, useMemo } from 'react';
import api from '../axios/api'; // Re-use original axios instance
import Pagination from './Pagination';

const AgentCatalogView = ({ onAgentClick }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('tile');

  // Fetch agents from backend
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/agent-catelog/');
        console.log(res)
        const mappedAgents = res.data.map((agent, index) => ({
          id: `AG-${String(index + 1).padStart(2, '0')}`,
          agent_id: agent.AgentID,
          name: agent.AgentName,
          description: agent.AgentDesc,
          Configuration: agent.Configuration,
          // FIX: Properly detect manager agents from backend data
          AgentType: agent.AgentType, // Keep the original AgentType
          isManagerAgent: agent.AgentType === 'manager' || agent.isManagerAgent || false,
          managedAgentsCount: agent.Configuration?.managed_agents?.length || 0,
          category: agent.Configuration?.category || 'General', // Use backend category if available
          creator: agent.Configuration?.creator || 'System',
          status: agent.Configuration?.status || 'Active',
          updated: new Date(agent.CreatedOn).toISOString().split('T')[0],
          role: agent.Configuration?.function_description || '',
          instructions: agent.Configuration?.system_message || '',
          tools: agent.Configuration?.tools || [],
          knowledge_base: agent.knowledge_base || '',
          examples: agent.examples || `Example 1: Use ${agent.AgentName} for its function\nExample 2: Sample scenario for ${agent.AgentName}`
        }));
        setAgents(mappedAgents);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch agents. Please try again.');
        setLoading(false);
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgents();
  }, []);

  // Generate unique agent ID
  const generateUniqueAgentId = () => {
    const highestId = agents.reduce((max, agent) => {
      const idNumber = parseInt(agent.id.split('-')[1]);
      return idNumber > max ? idNumber : max;
    }, 0);
    return `AG-${String(highestId + 1).padStart(2, '0')}`;
  };

  // Handle actions
  const handleNewAgentClick = () => {
    onAgentClick(null);
  };

  const handleAgentIdClick = (agent) => {
    onAgentClick(agent);
  };

  const handleTestClick = (agent) => {
    onAgentClick(agent, true);  // Pass true to indicate test mode
  };

  const handleCloneClick = async (agent) => {
    try {
      // Create a clone of the agent with updated properties
      const clonedAgent = {
        ...agent,
        id: generateUniqueAgentId(),
        agent_id: `${agent.agent_id}_clone`,
        name: `${agent.name} Clone`,
        status: 'Testing',
        updated: new Date().toISOString().split('T')[0]
      };

      // Create the backend agent object
      const backendAgent = {
        AgentID: clonedAgent.agent_id,
        AgentName: clonedAgent.name,
        AgentDesc: clonedAgent.description,
        Configuration: {
          function_description: clonedAgent.role,
          system_message: clonedAgent.instructions,
          tools: clonedAgent.tools,
          category: clonedAgent.category,
          creator: clonedAgent.creator,
          status: clonedAgent.status,
          // Make sure to include any other Configuration properties that might be needed
        },
        knowledge_base: clonedAgent.knowledge_base,
        CreatedOn: new Date().toISOString()
      };

      // Save the cloned agent to the backend
      const res = await api.post('/admin/agent-catelog/', backendAgent);
      
      // Add the new agent to the list
      setAgents([clonedAgent, ...agents]);
      
      // Navigate to the Progressive Agent Builder with the cloned agent
      onAgentClick(clonedAgent);
      
    } catch (err) {
      console.error('Error cloning agent:', err);
      alert('Failed to clone agent. Please try again.');
    }
  };

  // Handle filters and pagination
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const searchMatch = searchText === '' ||
        agent.id.toLowerCase().includes(searchText.toLowerCase()) ||
        agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchText.toLowerCase());
      const categoryMatch = categoryFilter === 'All Categories' || agent.category === categoryFilter;
      const statusMatch = statusFilter === 'All Statuses' || agent.status === statusFilter;
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [agents, searchText, categoryFilter, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(agents.map(agent => agent.category))];
    return ['All Categories', ...uniqueCategories];
  }, [agents]);

  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(agents.map(agent => agent.status))];
    return ['All Statuses', ...uniqueStatuses];
  }, [agents]);

  // Category icons (unchanged from new code)
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Data Privacy':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Data Extraction':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Risk Analysis':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Claims Analysis':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Data Quality':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Pricing':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'Communication':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12H12.01M12 6H12.01M12 18H12.01M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12ZM13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17C12.5523 17 13 17.4477 13 18ZM13 6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6C11 5.44772 11.4477 5 12 5C12.5523 5 13 5.44772 13 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  // NEW: Manager Agent Icon
  const getManagerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 11L19 13L23 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (loading) {
    return <div>Loading agents...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="table-view">
      <div className="page-header">
        <h1>Agent Catalog</h1>
        <p>Pre-built AI agents for commercial insurance workflows</p>
      </div>

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

        <div>
          <button
            className="btn btn-secondary mr-2"
            onClick={() => {
              const jsonString = JSON.stringify(filteredAgents, null, 2);
              const blob = new Blob([jsonString], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'agent_catalog.json';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 11.5L8 2M8 11.5L5 9M8 11.5L11 9M13 14.5H3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="btn btn-primary" onClick={handleNewAgentClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3.33333V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New Agent
          </button>
        </div>
      </div>

      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search agents..."
            className="form-control"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-selects">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="form-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <button
                        onClick={() => handleAgentIdClick(agent)}
                        className="agent-id-link"
                      >
                        {agent.id}
                        {/* NEW: Manager indicator in list view */}
                        {agent.isManagerAgent && (
                          <span className="manager-indicator-small" title="Manager Agent">
                            {getManagerIcon()}
                          </span>
                        )}
                      </button>
                    </td>
                    <td>
                      {agent.name}
                      {/* NEW: Show managed agents count */}
                      {agent.isManagerAgent && agent.managedAgentsCount > 0 && (
                        <span className="count-badge" title={`Manages ${agent.managedAgentsCount} agents`}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 8.5L8 11L14.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {agent.managedAgentsCount}
                        </span>
                      )}
                    </td>
                    <td>{agent.description}</td>
                    <td>{agent.category}</td>
                    <td>{agent.creator}</td>
                    <td>
                      <span className={`status-badge status-${agent.status.toLowerCase().replace(' ', '-')}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td>{agent.updated}</td>
                    <td className="link-cell">
                      <div className="action-icon-container">
                        <button
                          className="action-button"
                          onClick={() => handleAgentIdClick(agent)}
                          aria-label="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.5 3H3.5C2.67157 3 2 3.67157 2 4.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V6.5L9.5 3Z"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9.5 3V6.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="tooltip">Edit</div>
                      </div>
                      <div className="action-icon-container">
                        <button
                          className="action-button"
                          onClick={() => handleCloneClick(agent)}
                          aria-label="Clone"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="7" y="7" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="tooltip">Clone</div>
                      </div>
                      <div className="action-icon-container">
                        <button
                          className="action-button"
                          onClick={() => handleTestClick(agent)}
                          aria-label="Test"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div className="tooltip">Test</div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No agents match your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tile-container">
          {currentItems.length > 0 ? (
            currentItems.map((agent) => (
              <div
                key={agent.id}
                className="tile"
                onClick={() => handleAgentIdClick(agent)}
              >
                <div className="tile-header agent-tile-header">
                  <div className="tile-icon">
                    {getCategoryIcon(agent.category)}
                  </div>
                  <div>
                    <h3 className="tile-title">
                      {agent.name}
                      {/* NEW: Manager indicator in tile view */}
                      {agent.isManagerAgent && (
                        <span className="manager-indicator" title="Manager Agent">
                          {getManagerIcon()}
                        </span>
                      )}
                    </h3>
                    <span className={`status-badge status-${agent.status.toLowerCase().replace(' ', '-')}`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
                <div className="tile-body">
                  <p className="tile-description">{agent.description}</p>
                  {/* NEW: Show managed agents count in tile */}
                  {agent.isManagerAgent && agent.managedAgentsCount > 0 && (
                    <div className="manager-info">
                      <span className="count-badge" title={`Manages ${agent.managedAgentsCount} agents`}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.5 8.5L8 11L14.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Manages {agent.managedAgentsCount} agent{agent.managedAgentsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="tile-footer">
                  <div className="tile-category">
                    <span className="category-icon">
                      {getCategoryIcon(agent.category)}
                    </span>
                    {agent.category}
                  </div>
                  <div className="tile-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="action-icon-container">
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentIdClick(agent);
                        }}
                        aria-label="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.5 3H3.5C2.67157 3 2 3.67157 2 4.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V6.5L9.5 3Z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9.5 3V6.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="tooltip">Edit</div>
                    </div>
                    <div className="action-icon-container">
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneClick(agent);
                        }}
                        aria-label="Clone"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="7" y="7" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="tooltip">Clone</div>
                    </div>
                    <div className="action-icon-container">
                      <button
                        className="action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestClick(agent);
                        }}
                        aria-label="Test"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 8L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <div className="tooltip">Test</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              No agents match your search criteria.
            </div>
          )}
        </div>
      )}

      <Pagination
        totalItems={filteredAgents.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default AgentCatalogView;
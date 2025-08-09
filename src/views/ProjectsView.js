import React, { useState, useMemo, useEffect } from 'react';
import Pagination from './Pagination';
import api from '../axios/api';

const ProjectsView = () => {
  // State for projects data
  const [projects, setProjects] = useState([]);
  // State for view mode (default to tile view)
  const [viewMode, setViewMode] = useState('tile');
  // State for search and filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [authorFilter, setAuthorFilter] = useState('All Authors');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Tooltip state
  const [hoveredAction, setHoveredAction] = useState(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/admin/projects/');
        if (response.status !== 200 || !response.data) throw new Error('Failed to fetch projects');

        const formattedProjects = response.data.map((project, index) => ({
          id: project.id || `PRJ-${String(index + 1).padStart(3, '0')}`,
          name: project.name || 'Unnamed Project',
          description: project.description || 'No description available',
          author: project.author || 'Artifi',
          status: project.status || 'Active',
          recipes: project.recipes || 0,
          updated: project.updated
            ? new Date(project.updated).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Failed to fetch projects. Please try again.');
      }
    };

    fetchProjects();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle author filter change
  const handleAuthorChange = (e) => {
    setAuthorFilter(e.target.value);
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

  // Extract unique statuses for dropdown
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(projects.map((project) => project.status))];
    return ['All Statuses', ...uniqueStatuses];
  }, [projects]);

  // Extract unique authors for dropdown
  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(projects.map((project) => project.author))];
    return ['All Authors', ...uniqueAuthors];
  }, [projects]);

  // Filter projects based on search text and filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchMatch =
        searchText === '' ||
        project.id.toLowerCase().includes(searchText.toLowerCase()) ||
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase());
      const statusMatch = statusFilter === 'All Statuses' || project.status === statusFilter;
      const authorMatch = authorFilter === 'All Authors' || project.author === authorFilter;
      return searchMatch && statusMatch && authorMatch;
    });
  }, [projects, searchText, statusFilter, authorFilter]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  // Handle click on "New Project" button
  const handleNewProjectClick = () => {
    console.log('Create new project');
    // TODO: Navigate to a project creation view or send a POST request to create a new project
  };

  // Handle action clicks
  const handleEditClick = (project) => {
    console.log('Edit project:', project.id);
    // TODO: Navigate to an edit view or send a PUT request to update the project
  };

  const handleCloneClick = async (project) => {
    try {
      const newId = `PRJ-${String(projects.length + 1).padStart(3, '0')}`;
      const clonedProject = {
        ...project,
        id: newId,
        name: `${project.name} (Clone)`,
        updated: new Date().toISOString().split('T')[0],
      };

      // Send POST request to clone the project
      const response = await api.post('/admin/projects/clone', clonedProject);
      if (response.status === 200 || response.status === 201) {
        setProjects([clonedProject, ...projects]);
        console.log('Project cloned successfully:', response.data);
      }
    } catch (error) {
      console.error('Error cloning project:', error);
      // Fallback to local state update if API is not available
      const newId = `PRJ-${String(projects.length + 1).padStart(3, '0')}`;
      const clonedProject = {
        ...project,
        id: newId,
        name: `${project.name} (Clone)`,
        updated: new Date().toISOString().split('T')[0],
      };
      setProjects([clonedProject, ...projects]);
      alert('Failed to clone project via API. Cloned locally instead.');
    }
  };

  const handleDeleteClick = async (projectId) => {
    try {
      // Send DELETE request to remove the project
      const response = await api.delete(`/admin/projects/${projectId}`);
      if (response.status === 200 || response.status === 204) {
        const updatedProjects = projects.filter((project) => project.id !== projectId);
        setProjects(updatedProjects);
        console.log('Project deleted successfully:', projectId);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      // Fallback to local state update if API is not available
      const updatedProjects = projects.filter((project) => project.id !== projectId);
      setProjects(updatedProjects);
      alert('Failed to delete project via API. Deleted locally instead.');
    }
  };

  // Helper function to get icon for project type
  const getProjectIcon = (project) => {
    if (project.name.includes('Commercial') || project.name.includes('Property')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3 21H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 21V7L13 3V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 21V10L13 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 17V17.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 13V13.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (project.name.includes('Auto')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 17H17V19.5C17 20.3284 16.3284 21 15.5 21H8.5C7.67157 21 7 20.3284 7 19.5V17Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 11H19L18 3H6L5 11Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 11L3 17H21L19 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 14H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 14H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (project.name.includes('Workers Compensation')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (project.name.includes('BOP') || project.name.includes('Business')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 22H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 2H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="5"
            y="2"
            width="14"
            height="20"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 18.5V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 18.5V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 18.5V19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 14.5V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14.5V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 14.5V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 10.5V11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 10.5V11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 10.5V11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 6.5V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 6.5V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 6.5V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else if (project.name.includes('Liability')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 16V16.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 9V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 13L12 18H9V15L14 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 6L18 8L22 4L20 2L16 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
  };

  // Render action buttons with proper structure
  const renderActionButtons = (project, inTile = false) => {
    const containerClass = inTile ? 'tile-actions' : 'link-cell';
    return (
      <div
        className={containerClass}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="action-icon-container">
          <button
            className="action-button"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(project);
            }}
            onMouseEnter={() => setHoveredAction(`edit-${project.id}`)}
            onMouseLeave={() => setHoveredAction(null)}
            aria-label="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9.5 3H3.5C2.67157 3 2 3.67157 2 4.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V6.5L9.5 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 3V6.5H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {hoveredAction === `edit-${project.id}` && <div className="tooltip">Edit</div>}
        </div>

        <div className="action-icon-container">
          <button
            className="action-button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloneClick(project);
            }}
            onMouseEnter={() => setHoveredAction(`clone-${project.id}`)}
            onMouseLeave={() => setHoveredAction(null)}
            aria-label="Clone"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="3"
                y="3"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="7"
                y="7"
                width="6"
                height="6"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {hoveredAction === `clone-${project.id}` && <div className="tooltip">Clone</div>}
        </div>

        <div className="action-icon-container">
          <button
            className="action-button delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(project.id);
            }}
            onMouseEnter={() => setHoveredAction(`delete-${project.id}`)}
            onMouseLeave={() => setHoveredAction(null)}
            aria-label="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 4H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 7V11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 7V11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {hoveredAction === `delete-${project.id}` && <div className="tooltip">Delete</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="table-view">
      <div className="page-header">
        <h1>Projects</h1>
        <p>Collections of commercial insurance agentic workflows for automated processing</p>
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
              <path
                d="M2 4H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M2 8H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M2 12H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="actions-right">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const jsonString = JSON.stringify(filteredProjects, null, 2);
              const blob = new Blob([jsonString], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'projects_catalog.json';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }}
          >
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
          <button className="btn btn-primary" onClick={handleNewProjectClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 3.33333V12.6667M3.33333 8H12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Add filter controls */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search projects..."
            className="form-control"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-selects">
          <select
            className="form-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={authorFilter}
            onChange={handleAuthorChange}
          >
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
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
                <th>Author</th>
                <th>Skill Recipes</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((project) => (
                  <tr key={project.id}>
                    <td>{project.id}</td>
                    <td>{project.name}</td>
                    <td>{project.description}</td>
                    <td>{project.author}</td>
                    <td>{project.recipes}</td>
                    <td>
                      <span
                        className={`status-badge status-${project.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>{project.updated}</td>
                    <td>{renderActionButtons(project)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No projects match your search criteria.
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
            currentItems.map((project) => (
              <div
                key={project.id}
                className="tile"
                onClick={() => handleEditClick(project)}
              >
                {/* Tile Header - Modified to remove ID and add project-tile-header class */}
                <div className="tile-header project-tile-header">
                  <div className="tile-icon">{getProjectIcon(project)}</div>
                  <div>
                    <h3 className="tile-title">{project.name}</h3>
                    <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Tile Body */}
                <div className="tile-body">
                  <p className="tile-description">{project.description}</p>
                </div>

                {/* Tile Footer */}
                <div className="tile-footer">
                  <div className="tile-category">
                    <span className="category-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2.5 14C2.5 11.5147 4.51472 9.5 7 9.5H9C11.4853 9.5 13.5 11.5147 13.5 14"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {project.author}
                  </div>

                  <div className="count-badge">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 11L12 14L22 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {project.recipes} Recipes
                  </div>

                  {renderActionButtons(project, true)}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No projects match your search criteria.</div>
          )}
        </div>
      )}

      {/* Add Pagination Component */}
      <Pagination
        totalItems={filteredProjects.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default ProjectsView;
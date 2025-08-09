import React, { useState, useMemo, useEffect } from 'react';
import Pagination from './Pagination';
import axios from 'axios';
// import WorkflowPresentation from '../atlas-utils/src/features/common/components/modals/WorkflowPresentation';

const SkillRecipesView = () => {
  // return <>
  //   <WorkflowPresentation name="submission_analysis_agentic" version={9} />
  // </>
  // State for recipes data
  const baseUrl = process.env.REACT_APP_ATLAS;
  const baseUrlGQL = process.env.REACT_APP_GQL;
  const [recipes, setRecipes] = useState([]);
  // State for view mode (changed default to 'tile' to match ToolChestView)
  const [viewMode, setViewMode] = useState('tile');
  // State for search and filters
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Tooltip state
  const [hoveredAction, setHoveredAction] = useState(null);

  // Fetch recipes from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.post(`${baseUrlGQL}/graphql`, {
          query: `
            {
              getAll {
                name
                version
                description
              }
            }
          `,
        });

        if (response.status !== 200 || !response.data?.data?.getAll)
          throw new Error('Failed to fetch workflow metadata');

        const formattedRecipes = response.data.data.getAll.map((workflow, index) => ({
          id: `WF-${String(index + 1).padStart(3, '0')}`,
          name: workflow.name || 'Unnamed Workflow',
          version: workflow.version,
          description: workflow.description || 'No description available',
          category: 'Workflow',
          creator: 'System',
          agents: 6,
          status: 'Active',
          updated: new Date().toISOString().split('T')[0],
          example: '',
          goal: '',
          instruction: '',
          api_info: {},
        }));

        setRecipes(formattedRecipes);
      } catch (error) {
        console.error('Error fetching workflows:', error);
        alert('Failed to fetch workflows. Please try again.');
      }
    };

    fetchSkills();
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

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
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

  // Extract unique categories for dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(recipes.map((recipe) => recipe.category))];
    return ['All Categories', ...uniqueCategories];
  }, [recipes]);

  // Extract unique statuses for dropdown
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(recipes.map((recipe) => recipe.status))];
    return ['All Statuses', ...uniqueStatuses];
  }, [recipes]);

  // Filter recipes based on search text and filter selections
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const searchMatch =
        searchText === '' ||
        recipe.id.toLowerCase().includes(searchText.toLowerCase()) ||
        recipe.name.toLowerCase().includes(searchText.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchText.toLowerCase());
      const categoryMatch = categoryFilter === 'All Categories' || recipe.category === categoryFilter;
      const statusMatch = statusFilter === 'All Statuses' || recipe.status === statusFilter;
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [recipes, searchText, categoryFilter, statusFilter]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecipes.slice(indexOfFirstItem, indexOfLastItem);

  // Handle clicking on New Recipe button
  const handleNewRecipeClick = () => {
    const url = `${baseUrl}/workflows/new`;
    window.open(url, '_blank')
  };

  // Handle action clicks
  const handleEditClick = (recipe) => {
    const url = `${baseUrl}/workflows/${recipe.name}/${recipe.version}`;
    window.open(url, '_blank');
  };

  const handleDeployClick = (recipe) => {
    console.log('Deploy recipe:', recipe.id);
    // TODO: Send a POST/PUT request to deploy the recipe
  };

  const handleCloneClick = async (recipe) => {
    try {
      const newId = `SR-${String(recipes.length + 1).padStart(3, '0')}`;
      const clonedRecipe = {
        ...recipe,
        id: newId,
        name: `${recipe.name} (Clone)`,
        status: 'Testing',
        updated: new Date().toISOString().split('T')[0],
      };

      // TODO: Replace with actual API endpoint for cloning/saving a recipe
      // const response = await api.post('/admin/Skills-recipe/clone', clonedRecipe);
      // if (response.status === 200 || response.status === 201) {
      //   setRecipes([clonedRecipe, ...recipes]);
      //   console.log('Recipe cloned successfully:', response.data);
      // }
    } catch (error) {
      console.error('Error cloning recipe:', error);
      // Fallback to local state update if API is not available
      const newId = `SR-${String(recipes.length + 1).padStart(3, '0')}`;
      const clonedRecipe = {
        ...recipe,
        id: newId,
        name: `${recipe.name} (Clone)`,
        status: 'Testing',
        updated: new Date().toISOString().split('T')[0],
      };
      setRecipes([clonedRecipe, ...recipes]);
      alert('Failed to clone recipe via API. Cloned locally instead.');
    }
  };

  // Render action buttons with proper structure
  const renderActionButtons = (recipe, inTile = false) => {
    const containerClass = inTile ? 'tile-actions' : 'link-cell';
    return (
      <div className={containerClass}>
        <div className="action-icon-container">
          <button
            className="action-button"
            onClick={() => handleEditClick(recipe)}
            onMouseEnter={() => setHoveredAction(`edit-${recipe.id}`)}
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
          {hoveredAction === `edit-${recipe.id}` && (
            <div className="tooltip">
              Edit
            </div>
          )}
        </div>

        <div className="action-icon-container">
          <button
            className="action-button"
            onClick={() => handleDeployClick(recipe)}
            onMouseEnter={() => setHoveredAction(`deploy-${recipe.id}`)}
            onMouseLeave={() => setHoveredAction(null)}
            aria-label="Deploy"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 2V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 7L8 10L11 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 14H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {hoveredAction === `deploy-${recipe.id}` && (
            <div className="tooltip">
              Deploy
            </div>
          )}
        </div>

        <div className="action-icon-container">
          <button
            className="action-button"
            onClick={() => handleCloneClick(recipe)}
            onMouseEnter={() => setHoveredAction(`clone-${recipe.id}`)}
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
          {hoveredAction === `clone-${recipe.id}` && (
            <div className="tooltip">
              Clone
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render recipe tile
  const renderRecipeTile = (recipe) => (
    <div
      key={recipe.id}
      className="tile"
      onClick={() => console.log('Recipe clicked:', recipe.id)}
    >
      <div className="tile-header skill-tile-header">
        <div className="tile-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4z" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h3 className="tile-title">{recipe.name}</h3>
          <span className={`status-badge status-${recipe.status.toLowerCase().replace(' ', '-')}`}>
            {recipe.status}
          </span>
        </div>
      </div>
      <div className="tile-body">
        <p className="tile-description">{recipe.description}</p>
      </div>
      <div className="tile-footer">
        <div className="tile-footer-left">
          <span className="tile-category">{recipe.category}</span>
          <span className="tile-version">v{recipe.version}</span>
          <span className="count-badge">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13 11C14.1046 11 15 10.1046 15 9C15 7.89543 14.1046 7 13 7C11.8954 7 11 7.89543 11 9C11 10.1046 11.8954 11 13 11Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 5C4.10457 5 5 4.10457 5 3C5 1.89543 4.10457 1 3 1C1.89543 1 1 1.89543 1 3C1 4.10457 1.89543 5 3 5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 15C4.10457 15 5 14.1046 5 13C5 11.8954 4.10457 11 3 11C1.89543 11 1 11.8954 1 13C1 14.1046 1.89543 15 3 15Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.5 4L11 8M4.5 12L11 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {recipe.agents} agents
          </span>
        </div>
        {renderActionButtons(recipe, true)}
      </div>
    </div>
  );

  return (
    <div className="table-view">
      <div className="page-header">
        <h1>Skill Recipes</h1>
        <p>Agentic workflows for commercial insurance processing</p>
      </div>

      {/* Action buttons with updated view toggle */}
      <div className="page-actions">
        <div className="view-toggle-group">
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 4h12M2 8h12m-12 4h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
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
        </div>

        <div className="actions-right">
          <button
            className="btn btn-secondary mr-2"
            onClick={() => {
              const jsonString = JSON.stringify(filteredRecipes, null, 2);
              const blob = new Blob([jsonString], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'skill_recipes.json';
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
          <button className="btn btn-primary" onClick={handleNewRecipeClick}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 3.33333V12.6667M3.33333 8H12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            New Recipe
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search recipes..."
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
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Creator</th>
                <th>Agents</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((recipe) => (
                  <tr key={recipe.id}>
                    <td>{recipe.name}</td>
                    <td>{recipe.description}</td>
                    <td>{recipe.category}</td>
                    <td>{recipe.creator}</td>
                    <td>{recipe.agents}</td>
                    <td>
                      <span
                        className={`status-badge status-${recipe.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {recipe.status}
                      </span>
                    </td>
                    <td>{recipe.updated}</td>
                    <td>{renderActionButtons(recipe)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No recipes match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tile-container">
          {currentItems.length > 0 ? (
            currentItems.map(renderRecipeTile)
          ) : (
            <div className="empty-state">No recipes match your search criteria.</div>
          )}
        </div>
      )}

      {/* Add Pagination Component */}
      <Pagination
        totalItems={filteredRecipes.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default SkillRecipesView;
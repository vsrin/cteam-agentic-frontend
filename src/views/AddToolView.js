import React, { useState, useEffect } from 'react';
import api from '../axios/api';
// Assuming you might have some CSS for styling feedback
// import './AddToolView.css';

// --- Helper function to get raw GitHub URL ---
// Converts: https://github.com/user/repo/blob/main/path/to/tool.py
// To:       https://raw.githubusercontent.com/user/repo/main/path/to/tool.py
const getRawGitHubUrl = (githubUrl) => {
  try {
    // Check if it's already a raw URL
    if (githubUrl.includes('raw.githubusercontent.com')) {
      return githubUrl;
    }
    const url = new URL(githubUrl);
    if (url.hostname === 'github.com') {
      const pathParts = url.pathname.split('/');
      // Example: ['', 'user', 'repo', 'blob', 'main', 'path', 'to', 'tool.py']
      if (pathParts.length > 4 && pathParts[3] === 'blob') {
        const user = pathParts[1];
        const repo = pathParts[2];
        const branch = pathParts[4];
        const filePath = pathParts.slice(5).join('/');
        return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${filePath}`;
      }
    }
  } catch (e) {
    console.error("Invalid GitHub URL format:", e);
  }
  console.warn("Could not convert URL to raw GitHub URL format. Trying original URL.");
  return githubUrl; // Return original URL if conversion fails or isn't applicable
};


const AddToolView = ({
  onBack,
  onSave, // This function will receive the final toolData object on save
  initialToolData = null,
  renderHeader = true,
  saveButtonText = null,
  type = "", // Expecting 'github' or other types
  showNotification // Add this prop to receive the notification function
}) => {

  // Initial tool data structure (kept as is)
  const defaultToolData = {
    // Include tool_id if it's part of the structure, maybe generated on save or passed in initialToolData
    tool_id: '',
    name: "",
    description: "",
    // Assuming github_url corresponds to the URL, let's add it
    github_url: "", // Add this field to store the URL within toolData
    requires_env_vars: [], // Stores saved env vars as strings
    dependencies: [], // Stores saved dependencies as strings like ["package==version", "package2"]
    type: type,
    uses_llm: true,
    default_llm_model: "",
    default_system_instructions: "",
    structured_output: false,
    input_schema: {},
    output_schema: {},
    config: {},
    direct_to_user: false,
    respond_back_to_agent: false,
    response_type: "filesystem",
    call_back_url: "",
    database_config_uri: ""
  };

  // State for form data
  const [toolData, setToolData] = useState(defaultToolData);
  // State for array inputs (for requires_env_vars and dependencies) - Kept as is
  const [envVarInputs, setEnvVarInputs] = useState([""]); // Temp input for adding env vars
  const [dependencyInputs, setDependencyInputs] = useState([""]); // Temp input for adding dependencies

  // State to track if we're in edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // --- New State for Fetching Logic ---
  const [githubUrlInput, setGithubUrlInput] = useState(''); // Separate state for the URL input field itself
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null); // Store fetch error messages

  // Initialize form data when initialToolData changes
  useEffect(() => {
    // Create a fresh default data object to avoid stale closures
    const getDefaultToolData = () => ({
      tool_id: '',
      name: "",
      description: "",
      github_url: "",
      requires_env_vars: [],
      dependencies: [],
      type: type,
      uses_llm: true,
      default_llm_model: "",
      default_system_instructions: "",
      structured_output: false,
      input_schema: {},
      output_schema: {},
      config: {},
      direct_to_user: false,
      respond_back_to_agent: false,
      response_type: "filesystem",
      call_back_url: "",
      database_config_uri: ""
    });

    let dataToSet;
    if (initialToolData) {
      // Merge initial data with defaults, ensuring all keys exist
      dataToSet = {
        ...getDefaultToolData(), // Start with defaults
        ...initialToolData, // Override with initial data
        type: initialToolData.type || type, // Ensure type is correctly set
        github_url: initialToolData.github_url || '', // Ensure github_url is initialized
        // Ensure array/object fields are correctly initialized if missing in initialToolData
        requires_env_vars: initialToolData.requires_env_vars || [],
        dependencies: initialToolData.dependencies || [],
        input_schema: initialToolData.input_schema || {},
        output_schema: initialToolData.output_schema || {},
        config: initialToolData.config || {},
      };
      setIsEditMode(true);
    } else {
      // Use default data, ensuring type is set
      dataToSet = { ...getDefaultToolData(), type: type, github_url: '' };
      setIsEditMode(false);
    }

    setToolData(dataToSet);
    // Initialize the separate URL input state
    setGithubUrlInput(dataToSet.github_url);
    // Initialize temporary input arrays based on the loaded/default toolData
    // Ensure all items are strings and filter out empty ones
    const envVarStrings = (dataToSet.requires_env_vars || [])
      .filter(item => item != null)
      .map(item => String(item))
      .filter(item => item.trim() !== "");
    setEnvVarInputs(envVarStrings.length > 0 ? [...envVarStrings, ""] : [""]);
    
    const depStrings = (dataToSet.dependencies || [])
      .filter(item => item != null)
      .map(item => String(item))
      .filter(item => item.trim() !== "");
    setDependencyInputs(depStrings.length > 0 ? [...depStrings, ""] : [""]);

  }, [initialToolData, type]); // Rerun if initialToolData or type changes


  // --- Input Handlers ---

  // Modified to handle the separate githubUrlInput state
  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target; // Renamed 'type' to 'inputType'

    if (name === 'github_url') {
      // Update the dedicated input field state
      setGithubUrlInput(value);
      // Also update the corresponding field in toolData
      setToolData(prev => ({ ...prev, github_url: value }));
    } else if (name === 'input_schema' || name === 'output_schema') {
      // Handle JSON textareas - store as string, validate on save or use try-catch
      setToolData(prev => ({ ...prev, [name]: value }));
    } else {
      // Handle other inputs as before
      setToolData(prev => ({
        ...prev,
        [name]: inputType === 'checkbox' ? checked : value
      }));
    }
  };

  // Kept original handlers for temporary input arrays
  const handleEnvVarInputChange = (index, value) => {
    const updatedInputs = [...envVarInputs];
    updatedInputs[index] = value;
    setEnvVarInputs(updatedInputs);
  };

  const handleDependencyInputChange = (index, value) => {
    const updatedInputs = [...dependencyInputs];
    updatedInputs[index] = value;
    setDependencyInputs(updatedInputs);
  };

  const handleAddEnvVarInput = () => {
    setEnvVarInputs([...envVarInputs, ""]);
  };

  const handleAddDependencyInput = () => {
    setDependencyInputs([...dependencyInputs, ""]);
  };

  const handleRemoveEnvVarInput = (index) => {
    const updatedInputs = envVarInputs.filter((_, i) => i !== index);
    // Ensure there's always at least one input field if the list becomes empty
    setEnvVarInputs(updatedInputs.length > 0 ? updatedInputs : [""]);
  };

  const handleRemoveDependencyInput = (index) => {
    const updatedInputs = dependencyInputs.filter((_, i) => i !== index);
    // Ensure there's always at least one input field if the list becomes empty
    setDependencyInputs(updatedInputs.length > 0 ? updatedInputs : [""]);
  };

  // --- New Fetch Function ---
  const handleFetchToolDetails = async () => {
    if (!githubUrlInput) {
      if (showNotification) {
        showNotification('Please enter a GitHub URL.', 'error');
      }
      return;
    }
    const rawUrl = getRawGitHubUrl(githubUrlInput);
    if (!rawUrl) {
      if (showNotification) {
        showNotification('Invalid GitHub URL format or could not convert to raw URL.', 'error');
      }
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await api.post('/admin/tool-chest/api/v1/tools/parse-from-github', { github_url: rawUrl });

      if (response.data && response.data.status === 'success') {
        const fetched = response.data.data; // Extracted data from backend

        // --- Populate Form State ---
        setToolData(prev => ({
          ...prev, // Keep existing data like type, llm settings etc.
          name: fetched.name || prev.name,
          description: fetched.description || prev.description,
          github_url: githubUrlInput, // Ensure URL is current
          // Overwrite arrays with fetched data - assumes backend returns simple string arrays
          // or adjust based on backend format (e.g., if it returns [["pkg", "ver"], ...])
          requires_env_vars: fetched.requires_env_vars || [],
          // Assuming backend returns dependencies like ["package==version", "package2"]
          // If backend returns [["pkg", "ver"], ...] format it here:
          // dependencies: (fetched.dependencies || []).map(dep => dep[0] + (dep[1] ? `==${dep[1]}` : '')),
          dependencies: fetched.dependencies || [],
          // Handle schemas - assuming backend returns objects
          input_schema: fetched.input_schema || {},
          output_schema: fetched.output_schema || {},
          config: fetched.config || {}, // Overwrite or merge config as needed
          // Populate other fields if backend provides them (e.g., version)
        }));

        // --- Update the temporary input states to match fetched data ---
        const fetchedEnvVars = fetched.requires_env_vars || [];
        // Ensure all items are strings
        const envVarStrings = fetchedEnvVars
          .filter(item => item != null)
          .map(item => String(item))
          .filter(item => item.trim() !== "");
        setEnvVarInputs(envVarStrings.length > 0 ? [...envVarStrings, ""] : [""]);

        const fetchedDeps = fetched.dependencies || [];
        // Ensure all items are strings
        const depStrings = fetchedDeps
          .filter(item => item != null)
          .map(item => String(item))
          .filter(item => item.trim() !== "");
        setDependencyInputs(depStrings.length > 0 ? [...depStrings, ""] : [""]);
        // If backend returns [["pkg", "ver"], ...], format it:
        // const formattedDeps = (fetched.dependencies || []).map(dep => dep[0] + (dep[1] ? `==${dep[1]}` : ''));
        // setDependencyInputs(formattedDeps.length > 0 ? [...formattedDeps, ""] : [""]);

        // Replace browser alert with inline notification
        if (showNotification) {
          showNotification('Tool details fetched and populated successfully!', 'success');
        }

      } else {
        // Handle backend-reported errors (including validation "Bad Tool")
        const errorMessage = response.data?.message || 'Unknown error fetching tool details.';
        const missingFields = response.data?.missing;
        const alertMessage = `Error: ${errorMessage}${missingFields ? ` (Missing: ${missingFields.join(', ')})` : ''}`;
        setFetchError(alertMessage); // Store error for display
        if (showNotification) {
          showNotification(alertMessage, 'error');
        }
      }

    } catch (error) {
      console.error('Error fetching/parsing tool:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch tool details. Check the URL and network connection.';
      setFetchError(message);
      if (showNotification) {
        showNotification(`Error: ${message}`, 'error');
      }
    } finally {
      setIsFetching(false);
    }
  };


  // --- Handle Save (Final Step) ---
  const handleSave = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Final data preparation before calling onSave
    const finalToolData = { ...toolData };

    // **Crucial**: Update requires_env_vars and dependencies from the *input states*
    // Filter out empty strings from the temporary input arrays, ensuring we work with strings
    finalToolData.requires_env_vars = envVarInputs
      .filter(input => input != null) // Remove null/undefined
      .map(input => String(input)) // Convert to string
      .filter(input => input.trim() !== ""); // Filter out empty strings
    
    finalToolData.dependencies = dependencyInputs
      .filter(input => input != null) // Remove null/undefined
      .map(input => String(input)) // Convert to string
      .filter(input => input.trim() !== ""); // Filter out empty strings

    // Validate/Parse JSON Schemas from textareas
    try {
      if (typeof finalToolData.input_schema === 'string' && finalToolData.input_schema.trim() !== '') {
        finalToolData.input_schema = JSON.parse(finalToolData.input_schema);
      } else if (typeof finalToolData.input_schema !== 'object') {
        finalToolData.input_schema = {}; // Default to empty object if invalid/empty string
      }
    } catch (err) {
      if (showNotification) {
        showNotification('Invalid JSON in Input Schema. Please correct it.', 'error');
      }
      console.error("Input Schema JSON Parse Error:", err);
      return; // Prevent saving with invalid JSON
    }
    try {
      if (typeof finalToolData.output_schema === 'string' && finalToolData.output_schema.trim() !== '') {
        finalToolData.output_schema = JSON.parse(finalToolData.output_schema);
      } else if (typeof finalToolData.output_schema !== 'object') {
        finalToolData.output_schema = {}; // Default to empty object if invalid/empty string
      }
    } catch (err) {
      if (showNotification) {
        showNotification('Invalid JSON in Output Schema. Please correct it.', 'error');
      }
      console.error("Output Schema JSON Parse Error:", err);
      return; // Prevent saving with invalid JSON
    }


    // Add other final validation if needed
    if (!finalToolData.name) {
      if (showNotification) {
        showNotification("Tool Name cannot be empty.", 'error');
      }
      return;
    }
    if (type === 'github' && !finalToolData.github_url) {
      if (showNotification) {
        showNotification("GitHub URL cannot be empty for GitHub tools.", 'error');
      }
      return;
    }

    console.log("Calling onSave with:", finalToolData); // For debugging
    onSave(finalToolData); // Pass the prepared data to the parent/handler
  };

  const handleDelete = async () => {
    // Use a custom confirmation instead of window.confirm
    const confirmDelete = () => {
      return new Promise((resolve) => {
        if (showNotification) {
          // Create a custom confirmation notification
          const notification = document.createElement('div');
          notification.className = 'inline-notification confirmation-notification';
          notification.innerHTML = `
            <div class="notification-content">
              <span class="notification-icon">⚠️</span>
              <span class="notification-message">Are you sure you want to permanently delete this tool? This action cannot be undone.</span>
              <div class="notification-actions">
                <button class="confirm-btn">Delete</button>
                <button class="cancel-btn">Cancel</button>
              </div>
            </div>
          `;
          
          // Style the confirmation notification
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 450px;
            padding: 0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
            line-height: 1.4;
          `;

          const content = notification.querySelector('.notification-content');
          content.style.cssText = `
            display: flex;
            flex-direction: column;
            padding: 16px;
            gap: 12px;
          `;

          const actions = notification.querySelector('.notification-actions');
          actions.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          `;

          const confirmBtn = notification.querySelector('.confirm-btn');
          const cancelBtn = notification.querySelector('.cancel-btn');

          confirmBtn.style.cssText = `
            padding: 6px 12px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          `;

          cancelBtn.style.cssText = `
            padding: 6px 12px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          `;

          confirmBtn.onclick = () => {
            document.body.removeChild(notification);
            resolve(true);
          };

          cancelBtn.onclick = () => {
            document.body.removeChild(notification);
            resolve(false);
          };

          document.body.appendChild(notification);
        } else {
          // Fallback to window.confirm if showNotification is not available
          resolve(window.confirm("Are you sure you want to permanently delete this tool? This action cannot be undone."));
        }
      });
    };

    const confirmed = await confirmDelete();
    
    if (confirmed) {
      setIsFetching(true);
      try {
        const response = await api.delete(`/admin/tool-chest/delete-tool/${toolData.tool_id}`);
        if (response.data?.status === 'success') {
          console.log('Tool deleted successfully:', response.data.data.tool_id);
          if (showNotification) {
            showNotification('Tool deleted successfully!', 'success');
          }
          // Redirect after showing success message
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          const errorMessage = response.data?.message || 'Failed to delete tool.';
          if (showNotification) {
            showNotification(`Error: ${errorMessage}`, 'error');
          }
        }
      } catch (error) {
        console.error('Error deleting tool:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete tool. Check the network connection.';
        if (showNotification) {
          showNotification(`Error: ${errorMessage}`, 'error');
        }
      } finally {
        setIsFetching(false);
      }
    }
  };


  // --- Render ---
  // (Keep your existing JSX structure, but add the GitHub URL input and Fetch button)
  return (
    <div className="add-tool-view">
      {renderHeader && (
        <header className="add-tool-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          {onBack && <button onClick={onBack} className="button button-secondary">&lt; Back</button>}
          <h1>{isEditMode ? 'Edit Tool' : 'Add New Tool'}</h1>
        </header>
      )}

      <form onSubmit={handleSave}>
        {type === 'github' && (
          <div className="form-container">
            {/* Basic Information Section */}
            <div className="form-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>Basic Information</h3>

              {/* GitHub URL Input and Fetch Button */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="github_url">GitHub URL (Link to Python File)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="url"
                    id="github_url" // Use id matching label's htmlFor
                    name="github_url" // Connects to handleInputChange logic
                    className="form-control"
                    value={githubUrlInput} // Controlled by separate state
                    onChange={handleInputChange}
                    placeholder="https://github.com/user/repo/blob/main/path/to/tool.py"
                    required // Make URL required for github type
                    style={{ flexGrow: 1, padding: '8px' }}
                  />
                  <button
                    type="button" // Prevents form submission
                    onClick={handleFetchToolDetails}
                    disabled={isFetching || !githubUrlInput}
                    className="button button-secondary"
                    style={{ padding: '8px 12px', cursor: (isFetching || !githubUrlInput) ? 'not-allowed' : 'pointer' }}
                  >
                    {isFetching ? 'Fetching...' : 'Fetch Details'}
                  </button>
                </div>
                {fetchError && <p style={{ color: 'red', marginTop: '5px', fontSize: '0.9em' }}>{fetchError}</p>}
              </div>

              {/* Name */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={toolData.name}
                  onChange={handleInputChange}
                  placeholder="Tool Name (e.g., NAICSExcelTool)"
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={toolData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what the tool does"
                  rows="3"
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              {/* Add other basic fields if needed */}
            </div>

            {/* Dependencies Section - Using temporary input state */}
            <div className="form-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>Dependencies</h3>
              <small>Enter dependencies one by one (e.g., pandas==1.5.0 or requests). Use Add button.</small>
              {dependencyInputs.map((dep, index) => (
                <div key={index} className="form-group dynamic-input" style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={dep}
                    onChange={(e) => handleDependencyInputChange(index, e.target.value)}
                    placeholder="e.g., pandas==1.5.0"
                    style={{ flexGrow: 1, padding: '8px' }}
                  />
                  {/* Show remove button only if there's more than one input or if it's not empty */}
                  {(dependencyInputs.length > 1 || dep.trim() !== '') && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDependencyInput(index)}
                      className="button button-danger button-small"
                      style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddDependencyInput} className="button button-secondary button-small" style={{ padding: '4px 8px', marginTop: '5px' }}>
                + Add Another Dependency
              </button>
              {/* Optional: Button to explicitly 'save' temporary inputs to toolData.dependencies */}
              {/* <button type="button" onClick={handleSaveDependencies} className="button button-secondary button-small" style={{ padding: '4px 8px', marginLeft: '10px' }}>
                   Confirm Dependencies
                 </button> */}
            </div>

            {/* Environment Variables Section - Using temporary input state */}
            <div className="form-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>Required Environment Variables</h3>
              <small>Enter required variable names one by one (e.g., OPENAI_API_KEY). Use Add button.</small>
              {envVarInputs.map((envVar, index) => (
                <div key={index} className="form-group dynamic-input" style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={envVar}
                    onChange={(e) => handleEnvVarInputChange(index, e.target.value)}
                    placeholder="e.g., OPENAI_API_KEY"
                    style={{ flexGrow: 1, padding: '8px' }}
                  />
                  {/* Show remove button only if there's more than one input or if it's not empty */}
                  {(envVarInputs.length > 1 || envVar.trim() !== '') && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEnvVarInput(index)}
                      className="button button-danger button-small"
                      style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddEnvVarInput} className="button button-secondary button-small" style={{ padding: '4px 8px', marginTop: '5px' }}>
                + Add Another Variable
              </button>
              {/* Optional: Button to explicitly 'save' temporary inputs to toolData.requires_env_vars */}
              {/* <button type="button" onClick={handleSaveEnvVars} className="button button-secondary button-small" style={{ padding: '4px 8px', marginLeft: '10px' }}>
                  Confirm Variables
                </button> */}
            </div>

            {/* Schema Section */}
            <div className="form-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>Schemas</h3>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="input_schema">Input Schema (JSON)</label>
                <textarea
                  id="input_schema"
                  name="input_schema"
                  className="form-control json-input"
                  // Display as formatted JSON string if object, otherwise show the raw string (for editing invalid JSON)
                  value={typeof toolData.input_schema === 'object' ? JSON.stringify(toolData.input_schema, null, 2) : toolData.input_schema}
                  onChange={handleInputChange}
                  placeholder='{ "type": "object", "properties": { ... } }'
                  rows="8"
                  style={{ width: '100%', padding: '8px', fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="output_schema">Output Schema (JSON)</label>
                <textarea
                  id="output_schema"
                  name="output_schema"
                  className="form-control json-input"
                  value={typeof toolData.output_schema === 'object' ? JSON.stringify(toolData.output_schema, null, 2) : toolData.output_schema}
                  onChange={handleInputChange}
                  placeholder='{ "type": "object", "properties": { ... } }'
                  rows="8"
                  style={{ width: '100%', padding: '8px', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Other sections like LLM Config, Response Behavior etc. go here */}
            {/* Example: LLM Config */}
            <div className="form-section" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
              <h3>LLM Configuration</h3>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="checkbox"
                  id="uses_llm"
                  name="uses_llm"
                  checked={toolData.uses_llm}
                  onChange={handleInputChange}
                />
                <label htmlFor="uses_llm">Uses LLM</label>
              </div>
              {/* Conditionally render LLM details */}
              {toolData.uses_llm && (
                <>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="default_llm_model">Default LLM Model</label>
                    <input
                      type="text"
                      id="default_llm_model"
                      name="default_llm_model"
                      className="form-control"
                      value={toolData.default_llm_model}
                      onChange={handleInputChange}
                      placeholder="e.g., gpt-4"
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label htmlFor="default_system_instructions">Default System Instructions</label>
                    <textarea
                      id="default_system_instructions"
                      name="default_system_instructions"
                      className="form-control"
                      value={toolData.default_system_instructions}
                      onChange={handleInputChange}
                      placeholder="System instructions for the LLM..."
                      rows="4"
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="form-actions" style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="button button-secondary"
                  style={{
                    padding: '10px 15px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="button button-primary"
                disabled={isFetching}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isFetching ? 'not-allowed' : 'pointer'
                }}
              >
                {isFetching ? 'Working...' : (saveButtonText || (isEditMode ? 'Update Tool' : 'Save Tool'))}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="button button-danger"
                disabled={isFetching}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isFetching ? 'not-allowed' : 'pointer'
                }}
              >
                {isFetching ? 'Deleting...' : 'Delete Tool'}
              </button>
            </div>

          </div>
        )}

        {/* Render other form types if needed */}
        {type === 'api' && (
          <div className="form-container">
            <div className="form-grid">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={toolData.name}
                    onChange={handleInputChange}
                    placeholder="My API Tool"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    value={toolData.description}
                    onChange={handleInputChange}
                    placeholder="Description of my API tool"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="api_url">API URL</label>
                  <input
                    type="text"
                    id="api_url"
                    name="api_url"
                    className="form-control"
                    value={toolData.api_url}
                    onChange={handleInputChange}
                    placeholder="https://api.example.com/tool"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="access_token">Access Token</label>
                  <input
                    type="text"
                    id="access_token"
                    name="access_token"
                    className="form-control"
                    value={toolData.access_token}
                    onChange={handleInputChange}
                    placeholder="Your API access token"
                  />
                </div>
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="button button-secondary"
                  style={{
                    padding: '10px 15px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="button button-primary"
                disabled={isFetching}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isFetching ? 'not-allowed' : 'pointer'
                }}
              >
                {isFetching ? 'Working...' : (saveButtonText || (isEditMode ? 'Update Tool' : 'Save Tool'))}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="button button-danger"
                disabled={isFetching}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isFetching ? 'not-allowed' : 'pointer'
                }}
              >
                {isFetching ? 'Deleting...' : 'Delete Tool'}
              </button>
            </div>

          </div>


        )}
      </form>
    </div>
  );
};

export default AddToolView;
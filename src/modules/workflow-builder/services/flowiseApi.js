// Flowise API service to handle saving, loading, and executing workflows
// Note: Replace the baseURL with your actual Flowise API endpoint

// Configuration
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api/v1', // Default Flowise API endpoint
    apiKey: 'u0_chZUipKALy19PDPkKC0hQU4EIrBgwYPZ7ilhZmBI', // Your Flowise API key (if required)
    timeout: 30000 // Default timeout in milliseconds
  };
  
  // Helper to set the API key and base URL from the application config
  export const configureAPI = (config) => {
    if (config.baseURL) API_CONFIG.baseURL = config.baseURL;
    if (config.apiKey) API_CONFIG.apiKey = config.apiKey;
    if (config.timeout) API_CONFIG.timeout = config.timeout;
  };
  
  // Helper for making API requests
  const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add API key to headers if available
    if (API_CONFIG.apiKey) {
      headers['Authorization'] = `Bearer ${API_CONFIG.apiKey}`;
    }
    
    const options = {
      method,
      headers,
      timeout: API_CONFIG.timeout
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}\n${errorText}`);
      }
      
      // Check if the response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };
  
  // Convert our internal workflow format to Flowise format
  const convertToFlowiseFormat = (workflow) => {
    // This is a simplified conversion - adjust based on actual Flowise API requirements
    const flowiseNodes = workflow.nodes.map(node => {
      // Map our node types to Flowise node types
      const flowiseNodeType = mapNodeTypeToFlowise(node.type);
      
      return {
        id: node.id,
        type: flowiseNodeType,
        position: node.position,
        data: {
          ...node.data,
          // Additional transformations may be needed based on Flowise API
        }
      };
    });
    
    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || '',
      nodes: flowiseNodes,
      edges: workflow.edges
    };
  };
  
  // Convert Flowise format back to our internal format
  const convertFromFlowiseFormat = (flowiseWorkflow) => {
    // This is a simplified conversion - adjust based on actual Flowise API
    const nodes = flowiseWorkflow.nodes.map(node => {
      // Map Flowise node types to our node types
      const nodeType = mapFlowiseNodeTypeToInternal(node.type);
      
      return {
        id: node.id,
        type: nodeType,
        position: node.position,
        data: {
          ...node.data,
          // Additional transformations may be needed
        }
      };
    });
    
    return {
      id: flowiseWorkflow.id,
      name: flowiseWorkflow.name,
      description: flowiseWorkflow.description || '',
      nodes: nodes,
      edges: flowiseWorkflow.edges
    };
  };
  
  // Map our node types to Flowise node types
  const mapNodeTypeToFlowise = (nodeType) => {
    const mapping = {
      'aiAgent': 'llmNode',
      'tool': 'toolNode',
      'trigger': 'triggerNode',
      'output': 'outputNode'
    };
    
    return mapping[nodeType] || nodeType;
  };
  
  // Map Flowise node types to our internal node types
  const mapFlowiseNodeTypeToInternal = (flowiseNodeType) => {
    const mapping = {
      'llmNode': 'aiAgent',
      'toolNode': 'tool',
      'triggerNode': 'trigger',
      'outputNode': 'output'
    };
    
    return mapping[flowiseNodeType] || flowiseNodeType;
  };
  
  // API Functions
  
  // Save workflow
  export const saveWorkflow = async (workflow) => {
    try {
      const flowiseWorkflow = convertToFlowiseFormat(workflow);
      
      // If workflow already has an ID, update it; otherwise create new
      if (workflow.id) {
        return await apiRequest(`/workflows/${workflow.id}`, 'PUT', flowiseWorkflow);
      } else {
        return await apiRequest('/workflows', 'POST', flowiseWorkflow);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  };
  
  // Load workflow by ID
  export const loadWorkflow = async (id) => {
    try {
      const flowiseWorkflow = await apiRequest(`/workflows/${id}`, 'GET');
      return convertFromFlowiseFormat(flowiseWorkflow);
    } catch (error) {
      console.error('Error loading workflow:', error);
      throw error;
    }
  };
  
  // Get all workflows
  export const getWorkflows = async () => {
    try {
      const flowiseWorkflows = await apiRequest('/workflows', 'GET');
      return flowiseWorkflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description || ''
      }));
    } catch (error) {
      console.error('Error getting workflows:', error);
      throw error;
    }
  };
  
  // Delete workflow
  export const deleteWorkflow = async (id) => {
    try {
      return await apiRequest(`/workflows/${id}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  };
  
  // Execute workflow
  export const executeWorkflow = async (workflow) => {
    try {
      const flowiseWorkflow = convertToFlowiseFormat(workflow);
      return await apiRequest('/predictions', 'POST', {
        workflow: flowiseWorkflow
      });
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  };
  
  // Get execution history
  export const getExecutionHistory = async (workflowId) => {
    try {
      return await apiRequest(`/executions?workflowId=${workflowId}`, 'GET');
    } catch (error) {
      console.error('Error getting execution history:', error);
      throw error;
    }
  };
  
  // Export workflow as JSON
  export const exportWorkflow = (workflow) => {
    const flowiseWorkflow = convertToFlowiseFormat(workflow);
    const dataStr = JSON.stringify(flowiseWorkflow, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${workflow.name || 'workflow'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
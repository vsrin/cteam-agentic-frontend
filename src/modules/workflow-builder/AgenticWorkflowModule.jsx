import React, { useState, useEffect } from 'react';
import { configureAPI } from './services/flowiseApi';
import WorkflowBuilder from './WorkflowBuilder';

// Import all CSS files
import './WorkflowBuilder.css';
import './components/NodesPalette.css';
import './components/PropertiesPanel.css';
import './components/WorkflowControls.css';
import './nodes/CustomNodes.css';

/**
 * AgenticWorkflowModule - Main component for integrating the workflow builder
 * into your existing React application
 * 
 * @param {Object} props
 * @param {Object} props.config - Configuration options
 * @param {string} props.config.flowiseApiUrl - Flowise API URL
 * @param {string} props.config.flowiseApiKey - Flowise API key (if required)
 * @param {Function} props.onWorkflowSave - Callback when a workflow is saved
 * @param {Function} props.onWorkflowExecute - Callback when a workflow is executed
 */
const AgenticWorkflowModule = ({
  config = {},
  onWorkflowSave,
  onWorkflowExecute
}) => {
  const [isConfigured, setIsConfigured] = useState(false);

  // Configure the Flowise API with the provided settings
  useEffect(() => {
    if (config.flowiseApiUrl) {
      configureAPI({
        baseURL: config.flowiseApiUrl,
        apiKey: config.flowiseApiKey,
        timeout: config.timeout || 30000
      });
      setIsConfigured(true);
    }
  }, [config]);

  // Handle workflow save event
  const handleWorkflowSave = (workflow) => {
    // Call the parent callback if provided
    if (onWorkflowSave && typeof onWorkflowSave === 'function') {
      onWorkflowSave(workflow);
    }
  };

  // Handle workflow execution event
  const handleWorkflowExecute = (results) => {
    // Call the parent callback if provided
    if (onWorkflowExecute && typeof onWorkflowExecute === 'function') {
      onWorkflowExecute(results);
    }
  };

  if (!isConfigured && config.flowiseApiUrl) {
    return (
      <div className="workflow-module-loading">
        <p>Configuring workflow module...</p>
      </div>
    );
  }

  if (!config.flowiseApiUrl) {
    return (
      <div className="workflow-module-error">
        <h3>Configuration Required</h3>
        <p>Please provide a valid Flowise API URL in the configuration.</p>
      </div>
    );
  }

  return (
    <div className="agentic-workflow-module">
      <WorkflowBuilder
        onWorkflowSave={handleWorkflowSave}
        onWorkflowExecute={handleWorkflowExecute}
      />
    </div>
  );
};

export default AgenticWorkflowModule;
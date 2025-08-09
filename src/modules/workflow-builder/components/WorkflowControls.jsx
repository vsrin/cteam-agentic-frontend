// components/WorkflowControls.jsx
import React, { useState } from 'react';
import './WorkflowControls.css';

/**
 * WorkflowControls - Component for workflow actions (save, load, execute)
 * 
 * @param {Object} props
 * @param {Function} props.onSave - Save workflow callback
 * @param {Function} props.onNew - New workflow callback
 * @param {Function} props.onExecute - Execute workflow callback
 * @param {Function} props.onLoadExample - Load example workflow callback
 * @param {Array} props.savedWorkflows - List of saved workflows
 * @param {Function} props.onLoad - Load workflow callback
 * @param {boolean} props.isExecuting - Flag indicating if workflow is executing
 * @param {boolean} props.isSaving - Flag indicating if workflow is saving
 */
const WorkflowControls = ({
  onSave,
  onNew,
  onExecute,
  onLoadExample,
  savedWorkflows = [],
  onLoad,
  isExecuting,
  isSaving
}) => {
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showExamplesMenu, setShowExamplesMenu] = useState(false);
  
  return (
    <div className="workflow-controls">
      <button
        className="control-btn"
        onClick={onNew}
        title="Create a new workflow"
      >
        New
      </button>
      
      <button
        className="control-btn"
        onClick={onSave}
        disabled={isSaving}
        title="Save the current workflow"
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      
      <div className="dropdown-container">
        <button
          className="control-btn"
          onClick={() => {
            setShowLoadMenu(!showLoadMenu);
            setShowExamplesMenu(false);
          }}
          title="Load a saved workflow"
        >
          Load
        </button>
        
        {showLoadMenu && savedWorkflows.length > 0 && (
          <ul className="dropdown-menu">
            {savedWorkflows.map(workflow => (
              <li key={workflow.id} onClick={() => {
                onLoad(workflow.id);
                setShowLoadMenu(false);
              }}>
                {workflow.name}
              </li>
            ))}
          </ul>
        )}
        
        {showLoadMenu && savedWorkflows.length === 0 && (
          <div className="dropdown-menu empty-menu">
            No saved workflows
          </div>
        )}
      </div>
      
      <div className="dropdown-container">
        <button
          className="control-btn examples-btn"
          onClick={() => {
            setShowExamplesMenu(!showExamplesMenu);
            setShowLoadMenu(false);
          }}
          title="Load an example workflow"
        >
          Examples
        </button>
        
        {showExamplesMenu && (
          <ul className="dropdown-menu">
            <li onClick={() => {
              onLoadExample('example-email-processing');
              setShowExamplesMenu(false);
            }}>
              Email Processing Workflow
            </li>
            <li onClick={() => {
              onLoadExample('example-customer-support');
              setShowExamplesMenu(false);
            }}>
              Customer Support Bot
            </li>
            <li onClick={() => {
              onLoadExample('example-data-analysis');
              setShowExamplesMenu(false);
            }}>
              Data Analysis Pipeline
            </li>
            <li onClick={() => {
              onLoadExample('example-content-generation');
              setShowExamplesMenu(false);
            }}>
              Content Generation Workflow
            </li>
          </ul>
        )}
      </div>
      
      <button
        className="control-btn execute-btn"
        onClick={onExecute}
        disabled={isExecuting}
        title="Execute the current workflow"
      >
        {isExecuting ? 'Executing...' : 'Execute'}
      </button>
    </div>
  );
};

export default WorkflowControls;
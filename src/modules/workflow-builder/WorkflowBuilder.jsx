// WorkflowBuilder.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
  ReactFlowProvider, 
  Background, 
  Controls, 
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { getWorkflowExampleById } from './services/workflowExamples';

// Custom node components
import AIAgentNode from './nodes/AIAgentNode';
import ToolNode from './nodes/ToolNode';
import TriggerNode from './nodes/TriggerNode';
import OutputNode from './nodes/OutputNode';

// Sidebar and panel components
import NodesPalette from './components/NodesPalette';
import PropertiesPanel from './components/PropertiesPanel';
import WorkflowControls from './components/WorkflowControls';

// API service for Flowise
import { saveWorkflow, loadWorkflow, executeWorkflow } from './services/flowiseApi';

// Custom styling and utility functions
import './WorkflowBuilder.css';

// Register custom node types
const nodeTypes = {
  aiAgent: AIAgentNode,
  tool: ToolNode,
  trigger: TriggerNode,
  output: OutputNode
};

const WorkflowBuilder = () => {
  // State for ReactFlow nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // State for the selected node (for properties panel)
  const [selectedNode, setSelectedNode] = useState(null);
  
  // State for workflow metadata
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowId, setWorkflowId] = useState(null);
  
  // State for execution status
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  
  // State for saving/loading
  const [isSaving, setIsSaving] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create refs for ReactFlow
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);

  // Load saved workflows on component mount
  useEffect(() => {
    // This would be replaced with your actual API call
    const fetchWorkflows = async () => {
      try {
        // Sample data - replace with actual API call
        const workflows = [
          { id: 'wf1', name: 'Email Processing Workflow' },
          { id: 'wf2', name: 'Customer Support Bot' },
          { id: 'wf3', name: 'Data Analysis Pipeline' }
        ];
        setSavedWorkflows(workflows);
      } catch (error) {
        console.error('Error fetching saved workflows:', error);
      }
    };
    
    fetchWorkflows();
  }, []);

  // Store the ReactFlow instance when it's initialized
  const onInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
  }, []);

  // Handle connection (edge) creation
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  // Handle node deselection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Add node from palette to canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance.current || !reactFlowWrapper.current) {
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type) {
        console.error('No valid node type found in drop data');
        return;
      }

      // Get the current pane's rect
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Calculate position relative to the current transform
      const position = reactFlowInstance.current.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      console.log('Dropping node at position:', position);
      
      // Create a new node
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length + 1}`,
          // Default properties based on node type
          properties: getDefaultPropertiesForType(type)
        },
      };
      
      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );
  
  // Get default properties based on node type
  const getDefaultPropertiesForType = (type) => {
    switch(type) {
      case 'aiAgent':
        return { 
          agentType: 'Chat',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 1000
        };
      case 'tool':
        return { 
          toolType: 'API',
          endpoint: '',
          method: 'GET',
          headers: {}
        };
      case 'trigger':
        return { 
          triggerType: 'Manual',
          schedule: '',
          conditions: []
        };
      case 'output':
        return { 
          format: 'JSON',
          destination: 'default'
        };
      default:
        return {};
    }
  };

  // Update node properties
  const updateNodeProperties = useCallback((nodeId, newProperties) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Update the properties object while keeping other data properties
          return {
            ...node,
            data: {
              ...node.data,
              properties: {
                ...node.data.properties,
                ...newProperties
              }
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Save the current workflow
  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please provide a workflow name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const workflowData = {
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        nodes: nodes,
        edges: edges
      };
      
      const savedWorkflow = await saveWorkflow(workflowData);
      
      if (savedWorkflow?.id) {
        setWorkflowId(savedWorkflow.id);
        alert('Workflow saved successfully!');
        
        // Refresh the list of saved workflows
        setSavedWorkflows((wfs) => {
          const exists = wfs.some(wf => wf.id === savedWorkflow.id);
          if (!exists) {
            return [...wfs, { id: savedWorkflow.id, name: savedWorkflow.name }];
          } else {
            return wfs.map(wf => wf.id === savedWorkflow.id ? { ...wf, name: savedWorkflow.name } : wf);
          }
        });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load a workflow
  const handleLoadWorkflow = async (id) => {
    setIsLoading(true);
    
    try {
      const workflow = await loadWorkflow(id);
      
      if (workflow) {
        setWorkflowId(workflow.id);
        setWorkflowName(workflow.name);
        setWorkflowDescription(workflow.description || '');
        setNodes(workflow.nodes || []);
        setEdges(workflow.edges || []);
        setSelectedNode(null);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      alert('Failed to load workflow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

// Handle loading an example workflow
// Handle loading an example workflow
const handleLoadExampleWorkflow = (exampleId) => {
  try {
    console.log("Loading example workflow:", exampleId);
    const example = getWorkflowExampleById(exampleId);
    
    if (example) {
      // Ask for confirmation if there's unsaved work
      if (nodes.length > 0 && !window.confirm('Load example workflow? Any unsaved changes will be lost.')) {
        return;
      }
      
      // First clear existing nodes and edges
      setNodes([]);
      setEdges([]);
      
      // Wait a frame before setting new data
      setTimeout(() => {
        setWorkflowId(null); // No ID as this is just an example, not saved yet
        setWorkflowName(example.name);
        setWorkflowDescription(example.description || '');
        
        // Set nodes and edges
        setNodes(example.nodes);
        setEdges(example.edges);
        
        // Force fit view after nodes are added
        if (reactFlowInstance.current) {
          setTimeout(() => {
            reactFlowInstance.current.fitView();
          }, 100);
        }
        
        setSelectedNode(null);
        setExecutionResults(null);
        
        console.log("Example workflow loaded", example.nodes.length, "nodes");
      }, 50);
    } else {
      console.error("Example workflow not found:", exampleId);
      alert('Example workflow not found.');
    }
  } catch (error) {
    console.error('Error loading example workflow:', error);
    alert('Failed to load example workflow. Please try again.');
  }
};


  // Execute the current workflow
  const handleExecuteWorkflow = async () => {
    setIsExecuting(true);
    setExecutionResults(null);
    
    try {
      const workflowData = {
        nodes: nodes,
        edges: edges
      };
      
      const results = await executeWorkflow(workflowData);
      setExecutionResults(results);
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Failed to execute workflow. Please check the console for details.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Create a new workflow
  const handleNewWorkflow = () => {
    if (nodes.length > 0 && !window.confirm('Create a new workflow? Any unsaved changes will be lost.')) {
      return;
    }
    
    setNodes([]);
    setEdges([]);
    setWorkflowId(null);
    setWorkflowName('New Workflow');
    setWorkflowDescription('');
    setSelectedNode(null);
    setExecutionResults(null);
  };

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <div className="workflow-title">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            className="workflow-name-input"
          />
          <textarea
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Description (optional)"
            className="workflow-description-input"
          />
        </div>
        
        <WorkflowControls
          onSave={handleSaveWorkflow}
          onNew={handleNewWorkflow}
          onExecute={handleExecuteWorkflow}
          onLoadExample={handleLoadExampleWorkflow}
          savedWorkflows={savedWorkflows}
          onLoad={handleLoadWorkflow}
          isExecuting={isExecuting}
          isSaving={isSaving}
        />
      </div>
      
      <div className="workflow-content">
        <div className="nodes-palette">
          <NodesPalette />
        </div>
        
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={onInit}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
              
              {/* Empty State Guide Overlay */}
              {nodes.length === 0 && (
                <div className="empty-canvas-guide">
                  <div className="guide-content">
                    <h3>Start Building Your Workflow</h3>
                    <p>Drag nodes from the palette on the left or try one of our pre-built examples.</p>
                    <div className="guide-actions">
                      <button 
                        className="guide-btn" 
                        onClick={() => handleLoadExampleWorkflow('example-email-processing')}
                      >
                        Try Email Processing Example
                      </button>
                      <button 
                        className="guide-btn" 
                        onClick={() => handleLoadExampleWorkflow('example-customer-support')}
                      >
                        Try Customer Support Example
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </ReactFlow>
          </div>
        </ReactFlowProvider>
        
        <div className="properties-panel">
          {selectedNode ? (
            <PropertiesPanel
              node={selectedNode}
              onUpdate={(properties) => updateNodeProperties(selectedNode.id, properties)}
            />
          ) : (
            <div className="no-selection-message">
              Select a node to view and edit its properties
            </div>
          )}
        </div>
      </div>
      
      {executionResults && (
        <div className="execution-results">
          <h3>Execution Results</h3>
          <pre>{JSON.stringify(executionResults, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
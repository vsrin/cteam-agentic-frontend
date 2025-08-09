import React, { useState, useEffect } from 'react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ node, onUpdate }) => {
  const [properties, setProperties] = useState({});
  
  useEffect(() => {
    if (node && node.data.properties) {
      setProperties(node.data.properties);
    }
  }, [node]);

  const handlePropertyChange = (key, value) => {
    const updatedProperties = {
      ...properties,
      [key]: value,
    };
    
    setProperties(updatedProperties);
    onUpdate(updatedProperties);
  };

  const renderPropertyFields = () => {
    if (!node || !node.data.properties) return null;
    
    switch (node.type) {
      case 'aiAgent':
        return renderAIAgentProperties();
      case 'tool':
        return renderToolProperties();
      case 'trigger':
        return renderTriggerProperties();
      case 'output':
        return renderOutputProperties();
      default:
        return <p>No properties available for this node type</p>;
    }
  };

  const renderAIAgentProperties = () => {
    return (
      <>
        <div className="property-group">
          <h4>Agent Configuration</h4>
          
          <div className="property-field">
            <label>Agent Type</label>
            <select
              value={properties.agentType || 'Chat'}
              onChange={(e) => handlePropertyChange('agentType', e.target.value)}
            >
              <option value="Chat">Chat</option>
              <option value="Completion">Completion</option>
              <option value="Classifier">Classifier</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          
          <div className="property-field">
            <label>Model</label>
            <select
              value={properties.model || 'gpt-3.5-turbo'}
              onChange={(e) => handlePropertyChange('model', e.target.value)}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="llama-3-8b">Llama 3 (8B)</option>
              <option value="llama-3-70b">Llama 3 (70B)</option>
              <option value="custom">Custom Model</option>
            </select>
          </div>
          
          {properties.model === 'custom' && (
            <div className="property-field">
              <label>Custom Model Name</label>
              <input
                type="text"
                value={properties.customModel || ''}
                onChange={(e) => handlePropertyChange('customModel', e.target.value)}
                placeholder="Enter model name"
              />
            </div>
          )}
        </div>
        
        <div className="property-group">
          <h4>Model Parameters</h4>
          
          <div className="property-field">
            <label>Temperature ({properties.temperature || 0.7})</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={properties.temperature || 0.7}
              onChange={(e) => handlePropertyChange('temperature', parseFloat(e.target.value))}
            />
          </div>
          
          <div className="property-field">
            <label>Max Tokens</label>
            <input
              type="number"
              value={properties.maxTokens || 1000}
              onChange={(e) => handlePropertyChange('maxTokens', parseInt(e.target.value))}
              min="1"
              max="32000"
            />
          </div>
          
          <div className="property-field">
            <label>System Prompt</label>
            <textarea
              rows="4"
              value={properties.systemPrompt || ''}
              onChange={(e) => handlePropertyChange('systemPrompt', e.target.value)}
              placeholder="Instructions for the AI agent"
            />
          </div>
        </div>
      </>
    );
  };

  const renderToolProperties = () => {
    return (
      <>
        <div className="property-group">
          <h4>Tool Configuration</h4>
          
          <div className="property-field">
            <label>Tool Type</label>
            <select
              value={properties.toolType || 'API'}
              onChange={(e) => handlePropertyChange('toolType', e.target.value)}
            >
              <option value="API">REST API</option>
              <option value="Function">Custom Function</option>
              <option value="Database">Database Query</option>
              <option value="FileOperation">File Operation</option>
            </select>
          </div>
          
          {properties.toolType === 'API' && (
            <>
              <div className="property-field">
                <label>Endpoint URL</label>
                <input
                  type="text"
                  value={properties.endpoint || ''}
                  onChange={(e) => handlePropertyChange('endpoint', e.target.value)}
                  placeholder="https://api.example.com/data"
                />
              </div>
              
              <div className="property-field">
                <label>Method</label>
                <select
                  value={properties.method || 'GET'}
                  onChange={(e) => handlePropertyChange('method', e.target.value)}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              
              <div className="property-field">
                <label>Headers (JSON)</label>
                <textarea
                  rows="3"
                  value={properties.headers ? JSON.stringify(properties.headers, null, 2) : '{}'}
                  onChange={(e) => {
                    try {
                      const headersObj = JSON.parse(e.target.value);
                      handlePropertyChange('headers', headersObj);
                    } catch (error) {
                      // Don't update if the JSON is invalid
                    }
                  }}
                  placeholder='{"Content-Type": "application/json"}'
                />
              </div>
            </>
          )}
          
          {properties.toolType === 'Function' && (
            <div className="property-field">
              <label>Function Code</label>
              <textarea
                rows="8"
                value={properties.functionCode || ''}
                onChange={(e) => handlePropertyChange('functionCode', e.target.value)}
                placeholder="// Write your JavaScript function here"
              />
            </div>
          )}
          
          {properties.toolType === 'Database' && (
            <>
              <div className="property-field">
                <label>Connection String</label>
                <input
                  type="text"
                  value={properties.connectionString || ''}
                  onChange={(e) => handlePropertyChange('connectionString', e.target.value)}
                  placeholder="postgresql://user:password@localhost:5432/db"
                />
              </div>
              
              <div className="property-field">
                <label>Query</label>
                <textarea
                  rows="3"
                  value={properties.query || ''}
                  onChange={(e) => handlePropertyChange('query', e.target.value)}
                  placeholder="SELECT * FROM users WHERE status = 'active'"
                />
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const renderTriggerProperties = () => {
    return (
      <>
        <div className="property-group">
          <h4>Trigger Configuration</h4>
          
          <div className="property-field">
            <label>Trigger Type</label>
            <select
              value={properties.triggerType || 'Manual'}
              onChange={(e) => handlePropertyChange('triggerType', e.target.value)}
            >
              <option value="Manual">Manual</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Webhook">Webhook</option>
              <option value="Event">Event-based</option>
            </select>
          </div>
          
          {properties.triggerType === 'Scheduled' && (
            <div className="property-field">
              <label>Schedule (CRON)</label>
              <input
                type="text"
                value={properties.schedule || ''}
                onChange={(e) => handlePropertyChange('schedule', e.target.value)}
                placeholder="0 0 * * * (daily at midnight)"
              />
            </div>
          )}
          
          {properties.triggerType === 'Webhook' && (
            <div className="property-field">
              <label>Webhook Path</label>
              <input
                type="text"
                value={properties.webhookPath || ''}
                onChange={(e) => handlePropertyChange('webhookPath', e.target.value)}
                placeholder="/api/triggers/my-webhook"
              />
            </div>
          )}
          
          {properties.triggerType === 'Event' && (
            <>
              <div className="property-field">
                <label>Event Source</label>
                <input
                  type="text"
                  value={properties.eventSource || ''}
                  onChange={(e) => handlePropertyChange('eventSource', e.target.value)}
                  placeholder="app.users.created"
                />
              </div>
              
              <div className="property-field">
                <label>Condition (JavaScript)</label>
                <textarea
                  rows="3"
                  value={properties.eventCondition || ''}
                  onChange={(e) => handlePropertyChange('eventCondition', e.target.value)}
                  placeholder="event.user.role === 'admin'"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="property-group">
          <h4>Input Parameters</h4>
          <div className="property-field">
            <label>Parameter Definitions (JSON)</label>
            <textarea
              rows="4"
              value={properties.inputParams ? JSON.stringify(properties.inputParams, null, 2) : '[]'}
              onChange={(e) => {
                try {
                  const paramsArray = JSON.parse(e.target.value);
                  handlePropertyChange('inputParams', paramsArray);
                } catch (error) {
                  // Don't update if the JSON is invalid
                }
              }}
              placeholder='[{"name": "query", "type": "string", "required": true}]'
            />
          </div>
        </div>
      </>
    );
  };

  const renderOutputProperties = () => {
    return (
      <>
        <div className="property-group">
          <h4>Output Configuration</h4>
          
          <div className="property-field">
            <label>Output Format</label>
            <select
              value={properties.format || 'JSON'}
              onChange={(e) => handlePropertyChange('format', e.target.value)}
            >
              <option value="JSON">JSON</option>
              <option value="Text">Plain Text</option>
              <option value="HTML">HTML</option>
              <option value="Markdown">Markdown</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          
          <div className="property-field">
            <label>Destination</label>
            <select
              value={properties.destination || 'default'}
              onChange={(e) => handlePropertyChange('destination', e.target.value)}
            >
              <option value="default">Default Response</option>
              <option value="file">File</option>
              <option value="database">Database</option>
              <option value="api">External API</option>
              <option value="email">Email</option>
            </select>
          </div>
          
          {properties.destination === 'file' && (
            <div className="property-field">
              <label>File Path</label>
              <input
                type="text"
                value={properties.filePath || ''}
                onChange={(e) => handlePropertyChange('filePath', e.target.value)}
                placeholder="/outputs/result.json"
              />
            </div>
          )}
          
          {properties.destination === 'database' && (
            <>
              <div className="property-field">
                <label>Connection String</label>
                <input
                  type="text"
                  value={properties.dbConnection || ''}
                  onChange={(e) => handlePropertyChange('dbConnection', e.target.value)}
                  placeholder="postgresql://user:password@localhost:5432/db"
                />
              </div>
              
              <div className="property-field">
                <label>Table/Collection</label>
                <input
                  type="text"
                  value={properties.dbTable || ''}
                  onChange={(e) => handlePropertyChange('dbTable', e.target.value)}
                  placeholder="workflow_results"
                />
              </div>
            </>
          )}
          
          {properties.destination === 'api' && (
            <>
              <div className="property-field">
                <label>API Endpoint</label>
                <input
                  type="text"
                  value={properties.apiEndpoint || ''}
                  onChange={(e) => handlePropertyChange('apiEndpoint', e.target.value)}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              
              <div className="property-field">
                <label>Method</label>
                <select
                  value={properties.apiMethod || 'POST'}
                  onChange={(e) => handlePropertyChange('apiMethod', e.target.value)}
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
            </>
          )}
          
          {properties.destination === 'email' && (
            <>
              <div className="property-field">
                <label>Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={properties.emailRecipients || ''}
                  onChange={(e) => handlePropertyChange('emailRecipients', e.target.value)}
                  placeholder="user@example.com, admin@example.com"
                />
              </div>
              
              <div className="property-field">
                <label>Subject Template</label>
                <input
                  type="text"
                  value={properties.emailSubject || ''}
                  onChange={(e) => handlePropertyChange('emailSubject', e.target.value)}
                  placeholder="Workflow Results: {{workflow.name}}"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="property-group">
          <h4>Transformations</h4>
          <div className="property-field">
            <label>Transform Function (JavaScript)</label>
            <textarea
              rows="4"
              value={properties.transformFunction || ''}
              onChange={(e) => handlePropertyChange('transformFunction', e.target.value)}
              placeholder="// Modify the output data before sending
data => {
  return { ...data, timestamp: new Date().toISOString() };
}"
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="properties-panel-container">
      <div className="properties-header">
        <h3>Node Properties</h3>
        <div className="node-title">{node?.data?.label}</div>
      </div>
      
      <div className="properties-content">
        <div className="property-group basic-info">
          <div className="property-field">
            <label>Label</label>
            <input
              type="text"
              value={node?.data?.label || ''}
              onChange={(e) => {
                // This updates the node label directly, not part of the properties object
                // You would need to handle this separately in the parent component
              }}
              placeholder="Node Label"
            />
          </div>
        </div>
        
        {renderPropertyFields()}
      </div>
    </div>
  );
};

export default PropertiesPanel;
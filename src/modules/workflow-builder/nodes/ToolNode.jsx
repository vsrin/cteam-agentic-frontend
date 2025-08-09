import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNodes.css';

const ToolNode = ({ data }) => {
  const { properties } = data;

  return (
    <div className="custom-node tool-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-header">
          <div className="node-icon">🔧</div>
          <div className="node-title">{data.label}</div>
        </div>
        
        <div className="node-details">
          <div className="node-property">
            <span className="property-label">Type:</span>
            <span className="property-value">{properties?.toolType || 'API'}</span>
          </div>
          
          {properties?.toolType === 'API' && (
            <div className="node-property">
              <span className="property-label">Method:</span>
              <span className="property-value">{properties?.method || 'GET'}</span>
            </div>
          )}
          
          {properties?.toolType === 'Database' && (
            <div className="node-property">
              <span className="property-label">Database:</span>
              <span className="property-value">
                {properties?.connectionString?.split('/')?.pop() || 'undefined'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ToolNode);
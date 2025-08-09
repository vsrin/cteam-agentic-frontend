import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNodes.css';

const OutputNode = ({ data }) => {
  const { properties } = data;

  return (
    <div className="custom-node output-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-header">
          <div className="node-icon">📤</div>
          <div className="node-title">{data.label}</div>
        </div>
        
        <div className="node-details">
          <div className="node-property">
            <span className="property-label">Format:</span>
            <span className="property-value">{properties?.format || 'JSON'}</span>
          </div>
          
          <div className="node-property">
            <span className="property-label">Destination:</span>
            <span className="property-value">{properties?.destination || 'Default'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(OutputNode);
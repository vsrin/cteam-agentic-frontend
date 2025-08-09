import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNodes.css';

const AIAgentNode = ({ data }) => {
  const { properties } = data;

  return (
    <div className="custom-node ai-agent-node">
      <Handle type="target" position={Position.Top} />
      
      <div className="node-content">
        <div className="node-header">
          <div className="node-icon">🤖</div>
          <div className="node-title">{data.label}</div>
        </div>
        
        <div className="node-details">
          <div className="node-property">
            <span className="property-label">Type:</span>
            <span className="property-value">{properties?.agentType || 'Chat'}</span>
          </div>
          
          <div className="node-property">
            <span className="property-label">Model:</span>
            <span className="property-value">{properties?.model || 'gpt-3.5-turbo'}</span>
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(AIAgentNode);
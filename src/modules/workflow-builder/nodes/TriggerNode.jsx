import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './CustomNodes.css';

const TriggerNode = ({ data }) => {
  const { properties } = data;

  return (
    <div className="custom-node trigger-node">
      <div className="node-content">
        <div className="node-header">
          <div className="node-icon">⚡</div>
          <div className="node-title">{data.label}</div>
        </div>
        
        <div className="node-details">
          <div className="node-property">
            <span className="property-label">Type:</span>
            <span className="property-value">{properties?.triggerType || 'Manual'}</span>
          </div>
          
          {properties?.triggerType === 'Scheduled' && (
            <div className="node-property">
              <span className="property-label">Schedule:</span>
              <span className="property-value">{properties?.schedule || 'Not set'}</span>
            </div>
          )}
          
          {properties?.triggerType === 'Webhook' && (
            <div className="node-property">
              <span className="property-label">Path:</span>
              <span className="property-value">{properties?.webhookPath || '/webhook'}</span>
            </div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(TriggerNode);
// components/NodesPalette.jsx
import React from 'react';
import './NodesPalette.css';

const NodesPalette = () => {
  const onDragStart = (event, nodeType) => {
    // This is critical - set the data type and value correctly
    event.dataTransfer.setData('application/reactflow', nodeType);
    
    // Some browsers require this to initiate drag
    event.dataTransfer.effectAllowed = 'move';
  };

  // Define node types with their icons and labels
  const nodeTypes = [
    { type: 'aiAgent', label: 'AI Agent', icon: '🤖' },
    { type: 'tool', label: 'Tool', icon: '🔧' },
    { type: 'trigger', label: 'Trigger', icon: '⚡' },
    { type: 'output', label: 'Output', icon: '📤' }
  ];

  return (
    <div className="nodes-palette-container">
      <h3>Components</h3>
      <div className="nodes-list">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="node-item"
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
          >
            <span className="node-icon">{node.icon}</span>
            <span className="node-label">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodesPalette;
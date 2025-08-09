import React, { useState } from 'react';
import AgenticWorkflowModule from './modules/workflow-builder/AgenticWorkflowModule';

// This is a simplified example of how to integrate the workflow builder
// with your existing sidebar navigation in your React app

const ExampleSidebar = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  // Menu items for the sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'agents', label: 'AI Agents', icon: '🤖' },
    { id: 'workflows', label: 'Workflows', icon: '⚙️' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Handle menu item click
  const handleMenuItemClick = (moduleId) => {
    setActiveModule(moduleId);
  };

  // Configuration for the Workflow Module
  const workflowConfig = {
    flowiseApiUrl: 'http://localhost:3000/api/v1',
    flowiseApiKey: 'your-api-key-here', // Replace with your API key or environment variable
    timeout: 30000
  };

  // Callback when a workflow is saved
  const handleWorkflowSave = (workflow) => {
    console.log('Workflow saved:', workflow);
    // You can add your own custom logic here
  };

  // Callback when a workflow is executed
  const handleWorkflowExecute = (results) => {
    console.log('Workflow execution results:', results);
    // You can add your own custom logic here
  };

  // Render the active module content based on the selected menu item
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'workflows':
        return (
          <AgenticWorkflowModule
            config={workflowConfig}
            onWorkflowSave={handleWorkflowSave}
            onWorkflowExecute={handleWorkflowExecute}
          />
        );
      case 'dashboard':
        return <div className="module-content">Dashboard Content</div>;
      case 'agents':
        return <div className="module-content">AI Agents Content</div>;
      case 'tools':
        return <div className="module-content">Tools Content</div>;
      case 'settings':
        return <div className="module-content">Settings Content</div>;
      default:
        return <div className="module-content">Select a module from the sidebar</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>AI Platform</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="menu-items">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`menu-item ${activeModule === item.id ? 'active' : ''}`}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Main content area */}
      <div className="main-content">
        {renderModuleContent()}
      </div>
    </div>
  );
};

export default ExampleSidebar;

// Add this CSS to your application's styles:
/*
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 250px;
  background-color: #24292e;
  color: #fff;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #393f44;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
}

.sidebar-nav {
  padding: 10px 0;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #32383e;
}

.menu-item.active {
  background-color: #0366d6;
}

.menu-icon {
  margin-right: 12px;
  font-size: 16px;
}

.menu-label {
  font-size: 14px;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.module-content {
  padding: 20px;
  height: 100%;
}

.agentic-workflow-module {
  height: 100%;
}
*/
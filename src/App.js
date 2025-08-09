import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './views/HomeView';
import ProjectsView from './views/ProjectsView';
import AgentCatalogView from './views/AgentCatalogView';
import ToolChestView from './views/ToolChestView';
import WikiView from './views/WikiView';
import KnowledgeAssetView from './views/KnowledgeAssetView'; 
import KnowledgeBaseCreateView from './views/KnowledgeBaseCreateView';
import ProgressiveAgentBuilderView from './views/ProgressiveAgentBuilderView';
import SettingsView from './views/SettingsView';
import WorkflowBuilderView from './views/WorkflowBuilderView';
import SkillRecipesView from './views/SkillRecipesView';
import RAGConfiguratorView from './views/KnowledgeAssetsListView'; // Keep existing beta route
import KnowledgeAssetsCatalogView from './views/KnowledgeAssetsCatalogView'; // New catalog view
import KnowledgeAssetsBuilderView from './views/KnowledgeAssetsBuilderView'; // New builder view
import AppCatalogView from './views/AppCatalogView'; // New app catalog view
import ChatButton from './components/ChatButton';
import './styles/AddToolStyles.css';
import { ThemeProvider } from './ThemeContext';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [activeNav, setActiveNav] = useState('Home');
  
  // State to hold selected agent data when navigating from catalog to builder
  const [selectedAgentData, setSelectedAgentData] = useState(null);
  
  // State to hold knowledge base data for editing
  const [editKnowledgeBaseData, setEditKnowledgeBaseData] = useState(null);
  const [knowledgeAssetMode, setKnowledgeAssetMode] = useState('create'); // 'create', 'edit', 'test'
  
  // State to hold selected app data
  const [selectedAppData, setSelectedAppData] = useState(null);
  
  const handleNavClick = (navItem, viewName) => {
    console.log("Navigation clicked:", navItem, viewName);
    setActiveNav(navItem);
    
    // Directly set the view if viewName is provided
    if (viewName) {
      setCurrentView(viewName);
      return;
    }
    
    // Otherwise, determine the view based on the navItem
    switch(navItem) {
      case 'Home':
        setCurrentView('home');
        break;
      case 'Wiki':
        setCurrentView('wiki');
        break;
      case 'Builder/Knowledge Asset':
        setCurrentView('knowledgeAssetBuilder');
        break;
      case 'Builder/Knowledge Asset Beta':
        setCurrentView('ragConfigurator');
        break;
      case 'Catalog/Knowledge Assets':
        setCurrentView('knowledgeAssetsCatalog');
        break;
      case 'Catalog/Apps':
        setCurrentView('appCatalog');
        break;
      case 'Settings':
        setCurrentView('settings');
        break;
      case 'Catalog/Agents':
        setCurrentView('agentCatalog');
        break;
      case 'Catalog/Tools':
        setCurrentView('toolChest');
        break;
      case 'Catalog/Workflows':
        setCurrentView('workflowCatalog');
        break;
      case 'Catalog/Projects':
        setCurrentView('projects');
        break;
      case 'Builder/Agent Builder': 
        // Redirect old path to progressive builder
        setCurrentView('progressiveAgentBuilder');
        break;
      case 'Builder/Progressive Agent Builder':
        setCurrentView('progressiveAgentBuilder');
        break;
      case 'Builder/Workflow Builder':
        setCurrentView('workflowBuilder');
        break;
      default:
        setCurrentView('home');
    }
  };

  // Function to navigate from agent catalog to progressive agent builder
  const navigateToProgressiveAgentBuilder = (agentData = null, testMode = false) => {
    setActiveNav('Builder/Progressive Agent Builder');
    setCurrentView('progressiveAgentBuilder');
    setSelectedAgentData(agentData);
  };

  // Function to navigate back from agent builder to agent catalog
  const navigateBackToAgentCatalog = () => {
    setActiveNav('Catalog/Agents');
    setCurrentView('agentCatalog');
  };

  // Knowledge Assets Navigation Functions
  
  // Navigate to catalog from other views
  const navigateToKnowledgeAssetsCatalog = () => {
    setActiveNav('Catalog/Knowledge Assets');
    setCurrentView('knowledgeAssetsCatalog');
    setEditKnowledgeBaseData(null);
    setKnowledgeAssetMode('create');
  };

  // Navigate to builder for creating new knowledge asset
  const navigateToKnowledgeAssetsBuilder = () => {
    setActiveNav('Builder/Knowledge Asset');
    setCurrentView('knowledgeAssetBuilder');
    setEditKnowledgeBaseData(null);
    setKnowledgeAssetMode('create');
  };

  // Navigate to builder for editing existing knowledge asset
  const navigateToKnowledgeAssetsBuilderEdit = (knowledgeBaseData) => {
    setActiveNav('Builder/Knowledge Asset');
    setCurrentView('knowledgeAssetBuilder');
    setEditKnowledgeBaseData(knowledgeBaseData);
    setKnowledgeAssetMode('edit');
  };

  // Navigate to builder for testing existing knowledge asset
  const navigateToKnowledgeAssetsBuilderTest = (knowledgeBaseData) => {
    setActiveNav('Builder/Knowledge Asset');
    setCurrentView('knowledgeAssetBuilder');
    setEditKnowledgeBaseData(knowledgeBaseData);
    setKnowledgeAssetMode('test');
  };

  // App Catalog Navigation Functions
  
  // Navigate to app catalog
  const navigateToAppCatalog = () => {
    setActiveNav('Catalog/Apps');
    setCurrentView('appCatalog');
    setSelectedAppData(null);
  };

  // Handle app creation - could navigate to an app builder in the future
  const handleAppCreate = () => {
    console.log("Creating new app...");
    // For now, just show a notification
    // In the future, this could navigate to an App Builder view
    alert('App creation feature coming soon!');
  };

  // Handle app editing - could navigate to an app builder in the future
  const handleAppEdit = (appData) => {
    console.log("Editing app:", appData);
    setSelectedAppData(appData);
    // For now, just show a notification
    // In the future, this could navigate to an App Builder view
    alert(`Editing ${appData.name} - App editor coming soon!`);
  };

  // Handle app deployment
  const handleAppDeploy = (appData) => {
    console.log("Deploying app:", appData);
    // For now, just show a notification
    // In the future, this could integrate with deployment systems
    alert(`Deploying ${appData.name} - Deployment system coming soon!`);
  };

  // Legacy Functions (keep for backward compatibility)
  
  // Function to navigate to knowledge base create view for new entry
  const navigateToKnowledgeBaseCreate = () => {
    console.log("Navigating to Knowledge Base Create view");
    setEditKnowledgeBaseData(null); // Ensure we're not in edit mode
    setCurrentView('knowledgeBaseCreate');
  };

  // Function to navigate to knowledge base create view for editing
  const navigateToKnowledgeBaseEdit = (knowledgeBaseData) => {
    console.log("Navigating to Knowledge Base Edit view for:", knowledgeBaseData);
    setEditKnowledgeBaseData(knowledgeBaseData);
    setCurrentView('knowledgeBaseCreate');
  };

  // Function to navigate back to knowledge asset view
  const navigateToKnowledgeAsset = () => {
    console.log("Navigating back to Knowledge Asset view");
    setActiveNav('Builder/Knowledge Asset');
    setCurrentView('knowledgeAsset');
    // Reset the edit data when leaving the create/edit view
    setEditKnowledgeBaseData(null);
  };

  // Function to navigate to wiki view
  const navigateToWikiView = () => {
    console.log("Navigating to Wiki view");
    setActiveNav('Wiki');
    setCurrentView('wiki');
  };

  return (
    <div className="container">
      <Sidebar activeNav={activeNav} onNavClick={handleNavClick} />
      <div className="content">
        <Header />
        {currentView === 'home' && <HomeView />}
        {currentView === 'projects' && <ProjectsView />}
        {currentView === 'agentCatalog' && <AgentCatalogView onAgentClick={navigateToProgressiveAgentBuilder} />}
        {currentView === 'toolChest' && <ToolChestView />}
        {currentView === 'wiki' && <WikiView onCreateNew={navigateToKnowledgeAsset} />}
        
        {/* App Catalog View */}
        {currentView === 'appCatalog' && 
          <AppCatalogView 
            onCreateNew={handleAppCreate}
            onEdit={handleAppEdit}
            onDeploy={handleAppDeploy}
            onBack={null} // No back button needed in catalog
          />
        }
        
        {/* Knowledge Assets - New Split Architecture */}
        {currentView === 'knowledgeAssetsCatalog' && 
          <KnowledgeAssetsCatalogView 
            onCreateNew={navigateToKnowledgeAssetsBuilder}
            onEdit={navigateToKnowledgeAssetsBuilderEdit}
            onTest={navigateToKnowledgeAssetsBuilderTest}
            onBack={null} // No back button needed in catalog
          />
        }
        {currentView === 'knowledgeAssetBuilder' && 
          <KnowledgeAssetsBuilderView 
            onBack={navigateToKnowledgeAssetsCatalog}
            initialData={editKnowledgeBaseData}
            mode={knowledgeAssetMode}
          />
        }
        
        {/* Legacy Knowledge Asset Views (keep for backward compatibility) */}
        {currentView === 'knowledgeAsset' && 
          <KnowledgeAssetView 
            onCreateNew={navigateToKnowledgeBaseCreate} 
            onEdit={navigateToKnowledgeBaseEdit}
            onBack={navigateToWikiView} 
          />
        }
        {currentView === 'ragConfigurator' && 
          <RAGConfiguratorView 
            onBack={() => {
              setActiveNav('Builder/Knowledge Asset');
              setCurrentView('knowledgeAsset');
            }}
          />
        }
        {currentView === 'knowledgeBaseCreate' && 
          <KnowledgeBaseCreateView 
            onBack={navigateToKnowledgeAsset}
            initialData={editKnowledgeBaseData}
          />
        }
        
        {/* Other Views */}
        {currentView === 'progressiveAgentBuilder' && <ProgressiveAgentBuilderView agentData={selectedAgentData} onBack={navigateBackToAgentCatalog} />}
        {currentView === 'settings' && <SettingsView />}
        {currentView === 'workflowBuilder' && <WorkflowBuilderView />}
        {currentView === 'SkillRecipes' && <SkillRecipesView />}
      </div>
      {/* Global Chat Button */}
      <ChatButton />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
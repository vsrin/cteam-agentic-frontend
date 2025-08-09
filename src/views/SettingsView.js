import React, { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const SettingsView = () => {
  // Use the theme context
  const { currentTheme, setCurrentTheme } = useContext(ThemeContext);

  // Sample available themes
  const availableThemes = [
    { id: 'default', name: 'Default Blue', primaryColor: '#2c5282' },
    { id: 'dark', name: 'Dark Mode', primaryColor: '#1a202c' },
    { id: 'forest', name: 'Forest Green', primaryColor: '#2f855a' },
    { id: 'ruby', name: 'Ruby Red', primaryColor: '#9b2c2c' },
    { id: 'amber', name: 'Amber Gold', primaryColor: '#b7791f' },
    { id: 'ocean', name: 'Ocean Teal', primaryColor: '#285e61' }
  ];

  // Sample LLM providers
  const llmProviders = [
    { id: 'anthropic', name: 'Anthropic', models: ['Claude 3 Opus', 'Claude 3.5 Sonnet', 'Claude 3.7 Sonnet', 'Claude 3.5 Haiku'] },
    { id: 'openai', name: 'OpenAI', models: ['GPT-40', 'GPT-4o mini', 'GPT-4 Turbo'] },
    { id: 'google', name: 'Google', models: ['Gemini Pro', 'Gemini Ultra'] },
    { id: 'mistral', name: 'Mistral AI', models: ['Mistral Large', 'Mistral Medium', 'Mistral Small'] },
    { id: 'cohere', name: 'Cohere', models: ['Command R+', 'Command R'] },
    { id: 'groq', name: 'Groq', models: ['llama-3-70b', 'llama-3-8b', 'mixtral-8x7b', 'llama-4-maverick-17b', 'groq-llama4-maverick'] }
  ];

  // State for settings
  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState('Claude 3.7 Sonnet');
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);

  // Get the available models for the selected provider
  const availableModels = llmProviders.find(provider => provider.id === selectedProvider)?.models || [];

  // Handle provider change
  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setSelectedProvider(newProvider);
    
    // Set default model for the selected provider
    const defaultModel = llmProviders.find(provider => provider.id === newProvider)?.models[0] || '';
    setSelectedModel(defaultModel);
  };

  // Handle theme change
  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
  };

  // Toggle developer mode
  const handleDeveloperModeToggle = () => {
    setDeveloperMode(!developerMode);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or an API
    console.log('Saving settings:', {
      theme: currentTheme,
      provider: selectedProvider,
      model: selectedModel,
      developerMode
    });
    
    // Show save message
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  return (
    <div className="settings-page">
      {/* Page header */}
      <h2 className="settings-header">Settings</h2>

      {/* 4-quadrant grid layout */}
      <div className="settings-grid">
        {/* Top Left: System Settings */}
        <div className="settings-card">
          <h3 className="settings-section-title">System Settings</h3>
          
          <div className="settings-group">
            <div className="settings-label">Developer Mode</div>
            <div className="settings-toggle-container">
              <label className="settings-switch">
                <input 
                  type="checkbox" 
                  checked={developerMode}
                  onChange={handleDeveloperModeToggle}
                />
                <span className="settings-slider"></span>
              </label>
              <span className="settings-toggle-label">Enable advanced features for developers</span>
            </div>
          </div>
          
          <div className="settings-group">
            <div className="settings-label">API Credentials</div>
            <button className="settings-button">Manage API Keys</button>
          </div>
        </div>

        {/* Top Right: Color Theme */}
        <div className="settings-card">
          <h3 className="settings-section-title">Appearance</h3>
          
          <div className="settings-group">
            <div className="settings-label">Color Theme</div>
            <select 
              className="settings-select" 
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {availableThemes.map(theme => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>
          </div>

          <div className="settings-theme-swatches">
            {availableThemes.map(theme => (
              <div 
                key={theme.id}
                className={`settings-theme-swatch ${currentTheme === theme.id ? 'selected' : ''}`}
                style={{ backgroundColor: theme.primaryColor }}
                onClick={() => handleThemeChange(theme.id)}
                title={theme.name}
              ></div>
            ))}
          </div>
        </div>

        {/* Bottom Left: AI Model Preferences */}
        <div className="settings-card">
          <h3 className="settings-section-title">AI Model Preferences</h3>
          
          <div className="settings-group">
            <div className="settings-label">Default LLM Provider</div>
            <select 
              className="settings-select"
              value={selectedProvider}
              onChange={handleProviderChange}
            >
              {llmProviders.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
          </div>
          
          <div className="settings-group">
            <div className="settings-label">Default Model</div>
            <select 
              className="settings-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div className="settings-helper-text">
            These settings will be used as defaults when creating new agents. You can override these settings for individual agents.
          </div>
        </div>

        {/* Bottom Right: Save Settings */}
        <div className="settings-card settings-card-centered">
          <h3 className="settings-section-title">Apply Your Changes</h3>
          
          <div className="settings-save-description">
            Click the button below to save all your settings across all categories.
          </div>
          
          <button 
            className="settings-save-button"
            onClick={handleSaveSettings}
          >
            Save All Settings
          </button>
        </div>
      </div>

      {/* Save Message */}
      {showSaveMessage && (
        <div className="settings-save-message">
          Settings saved successfully!
        </div>
      )}

      {/* Component-specific styles */}
      <style jsx>{`
        .settings-page {
          padding: 24px;
          max-width: 100%;
          text-align: left;
        }

        .settings-header {
          margin-top: 0;
          margin-bottom: 24px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 24px;
          max-width: 100%;
        }

        .settings-card {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .settings-card-centered {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .settings-section-title {
          margin: 0 0 24px 0;
          font-size: 18px;
        }

        .settings-group {
          margin-bottom: 24px;
        }

        .settings-label {
          font-weight: 500;
          margin-bottom: 8px;
        }

        .settings-select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }

        .settings-button {
          padding: 8px 16px;
          background-color: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
        }

        .settings-toggle-container {
          display: flex;
          align-items: center;
        }

        .settings-toggle-label {
          margin-left: 12px;
        }

        .settings-theme-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
        }

        .settings-theme-swatch {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s;
        }

        .settings-theme-swatch.selected {
          border: 2px solid black;
        }

        .settings-theme-swatch:hover {
          transform: scale(1.05);
        }

        .settings-helper-text {
          font-size: 14px;
          color: #718096;
        }

        .settings-save-description {
          margin-bottom: 24px;
        }

        .settings-save-button {
          padding: 12px 32px;
          background-color: #4299e1;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          max-width: 200px;
        }

        .settings-save-button:hover {
          background-color: #3182ce;
        }

        .settings-save-message {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #48bb78;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .settings-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .settings-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .settings-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        
        .settings-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .settings-slider {
          background-color: #4299e1;
        }
        
        input:checked + .settings-slider:before {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
};

export default SettingsView;
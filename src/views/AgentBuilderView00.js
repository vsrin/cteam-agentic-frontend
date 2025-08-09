import React, { useState, useEffect } from 'react';
import api from '../axios/api'; // Configured Axios instance
import axios from 'axios';
import AddToolView from './AddToolView';
import ChatInterface from '../components/ChatInterface';
import ChatInterfaceNormal from '../components/ChatInterfactNormal';
import StructuredOutputBuilder from '../components/StructuredOutputBuilder';

const AgentBuilderView = ({ agentData = null, onBack = () => { }, mode = 'create' }) => {
  //============================================================
  // STATE MANAGEMENT
  //============================================================

  // Basic Agent Information
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [agentConfig, setAgentConfig] = useState({});
  const [structuredOutputSchema, setStructuredOutputSchema] = useState({})

  // LLM Configuration
  const [llmProvider, setLlmProvider] = useState('OpenAI');
  const [llmModel, setLlmModel] = useState('gpt-4o');

  // Agent Functionality
  const [agentRole, setAgentRole] = useState('');
  const [agentCategory, setAgentCategory] = useState('General'); // Added agent category state
  const [agentInstructions, setAgentInstructions] = useState('');
  const [examples, setExamples] = useState('');

  // UI Interaction
  const [inquiry, setInquiry] = useState('Type your query...');
  const [isFormModified, setIsFormModified] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  // Collapsible Sections
  const [coreFeaturesSectionExpanded, setCoreFeaturesSectionExpanded] = useState(true);
  const [managerSectionExpanded, setManagerSectionExpanded] = useState(true);
  const [toolsSectionExpanded, setToolsSectionExpanded] = useState(true);
  const [previewPaneExpanded, setPreviewPaneExpanded] = useState(false);

  // Feature Toggles
  const [isManagerAgent, setIsManagerAgent] = useState(false);
  const [coreFeatures, setCoreFeatures] = useState({
    knowledgeBase: false,
    dataQuery: false,
    shortTermMemory: false,
    longTermMemory: false,
    humanizer: false,
    reflection: false,
    groundedness: false,
    contextRelevance: false,
    structuredOutput: false
  });

  // Knowledge Base
  const [showKnowledgeBaseSelector, setShowKnowledgeBaseSelector] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
  const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState([]);

  // Manager Agent
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [selectedManagerAgents, setSelectedManagerAgents] = useState([]);
  const [managerAgentIntention, setManagerAgentIntention] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);

  // Tool Management
  const [selectedTools, setSelectedTools] = useState([]);
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const [showAddTool, setShowAddTool] = useState(false);
  const [toolSelectionOpen, setToolSelectionOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState([]);

  // Initial Data for Change Tracking
  const [initialData, setInitialData] = useState({});

  // Action Confirmation States
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  //============================================================
  // LIFECYCLE MANAGEMENT (useEffect hooks)
  //============================================================

  // Fetch Knowledge Bases
  useEffect(() => {
    console.log(agentData)
    axios
      .get('http://16.170.162.72:8000/documents')
      .then((response) => {
        console.log(response)
        const fetchedKBs = response.data.map((doc) => ({
          id: doc._id,
          name: doc.document_name,
          description: doc.description,
          collection_name: doc.collection_name,
        }));
        setAvailableKnowledgeBases(fetchedKBs);
      })
      .catch((error) => {
        console.error('Error fetching documents:', error);
      });
  }, []);

  // Fetch Agents
  useEffect(() => {
    api
      .get('/admin/agent-catelog/')
      .then((res) => {
        const mappedAgents = res.data.map((agent, index) => ({
          id: agent.AgentID || `AG-${String(index + 1).padStart(2, '0')}`,
          name: agent.AgentName,
          description: agent.AgentDesc,
          category: agent.Configuration?.category || 'General',
          creator: 'System',
          status: 'Active',
          updated: new Date(agent.CreatedOn).toISOString().split('T')[0],
          role: agent.Configuration?.function_description || '',
          instructions: agent.Configuration?.system_message || '',
          tools: agent.Configuration?.tools?.map((tool) => tool.name) || [],
          examples: `Example 1: Use ${agent.AgentName} for its function\nExample 2: Sample scenario for ${agent.AgentName}`,
        }));
        setAvailableAgents(mappedAgents);
      })
      .catch((err) => console.error('Error fetching agents:', err));
  }, []);

  // Fetch Tools
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await api.get('/admin/tool-chest/');
        if (response.status !== 200 || !response.data) throw new Error('Failed to fetch tools');
        const fetchedTools = response.data.map((tool, index) => ({
          id: tool.tool_id || `TL-${String(index + 1).padStart(2, '0')}`,
          tool_id: tool.tool_id,
          name: tool.tool_name || '',
          description: tool.description || `Automated process using ${tool.tool_name}`,
          category: tool.category || '',
          creator: tool.creator || 'System Generated',
          type: tool.type || 'github',
          updated: tool.date_added ? new Date(tool.date_added).toISOString().split('T')[0] : '',
          github_url: tool.github_url || '',
          requires_env_vars: tool.requires_env_vars || [],
          dependencies: tool.dependencies || [],
          uses_llm: tool.uses_llm || false,
          default_llm_model: tool.default_llm_model || '',
          default_system_instructions: tool.default_system_instructions || '',
          structured_output: tool.structured_output || false,
          input_schema: tool.input_schema || {},
          output_schema: tool.output_schema || {},
          config: tool.config || {},
          direct_to_user: tool.direct_to_user || false,
          respond_back_to_agent: tool.respond_back_to_agent || false,
          response_type: tool.response_type || '',
          call_back_url: tool.call_back_url || '',
          database_config_uri: tool.database_config_uri || '',
        }));
        setAvailableTools(fetchedTools);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };
    fetchTools();
  }, []);

  // Initialize Form with Agent Data
  useEffect(() => {
    if (agentData) {
      setAgentName(agentData.name || '');
      setAgentDescription(agentData.description || '');
      setAgentRole(agentData.role || '');
      setAgentCategory(agentData.category || 'General'); // Initialize category from agent data
      setAgentInstructions(agentData.instructions || '');
      setExamples(agentData.examples || '');
      setSelectedTools(agentData.tools?.map((tool) => tool.tool_id) || []);
      setIsManagerAgent(agentData.isManagerAgent || false);
      setSelectedManagerAgents(agentData.selectedManagerAgents || []);
      setManagerAgentIntention(agentData.managerAgentIntention || '');
      setSelectedKnowledgeBase(agentData.knowledge_base || null);
      setLlmProvider(agentData.llmProvider || 'OpenAI');
      setLlmModel(agentData.llmModel || 'gpt-4o');
      setCoreFeatures({
        knowledgeBase: agentData.knowledge_base ? true : false,
        dataQuery: agentData.coreFeatures?.dataQuery || false,
        shortTermMemory: agentData.coreFeatures?.shortTermMemory || false,
        longTermMemory: agentData.coreFeatures?.longTermMemory || false,
        humanizer: agentData.coreFeatures?.humanizer || false,
        reflection: agentData.coreFeatures?.reflection || false,
        groundedness: agentData.coreFeatures?.groundedness || false,
        contextRelevance: agentData.coreFeatures?.contextRelevance || false,
      });
      console.log(Object.keys(agentData.knowledge_base).length)
      setShowKnowledgeBaseSelector(
        agentData.knowledge_base && (Object.keys(agentData.knowledge_base).length > 0)
      );
      setStructuredOutputSchema(agentData.Configuration?.structured_output || false)
      setCoreFeatures(prev => ({
        ...prev,
        structuredOutput: !!agentData.Configuration?.structured_output_toggle
      }));

      setSelectedKnowledgeBase(agentData.knowledge_base)
      // If we're in test mode, automatically start the chat interface
      if (mode === 'test') {
        handleStartTest();
      }
    } else {
      setAgentName('');
      setAgentDescription('');
      setLlmProvider('OpenAI');
      setLlmModel('gpt-4o');
      setAgentRole('');
      setAgentCategory('General'); // Set default category
      setAgentInstructions('');
      setSelectedTools([]);
      setExamples('');
      setInquiry('Type your query...');
      setIsManagerAgent(false);
      setSelectedManagerAgents([]);
      setManagerAgentIntention('');
      setSelectedKnowledgeBase(null);
      setCoreFeatures({
        knowledgeBase: false, // Default to off for new agents
        dataQuery: false,
        shortTermMemory: false,
        longTermMemory: false,
        humanizer: false,
        reflection: false,
        groundedness: false,
        contextRelevance: false,
      });
      setShowKnowledgeBaseSelector(false);
    }

    setInitialData({
      agent_id: agentData?.agent_id,
      name: agentData?.name || '',
      description: agentData?.description || '',
      role: agentData?.role || '',
      category: agentData?.category || 'General', // Include category in initial data
      instructions: agentData?.instructions || '',
      examples: agentData?.examples || '',
      tools: [...(agentData?.tools || [])],
      isManagerAgent: agentData?.isManagerAgent || false,
      selectedManagerAgents: [...(agentData?.selectedManagerAgents || [])],
      managerAgentIntention: agentData?.managerAgentIntention || '',
      selectedKnowledgeBase: agentData?.knowledge_base || null,
      coreFeatures: agentData?.coreFeatures || {
        knowledgeBase: false, // Default to off for new agents
        dataQuery: false,
        shortTermMemory: false,
        longTermMemory: false,
        humanizer: false,
        reflection: false,
        groundedness: false,
        contextRelevance: false,
      },
    });

    setIsFormModified(false);
    setShowBackConfirmation(false);
    setShowDeleteConfirmation(false);
  }, [agentData, mode]);

  // Track Form Modifications
  useEffect(() => {
    // Don't track modifications in test mode
    if (mode === 'test') return;

    const currentData = {
      name: agentName,
      description: agentDescription,
      role: agentRole,
      category: agentCategory, // Include category in current data
      instructions: agentInstructions,
      examples: examples,
      tools: [...selectedTools],
      isManagerAgent: isManagerAgent,
      selectedManagerAgents: [...selectedManagerAgents],
      managerAgentIntention: managerAgentIntention,
      selectedKnowledgeBase: selectedKnowledgeBase,
      coreFeatures: { ...coreFeatures },
    };

    const isModified =
      currentData.name !== initialData.name ||
      currentData.description !== initialData.description ||
      currentData.role !== initialData.role ||
      currentData.category !== initialData.category || // Include category in modification check
      currentData.instructions !== initialData.instructions ||
      currentData.examples !== initialData.examples ||
      JSON.stringify(currentData.tools) !== JSON.stringify(initialData.tools) ||
      currentData.isManagerAgent !== initialData.isManagerAgent ||
      JSON.stringify(currentData.selectedManagerAgents) !== JSON.stringify(initialData.selectedManagerAgents) ||
      currentData.managerAgentIntention !== initialData.managerAgentIntention ||
      JSON.stringify(currentData.selectedKnowledgeBase) !== JSON.stringify(initialData.selectedKnowledgeBase) ||
      JSON.stringify(currentData.coreFeatures) !== JSON.stringify(initialData.coreFeatures);

    setIsFormModified(isModified);
  }, [
    agentName,
    agentDescription,
    agentRole,
    agentCategory, // Add category to dependency array 
    agentInstructions,
    examples,
    selectedTools,
    isManagerAgent,
    selectedManagerAgents,
    managerAgentIntention,
    selectedKnowledgeBase,
    coreFeatures,
    initialData,
    mode, // Add mode to dependency array
  ]);

  // Toggle Knowledge Base Selector
  useEffect(() => {
    if (agentData && agentData.knowledge_base && Object.keys(agentData.knowledge_base).length > 0) {
      console.log('setting to true');
      setShowKnowledgeBaseSelector(true);
    } else {
      setShowKnowledgeBaseSelector(false);
      // setSelectedKnowledgeBase(null);
    }
  }, [coreFeatures.knowledgeBase]);

  // Initialize Expanded State
  useEffect(() => {
    const anyCoreFeatureEnabled = Object.values(coreFeatures).some((value) => value === true);
    setCoreFeaturesSectionExpanded(!previewPaneExpanded || anyCoreFeatureEnabled);
    setManagerSectionExpanded(isManagerAgent);
    setToolsSectionExpanded(selectedTools.length > 0);
  }, [coreFeatures, isManagerAgent, selectedTools, previewPaneExpanded]);

  // Add beforeunload handler for browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormModified) {
        // The message text isn't actually displayed in modern browsers for security reasons
        // But setting this property triggers the confirmation dialog
        e.preventDefault();
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormModified]);

  //============================================================
  // HELPER FUNCTIONS
  //============================================================

  const shouldShowBackButton = () => {
    return agentData !== null;
  };

  const getHeaderText = () => {
    if (!agentData) {
      return 'Create Agent';
    }
    switch (mode) {
      case 'edit':
        return `Edit ${agentName}`;
      case 'test':
        return `Test ${agentName}`;
      case 'clone':
        return `Clone ${agentName}`;
      default:
        return `${agentName}`;
    }
  };

  const getUpdateButtonText = () => {
    if (!agentData) {
      return 'Create Agent';
    }
    switch (mode) {
      case 'edit':
        return 'Update Agent';
      case 'test':
        return 'Save & Test';
      case 'clone':
        return 'Create Clone';
      default:
        return 'Update';
    }
  };

  const isFormFieldDisabled = () => {
    return mode === 'test';
  };

  // Helper function to get tool details by ID
  const getToolDetails = (toolId) => {
    return availableTools.find((tool) => tool.tool_id === toolId);
  };

  //============================================================
  // HANDLERS
  //============================================================

  // Knowledge Base Handlers
  const handleSelectKnowledgeBase = (e) => {
    if (isFormFieldDisabled()) return;

    const kbId = e.target.value;
    if (kbId === '') {
      setSelectedKnowledgeBase(null);
    } else {
      const selected = availableKnowledgeBases.find((kb) => kb.id === kbId);
      setSelectedKnowledgeBase(selected);
    }
  };

  const toggleCoreFeatureSection = () => {
    if (isFormFieldDisabled()) return;
    setCoreFeaturesSectionExpanded(!coreFeaturesSectionExpanded);
  };

  const togglePreviewPane = () => {
    setPreviewPaneExpanded(!previewPaneExpanded);
  };

  // Tool Management Handlers
  const toggleToolsSection = () => {
    if (isFormFieldDisabled()) return;
    setToolsSectionExpanded(!toolsSectionExpanded);
  };

  const handleSaveTool = (toolData) => {
    if (isFormFieldDisabled()) return;

    if (!toolData.id) {
      toolData.id = `TL-${new Date().getTime().toString().slice(-6)}`;
      toolData.tool_id = toolData.id;
    }

    if (!availableTools.some((tool) => tool.id === toolData.id)) {
      setAvailableTools([...availableTools, { id: toolData.id, tool_id: toolData.id, name: toolData.name }]);
    }

    if (!selectedTools.includes(toolData.id)) {
      setSelectedTools([...selectedTools, toolData.id]);
    }

    setShowAddTool(false);
  };

  const handleSelectExistingTool = (toolId) => {
    if (isFormFieldDisabled()) return;

    if (!selectedTools.includes(toolId)) {
      setSelectedTools([...selectedTools, toolId]);
    }
    setToolSelectionOpen(false);
  };

  const getUnselectedTools = () => {
    return availableTools.filter((tool) => !selectedTools.includes(tool.tool_id));
  };

  const handleAddToolClick = () => {
    if (isFormFieldDisabled()) return;
    setToolSelectionOpen(true);
  };

  const handleCreateNewTool = () => {
    if (isFormFieldDisabled()) return;
    setToolSelectionOpen(false);
    setShowAddTool(true);
  };

  // Manager Agent Handlers
  const toggleManagerSection = () => {
    if (isFormFieldDisabled()) return;
    setManagerSectionExpanded(!managerSectionExpanded);
  };

  const handleToggleAgentSelector = () => {
    if (isFormFieldDisabled()) return;
    setShowAgentSelector(!showAgentSelector);
  };

  const handleSelectManagerAgent = (agentId) => {
    if (isFormFieldDisabled()) return;

    if (selectedManagerAgents.includes(agentId)) {
      setSelectedManagerAgents(selectedManagerAgents.filter((id) => id !== agentId));
    } else {
      setSelectedManagerAgents([...selectedManagerAgents, agentId]);
    }
  };

  const handleManagerIntentionChange = (e) => {
    if (isFormFieldDisabled()) return;
    setManagerAgentIntention(e.target.value);
  };

  const getSelectedAgentDetails = (agentId) => {
    return availableAgents.find((agent) => agent.id === agentId);
  };

  // Form Action Handlers
  const handleBackClick = () => {
    if (isFormModified) {
      setShowBackConfirmation(true);
    } else {
      onBack();
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmation(false);
    onBack();
  };

  const handleCancelBack = () => {
    setShowBackConfirmation(false);
  };

  const handleUpdateAgent = async () => {
    if (isFormFieldDisabled()) return;

    const config = {
      AgentID: agentData?.agent_id || null,
      AgentName: agentName,
      AgentDesc: agentDescription,
      CreatedOn: new Date().toISOString(),
      Configuration: {
        name: agentName.toLowerCase().replace(/\\s+/g, '_'),
        function_description: agentRole,
        system_message: agentInstructions,
        tools: availableTools
          .filter((tool) => selectedTools.includes(tool.tool_id))
          .map((tool) => ({
            tool_id: tool.tool_id,
            name: tool.name,
            description: tool.description,
            direct_to_user: tool.direct_to_user ?? true,
            save_to_db: tool.save_to_db ?? false,
            database_config: tool.database_config ?? {},
            post_to_callback: tool.post_to_callback ?? false,
            callback_url: tool.call_back_url ?? '',
            needs_structured_output: tool.structured_output ?? true,
            config: tool.config ?? {},
          })),
        category: agentCategory, // Include category in the configuration
        examples: examples,
        structured_output_toggle: coreFeatures.structuredOutput,
        structured_output: structuredOutputSchema,
        knowledge_base: selectedKnowledgeBase
          ? {
            id: selectedKnowledgeBase.id,
            name: selectedKnowledgeBase.name,
            enabled: 'yes',
            collection_name: selectedKnowledgeBase.collection_name,
            embedding_model: 'BAAI/bge-small-en-v1.5',
            description: selectedKnowledgeBase.description,
            number_of_chunks: 5,
          }
          : {},
      },
      isManagerAgent: isManagerAgent,
      selectedManagerAgents: selectedManagerAgents,
      managerAgentIntention: managerAgentIntention,
      selectedKnowledgeBase: selectedKnowledgeBase,
      knowledge_base: selectedKnowledgeBase
        ? {
          id: selectedKnowledgeBase.id,
          name: selectedKnowledgeBase.name,
          enabled: 'yes',
          collection_name: selectedKnowledgeBase.collection_name,
          embedding_model: 'BAAI/bge-small-en-v1.5',
          description: selectedKnowledgeBase.description,
          number_of_chunks: 5,
        }
        : {},
      coreFeatures: coreFeatures,
      llmProvider: llmProvider,
      llmModel: llmModel,
      examples: examples
    };

    try {
      const response = await api.put('admin/agent-catelog/create', config);
      console.log('Agent configuration updated:', JSON.stringify(config, null, 2));
      setIsFormModified(false);
      setAgentConfig(config);

      setInitialData({
        agent_id: agentData?.agent_id,
        name: agentName,
        description: agentDescription,
        role: agentRole,
        category: agentCategory, // Include category in initial data after update
        instructions: agentInstructions,
        examples: examples,
        tools: [...selectedTools],
        isManagerAgent,
        selectedManagerAgents: [...selectedManagerAgents],
        managerAgentIntention,
        selectedKnowledgeBase,
        coreFeatures: { ...coreFeatures },
      });

      // Use non-intrusive notification instead of alert
      const successNotification = document.createElement('div');
      successNotification.className = 'success-notification';
      successNotification.textContent = 'Agent updated successfully!';
      document.body.appendChild(successNotification);

      setTimeout(() => {
        document.body.removeChild(successNotification);

        // Navigate after notification if needed
      }, 2000);
    } catch (error) {
      console.error('Error updating agent:', error);

      // Use non-intrusive error notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'error-notification';
      errorNotification.textContent = 'Failed to update agent. Please try again.';
      document.body.appendChild(errorNotification);

      setTimeout(() => {
        document.body.removeChild(errorNotification);
      }, 3000);
    }
  };

  const handleStartTest = () => {
    if (!agentData?.agent_id && mode !== 'edit' && mode !== 'test') {
      // Use non-intrusive notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'warning-notification';
      notification.textContent = 'Please save the agent before sandbox testing.';
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);

      return;
    }

    const config = {
      AgentID: agentData?.agent_id || null,
      AgentName: agentName,
      AgentDesc: agentDescription,
      CreatedOn: new Date().toISOString(),
      Configuration: {
        name: agentName.toLowerCase().replace(/\\s+/g, '_'),
        function_description: agentRole,
        system_message: agentInstructions,
        category: agentCategory, // Include category in test configuration
        examples: examples,
        structured_output_toggle: coreFeatures.structuredOutput,
        structured_output: coreFeatures.structuredOutput ? JSON.parse(structuredOutputSchema).structured_output : null,
        tools: availableTools
          .filter((tool) => selectedTools.includes(tool.tool_id))
          .map((tool) => ({
            tool_id: tool.tool_id,
            name: tool.name,
            description: tool.description,
            direct_to_user: tool.direct_to_user ?? true,
            save_to_db: tool.save_to_db ?? false,
            database_config: tool.database_config ?? {},
            post_to_callback: tool.post_to_callback ?? false,
            callback_url: tool.call_back_url ?? '',
            needs_structured_output: tool.structured_output ?? true,
            config: tool.config ?? {},
          })),
        knowledge_base: selectedKnowledgeBase
          ? {
            id: selectedKnowledgeBase.id,
            name: selectedKnowledgeBase.name,
            enabled: 'yes',
            collection_name: selectedKnowledgeBase.collection_name,
            embedding_model: 'BAAI/bge-small-en-v1.5',
            description: selectedKnowledgeBase.description,
            number_of_chunks: 5,
          }
          : {},
      },
      isManagerAgent: isManagerAgent,
      selectedManagerAgents: selectedManagerAgents,
      managerAgentIntention: managerAgentIntention,
      selectedKnowledgeBase: selectedKnowledgeBase,
      knowledge_base: selectedKnowledgeBase
        ? {
          id: selectedKnowledgeBase.id,
          name: selectedKnowledgeBase.name,
          enabled: 'yes',
          collection_name: selectedKnowledgeBase.collection_name,
          embedding_model: 'BAAI/bge-small-en-v1.5',
          description: selectedKnowledgeBase.description,
          number_of_chunks: 5,
        }
        : {},
      coreFeatures: coreFeatures,
      llmProvider: llmProvider,
      llmModel: llmModel,
      examples: examples
    };

    setAgentConfig(config);
    setIsChatStarted(true);
    setPreviewPaneExpanded(true);
  };

  const handleDeleteClick = () => {
    if (isFormFieldDisabled()) return;

    if (!agentData?.agent_id) {
      // Use non-intrusive notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = 'The agent does not exist!';
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);

      return;
    }

    // Show inline confirmation instead of window.confirm
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await api.delete('/admin/agent-catelog/delete', {
        data: { AgentID: agentData.agent_id },
      });

      // Use non-intrusive notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.textContent = res.data.message || 'Agent deleted successfully';
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;

      // Use non-intrusive error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.textContent = `Error deleting agent: ${errorMsg}`;
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);

      setShowDeleteConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleFeatureToggle = (featureName) => {
    if (isFormFieldDisabled()) return;
    console.log(agentData)
    console.log('toggle knowledgebase')
    setCoreFeatures({
      ...coreFeatures,
      [featureName]: !coreFeatures[featureName],
    });
  };
  //============================================================
  // RENDER
  //============================================================

  return (
    <div className={`main-content ${previewPaneExpanded ? 'preview-expanded' : 'preview-collapsed'}`}>
      {/* LEFT SIDE: Form Side */}
      <div className="form-grid">
        {/* Page Header */}
        <div className="page-header section-header">
          <h1>{getHeaderText()}</h1>
        </div>

        {/* Back Button or Back Confirmation */}
        <div className="section-back">
          {!showBackConfirmation ? (
            <button
              className={`btn btn-secondary ${isFormModified ? 'has-changes' : ''}`}
              onClick={handleBackClick}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.6667 3.33333L5.33333 8L10.6667 12.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
              {isFormModified && (
                <span className="unsaved-indicator" title="You have unsaved changes"></span>
              )}
            </button>
          ) : (
            <div className="back-confirmation">
              <span className="confirmation-message">You have unsaved changes. Discard them?</span>
              <div className="confirmation-actions">
                <button className="btn btn-text" onClick={handleCancelBack}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmBack}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Agent Name */}
        <div className="form-row section-name">
          <div className="tooltip-container">
            <label className="form-label">Name</label>
            <svg
              className="info-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.6667V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.33333H8.00667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="tooltip-text">Enter a unique name for your AI agent</span>
          </div>
          <input
            type="text"
            className="form-control"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Enter agent name"
            disabled={isFormFieldDisabled()}
          />
        </div>

        {/* Agent Description */}
        <div className="form-row section-description">
          <label className="form-label">
            Description
            <svg
              className="info-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.6667V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.33333H8.00667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <input
            type="text"
            className="form-control"
            value={agentDescription}
            onChange={(e) => setAgentDescription(e.target.value)}
            placeholder="Enter agent description"
            disabled={isFormFieldDisabled()}
          />
        </div>

        {/* LLM Provider and Model */}
        <div className="form-row section-llm">
          <div className="llm-section-container">
            <div className="llm-provider-select">
              <label className="form-label">
                LLM Provider
                <svg
                  className="info-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10.6667V8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 5.33333H8.00667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
              <div className="select-wrapper">
                <select
                  className="form-select"
                  value={llmProvider}
                  onChange={(e) => setLlmProvider(e.target.value)}
                  disabled={isFormFieldDisabled()}
                >
                  <option>OpenAI</option>
                  <option>Anthropic</option>
                  <option>Google</option>
                  <option>Mistral</option>
                </select>
              </div>
            </div>
            <div className="llm-model-select">
              <label className="form-label">
                LLM Model
                <svg
                  className="info-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10.6667V8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 5.33333H8.00667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
              <div className="select-wrapper">
                <select
                  className="form-select"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  disabled={isFormFieldDisabled()}
                >
                  <option>gpt-4o</option>
                  <option>gpt-4</option>
                  <option>gpt-3.5-turbo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Role */}
        <div className="form-row section-role">
          <label className="form-label">
            Agent Role
            <svg
              className="info-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.6667V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.33333H8.00667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <input
            type="text"
            className="form-control"
            value={agentRole}
            onChange={(e) => setAgentRole(e.target.value)}
            placeholder="Define the role of this agent"
            disabled={isFormFieldDisabled()}
          />
        </div>

        {/* Agent Category - Added new field */}
        <div className="form-row section-category">
          <label className="form-label">
            Agent Category
            <svg
              className="info-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.6667V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.33333H8.00667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <input
            type="text"
            className="form-control"
            value={agentCategory}
            onChange={(e) => setAgentCategory(e.target.value)}
            placeholder="Specify the category for this agent"
            disabled={isFormFieldDisabled()}
          />
        </div>

        {/* Agent Instructions */}
        <div className="form-row section-instructions">
          <label className="form-label">
            Agent Instructions
            <svg
              className="info-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.6667V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.33333H8.00667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <div className="instruction-container">
            <textarea
              className="form-textarea instruction-textarea"
              value={agentInstructions}
              onChange={(e) => setAgentInstructions(e.target.value)}
              placeholder="Enter detailed instructions for the agent"
              rows="10"
              disabled={isFormFieldDisabled()}
            ></textarea>
          </div>
        </div>

        {/* Tool Configuration Section */}
        <div className="form-row features-section section-tools">
          <div className="features-section-header" onClick={toggleToolsSection}>
            <h3 className="features-title">Tool Configuration</h3>
            <svg
              className="toggle-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {toolsSectionExpanded && (
            <div className="tools-content">
              {selectedTools.length > 0 && (
                <div className="selected-tools">
                  <h4>Selected Tools:</h4>
                  <ul className="tools-list">
                    {selectedTools.map((toolId) => {
                      const tool = getToolDetails(toolId);
                      return (
                        <li key={toolId} className="tool-item">
                          <div className="tool-item-content">
                            <span className="tool-name" title={tool?.description}>
                              {tool?.name}
                            </span>
                            {tool?.description && (
                              <div className="tool-description">
                                {tool.description}
                              </div>
                            )}
                          </div>
                          <button
                            className="tool-remove-btn"
                            onClick={() => setSelectedTools(selectedTools.filter((id) => id !== toolId))}
                            disabled={isFormFieldDisabled()}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4L4 12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4 4L12 12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!toolSelectionOpen && !isFormFieldDisabled() && (
                <button
                  className="add-tool-btn"
                  onClick={handleAddToolClick}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 3.33334V12.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.33331 8H12.6666"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Add Tool
                </button>
              )}

              {toolSelectionOpen && (
                <div className="tool-selection-panel">
                  <h4>Select a Tool</h4>
                  {getUnselectedTools().length > 0 ? (
                    <>
                      <div className="existing-tools-section">
                        <h5>Choose from existing tools:</h5>
                        <div className="tools-dropdown">
                          {getUnselectedTools().map((tool) => (
                            <div
                              key={tool.tool_id}
                              className="tool-option"
                              onClick={() => handleSelectExistingTool(tool.tool_id)}
                            >
                              <div className="tool-option-content">
                                <div className="tool-option-name">{tool.name}</div>
                                {tool.description && (
                                  <div className="tool-option-description">{tool.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="tool-selection-divider">
                        <span>OR</span>
                      </div>
                    </>
                  ) : (
                    <p>No more existing tools available.</p>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateNewTool}
                  >
                    Create New Tool
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setToolSelectionOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Manager Agent Toggle */}
        <div className="form-row section-manager">
          <div className="section-header" onClick={toggleManagerSection}>
            <div className="section-title-row">
              <label className="form-label">
                Manager Agent
                <svg
                  className="info-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10.6667V8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 5.33333H8.00667"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="managerToggle"
                  checked={isManagerAgent}
                  onChange={(e) => setIsManagerAgent(e.target.checked)}
                  disabled={isFormFieldDisabled()}
                />
                <label htmlFor="managerToggle" className="toggle-slider"></label>
              </div>
            </div>
            {isManagerAgent && (
              <svg
                className="toggle-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Manager Agent Selection */}
        {isManagerAgent && managerSectionExpanded && (
          <div className="form-row manager-agent-section section-manager-details">
            <div className="manager-alert">
              <svg
                className="warning-icon"
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 5.33333V8"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 10.6667H8.00667"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667Z"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                This feature is best experienced when using high reasoning models (such as gpt-4o, o3-mini,
                claude-3-5, etc)
              </span>
            </div>

            <div className="agent-selection-container">
              <div className="selection-header">
                <label className="form-label">Managed Agents</label>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleToggleAgentSelector}
                  disabled={isFormFieldDisabled()}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 3.33334V12.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.33331 8H12.6666"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {showAgentSelector ? 'Close' : 'Select Agents'}
                </button>
              </div>

              {selectedManagerAgents.length > 0 ? (
                <ul className="selected-agents-list">
                  {selectedManagerAgents.map((agentId) => {
                    const agent = getSelectedAgentDetails(agentId);
                    return (
                      agent && (
                        <li key={agentId} className="selected-agent-item">
                          <div className="agent-info">
                            <div className="agent-id">{agent.id}</div>
                            <div className="agent-name">{agent.name}</div>
                          </div>
                          <button
                            className="agent-remove-btn"
                            onClick={() => handleSelectManagerAgent(agentId)}
                            disabled={isFormFieldDisabled()}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4L4 12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M4 4L12 12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </li>
                      )
                    );
                  })}
                </ul>
              ) : (
                <div className="no-agents-selected">
                  No agents selected. Click "Select Agents" to choose agents for this manager to coordinate.
                </div>
              )}

              {showAgentSelector && (
                <div className="agent-selector-panel">
                  <div className="selector-header">
                    <h4>Select Agents to Manage</h4>
                    <input type="text" className="agent-search" placeholder="Search agents..." />
                  </div>
                  <div className="agent-list">
                    {availableAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className={`agent-option ${selectedManagerAgents.includes(agent.id) ? 'selected' : ''}`}
                        onClick={() => handleSelectManagerAgent(agent.id)}
                      >
                        <div className="agent-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedManagerAgents.includes(agent.id)}
                            onChange={() => { }}
                            id={`agent-${agent.id}`}
                            disabled={isFormFieldDisabled()}
                          />
                          <label htmlFor={`agent-${agent.id}`}></label>
                        </div>
                        <div className="agent-details">
                          <div className="agent-header">
                            <span className="agent-id">{agent.id}</span>
                            <span className="agent-name">{agent.name}</span>
                          </div>
                          <div className="agent-description">{agent.description}</div>
                          <div className="agent-category">
                            <span className="category-tag">{agent.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="manager-intention">
                <label className="form-label">
                  How would you use this agent?
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </label>
                <textarea
                  className="form-textarea"
                  value={managerAgentIntention}
                  onChange={handleManagerIntentionChange}
                  placeholder="Describe how you intend to use this manager agent (e.g., 'Coordinate risk assessment across multiple agents' or 'Manage data privacy compliance workflow')"
                  disabled={isFormFieldDisabled()}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Core Features Section */}
        <div className="form-row features-section section-features">
          <div className="features-section-header" onClick={toggleCoreFeatureSection}>
            <h3 className="features-title">Core Features</h3>
            <svg
              className="toggle-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {coreFeaturesSectionExpanded && (
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-label">
                  <span>Knowledge Base</span>
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round" />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="knowledgeBaseToggle"
                    checked={coreFeatures.knowledgeBase}
                    onChange={() => handleFeatureToggle('knowledgeBase')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="knowledgeBaseToggle" className="toggle-slider"></label>
                </div>
              </div>

              {coreFeatures.knowledgeBase && (
                <div className="knowledge-base-section">
                  <div className="knowledge-base-selector">
                    <label className="form-label">Select Knowledge Base</label>
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        value={selectedKnowledgeBase ? selectedKnowledgeBase.id : ''}
                        onChange={handleSelectKnowledgeBase}
                        disabled={isFormFieldDisabled()}
                      >
                        <option value="">Select a knowledge base</option>
                        {availableKnowledgeBases.map((kb) => (
                          <option key={kb.id} value={kb.id}>
                            {kb.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedKnowledgeBase && (
                    <div className="selected-knowledge-base">
                      <div className="knowledge-base-name">{selectedKnowledgeBase.name}</div>
                      <div className="knowledge-base-description">{selectedKnowledgeBase.description}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="feature-item">
                <div className="feature-label">
                  <span>Data Query</span>
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="dataQueryToggle"
                    checked={coreFeatures.dataQuery}
                    onChange={() => handleFeatureToggle('dataQuery')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="dataQueryToggle" className="toggle-slider"></label>
                </div>
              </div>



              <div className="feature-item">
                <div className="feature-label">
                  <span>Long Term Memory</span>
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="longTermMemoryToggle"
                    checked={coreFeatures.longTermMemory}
                    onChange={() => handleFeatureToggle('longTermMemory')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="longTermMemoryToggle" className="toggle-slider"></label>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-label">
                  <span>Structured Output</span>
                  <svg
                    className="info-icon"
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <path d="M8 10.6667V8"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="structuredOutputToggle"
                    checked={coreFeatures.structuredOutput}
                    onChange={() => handleFeatureToggle('structuredOutput')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="structuredOutputToggle" className="toggle-slider"></label>
                </div>
              </div>

              {/* When toggled on, show JSON schema editor */}
              {console.log(coreFeatures.structuredOutput)}
              {coreFeatures.structuredOutput && (
                <div className="structured-output-section">
                  <label className="form-label" htmlFor="structuredOutputBuilder">
                    Structured Output Configuration
                  </label>

                  <StructuredOutputBuilder
                    onChange={setStructuredOutputSchema}
                    disabled={isFormFieldDisabled()}
                    structuredOutputSchema={structuredOutputSchema}
                  />
                </div>
              )}


              <div className="feature-category-header">
                <span>Responsible AI</span>
              </div>

              <div className="feature-item">
                <div className="feature-label">
                  <span>Humanizer</span>
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="humanizerToggle"
                    checked={coreFeatures.humanizer}
                    onChange={() => handleFeatureToggle('humanizer')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="humanizerToggle" className="toggle-slider"></label>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-label">
                  <span>Reflection</span>
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="reflectionToggle"
                    checked={coreFeatures.reflection}
                    onChange={() => handleFeatureToggle('reflection')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="reflectionToggle" className="toggle-slider"></label>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-label">
                  <span>Groundedness</span>
                  <svg
                    className="info-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333H8.00667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="groundednessToggle"
                    checked={coreFeatures.groundedness}
                    onChange={() => handleFeatureToggle('groundedness')}
                    disabled={isFormFieldDisabled()}
                  />
                  <label htmlFor="groundednessToggle" className="toggle-slider"></label>
                </div>
              </div>
            </div>

          )}
        </div>

        {/* Examples */}
        <div className="form-row section-examples">
          <label className="form-label">
            Examples
            <svg
              className="info-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.6667V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 5.33333H8.00667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </label>
          <textarea
            className="form-textarea examples-textarea"
            value={examples}
            onChange={(e) => setExamples(e.target.value)}
            placeholder="Provide example queries or use cases for this agent"
            rows="5"
            disabled={isFormFieldDisabled()}
          ></textarea>
        </div>

        {/* Action Buttons and Status */}
        <div className="section-update">
          {/* Persistent notification for unsaved changes */}
          {isFormModified && (
            <span className="save-status">Changes not saved</span>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirmation ? (
            <div className="delete-confirmation">
              <span className="confirmation-message">Are you sure you want to delete this agent?</span>
              <div className="confirmation-actions">
                <button className="btn btn-text" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="button-group">
              {!isFormFieldDisabled() && (
                <button
                  className="update-btn"
                  onClick={handleUpdateAgent}
                >
                  {getUpdateButtonText()}
                </button>
              )}
              <button
                className="test-agent-btn"
                onClick={handleStartTest}
              >
                Test Agent
              </button>
              {agentData?.agent_id && !isFormFieldDisabled() && (
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteClick}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Pane Toggle Button */}
      <div className={`preview-toggle ${previewPaneExpanded ? '' : 'collapsed'}`} onClick={togglePreviewPane}>
        <svg
          className="toggle-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* RIGHT SIDE: Preview Pane with Chat Interface */}
      {previewPaneExpanded && (
        <div className="preview-pane">
          {showAddTool ? (
            <div className="preview-content">
              <div className="add-tool-view">
                <div className="page-header">
                  <h1>Configure Tool</h1>
                </div>
                <AddToolView
                  onSave={handleSaveTool}
                  onCancel={() => setShowAddTool(false)}
                  renderHeader={false}
                  saveButtonText="Add to Agent"
                />
              </div>
            </div>
          ) : (
            <>
              {isChatStarted ? (
                coreFeatures.structuredOutput ? (
                  <ChatInterface
                    agentConfig={agentConfig}
                    inquiry={inquiry}
                    setInquiry={setInquiry}
                  />
                ) : (
                  <ChatInterfaceNormal
                    agentConfig={agentConfig}
                    inquiry={inquiry}
                    setInquiry={setInquiry}
                  />
                )
              ) : (
                <div className="preview-content">
                  <div className="preview-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3>Preview Panel</h3>
                    <p>Configure your agent to see the results of your agent performance</p>
                  </div>
                </div>
              )}

              {!isChatStarted && (
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type your query..."
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                  />
                  <button className="btn-icon" onClick={handleStartTest}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.6666 8H1.33331" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 1.33333L1.33333 8L8 14.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Tool Modal */}
      {showAddTool && !previewPaneExpanded && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddToolView
              onSave={handleSaveTool}
              onCancel={() => setShowAddTool(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentBuilderView;
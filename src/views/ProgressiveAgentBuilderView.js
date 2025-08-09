import React, { useState, useEffect } from 'react';
import api from '../axios/api'; // Configured Axios instance
import axios from 'axios';
import AddToolView from './AddToolView';
import ChatInterface from '../components/ChatInterface';
import ChatInterfaceNormal from '../components/ChatInterfactNormal';
import StructuredOutputBuilder from '../components/StructuredOutputBuilder';

// Add this CSS at the top after imports
const agentDetailStyles = `
.selected-agent-item-detailed {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #f9f9f9;
}

.agent-details-form {
  margin-top: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.capability-input {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.capability-input .form-control {
  flex: 1;
  margin-right: 8px;
}

.remove-capability-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-capability-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
}
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = agentDetailStyles;
  document.head.appendChild(styleSheet);
}

const ProgressiveAgentBuilderView = ({ agentData = null, onBack = () => { }, mode = 'create' }) => {
  //============================================================
  // STATE MANAGEMENT - Preserving all original state variables
  //============================================================

  // View Mode State (Progressive Disclosure)
  const [viewMode, setViewMode] = useState('essential'); // 'essential', 'advanced', 'test'

  // Basic Agent Information
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [agentConfig, setAgentConfig] = useState({});
  const [structuredOutputSchema, setStructuredOutputSchema] = useState({})

  // LLM Configuration
  const [llmProvider, setLlmProvider] = useState('OpenAI');
  const [llmModel, setLlmModel] = useState('gpt-40');

  // Agent Functionality
  const [agentRole, setAgentRole] = useState('');
  const [agentCategory, setAgentCategory] = useState('General');
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
  const [selectedAgentDetails, setSelectedAgentDetails] = useState({});

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
  
  // Loading & Notification States
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  //============================================================
  // LIFECYCLE MANAGEMENT (useEffect hooks) - Preserved from original
  //============================================================

  // Fetch Knowledge Bases
  useEffect(() => {
    axios
      .get('http://16.170.162.72:8000/documents')
      .then((response) => {
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

  // Initialize Form with Agent Data - FIXED TO HANDLE MANAGER AGENTS
  useEffect(() => {
    if (agentData) {
      setAgentName(agentData.name || '');
      setAgentDescription(agentData.description || '');
      setAgentRole(agentData.role || '');
      setAgentCategory(agentData.category || 'General');
      setAgentInstructions(agentData.instructions || '');
      setExamples(agentData.examples || '');
      setSelectedTools(agentData.tools?.map((tool) => tool.tool_id) || []);
      
      // FIX: Properly detect and set manager agent status from backend data
      const isManager = agentData.AgentType === 'manager' || agentData.isManagerAgent || false;
      setIsManagerAgent(isManager);
      
      // FIX: Extract managed agents from Configuration.managed_agents
      let managedAgentIds = [];
      let agentDetails = {};
      
      if (isManager && agentData.Configuration?.managed_agents) {
        managedAgentIds = agentData.Configuration.managed_agents.map(agent => agent.AgentID);
        
        // Build selectedAgentDetails from the managed_agents data
        agentData.Configuration.managed_agents.forEach(agent => {
          agentDetails[agent.AgentID] = {
            capabilities: agent.capabilities || ["General AI assistance", "Task coordination"],
            contextual_usage: agent.contextual_usage || `Used for ${agent.specialization || 'general'} tasks and coordination`,
            specialization: agent.specialization || 'General',
            when_to_use: agent.when_to_use || `When you need ${agent.specialization || 'assistance'} support`
          };
        });
      }
      
      setSelectedManagerAgents(managedAgentIds);
      setSelectedAgentDetails(agentDetails);
      setManagerAgentIntention(agentData.managerAgentIntention || '');
      
      setSelectedKnowledgeBase(agentData.knowledge_base || null);
      setLlmProvider(agentData.llmProvider || 'OpenAI');
      setLlmModel(agentData.llmModel || 'gpt-40');
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
      setShowKnowledgeBaseSelector(
        agentData.knowledge_base && (Object.keys(agentData.knowledge_base).length > 0)
      );
      setStructuredOutputSchema(agentData.Configuration?.structured_output || false)
      setCoreFeatures(prev => ({
        ...prev,
        structuredOutput: !!agentData.Configuration?.structured_output_toggle
      }));

      setSelectedKnowledgeBase(agentData.knowledge_base);
      
      // If we're in test mode, automatically start the chat interface
      if (mode === 'test') {
        handleStartTest();
      }
    } else {
      setAgentName('');
      setAgentDescription('');
      setLlmProvider('OpenAI');
      setLlmModel('gpt-40');
      setAgentRole('');
      setAgentCategory('General');
      setAgentInstructions('');
      setSelectedTools([]);
      setExamples('');
      setInquiry('Type your query...');
      setIsManagerAgent(false);
      setSelectedManagerAgents([]);
      setManagerAgentIntention('');
      setSelectedKnowledgeBase(null);
      setSelectedAgentDetails({});
      setCoreFeatures({
        knowledgeBase: false,
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
      category: agentData?.category || 'General',
      instructions: agentData?.instructions || '',
      examples: agentData?.examples || '',
      tools: [...(agentData?.tools || [])],
      isManagerAgent: agentData?.AgentType === 'manager' || agentData?.isManagerAgent || false,
      selectedManagerAgents: [...(agentData?.selectedManagerAgents || [])],
      managerAgentIntention: agentData?.managerAgentIntention || '',
      selectedKnowledgeBase: agentData?.knowledge_base || null,
      selectedAgentDetails: { ...(agentData?.selectedAgentDetails || {}) },
      coreFeatures: agentData?.coreFeatures || {
        knowledgeBase: false,
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
    
    // Set initial view mode
    setViewMode('essential');
  }, [agentData, mode]);

  // Track Form Modifications
  useEffect(() => {
    // Don't track modifications in test mode
    if (mode === 'test') return;

    const currentData = {
      name: agentName,
      description: agentDescription,
      role: agentRole,
      category: agentCategory,
      instructions: agentInstructions,
      examples: examples,
      tools: [...selectedTools],
      isManagerAgent: isManagerAgent,
      selectedManagerAgents: [...selectedManagerAgents],
      managerAgentIntention: managerAgentIntention,
      selectedKnowledgeBase: selectedKnowledgeBase,
      coreFeatures: { ...coreFeatures },
      selectedAgentDetails: { ...selectedAgentDetails },
    };

    const isModified =
      currentData.name !== initialData.name ||
      currentData.description !== initialData.description ||
      currentData.role !== initialData.role ||
      currentData.category !== initialData.category ||
      currentData.instructions !== initialData.instructions ||
      currentData.examples !== initialData.examples ||
      JSON.stringify(currentData.tools) !== JSON.stringify(initialData.tools) ||
      currentData.isManagerAgent !== initialData.isManagerAgent ||
      JSON.stringify(currentData.selectedManagerAgents) !== JSON.stringify(initialData.selectedManagerAgents) ||
      currentData.managerAgentIntention !== initialData.managerAgentIntention ||
      JSON.stringify(currentData.selectedKnowledgeBase) !== JSON.stringify(initialData.selectedKnowledgeBase) ||
      JSON.stringify(currentData.coreFeatures) !== JSON.stringify(initialData.coreFeatures) ||
      JSON.stringify(currentData.selectedAgentDetails) !== JSON.stringify(initialData.selectedAgentDetails || {});

    setIsFormModified(isModified);
  }, [
    agentName,
    agentDescription,
    agentRole,
    agentCategory,
    agentInstructions,
    examples,
    selectedTools,
    isManagerAgent,
    selectedManagerAgents,
    managerAgentIntention,
    selectedKnowledgeBase,
    coreFeatures,
    initialData,
    mode,
    selectedAgentDetails,
  ]);

  // Toggle Knowledge Base Selector
  useEffect(() => {
    if (agentData && agentData.knowledge_base && Object.keys(agentData.knowledge_base).length > 0) {
      setShowKnowledgeBaseSelector(true);
    } else {
      setShowKnowledgeBaseSelector(false);
    }
  }, [coreFeatures.knowledgeBase, agentData]);

  // Initialize Expanded State - FIX: Auto-expand manager section when manager agent is loaded
  useEffect(() => {
    const anyCoreFeatureEnabled = Object.values(coreFeatures).some((value) => value === true);
    setCoreFeaturesSectionExpanded(!previewPaneExpanded || anyCoreFeatureEnabled);
    setManagerSectionExpanded(isManagerAgent); // Auto-expand when manager agent is detected
    setToolsSectionExpanded(selectedTools.length > 0);
  }, [coreFeatures, isManagerAgent, selectedTools, previewPaneExpanded]);

  // Add beforeunload handler for browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormModified) {
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

  //============================================================
  // HANDLERS
  //============================================================

  // New Progressive Disclosure Handlers
  const toggleAdvancedMode = () => {
    setViewMode(viewMode === 'essential' ? 'advanced' : 'essential');
  };

  const enterTestMode = () => {
    setViewMode('test');
  };

  const exitTestMode = () => {
    setViewMode('essential');
    setIsChatStarted(false);
  };

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
      // Remove agent and its details
      setSelectedManagerAgents(selectedManagerAgents.filter((id) => id !== agentId));
      const newDetails = { ...selectedAgentDetails };
      delete newDetails[agentId];
      setSelectedAgentDetails(newDetails);
    } else {
      // Add agent with default details
      setSelectedManagerAgents([...selectedManagerAgents, agentId]);
      const agent = availableAgents.find(a => a.id === agentId);
      const newAgentDetails = {
        capabilities: ["General AI assistance", "Task coordination"],
        contextual_usage: `Used for ${agent?.category || 'general'} tasks and coordination`,
        specialization: agent?.category || 'General',
        when_to_use: `When you need ${agent?.role || 'assistance'} or ${agent?.category || 'general'} support`
      };
      
      setSelectedAgentDetails(prev => ({
        ...prev,
        [agentId]: newAgentDetails
      }));
    }
  };

  const handleAgentDetailChange = (agentId, field, value) => {
    if (isFormFieldDisabled()) return;
    
    setSelectedAgentDetails(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        [field]: value
      }
    }));
  };

  const handleCapabilityChange = (agentId, index, value) => {
    if (isFormFieldDisabled()) return;
    
    setSelectedAgentDetails(prev => {
      const newCapabilities = [...(prev[agentId]?.capabilities || [])];
      newCapabilities[index] = value;
      return {
        ...prev,
        [agentId]: {
          ...prev[agentId],
          capabilities: newCapabilities
        }
      };
    });
  };

  const addCapability = (agentId) => {
    if (isFormFieldDisabled()) return;
    
    setSelectedAgentDetails(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        capabilities: [...(prev[agentId]?.capabilities || []), ""]
      }
    }));
  };

  const removeCapability = (agentId, index) => {
    if (isFormFieldDisabled()) return;
    
    setSelectedAgentDetails(prev => {
      const newCapabilities = [...(prev[agentId]?.capabilities || [])];
      newCapabilities.splice(index, 1);
      return {
        ...prev,
        [agentId]: {
          ...prev[agentId],
          capabilities: newCapabilities
        }
      };
    });
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

  // Show a non-intrusive notification toast
  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification({
        show: false,
        type: '',
        message: ''
      });
    }, 3000);
  };

  const handleUpdateAgent = async () => {
    if (isFormFieldDisabled()) return;

    setIsLoading(true);

    const config = {
      AgentID: agentData?.agent_id || null,
      AgentName: agentName,
      AgentDesc: agentDescription,
      CreatedOn: new Date().toISOString(),
      AgentType: isManagerAgent ? "manager" : "standard",
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
        category: agentCategory,
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
        managed_agents: isManagerAgent ? selectedManagerAgents.map((agentId) => {
          const agent = availableAgents.find(a => a.id === agentId);
          const details = selectedAgentDetails[agentId] || {
            capabilities: ["General AI assistance", "Task coordination"],
            contextual_usage: `Used for ${agent?.category || 'general'} tasks and coordination`,
            specialization: agent?.category || 'General',
            when_to_use: `When you need ${agent?.role || 'assistance'} or ${agent?.category || 'general'} support`
          };
          
          return {
            _id: { $oid: agent?.id || agentId },
            AgentID: agentId,
            AgentName: agent?.name || '',
            capabilities: details.capabilities || ["General AI assistance", "Task coordination"],
            contextual_usage: details.contextual_usage || `Used for ${agent?.category || 'general'} tasks and coordination`,
            specialization: details.specialization || agent?.category || 'General',
            when_to_use: details.when_to_use || `When you need ${agent?.role || 'assistance'} or ${agent?.category || 'general'} support`,
            AgentDesc: agent?.description || '',
            CreatedOn: agent?.CreatedOn || new Date().toISOString(),
            Configuration: {
              name: agent?.name?.toLowerCase().replace(/\s+/g, '_') || '',
              function_description: agent?.role || '',
              system_message: agent?.instructions || '',
              tools: (agent?.tools || []).map(toolName => {
                const tool = availableTools.find(t => t.name === toolName);
                return tool ? {
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
                } : null;
              }).filter(Boolean),
              category: agent?.category || 'General',
              examples: agent?.examples || '',
              structured_output_toggle: false,
              structured_output: {},
              knowledge_base: {}
            },
            isManagerAgent: false,
            selectedManagerAgents: [],
            managerAgentIntention: "",
            selectedKnowledgeBase: {},
            coreFeatures: {
              knowledgeBase: false,
              dataQuery: false,
              shortTermMemory: false,
              longTermMemory: false,
              humanizer: false,
              reflection: false,
              groundedness: false,
              contextRelevance: false,
              structuredOutput: false
            },
            knowledge_base: {},
            llmModel: agent?.llmModel || "gpt-40",
            llmProvider: agent?.llmProvider || "OpenAI",
            examples: agent?.examples || ''
          };
        }) : [],
        supervisor_settings: isManagerAgent ? {
          output_mode: "handoff",
          add_handoff_messages: true,
          handoff_tool_prefix: "handoff_to_",
          use_message_forwarding: false
        } : {}
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
      examples: examples,
      selectedAgentDetails: selectedAgentDetails
    };

    try {
      const response = await api.put('admin/agent-catelog/create', config);
      setIsFormModified(false);
      setAgentConfig(config);

      setInitialData({
        agent_id: agentData?.agent_id,
        name: agentName,
        description: agentDescription,
        role: agentRole,
        category: agentCategory,
        instructions: agentInstructions,
        examples: examples,
        tools: [...selectedTools],
        isManagerAgent,
        selectedManagerAgents: [...selectedManagerAgents],
        managerAgentIntention,
        selectedKnowledgeBase,
        coreFeatures: { ...coreFeatures },
        selectedAgentDetails: { ...selectedAgentDetails },
      });

      setIsLoading(false);
      showNotification('success', 'Agent updated successfully!');
    } catch (error) {
      console.error('Error updating agent:', error);
      setIsLoading(false);
      showNotification('error', 'Failed to update agent. Please try again.');
    }
  };

  const handleStartTest = () => {
    if (!agentData?.agent_id && mode !== 'edit' && mode !== 'test') {
      showNotification('warning', 'Please save the agent before sandbox testing.');
      return;
    }

    const config = {
      AgentID: agentData?.agent_id || null,
      AgentName: agentName,
      AgentDesc: agentDescription,
      CreatedOn: new Date().toISOString(),
      AgentType: isManagerAgent ? "manager" : "standard",
      Configuration: {
        name: agentName.toLowerCase().replace(/\\s+/g, '_'),
        function_description: agentRole,
        system_message: agentInstructions,
        category: agentCategory,
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
        managed_agents: isManagerAgent ? selectedManagerAgents.map((agentId) => {
          const agent = availableAgents.find(a => a.id === agentId);
          const details = selectedAgentDetails[agentId] || {
            capabilities: ["General AI assistance", "Task coordination"],
            contextual_usage: `Used for ${agent?.category || 'general'} tasks and coordination`,
            specialization: agent?.category || 'General',
            when_to_use: `When you need ${agent?.role || 'assistance'} or ${agent?.category || 'general'} support`
          };
          
          return {
            _id: { $oid: agent?.id || agentId },
            AgentID: agentId,
            AgentName: agent?.name || '',
            capabilities: details.capabilities || ["General AI assistance", "Task coordination"],
            contextual_usage: details.contextual_usage || `Used for ${agent?.category || 'general'} tasks and coordination`,
            specialization: details.specialization || agent?.category || 'General',
            when_to_use: details.when_to_use || `When you need ${agent?.role || 'assistance'} or ${agent?.category || 'general'} support`,
            AgentDesc: agent?.description || '',
            CreatedOn: agent?.CreatedOn || new Date().toISOString(),
            Configuration: {
              name: agent?.name?.toLowerCase().replace(/\s+/g, '_') || '',
              function_description: agent?.role || '',
              system_message: agent?.instructions || '',
              tools: (agent?.tools || []).map(toolName => {
                const tool = availableTools.find(t => t.name === toolName);
                return tool ? {
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
                } : null;
              }).filter(Boolean),
              category: agent?.category || 'General',
              examples: agent?.examples || '',
              structured_output_toggle: false,
              structured_output: {},
              knowledge_base: {}
            },
            isManagerAgent: false,
            selectedManagerAgents: [],
            managerAgentIntention: "",
            selectedKnowledgeBase: {},
            coreFeatures: {
              knowledgeBase: false,
              dataQuery: false,
              shortTermMemory: false,
              longTermMemory: false,
              humanizer: false,
              reflection: false,
              groundedness: false,
              contextRelevance: false,
              structuredOutput: false
            },
            knowledge_base: {},
            llmModel: agent?.llmModel || "gpt-40",
            llmProvider: agent?.llmProvider || "OpenAI",
            examples: agent?.examples || ''
          };
        }) : [],
        supervisor_settings: isManagerAgent ? {
          output_mode: "handoff",
          add_handoff_messages: true,
          handoff_tool_prefix: "handoff_to_",
          use_message_forwarding: false
        } : {}
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
      examples: examples,
      selectedAgentDetails: selectedAgentDetails
    };

    setAgentConfig(config);
    setIsChatStarted(true);
    
    // Switch to test mode (hides configuration and shows only the chat interface)
    enterTestMode();
  };

  const handleDeleteClick = () => {
    if (isFormFieldDisabled()) return;

    if (!agentData?.agent_id) {
      showNotification('error', 'The agent does not exist!');
      return;
    }

    // Show inline confirmation instead of window.confirm
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      const res = await api.delete('/admin/agent-catelog/delete', {
        data: { AgentID: agentData.agent_id },
      });

      setIsLoading(false);
      showNotification('success', res.data.message || 'Agent deleted successfully');
      
      // Navigate to the home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setIsLoading(false);
      showNotification('error', `Error deleting agent: ${errorMsg}`);
      setShowDeleteConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleFeatureToggle = (featureName) => {
    if (isFormFieldDisabled()) return;
    
    setCoreFeatures({
      ...coreFeatures,
      [featureName]: !coreFeatures[featureName],
    });
  };
  
  //============================================================
  // RENDER
  //============================================================

  // Test mode shows only the chat interface, hiding all configuration
  if (viewMode === 'test') {
    return (
      <div className="progressive-agent-builder test-mode">
        <div className="test-mode-header">
          <button 
            className="btn btn-secondary back-to-config" 
            onClick={exitTestMode}
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
            Back to Configuration
          </button>
          <h2>{getHeaderText()}</h2>
        </div>
        
        <div className="chat-container">
          {coreFeatures.structuredOutput ? (
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
          )}
        </div>
      </div>
    );
  }

  // Essential and Advanced mode render the configuration UI with progressive disclosure
  return (
    <div className="progressive-agent-builder">
      <div className="page-header">
        <h1>{getHeaderText()}</h1>
      </div>

      {/* Back Button or Back Confirmation */}
      <div className="back-container">
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

      <div className="progressive-form-container">
        {/* Essential Configuration Area - Always Visible */}
        <div className="essential-config-section">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="agent-name">
                Name
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <input
                id="agent-name"
                type="text"
                className="form-control"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                disabled={isFormFieldDisabled()}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="agent-description">
                Description
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <input
                id="agent-description"
                type="text"
                className="form-control"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Enter agent description"
                disabled={isFormFieldDisabled()}
              />
            </div>
          </div>

          <div className="form-row two-column">
            <div className="form-group">
              <label className="form-label" htmlFor="agent-role">
                Agent Role
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <input
                id="agent-role"
                type="text"
                className="form-control"
                value={agentRole}
                onChange={(e) => setAgentRole(e.target.value)}
                placeholder="Define the role of this agent"
                disabled={isFormFieldDisabled()}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="agent-category">
                Agent Category
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <input
                id="agent-category"
                type="text"
                className="form-control"
                value={agentCategory}
                onChange={(e) => setAgentCategory(e.target.value)}
                placeholder="Specify the category for this agent"
                disabled={isFormFieldDisabled()}
              />
            </div>
          </div>

          {/* Moved Agent Instructions to Essential Section */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="agent-instructions">
                Agent Instructions
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
              <textarea
                id="agent-instructions"
                className="form-textarea instruction-textarea"
                value={agentInstructions}
                onChange={(e) => setAgentInstructions(e.target.value)}
                placeholder="Enter detailed instructions for the agent"
                rows="5"
                disabled={isFormFieldDisabled()}
              ></textarea>
            </div>
          </div>

          {/* Moved Examples to Essential Section */}
          <div className="form-row examples-section">
            <label className="form-label" htmlFor="examples">
              Examples
              <svg
                className="info-icon"
                width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
            <textarea
              id="examples"
              className="form-textarea examples-textarea"
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              placeholder="Provide example queries or use cases for this agent"
              rows="5"
              disabled={isFormFieldDisabled()}
            ></textarea>
          </div>

          {/* Toggle for Advanced Configuration */}
          <div className="advanced-config-toggle">
            <button 
              className="btn btn-secondary" 
              onClick={toggleAdvancedMode}
            >
              {viewMode === 'essential' ? 'Advanced Configuration' : 'Hide Advanced Configuration'}
              <svg
                className={`toggle-icon ${viewMode === 'advanced' ? 'expanded' : ''}`}
                width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced Configuration Area - Conditionally Visible */}
        {viewMode === 'advanced' && (
          <div className="advanced-config-section">
            {/* LLM Provider and Model */}
            <div className="form-row two-column">
              <div className="form-group">
                <label className="form-label" htmlFor="llm-provider">
                  LLM Provider
                  <svg
                    className="info-icon"
                    width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </label>
                <select
                  id="llm-provider"
                  className="form-select"
                  value={llmProvider}
                  onChange={(e) => {
                    setLlmProvider(e.target.value);
                    if (e.target.value === 'Groq') {
                      setLlmModel('llama-3-70b');
                    } else if (e.target.value === 'OpenAI') {
                      setLlmModel('gpt-40');
                    } else {
                      setLlmModel('');
                    }
                  }}
                  disabled={isFormFieldDisabled()}
                >
                  <option>OpenAI</option>
                  <option>Anthropic</option>
                  <option>Google</option>
                  <option>Mistral</option>
                  <option>Groq</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="llm-model">
                  LLM Model
                  <svg
                    className="info-icon"
                    width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </label>
                <select
                  id="llm-model"
                  className="form-select"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  disabled={isFormFieldDisabled()}
                >
                  {llmProvider === 'Groq' ? (
                    <>
                      <option value="llama-3-8b">llama-3-8b</option>
                      <option value="llama-4-maverick-17b">llama-4-maverick-17b</option>
                      <option value="groq-llama4-maverick">groq-llama4-maverick</option>
                    </>
                  ) : llmProvider === 'OpenAI' ? (
                    <>
                      <option value="gpt-40">gpt-40</option>
                      <option value="gpt-4">gpt-4</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    </>
                  ) : (
                    <option value="">Select a model</option>
                  )}
                </select>
              </div>
            </div>

            {/* Tools Section - First in reordered configuration */}
            <div className="tools-section">
              <div className="section-header" onClick={toggleToolsSection}>
                <div className="section-title-row">
                  <label className="form-label">
                    Tool Configuration
                    <svg
                      className="info-icon"
                      width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </label>
                </div>
                <svg
                  className="toggle-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {toolsSectionExpanded && (
                <>
                  {selectedTools.length > 0 && (
                    <div className="selected-tools">
                      <h4>Selected Tools:</h4>
                      <ul className="tools-list">
                        {selectedTools.map((toolId) => {
                          const tool = availableTools.find((t) => t.tool_id === toolId);
                          return (
                            <li key={toolId} className="tool-item">
                              <span title={tool?.description}>{tool?.name}</span>

                              <button
                                className="tool-remove-btn"
                                onClick={() => setSelectedTools(selectedTools.filter((id) => id !== toolId))}
                                disabled={isFormFieldDisabled()}
                              >
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {!toolSelectionOpen && !isFormFieldDisabled() && (
                    <button className="add-tool-btn" onClick={handleAddToolClick}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 3.33334V12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.33331 8H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Add Tool
                    </button>
                  )}
                </>
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
                              title={tool.description}
                              key={tool.tool_id}
                              className="tool-option"
                              onClick={() => handleSelectExistingTool(tool.tool_id)}
                            >
                              {tool.name}
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

            {/* Knowledge Base - Second in reordered configuration */}
            <div className="features-section">
              <div className="feature-item">
                <div className="feature-label">
                  <span>Knowledge Base</span>
                  <svg
                    className="info-icon"
                    width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

                  {selectedKnowledgeBase && (
                    <div className="selected-knowledge-base">
                      <div className="knowledge-base-name">{selectedKnowledgeBase.name}</div>
                      <div className="knowledge-base-description">{selectedKnowledgeBase.description}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Structured Output - Third in reordered configuration */}
            <div className="feature-item">
              <div className="feature-label">
                <span>Structured Output</span>
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

            {/* Manager Agent - Fourth in reordered configuration */}
            <div className="manager-section">
              <div className="section-header" onClick={toggleManagerSection}>
                <div className="section-title-row">
                  <label className="form-label">
                    Manager Agent
                    <svg
                      className="info-icon"
                      width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                    width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {isManagerAgent && managerSectionExpanded && (
                <div className="manager-agent-section">
                  <div className="manager-alert">
                    <svg
                      className="warning-icon"
                      width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 5.33333V8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 10.6667H8.00667" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667Z"
                        stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>
                      This feature is best experienced when using high reasoning models (such as gpt-40, o3-mini,
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
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3.33334V12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3.33331 8H12.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {showAgentSelector ? 'Close' : 'Select Agents'}
                      </button>
                    </div>

                    {selectedManagerAgents.length > 0 ? (
                      <ul className="selected-agents-list">
                        {selectedManagerAgents.map((agentId) => {
                          const agent = getSelectedAgentDetails(agentId);
                          const agentDetails = selectedAgentDetails[agentId] || {};
                          
                          return (
                            agent && (
                              <li key={agentId} className="selected-agent-item-detailed">
                                <div className="agent-info">
                                  <div className="agent-id">{agent.id}</div>
                                  <div className="agent-name">{agent.name}</div>
                                  <button
                                    className="agent-remove-btn"
                                    onClick={() => handleSelectManagerAgent(agentId)}
                                    disabled={isFormFieldDisabled()}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </button>
                                </div>
                                
                                <div className="agent-details-form">
                                  {/* Capabilities */}
                                  <div className="form-group">
                                    <label className="form-label">Capabilities</label>
                                    {(agentDetails.capabilities || ['Default capability']).map((capability, index) => (
                                      <div key={index} className="capability-input">
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={capability}
                                          onChange={(e) => handleCapabilityChange(agentId, index, e.target.value)}
                                          placeholder="Enter capability"
                                          disabled={isFormFieldDisabled()}
                                        />
                                        <button
                                          type="button"
                                          className="remove-capability-btn"
                                          onClick={() => removeCapability(agentId, index)}
                                          disabled={isFormFieldDisabled()}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      className="add-capability-btn"
                                      onClick={() => addCapability(agentId)}
                                      disabled={isFormFieldDisabled()}
                                    >
                                      + Add Capability
                                    </button>
                                  </div>

                                  {/* Contextual Usage */}
                                  <div className="form-group">
                                    <label className="form-label">Contextual Usage</label>
                                    <textarea
                                      className="form-textarea"
                                      value={agentDetails.contextual_usage || ''}
                                      onChange={(e) => handleAgentDetailChange(agentId, 'contextual_usage', e.target.value)}
                                      placeholder="Describe when and how this agent should be used"
                                      disabled={isFormFieldDisabled()}
                                      rows="2"
                                    />
                                  </div>

                                  {/* Specialization */}
                                  <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={agentDetails.specialization || ''}
                                      onChange={(e) => handleAgentDetailChange(agentId, 'specialization', e.target.value)}
                                      placeholder="What is this agent specialized in?"
                                      disabled={isFormFieldDisabled()}
                                    />
                                  </div>

                                  {/* When to Use */}
                                  <div className="form-group">
                                    <label className="form-label">When to Use</label>
                                    <textarea
                                      className="form-textarea"
                                      value={agentDetails.when_to_use || ''}
                                      onChange={(e) => handleAgentDetailChange(agentId, 'when_to_use', e.target.value)}
                                      placeholder="Describe the specific scenarios when this agent should be used"
                                      disabled={isFormFieldDisabled()}
                                      rows="2"
                                    />
                                  </div>
                                </div>
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
                          width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            </div>

            {/* Responsible AI - Fifth in reordered configuration */}
            <div className="feature-category-header">
              <span>Responsible AI</span>
            </div>

            <div className="feature-item">
              <div className="feature-label">
                <span>Humanizer</span>
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

            {/* Other features that were previously in Core Features section */}
            <div className="feature-item">
              <div className="feature-label">
                <span>Data Query</span>
                <svg
                  className="info-icon"
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                  width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10.6667V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 5.33333H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          </div>
        )}

        {/* Action Buttons (Create/Update, Test, Delete) - Always Visible */}
        <div className="form-actions">
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

      {/* Add Tool Modal (when outside the preview pane) */}
      {showAddTool && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AddToolView
              onSave={handleSaveTool}
              onCancel={() => setShowAddTool(false)}
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}-notification`}>
          {notification.type === 'success' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {notification.type === 'error' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 6.66669V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.0001 16.6667C13.6821 16.6667 16.6667 13.6821 16.6667 10.0001C16.6667 6.31817 13.6821 3.33337 10.0001 3.33337C6.31818 3.33337 3.33337 6.31817 3.33337 10.0001C3.33337 13.6821 6.31818 16.6667 10.0001 16.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {notification.type === 'warning' && (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6.66669V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.26257 4.16667L2.87923 13.3333C2.65672 13.7293 2.55786 14.1848 2.59925 14.6396C2.64063 15.0943 2.82033 15.5256 3.11248 15.8663C3.40463 16.2071 3.79451 16.4412 4.22748 16.5358C4.66044 16.6304 5.11522 16.5806 5.51923 16.3933L5.5159 16.3933L5.52257 16.39L10.0001 13.9633L14.4767 16.39L14.4834 16.3933L14.4901 16.3933C14.8941 16.5806 15.3489 16.6304 15.7818 16.5358C16.2148 16.4412 16.6047 16.2071 16.8968 15.8663C17.189 15.5256 17.3687 15.0943 17.4101 14.6396C17.4515 14.1848 17.3526 13.7293 17.1301 13.3333L11.7467 4.16667C11.5307 3.77862 11.2056 3.4549 10.8108 3.23424C10.4161 3.01357 9.96767 2.90512 9.51089 2.92123C9.05411 2.93735 8.616 3.07708 8.24353 3.32209C7.87105 3.56709 7.57967 3.90728 7.40257 4.30667L8.26257 4.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressiveAgentBuilderView;
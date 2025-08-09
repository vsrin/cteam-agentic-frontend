// services/workflowExamples.js
/**
 * Collection of premade workflow examples for demonstration purposes
 */

// Example 1: Simple Email Processing Workflow
const emailProcessingWorkflow = {
    id: 'example-email-processing',
    name: 'Email Processing Workflow',
    description: 'Analyzes incoming emails, categorizes them, and generates appropriate responses.',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Email Received',
          properties: {
            triggerType: 'Email',
            schedule: '',
            conditions: ['new-email']
          }
        }
      },
      {
        id: 'aiAgent-1',
        type: 'aiAgent',
        position: { x: 100, y: 250 },
        data: {
          label: 'Email Classifier',
          properties: {
            agentType: 'Classifier',
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            maxTokens: 500,
            systemPrompt: 'Categorize this email into one of these categories: Customer Support, Sales Inquiry, Technical Issue, Spam, or Other.'
          }
        }
      },
      {
        id: 'tool-1',
        type: 'tool',
        position: { x: 100, y: 400 },
        data: {
          label: 'Response Template Selector',
          properties: {
            toolType: 'Template Selector',
            endpoint: '/api/templates',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }
        }
      },
      {
        id: 'aiAgent-2',
        type: 'aiAgent',
        position: { x: 100, y: 550 },
        data: {
          label: 'Response Generator',
          properties: {
            agentType: 'Chat',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000,
            systemPrompt: 'Generate a helpful, professional email response based on the template and customer email. Maintain the tone and structure of the template while personalizing it to address the specific details in the customer\'s email.'
          }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 700 },
        data: {
          label: 'Email Response',
          properties: {
            format: 'Text',
            destination: 'email'
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'aiAgent-1', animated: true },
      { id: 'e2-3', source: 'aiAgent-1', target: 'tool-1', animated: true },
      { id: 'e3-4', source: 'tool-1', target: 'aiAgent-2', animated: true },
      { id: 'e4-5', source: 'aiAgent-2', target: 'output-1', animated: true }
    ]
  };
  
  // Example 2: Customer Support Bot
  const customerSupportWorkflow = {
    id: 'example-customer-support',
    name: 'Customer Support Bot',
    description: 'Handles customer inquiries using a knowledge base and escalates complex issues to human agents.',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Chat Started',
          properties: {
            triggerType: 'Chat',
            schedule: '',
            conditions: ['new-chat']
          }
        }
      },
      {
        id: 'aiAgent-1',
        type: 'aiAgent',
        position: { x: 100, y: 250 },
        data: {
          label: 'Intent Analyzer',
          properties: {
            agentType: 'Classifier',
            model: 'gpt-3.5-turbo',
            temperature: 0.2,
            maxTokens: 300,
            systemPrompt: 'Analyze the customer query to determine their intent and needed information. Categorize as: Product Question, Billing Issue, Technical Support, or Other.'
          }
        }
      },
      {
        id: 'tool-1',
        type: 'tool',
        position: { x: 100, y: 400 },
        data: {
          label: 'Knowledge Base Search',
          properties: {
            toolType: 'Vector DB',
            endpoint: '/api/kb/search',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }
        }
      },
      {
        id: 'aiAgent-2',
        type: 'aiAgent',
        position: { x: 100, y: 550 },
        data: {
          label: 'Response Generator',
          properties: {
            agentType: 'Chat',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000,
            systemPrompt: 'You are a helpful customer support agent. Use the knowledge base information to answer customer queries accurately. If you don\'t have sufficient information, politely explain what you know and what additional information might help resolve their issue.'
          }
        }
      },
      {
        id: 'tool-2',
        type: 'tool',
        position: { x: 350, y: 400 },
        data: {
          label: 'Complexity Analyzer',
          properties: {
            toolType: 'API',
            endpoint: '/api/analyze-complexity',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 700 },
        data: {
          label: 'Chat Response',
          properties: {
            format: 'Text',
            destination: 'chat'
          }
        }
      },
      {
        id: 'output-2',
        type: 'output',
        position: { x: 350, y: 550 },
        data: {
          label: 'Human Escalation',
          properties: {
            format: 'JSON',
            destination: 'ticketing-system'
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'aiAgent-1', animated: true },
      { id: 'e2-3a', source: 'aiAgent-1', target: 'tool-1', animated: true },
      { id: 'e2-3b', source: 'aiAgent-1', target: 'tool-2', animated: true },
      { id: 'e3a-4', source: 'tool-1', target: 'aiAgent-2', animated: true },
      { id: 'e3b-7', source: 'tool-2', target: 'output-2', animated: true },
      { id: 'e4-6', source: 'aiAgent-2', target: 'output-1', animated: true }
    ]
  };
  
  // Example 3: Data Analysis Pipeline
  const dataAnalysisWorkflow = {
    id: 'example-data-analysis',
    name: 'Data Analysis Pipeline',
    description: 'Processes data files, performs analysis, and generates interactive reports.',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Data Upload',
          properties: {
            triggerType: 'File',
            schedule: '',
            conditions: ['csv-upload', 'xlsx-upload']
          }
        }
      },
      {
        id: 'tool-1',
        type: 'tool',
        position: { x: 100, y: 250 },
        data: {
          label: 'Data Preprocessor',
          properties: {
            toolType: 'Data Processing',
            endpoint: '/api/preprocess',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }
        }
      },
      {
        id: 'aiAgent-1',
        type: 'aiAgent',
        position: { x: 100, y: 400 },
        data: {
          label: 'Data Analyzer',
          properties: {
            agentType: 'Analyzer',
            model: 'gpt-4',
            temperature: 0.2,
            maxTokens: 1500,
            systemPrompt: 'Analyze the preprocessed data to identify key trends, anomalies, and insights. Generate a comprehensive analysis covering the main patterns in the data, any outliers or unusual observations, and preliminary recommendations based on the data.'
          }
        }
      },
      {
        id: 'tool-2',
        type: 'tool',
        position: { x: 100, y: 550 },
        data: {
          label: 'Visualization Generator',
          properties: {
            toolType: 'Charting',
            endpoint: '/api/visualize',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 700 },
        data: {
          label: 'Analysis Report',
          properties: {
            format: 'HTML',
            destination: 'dashboard'
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'tool-1', animated: true },
      { id: 'e2-3', source: 'tool-1', target: 'aiAgent-1', animated: true },
      { id: 'e3-4', source: 'aiAgent-1', target: 'tool-2', animated: true },
      { id: 'e4-5', source: 'tool-2', target: 'output-1', animated: true }
    ]
  };
  
  // Example 4: Content Generation Workflow
  const contentGenerationWorkflow = {
    id: 'example-content-generation',
    name: 'Content Generation Workflow',
    description: 'Creates blog posts and social media content from topic ideas.',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Topic Request',
          properties: {
            triggerType: 'Manual',
            schedule: '',
            conditions: ['topic-submitted']
          }
        }
      },
      {
        id: 'aiAgent-1',
        type: 'aiAgent',
        position: { x: 100, y: 250 },
        data: {
          label: 'Content Researcher',
          properties: {
            agentType: 'Researcher',
            model: 'gpt-4',
            temperature: 0.6,
            maxTokens: 2000,
            systemPrompt: 'Research the provided topic thoroughly. Gather key information, statistics, trends, and expert opinions relevant to this topic. Organize the research into main points that would be valuable for creating comprehensive content.'
          }
        }
      },
      {
        id: 'aiAgent-2',
        type: 'aiAgent',
        position: { x: 100, y: 400 },
        data: {
          label: 'Blog Writer',
          properties: {
            agentType: 'Writer',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 3000,
            systemPrompt: 'You are a skilled blog writer. Create an engaging, well-structured blog post using the research provided. Include an attention-grabbing introduction, informative body with subheadings, and a concise conclusion. Maintain a conversational yet professional tone throughout.'
          }
        }
      },
      {
        id: 'aiAgent-3',
        type: 'aiAgent',
        position: { x: 350, y: 400 },
        data: {
          label: 'Social Media Writer',
          properties: {
            agentType: 'Writer',
            model: 'gpt-4',
            temperature: 0.8,
            maxTokens: 1000,
            systemPrompt: 'Create engaging social media posts for Twitter, LinkedIn, and Instagram based on the research provided. Each platform should have its own tailored content respecting character limits and platform norms. Include relevant hashtags and call-to-actions.'
          }
        }
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 100, y: 550 },
        data: {
          label: 'Blog Post',
          properties: {
            format: 'Markdown',
            destination: 'cms'
          }
        }
      },
      {
        id: 'output-2',
        type: 'output',
        position: { x: 350, y: 550 },
        data: {
          label: 'Social Media Posts',
          properties: {
            format: 'JSON',
            destination: 'scheduler'
          }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'aiAgent-1', animated: true },
      { id: 'e2-3a', source: 'aiAgent-1', target: 'aiAgent-2', animated: true },
      { id: 'e2-3b', source: 'aiAgent-1', target: 'aiAgent-3', animated: true },
      { id: 'e3a-5', source: 'aiAgent-2', target: 'output-1', animated: true },
      { id: 'e3b-6', source: 'aiAgent-3', target: 'output-2', animated: true }
    ]
  };
  
  // Export all workflow examples
  export const workflowExamples = [
    emailProcessingWorkflow,
    customerSupportWorkflow,
    dataAnalysisWorkflow,
    contentGenerationWorkflow
  ];
  
  /**
   * Get a workflow example by ID
   * @param {string} id - The example workflow ID
   * @returns {Object|null} The workflow example or null if not found
   */
  export const getWorkflowExampleById = (id) => {
    return workflowExamples.find(example => example.id === id) || null;
  };
  
  /**
   * Get all workflow examples metadata (without the full nodes/edges details)
   * @returns {Array} Array of workflow examples metadata
   */
  export const getWorkflowExamplesMetadata = () => {
    return workflowExamples.map(({ id, name, description }) => ({
      id,
      name,
      description
    }));
  };
import React, { useState } from 'react';

const KnowledgeBaseView = () => {
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // State for selected category tab
  const [activeCategory, setActiveCategory] = useState('overview');

  // Knowledge categories
  const categories = [
    { id: 'overview', name: 'Platform Overview' },
    { id: 'projects', name: 'Projects' },
    { id: 'agents', name: 'AI Agents' },
    { id: 'tools', name: 'Tools' },
    { id: 'recipes', name: 'Skill Recipes' },
    { id: 'workflows', name: 'Workflows' },
    { id: 'faq', name: 'FAQ' }
  ];

  // Recent articles for the sidebar
  const recentArticles = [
    { id: 'ra-001', title: 'Getting Started with Commercial Submission Workflows', category: 'workflows' },
    { id: 'ra-002', title: 'Creating Custom AI Agents', category: 'agents' },
    { id: 'ra-003', title: 'Best Practices for ACORD Form Extraction', category: 'tools' },
    { id: 'ra-004', title: 'Understanding Risk Classification Models', category: 'agents' },
    { id: 'ra-005', title: 'How to Build Complex Skill Recipes', category: 'recipes' }
  ];

  // Popular topics for the sidebar
  const popularTopics = [
    { id: 'pt-001', title: 'Submission Intake Automation', category: 'workflows' },
    { id: 'pt-002', title: 'Risk Appetite Matching', category: 'recipes' },
    { id: 'pt-003', title: 'Loss Run Analysis', category: 'agents' },
    { id: 'pt-004', title: 'Data Extraction Techniques', category: 'tools' },
    { id: 'pt-005', title: 'Workflow Deployment Guide', category: 'projects' }
  ];

  // Helper function to filter articles based on search query
  const filterArticles = (articles) => {
    if (!searchQuery) return articles;
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Content based on active category
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'overview':
        return (
          <div className="kb-category-content">
            <h2>Commercial Insurance AI Platform Overview</h2>
            <div className="kb-intro-box">
              <p>
                The Commercial Insurance AI Platform is a comprehensive solution designed to automate and 
                enhance commercial insurance underwriting workflows. The platform leverages AI agents, 
                specialized tools, and configurable skill recipes to streamline submission intake, risk analysis, 
                and underwriting decision processes.
              </p>
            </div>
            
            <h3>Platform Components</h3>
            <div className="kb-components-grid">
              <div className="kb-component-card">
                <h4>Projects</h4>
                <p>Collections of commercial insurance agentic workflows for automated processing</p>
                <a href="#" onClick={() => setActiveCategory('projects')}>Learn more →</a>
              </div>
              <div className="kb-component-card">
                <h4>AI Agents</h4>
                <p>Pre-built AI agents for commercial insurance workflows</p>
                <a href="#" onClick={() => setActiveCategory('agents')}>Learn more →</a>
              </div>
              <div className="kb-component-card">
                <h4>Tools</h4>
                <p>Specialized tools and APIs for insurance processing</p>
                <a href="#" onClick={() => setActiveCategory('tools')}>Learn more →</a>
              </div>
              <div className="kb-component-card">
                <h4>Skill Recipes</h4>
                <p>Agentic workflows for commercial insurance processing</p>
                <a href="#" onClick={() => setActiveCategory('recipes')}>Learn more →</a>
              </div>
            </div>
            
            <h3>Key Platform Capabilities</h3>
            <ul className="kb-capabilities-list">
              <li>
                <strong>Automated Submission Intake</strong> - Extract, validate, and process submission 
                documents automatically
              </li>
              <li>
                <strong>Risk Analysis & Classification</strong> - Analyze submissions to determine risk 
                level and appropriate classification
              </li>
              <li>
                <strong>Appetite Matching</strong> - Match submissions against underwriting guidelines and appetites
              </li>
              <li>
                <strong>Completeness Verification</strong> - Identify missing information and generate 
                follow-up requests
              </li>
              <li>
                <strong>Loss Analysis</strong> - Process and analyze loss history data to inform risk decisions
              </li>
              <li>
                <strong>Premium Calculation</strong> - Calculate appropriate premiums based on risk factors
              </li>
            </ul>
          </div>
        );
      
      case 'projects':
        return (
          <div className="kb-category-content">
            <h2>Commercial Insurance Projects</h2>
            <p>
              Projects are collections of Skill Recipes that work together to automate commercial insurance workflows.
              Each project organizes multiple components to solve specific business problems in the commercial insurance domain.
            </p>
            
            <h3>Project Types</h3>
            <div className="kb-article-section">
              <h4>Submission Accelerator Projects</h4>
              <p>
                These projects provide end-to-end workflows for processing and evaluating commercial insurance submissions.
                They typically include components for document extraction, data validation, risk assessment, and underwriting decision support.
              </p>
              <p>
                <strong>Example:</strong> Commercial Submission Accelerator - An end-to-end workflow for processing and evaluating 
                commercial insurance submissions with automated extraction, validation, and preliminary risk assessment.
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Risk Analysis Projects</h4>
              <p>
                Risk analysis projects focus on evaluating specific types of risks and exposures within commercial submissions.
                These may be specialized by line of business (Property, Liability, Auto, etc.) or risk type.
              </p>
              <p>
                <strong>Examples:</strong>
              </p>
              <ul>
                <li>Commercial Property Risk Analyzer - AI-powered system for evaluating commercial property risks and exposures</li>
                <li>Commercial Auto Risk Assessment - Specialized workflow for commercial auto submission analysis</li>
              </ul>
            </div>
            
            <div className="kb-article-section">
              <h4>Line of Business Projects</h4>
              <p>
                These projects are specialized for specific commercial lines of business, providing targeted workflows for 
                underwriting particular types of policies.
              </p>
              <p>
                <strong>Examples:</strong>
              </p>
              <ul>
                <li>Small Business Underwriting Suite - Automated workflow for small business policy underwriting and pricing</li>
                <li>Workers Compensation Analyzer - End-to-end workflow for workers compensation submission intake and processing</li>
                <li>BOP Submission Processor - Specialized workflow for Business Owners Policy submission processing</li>
              </ul>
            </div>
            
            <h3>Working with Projects</h3>
            <div className="kb-article-section">
              <h4>Creating a New Project</h4>
              <ol>
                <li>Navigate to the Projects view</li>
                <li>Click the "New Project" button</li>
                <li>Provide a name, description, and select the relevant commercial insurance domain</li>
                <li>Add existing Skill Recipes or create new ones specific to your project</li>
                <li>Configure the workflow sequence and interactions between components</li>
                <li>Save and deploy your project</li>
              </ol>
            </div>
            
            <div className="kb-article-section">
              <h4>Best Practices</h4>
              <ul>
                <li>Organize projects by line of business or specific workflow type</li>
                <li>Include clear documentation on how each component works together</li>
                <li>Test projects thoroughly with sample submission data before deployment</li>
                <li>Monitor project performance and refine components as needed</li>
              </ul>
            </div>
          </div>
        );
      
      case 'agents':
        return (
          <div className="kb-category-content">
            <h2>AI Agents</h2>
            <p>
              AI Agents are specialized AI models trained to perform specific tasks within commercial insurance workflows.
              Each agent focuses on a particular domain expertise, such as document extraction, risk analysis, or communication.
            </p>
            
            <h3>Agent Categories</h3>
            <div className="kb-article-section">
              <h4>Data Extraction Agents</h4>
              <p>
                These agents specialize in extracting structured information from unstructured or semi-structured insurance documents.
              </p>
              <p>
                <strong>Example:</strong> ACORD Form Extractor - Extracts all key fields from ACORD forms with 98% accuracy
              </p>
              <div className="kb-usage-example">
                <strong>Usage:</strong>
                <pre>
                  {`// Example of using the ACORD Form Extractor agent
const extractionAgent = await AgentFactory.create('AGT-001');
const extractionResult = await extractionAgent.process({
  documentPath: '/path/to/acord_form.pdf'
});
// extractionResult contains structured data extracted from the form`}
                </pre>
              </div>
            </div>
            
            <div className="kb-article-section">
              <h4>Risk Analysis Agents</h4>
              <p>
                These agents evaluate commercial risks based on submission data, providing insights and classifications.
              </p>
              <p>
                <strong>Examples:</strong>
              </p>
              <ul>
                <li>Risk Classifier - Classifies commercial risks based on industry, location, and exposures</li>
                <li>Property Evaluator - Assesses property values and risk factors from submission documents</li>
              </ul>
            </div>
            
            <div className="kb-article-section">
              <h4>Claims Analysis Agents</h4>
              <p>
                These agents specialize in analyzing claims and loss history data to identify patterns and risk factors.
              </p>
              <p>
                <strong>Example:</strong> Loss Run Analyzer - Processes loss history data to identify patterns and risk factors
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Data Quality Agents</h4>
              <p>
                These agents verify data completeness and quality, identifying gaps and inconsistencies.
              </p>
              <p>
                <strong>Example:</strong> Submission Completeness Checker - Identifies missing information in submissions and generates follow-up questions
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Pricing Agents</h4>
              <p>
                These agents handle premium calculations based on risk factors and underwriting guidelines.
              </p>
              <p>
                <strong>Example:</strong> Premium Calculator - Calculates premiums based on risk factors and underwriting guidelines
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Communication Agents</h4>
              <p>
                These agents handle communication with brokers and clients, generating personalized responses.
              </p>
              <p>
                <strong>Example:</strong> Broker Communication Agent - Generates personalized responses to broker inquiries about submission status
              </p>
            </div>
            
            <h3>Working with Agents</h3>
            <div className="kb-article-section">
              <h4>Deploying Agents</h4>
              <ol>
                <li>Navigate to the Agent Catalog</li>
                <li>Select the agent you wish to deploy</li>
                <li>Click the "Deploy" action</li>
                <li>Configure agent parameters specific to your use case</li>
                <li>Add the agent to a Skill Recipe or Project</li>
              </ol>
            </div>
            
            <div className="kb-article-section">
              <h4>Customizing Agents</h4>
              <p>
                Agents can be customized to meet specific business requirements:
              </p>
              <ul>
                <li>Fine-tune extraction patterns for document processing agents</li>
                <li>Adjust risk thresholds for risk analysis agents</li>
                <li>Customize communication templates for broker interaction agents</li>
                <li>Add business-specific rules to evaluation agents</li>
              </ul>
            </div>
          </div>
        );
      
      case 'tools':
        return (
          <div className="kb-category-content">
            <h2>Tools</h2>
            <p>
              Tools are specialized components and APIs that perform specific functions within the commercial insurance workflow.
              Unlike Agents, tools are typically focused on more technical and specific tasks, often integrating with external
              systems or providing specialized computational capabilities.
            </p>
            
            <h3>Tool Categories</h3>
            <div className="kb-article-section">
              <h4>Data Processing Tools</h4>
              <p>
                These tools handle data transformation, normalization, and processing tasks.
              </p>
              <p>
                <strong>Examples:</strong>
              </p>
              <ul>
                <li>ACORD Form Parser - Extracts structured data from ACORD forms with field mapping</li>
                <li>Loss History Analyzer - Processes and standardizes loss run data from multiple formats</li>
              </ul>
              <div className="kb-usage-example">
                <strong>Usage:</strong>
                <pre>
                  {`// Example of using the ACORD Form Parser
const parser = await ToolFactory.create('TL-001');
const parseResult = await parser.execute({
  form: formData,
  mappings: customFieldMappings
});`}
                </pre>
              </div>
            </div>
            
            <div className="kb-article-section">
              <h4>Integration Tools</h4>
              <p>
                These tools connect to external systems and databases to retrieve or submit data.
              </p>
              <p>
                <strong>Example:</strong> Risk Database Connector - Connects to insurance risk databases to retrieve historical data
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Analysis Tools</h4>
              <p>
                These tools provide analytical capabilities for assessing risks and exposures.
              </p>
              <p>
                <strong>Example:</strong> Geospatial Risk Analyzer - Analyzes location data for natural disaster and other geographical risks
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Decisioning Tools</h4>
              <p>
                These tools implement business rules and decision logic for underwriting and risk selection.
              </p>
              <p>
                <strong>Example:</strong> Underwriting Rules Engine - Configurable rules engine for applying underwriting guidelines
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Classification Tools</h4>
              <p>
                These tools categorize and classify businesses, risks, and exposures.
              </p>
              <p>
                <strong>Example:</strong> Industry Classifier - Classifies businesses into SIC/NAICS codes based on descriptions
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Document Processing Tools</h4>
              <p>
                These tools generate, modify, or analyze insurance documents.
              </p>
              <p>
                <strong>Example:</strong> Policy PDF Generator - Creates policy documents from structured data with customizable templates
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Pricing Tools</h4>
              <p>
                These tools handle premium calculations and pricing models.
              </p>
              <p>
                <strong>Example:</strong> Premium Calculator - Calculates premiums based on exposure data and rating factors
              </p>
            </div>
            
            <h3>Working with Tools</h3>
            <div className="kb-article-section">
              <h4>Adding Tools to Your Environment</h4>
              <ol>
                <li>Navigate to the Tool Chest</li>
                <li>Select the tool you wish to add</li>
                <li>Click the "Download" or "Import" action</li>
                <li>Configure tool parameters specific to your use case</li>
                <li>Add the tool to your agents or recipes as needed</li>
              </ol>
            </div>
            
            <div className="kb-article-section">
              <h4>Testing Tools</h4>
              <p>
                Before integrating tools into your workflows, you can test them:
              </p>
              <ol>
                <li>Navigate to the Tool Chest</li>
                <li>Find the tool you want to test</li>
                <li>Click the "Test" action</li>
                <li>Provide sample input data</li>
                <li>Review the output and adjust parameters as needed</li>
              </ol>
            </div>
          </div>
        );
      
      case 'recipes':
        return (
          <div className="kb-category-content">
            <h2>Skill Recipes</h2>
            <p>
              Skill Recipes are configurable workflows that combine multiple agents and tools to accomplish 
              specific tasks in the commercial insurance process. Each recipe defines a sequence of operations,
              data transformations, and decision points to automate part of the underwriting workflow.
            </p>
            
            <h3>Recipe Categories</h3>
            <div className="kb-article-section">
              <h4>Intake Processing Recipes</h4>
              <p>
                These recipes handle the initial processing of submission documents and data extraction.
              </p>
              <p>
                <strong>Example:</strong> Submission Data Extraction - Extracts and normalizes key information from insurance submission documents
              </p>
              <div className="kb-recipe-diagram">
                <div className="recipe-step">Document Upload</div>
                <div className="recipe-arrow">↓</div>
                <div className="recipe-step">ACORD Form Detection</div>
                <div className="recipe-arrow">↓</div>
                <div className="recipe-step">Data Extraction</div>
                <div className="recipe-arrow">↓</div>
                <div className="recipe-step">Data Normalization</div>
                <div className="recipe-arrow">↓</div>
                <div className="recipe-step">Validation</div>
              </div>
            </div>
            
            <div className="kb-article-section">
              <h4>Risk Analysis Recipes</h4>
              <p>
                These recipes focus on analyzing extracted data to identify and quantify risks.
              </p>
              <p>
                <strong>Example:</strong> Exposure Analysis - Analyzes submission data to identify and quantify potential exposures
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Data Quality Recipes</h4>
              <p>
                These recipes verify data completeness and quality, generating follow-up requests as needed.
              </p>
              <p>
                <strong>Example:</strong> Completeness Verification - Checks submissions for completeness and generates information requests
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Risk Selection Recipes</h4>
              <p>
                These recipes evaluate submissions against underwriting guidelines and appetite.
              </p>
              <p>
                <strong>Example:</strong> Appetite Matching - Evaluates submissions against underwriting appetite guidelines
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Claims Analysis Recipes</h4>
              <p>
                These recipes process and analyze loss history data.
              </p>
              <p>
                <strong>Example:</strong> Loss Analysis - Analyzes loss run data to identify patterns and risk factors
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Pricing Recipes</h4>
              <p>
                These recipes calculate premiums based on risk data and rating models.
              </p>
              <p>
                <strong>Example:</strong> Quote Generation - Generates insurance quotes based on submission data and pricing models
              </p>
            </div>
            
            <div className="kb-article-section">
              <h4>Policy Administration Recipes</h4>
              <p>
                These recipes handle policy changes, endorsements, and renewals.
              </p>
              <p>
                <strong>Example:</strong> Policy Endorsement - Processes policy change requests and calculates premium adjustments
              </p>
            </div>
            
            <h3>Building Skill Recipes</h3>
            <div className="kb-article-section">
              <h4>Recipe Creation Process</h4>
              <ol>
                <li>Navigate to the Skill Recipes view</li>
                <li>Click the "New Recipe" button</li>
                <li>Define recipe metadata (name, description, category)</li>
                <li>Add agents and tools to the recipe workflow</li>
                <li>Configure data flow between components</li>
                <li>Define decision points and branching logic</li>
                <li>Test the recipe with sample data</li>
                <li>Deploy the recipe to your project</li>
              </ol>
            </div>
            
            <div className="kb-article-section">
              <h4>Recipe Best Practices</h4>
              <ul>
                <li>Design recipes to handle a single, well-defined task</li>
                <li>Include error handling and validation at each step</li>
                <li>Document the expected inputs and outputs clearly</li>
                <li>Test recipes with diverse sample data</li>
                <li>Monitor recipe performance in production</li>
              </ul>
            </div>
          </div>
        );
      
      case 'workflows':
        return (
          <div className="kb-category-content">
            <h2>Commercial Insurance Workflows</h2>
            <p>
              Workflows represent complete business processes that combine multiple projects, recipes, and agents
              to automate end-to-end commercial insurance operations. This section covers common workflow patterns
              and best practices for implementing them on the platform.
            </p>
            
            <h3>Common Workflow Patterns</h3>
            <div className="kb-article-section">
              <h4>Submission Intake and Triage</h4>
              <p>
                This workflow handles the initial receipt and processing of new commercial insurance submissions.
              </p>
              <ol>
                <li><strong>Document Intake</strong> - Receive and catalog submission documents</li>
                <li><strong>Data Extraction</strong> - Extract key information from ACORD forms and supplementary documents</li>
                <li><strong>Completeness Check</strong> - Verify submission completeness and request missing information</li>
                <li><strong>Risk Classification</strong> - Categorize the submission by line of business and risk type</li>
                <li><strong>Appetite Check</strong> - Determine if the submission matches underwriting appetite</li>
                <li><strong>Triage Decision</strong> - Route to appropriate underwriter or decline</li>
              </ol>
            </div>
            
            <div className="kb-article-section">
              <h4>Risk Evaluation and Pricing</h4>
              <p>
                This workflow evaluates submissions that have passed initial triage to determine risk level and appropriate pricing.
              </p>
              <ol>
                <li><strong>Exposure Analysis</strong> - Identify and quantify potential exposures</li>
                <li><strong>Loss History Analysis</strong> - Evaluate historical claims data</li>
                <li><strong>Risk Factor Assessment</strong> - Calculate and score key risk factors</li>
                <li><strong>Premium Calculation</strong> - Determine appropriate premium based on risk profile</li>
                <li><strong>Quote Generation</strong> - Generate formal quote documents</li>
              </ol>
            </div>
            
            <div className="kb-article-section">
              <h4>Policy Administration</h4>
              <p>
                This workflow handles changes to existing policies, including endorsements, renewals, and cancellations.
              </p>
              <ol>
                <li><strong>Change Request Intake</strong> - Process incoming policy change requests</li>
                <li><strong>Endorsement Processing</strong> - Calculate premium adjustments for policy changes</li>
                <li><strong>Renewal Evaluation</strong> - Reassess risk at policy renewal</li>
                <li><strong>Document Generation</strong> - Generate updated policy documents</li>
              </ol>
            </div>
            
            <h3>Implementing Workflows</h3>
            <div className="kb-article-section">
              <h4>Workflow Design Principles</h4>
              <ul>
                <li><strong>Clear Handoffs</strong> - Define clear input/output requirements between workflow stages</li>
                <li><strong>Exception Handling</strong> - Include processes for handling unusual cases and exceptions</li>
                <li><strong>Human-in-the-Loop</strong> - Design appropriate intervention points for underwriters</li>
                <li><strong>Monitoring Points</strong> - Include KPIs and monitoring at key workflow stages</li>
                <li><strong>Audit Trail</strong> - Maintain detailed logs of all workflow actions and decisions</li>
              </ul>
            </div>
            
            <div className="kb-article-section">
              <h4>Integration with External Systems</h4>
              <p>
                Workflows often need to integrate with external systems such as:
              </p>
              <ul>
                <li>Policy Administration Systems</li>
                <li>Agency Management Systems</li>
                <li>Claims Systems</li>
                <li>Document Management Systems</li>
                <li>Billing Systems</li>
                <li>Third-party Data Providers</li>
              </ul>
              <p>
                Integration is typically handled through API connectors or specialized integration tools in the Tool Chest.
              </p>
            </div>
          </div>
        );
      
      case 'faq':
        return (
          <div className="kb-category-content">
            <h2>Frequently Asked Questions</h2>
            
            <div className="kb-faq-section">
              <h3>Platform Basics</h3>
              
              <div className="kb-faq-item">
                <h4>What is the Commercial Insurance AI Platform?</h4>
                <p>
                  The Commercial Insurance AI Platform is a comprehensive solution that uses AI agents, specialized tools, 
                  and configurable workflows to automate commercial insurance underwriting processes, from submission intake 
                  to risk analysis and pricing.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>What types of commercial insurance can the platform handle?</h4>
                <p>
                  The platform supports various commercial lines including Property, General Liability, Workers Compensation, 
                  Commercial Auto, Business Owners Policies (BOP), and Professional Liability. Additional lines can be configured 
                  with custom agents and recipes.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>How does the platform integrate with our existing systems?</h4>
                <p>
                  The platform offers API connectors and integration tools that can connect with policy administration systems, 
                  agency management systems, document management systems, and other insurance software. Custom integrations can 
                  be developed using the Tool Chest.
                </p>
              </div>
            </div>
            
            <div className="kb-faq-section">
              <h3>AI Agents</h3>
              
              <div className="kb-faq-item">
                <h4>What are AI Agents?</h4>
                <p>
                  AI Agents are specialized AI models trained to perform specific tasks within commercial insurance workflows, 
                  such as document extraction, risk analysis, or broker communication. Each agent focuses on a particular domain 
                  expertise.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>How accurate are the data extraction agents?</h4>
                <p>
                  Data extraction agents like the ACORD Form Extractor typically achieve 95-98% accuracy on standard forms. 
                  Accuracy can vary based on document quality and format. The platform includes validation processes to catch 
                  and correct extraction errors.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>Can we customize AI Agents for our specific underwriting guidelines?</h4>
                <p>
                  Yes, AI Agents can be customized to incorporate your specific underwriting guidelines, risk appetites, and 
                  business rules. This customization is typically done through configuration rather than requiring code changes.
                </p>
              </div>
            </div>
            
            <div className="kb-faq-section">
              <h3>Tools and Recipes</h3>
              
              <div className="kb-faq-item">
                <h4>What's the difference between Tools and Agents?</h4>
                <p>
                  Tools are specialized components that perform specific technical functions (like data transformation or API integration), 
                  while Agents are AI models that handle more complex cognitive tasks (like document understanding or risk evaluation). 
                  Tools tend to be more deterministic, while Agents involve machine learning.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>How do I create a new Skill Recipe?</h4>
                <p>
                  To create a new Skill Recipe, navigate to the Skill Recipes view, click "New Recipe," define the recipe metadata, 
                  add agents and tools to the workflow, configure the data flow between components, define decision points, test with 
                  sample data, and deploy to your project.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>Can I import existing tools or recipes?</h4>
                <p>
                  Yes, the platform supports importing tools from Git repositories and importing recipes from the catalog or from 
                  other projects. This allows you to leverage existing components and workflows rather than building everything from scratch.
                </p>
              </div>
            </div>
            
            <div className="kb-faq-section">
              <h3>Implementation and Deployment</h3>
              
              <div className="kb-faq-item">
                <h4>How long does it typically take to implement a new workflow?</h4>
                <p>
                  Implementation time varies based on workflow complexity and customization needs. Simple workflows using pre-built 
                  components can be implemented in days to weeks, while complex workflows with custom components may take several weeks 
                  to months.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>How do we monitor the performance of deployed workflows?</h4>
                <p>
                  The platform includes built-in monitoring dashboards that track key performance indicators such as processing time, 
                  completion rates, exception rates, and accuracy metrics. You can also set up alerts for workflow failures or 
                  performance degradation.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>Can we have human reviewers for certain decisions?</h4>
                <p>
                  Yes, the platform supports human-in-the-loop workflows where certain decisions or high-risk cases can be routed 
                  to human underwriters for review. You can configure the criteria for when human review is required.
                </p>
              </div>
            </div>
            
            <div className="kb-faq-section">
              <h3>Security and Compliance</h3>
              
              <div className="kb-faq-item">
                <h4>How is data security handled on the platform?</h4>
                <p>
                  The platform uses industry-standard security measures including encryption at rest and in transit, role-based 
                  access control, audit logging, and secure API authentication. All components run within your secure environment 
                  to maintain data control.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>Is the platform compliant with insurance regulations?</h4>
                <p>
                  The platform is designed to support regulatory compliance, with features for audit trails, explainable decisions, 
                  and rate filing documentation. However, ensuring compliance with specific regulations in your jurisdiction 
                  remains your responsibility.
                </p>
              </div>
              
              <div className="kb-faq-item">
                <h4>How are model decisions documented for regulatory purposes?</h4>
                <p>
                  All AI agent decisions include detailed explanation components that document the factors considered, data used, 
                  and reasoning applied. These explanations can be included in underwriting files to satisfy regulatory requirements 
                  for explainability.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a category to view content</div>;
    }
  };

  return (
    <div className="main-content knowledgebase-view" style={{ display: 'flex', padding: '1.5rem' }}>
      {/* Left sidebar */}
      <div className="kb-sidebar" style={{ width: '250px', marginRight: '2rem' }}>
        <div className="kb-categories">
          <h3>Knowledge Categories</h3>
          <ul className="kb-category-list">
            {categories.map((category) => (
              <li 
                key={category.id} 
                className={activeCategory === category.id ? 'active' : ''}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="kb-recent">
          <h3>Recent Articles</h3>
          <ul className="kb-recent-list">
            {filterArticles(recentArticles).map((article) => (
              <li 
                key={article.id} 
                onClick={() => setActiveCategory(article.category)}
              >
                {article.title}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="kb-popular">
          <h3>Popular Topics</h3>
          <ul className="kb-popular-list">
            {filterArticles(popularTopics).map((topic) => (
              <li 
                key={topic.id} 
                onClick={() => setActiveCategory(topic.category)}
              >
                {topic.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="kb-content" style={{ flex: 1 }}>
        <div className="kb-header">
          <h1>Knowledge Base</h1>
          <p>Comprehensive documentation and guides for the Commercial Insurance AI Platform</p>
          
          {/* Search box */}
          <div className="kb-search">
            <input 
              type="text" 
              placeholder="Search knowledge base..." 
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>
        
        {/* Render content based on active category */}
        {renderCategoryContent()}
      </div>
      
      {/* CSS styles */}
      <style jsx>{`
        .knowledgebase-view {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .kb-sidebar {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
        }
        
        .kb-category-list li, .kb-recent-list li, .kb-popular-list li {
          cursor: pointer;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        
        .kb-category-list li:hover, .kb-recent-list li:hover, .kb-popular-list li:hover {
          color: #0066cc;
        }
        
        .kb-category-list li.active {
          font-weight: bold;
          color: #0066cc;
        }
        
        .kb-header {
          margin-bottom: 2rem;
        }
        
        .kb-search {
          display: flex;
          margin-top: 1rem;
        }
        
        .kb-search input {
          flex: 1;
          margin-right: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .kb-category-content h2 {
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #eee;
        }
        
        .kb-category-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .kb-article-section, .kb-faq-item {
          margin-bottom: 1.5rem;
        }
        
        .kb-intro-box {
          background-color: #f0f7ff;
          border-left: 4px solid #0066cc;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .kb-components-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .kb-component-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #eee;
        }
        
        .kb-component-card h4 {
          margin-top: 0;
        }
        
        .kb-capabilities-list li, .info-list li {
          margin-bottom: 0.5rem;
        }
        
        .kb-faq-item h4 {
          background-color: #f8f9fa;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }
        
        .kb-recipe-diagram {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 1.5rem 0;
        }
        
        .recipe-step {
          background-color: #e6f2ff;
          border: 1px solid #b3d7ff;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          min-width: 200px;
          text-align: center;
        }
        
        .recipe-arrow {
          margin: 0.5rem 0;
          color: #0066cc;
          font-weight: bold;
        }
        
        .kb-usage-example {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
        }
        
        .kb-usage-example pre {
          background-color: #eeeeee;
          padding: 0.75rem;
          border-radius: 4px;
          overflow-x: auto;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        
        .status-active {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-testing {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-in-development {
          background-color: #cce5ff;
          color: #004085;
        }
        
        .type-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #e9ecef;
          border-radius: 4px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeBaseView;
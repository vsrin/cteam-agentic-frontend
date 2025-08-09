import React, { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Upload, FileText, CheckCircle, X, Search } from 'lucide-react';

const KnowledgeAssetsBuilderView = ({ onBack, initialData, mode = 'create' }) => {
  const [currentStep, setCurrentStep] = useState(() => {
    if (mode === 'test') return 2; // Direct to test stage
    return 0; // Start at setup for create/edit
  });
  const [config, setConfig] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    embeddingModel: initialData?.embeddingModel || 'BAAI/bge-small-en-v1.5',
    useExistingKB: mode === 'edit' || mode === 'test'
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [kbId, setKbId] = useState(initialData?.id || null);
  const [processedSuccessfully, setProcessedSuccessfully] = useState(false);
  const [isChatMode, setIsChatMode] = useState(true); // true for chat, false for search
  const [searchQuery, setSearchQuery] = useState('');
  const [retrievedChunks, setRetrievedChunks] = useState([]);
  const [chatResponse, setChatResponse] = useState('');
  const [numberOfChunks, setNumberOfChunks] = useState(10);
  const [maxCrawlPages, setMaxCrawlPages] = useState(1);
  const [maxCrawlDepth, setMaxCrawlDepth] = useState('');
  const [dynamicWait, setDynamicWait] = useState(5);
  const [retrievalType, setRetrievalType] = useState('Basic');
  const [scoreThreshold, setScoreThreshold] = useState(0);

  // Embedding models configuration
  const embeddingModels = [
    { id: 'BAAI/bge-small-en-v1.5', name: 'BAAI BGE Small', description: 'Fast and efficient' },
    { id: 'BAAI/bge-base-en-v1.5', name: 'BAAI BGE Base', description: 'Balanced performance' },
    { id: 'jina-embeddings-v2-base-en', name: 'Jina Embeddings v2', description: 'High quality embeddings' }
  ];

  const fileInputRef = React.useRef(null);

  // Helper function to show notifications
  const showNotification = useCallback((message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `${type}-notification`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, type === 'error' ? 4000 : 3000);
  }, []);

  // Handle search/chat
  const handleSearchOrChat = async () => {
    if (!searchQuery.trim()) {
      showNotification('Please enter a question or search query.', 'error');
      return;
    }

    if (!kbId) {
      showNotification('No knowledge base available for testing.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Search for chunks
      const searchResponse = await fetch(`http://16.170.162.72:5001/api/knowledge-bases/${kbId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery, 
          numberOfChunks: numberOfChunks 
        })
      });

      if (!searchResponse.ok) {
        const error = await searchResponse.json();
        showNotification(`Search Error: ${error.error}`, 'error');
        return;
      }

      const chunks = await searchResponse.json();
      setRetrievedChunks(chunks);

      if (isChatMode) {
        // Generate chat response
        const chunkText = chunks.map(chunk => chunk.text).join('\n\n');
        const llmResponse = await fetch('http://16.170.162.72:5001/api/llm/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunkText,
            query: searchQuery,
            prompt: `Answer the following question: "${searchQuery}" strictly with the given context. Format your response using Markdown for better readability:\n\n${chunkText}`
          })
        });

        if (llmResponse.ok) {
          const { summary } = await llmResponse.json();
          setChatResponse(summary);
        } else {
          const error = await llmResponse.json();
          showNotification(`LLM Error: ${error.error}`, 'error');
        }
      } else {
        setChatResponse('');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Network error during search.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'uploaded'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Create or update knowledge base - STEP 0 only creates empty KB for new ones
  const handleCreateOrUpdate = async () => {
    if (!config.name || !config.embeddingModel) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    // For existing knowledge bases, check if embedding model changed
    if (mode === 'edit' && initialData) {
      const embeddingModelChanged = config.embeddingModel !== initialData.embeddingModel;
      const descriptionChanged = config.description !== initialData.description;
      
      if (embeddingModelChanged) {
        // Embedding model changed - need to reprocess everything
        if (!window.confirm('Changing the embedding model will reprocess all documents in this knowledge base. This may take some time. Continue?')) {
          return;
        }
      }

      if (embeddingModelChanged || descriptionChanged) {
        // Only update if something actually changed
        try {
          setIsLoading(true);
          const formData = new FormData();
          formData.append('name', config.name);
          formData.append('description', config.description);
          formData.append('embeddingModel', config.embeddingModel);

          const response = await fetch(`http://16.170.162.72:5001/api/knowledge-bases/${kbId}`, {
            method: 'PUT',
            body: formData
          });

          if (response.ok) {
            showNotification(`Knowledge base updated successfully!`);
            if (embeddingModelChanged) {
              showNotification('Documents are being reprocessed with the new embedding model.', 'warning');
            }
          } else {
            const error = await response.json();
            showNotification(`Error: ${error.error}`, 'error');
            return;
          }
        } catch (error) {
          console.error('Error:', error);
          showNotification('Network error. Please check if the server is running.', 'error');
          return;
        } finally {
          setIsLoading(false);
        }
      }

      // For existing KB, go to documents step to add more content
      setCurrentStep(1);
      return;
    }

    // For new knowledge bases, create empty KB first (like the old working version)
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', config.name);
      formData.append('description', config.description);
      formData.append('embeddingModel', config.embeddingModel);

      console.log('Creating empty knowledge base with:', { name: config.name, embeddingModel: config.embeddingModel });

      const response = await fetch('http://16.170.162.72:5001/api/knowledge-bases', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Empty knowledge base created successfully:', result);
        setKbId(result.id);
        showNotification('Knowledge base created successfully!');
        setCurrentStep(1); // Move to documents step
      } else {
        const error = await response.json();
        console.error('Error creating knowledge base:', error);
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Network error:', error);
      showNotification('Network error. Please check if the server is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Process documents - USING THE SAME PATTERN AS WORKING VERSION
  const handleProcessDocuments = async () => {
    if (!uploadedFiles.length && !url && !rawText) {
      // For edit mode, if no new documents, just proceed to test
      if (mode === 'edit') {
        setCurrentStep(2);
        return;
      }
      showNotification('Please add at least one document, URL, or text.', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      
      // Include ALL data like the working version does
      formData.append('name', config.name);
      formData.append('description', config.description);
      formData.append('embeddingModel', config.embeddingModel);
      
      // Add files
      uploadedFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // Add URL and related options
      if (url) {
        formData.append('url', url);
        formData.append('maxCrawlPages', maxCrawlPages);
        formData.append('maxCrawlDepth', maxCrawlDepth);
        formData.append('dynamicWait', dynamicWait);
      }
      
      // Add raw text
      if (rawText) formData.append('rawText', rawText);
      
      // Add retrieval options
      formData.append('numberOfChunks', numberOfChunks);
      formData.append('retrievalType', retrievalType);
      formData.append('scoreThreshold', scoreThreshold);

      console.log('Processing documents using main endpoint (like working version):', {
        name: config.name,
        files: uploadedFiles.length,
        hasUrl: !!url,
        hasRawText: !!rawText,
        mode
      });

      // Use the main endpoint like the working version does
      const response = await fetch('http://16.170.162.72:5001/api/knowledge-bases', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Documents processed successfully:', result);
        setKbId(result.id); // Update the ID from the response
        setProcessedSuccessfully(true);
        showNotification('Documents processed successfully!');
        setCurrentStep(2); // Move to test step
      } else {
        const error = await response.json();
        console.error('Error processing documents:', error);
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Network error processing documents:', error);
      showNotification('Failed to process documents.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 0, title: 'Setup', description: 'Configure your knowledge base' },
    { id: 1, title: 'Documents', description: 'Add your content' },
    { id: 2, title: 'Test & Deploy', description: 'Test and use your knowledge base' }
  ];

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-group">
            <div className="form-row">
              <label className="form-label">Knowledge Base Name *</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                className="form-control"
                placeholder="My Knowledge Base"
                disabled={mode === 'edit'}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea"
                rows="3"
                placeholder="Describe what this knowledge base contains..."
              />
            </div>
            <div className="form-row">
              <label className="form-label">Embedding Model *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {embeddingModels.map(model => (
                  <label key={model.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    border: '1px solid var(--light-gray)', 
                    borderRadius: '0.375rem', 
                    cursor: 'pointer',
                    backgroundColor: config.embeddingModel === model.id ? 'var(--light-accent)' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      name="embeddingModel"
                      value={model.id}
                      checked={config.embeddingModel === model.id}
                      onChange={(e) => setConfig(prev => ({ ...prev, embeddingModel: e.target.value }))}
                      style={{ marginRight: '0.75rem' }}
                    />
                    <div>
                      <p style={{ fontWeight: '500', margin: '0 0 0.25rem' }}>{model.name}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', margin: '0' }}>{model.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="form-group">
            <h3 style={{ marginBottom: '1.5rem' }}>
              {mode === 'edit' ? 'Add More Documents (Optional)' : 'Add Your Documents'}
            </h3>
            
            {mode === 'edit' && (
              <div style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.2)', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: '0', fontSize: '0.875rem' }}>
                  Your knowledge base is ready to use. You can add more documents below or skip to test it.
                </p>
              </div>
            )}
            
            {/* File Upload */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>
                {mode === 'edit' ? 'Add More Files' : 'Upload Files'}
              </h4>
              {mode === 'edit' && (
                <p style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                  Add new documents to your existing knowledge base. They will be processed with the same embedding model.
                </p>
              )}
              <div 
                style={{
                  border: '2px dashed var(--light-gray)',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload style={{ width: '3rem', height: '3rem', color: 'var(--secondary-color)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--secondary-color)', margin: '0 0 0.5rem' }}>Click to upload files or drag and drop</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', margin: '0' }}>PDF, DOCX, TXT files supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.txt"
                />
              </div>
              
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  {uploadedFiles.map(file => (
                    <div key={file.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '0.75rem', 
                      backgroundColor: 'var(--light-accent)', 
                      borderRadius: '0.375rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--secondary-color)' }} />
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: '0' }}>{file.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', margin: '0' }}>{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '0.25rem'
                        }}
                      >
                        <X style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL Input */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Or Add a Website URL</h4>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="form-control"
                placeholder="https://example.com"
              />
              
              {url && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Max Crawl Pages</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={maxCrawlPages}
                      onChange={(e) => setMaxCrawlPages(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Crawl Depth</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Depth"
                      value={maxCrawlDepth}
                      onChange={(e) => setMaxCrawlDepth(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dynamic Wait (s)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={dynamicWait}
                      onChange={(e) => setDynamicWait(parseInt(e.target.value) || 5)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Raw Text */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Or Add Raw Text</h4>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="form-textarea"
                rows="6"
                placeholder="Paste your text content here..."
              />
            </div>

            {/* Retrieval Options (like working version) */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Retrieval Settings</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Number of Chunks</label>
                  <input
                    type="number"
                    className="form-control"
                    value={numberOfChunks}
                    onChange={(e) => setNumberOfChunks(parseInt(e.target.value) || 10)}
                  />
                </div>
                <div className="form-group">
                  <label>Retrieval Type</label>
                  <select
                    className="form-control"
                    value={retrievalType}
                    onChange={(e) => setRetrievalType(e.target.value)}
                  >
                    <option>Basic</option>
                    <option>Advanced</option>
                    <option>Semantic</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label>Score Threshold: {scoreThreshold}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-group">
            {/* Knowledge Base Summary */}
            <div style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.08)', 
              border: '1px solid rgba(34, 197, 94, 0.2)', 
              borderRadius: '0.75rem', 
              padding: '0',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}>
              <div style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#22c55e', marginRight: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#166534', margin: '0' }}>
                    {mode === 'test' ? 'Testing' : 'Ready'}: {config.name}
                  </h3>
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#166534',
                  fontWeight: '500'
                }}>
                  Files: {initialData?.fileCount || 0}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Description:
                  </h4>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#15803d', 
                    margin: '0',
                    lineHeight: '1.5',
                    minHeight: '1.5rem'
                  }}>
                    {config.description || 'No description provided'}
                  </p>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                  gap: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(34, 197, 94, 0.15)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Embedding Model
                    </span>
                    <p style={{ fontSize: '0.875rem', color: '#15803d', margin: '0.25rem 0 0' }}>
                      {config.embeddingModel}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Vector Store
                    </span>
                    <p style={{ fontSize: '0.875rem', color: '#15803d', margin: '0.25rem 0 0' }}>
                      pgvector
                    </p>
                  </div>
                  {initialData?.updatedAt && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Last Updated
                      </span>
                      <p style={{ fontSize: '0.875rem', color: '#15803d', margin: '0.25rem 0 0' }}>
                        {new Date(initialData.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test Interface */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0' }}>Test Your Knowledge Base</h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{ fontWeight: !isChatMode ? 'bold' : 'normal', fontSize: '0.875rem' }}>Search</span>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="mode-toggle"
                      checked={isChatMode}
                      onChange={() => {
                        setIsChatMode(!isChatMode);
                        setRetrievedChunks([]);
                        setChatResponse('');
                        setSearchQuery('');
                      }}
                    />
                    <label htmlFor="mode-toggle" className="toggle-slider"></label>
                  </div>
                  <span style={{ fontWeight: isChatMode ? 'bold' : 'normal', fontSize: '0.875rem' }}>Chat</span>
                </div>
              </div>
              
              <p style={{ color: 'var(--secondary-color)', margin: '0 0 1rem' }}>
                {isChatMode 
                  ? 'Ask questions and get AI-generated answers based on your knowledge base.'
                  : 'Search for specific content and see the raw chunks retrieved from your documents.'
                }
              </p>
              
              {!isChatMode && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--light-accent)',
                  borderRadius: '0.375rem'
                }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    Number of chunks:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfChunks}
                    onChange={(e) => setNumberOfChunks(parseInt(e.target.value) || 10)}
                    style={{
                      width: '80px',
                      padding: '0.375rem',
                      border: '1px solid var(--light-gray)',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="chat-container" style={{ 
              border: '1px solid var(--light-gray)',
              borderRadius: '0.5rem',
              height: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div className="chat-messages" style={{ 
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ 
                  backgroundColor: 'var(--light-accent)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{ margin: '0', color: 'var(--primary-color)' }}>
                    👋 {isChatMode 
                      ? `Hi! I can help you search through "${config.name}". Ask me anything about the content in this knowledge base.`
                      : `Search through "${config.name}" to see specific chunks of content that match your query.`
                    }
                  </p>
                </div>

                {isChatMode && chatResponse && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--light-gray)'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                      AI Response:
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: chatResponse.replace(/\n/g, '<br>') }} />
                  </div>
                )}

                {!isChatMode && retrievedChunks.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                      Found {retrievedChunks.length} chunks:
                    </div>
                    {retrievedChunks.map((chunk, index) => (
                      <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        border: '1px solid var(--light-gray)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', marginBottom: '0.5rem' }}>
                          Chunk {index + 1} • Score: {chunk.score?.toFixed(3) || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
                          {chunk.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="chat-input" style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem',
                borderTop: '1px solid var(--light-gray)',
                backgroundColor: 'var(--white)'
              }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchOrChat()}
                  placeholder={isChatMode ? "Ask a question about your knowledge base..." : "Search for specific content..."}
                  style={{ 
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid var(--light-gray)',
                    borderRadius: '0.375rem',
                    marginRight: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSearchOrChat}
                  disabled={isLoading}
                >
                  <Search style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  {isLoading ? 'Processing...' : (isChatMode ? 'Ask' : 'Search')}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="progressive-agent-builder">
      {/* Back Button */}
      <div className="back-container">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Back to Knowledge Assets
        </button>
      </div>

      <div className="progressive-form-container">
        <div className="page-header">
          <h1>
            {mode === 'test' ? 'Test Knowledge Asset' : 
             mode === 'edit' ? 'Edit Knowledge Asset' : 
             'Create Knowledge Asset'}
          </h1>
          <p>
            {mode === 'test' ? 'Test and interact with your knowledge asset' : 
             'Simple 3-step process to create your knowledge asset'}
          </p>
        </div>

        {/* Progress Steps - hide in test mode */}
        {mode !== 'test' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {steps.map((step, index) => {
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;
                
                return (
                  <React.Fragment key={step.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isCompleted ? '#22c55e' : isActive ? '#3b82f6' : '#e5e7eb',
                        color: isCompleted || isActive ? 'white' : '#6b7280',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        {isCompleted ? <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} /> : index + 1}
                      </div>
                      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          margin: '0 0 0.25rem',
                          color: isActive ? '#3b82f6' : isCompleted ? '#22c55e' : '#6b7280'
                        }}>
                          {step.title}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: '0'
                        }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div style={{
                        flex: 0.5,
                        height: '2px',
                        backgroundColor: isCompleted ? '#22c55e' : '#e5e7eb',
                        margin: '0 1rem'
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="form-row" style={{ marginBottom: '2rem' }}>
          {getCurrentStepContent()}
        </div>

        {/* Navigation */}
        <div className="form-actions">
          <button
            onClick={() => {
              if (currentStep === 0) {
                onBack();
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
            className="btn btn-secondary"
          >
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </button>

          <div className="button-group">
            {currentStep === 0 && (
              <button
                onClick={handleCreateOrUpdate}
                disabled={isLoading || !config.name || !config.embeddingModel}
                className="btn btn-primary"
              >
                {isLoading ? 'Processing...' : config.useExistingKB ? 'Continue' : 'Create & Continue'}
              </button>
            )}

            {currentStep === 1 && (
              <button
                onClick={handleProcessDocuments}
                disabled={isProcessing}
                className="btn btn-primary"
              >
                {isProcessing ? 'Processing...' : 
                 mode === 'edit' ? 
                   (uploadedFiles.length || url || rawText ? 'Add Documents' : 'Test') : 
                   'Process Documents'}
              </button>
            )}

            {currentStep === 2 && mode !== 'test' && (
              <button
                onClick={() => {
                  showNotification('Knowledge asset is ready to use!');
                  onBack();
                }}
                className="btn btn-primary"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(isLoading || isProcessing) && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeAssetsBuilderView;
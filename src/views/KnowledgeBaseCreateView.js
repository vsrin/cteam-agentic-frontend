import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

const KnowledgeBaseCreateView = ({ onBack, initialData = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vectorStore] = useState('pgvector');
  const [embeddingModel, setEmbeddingModel] = useState('');
  const [nameError, setNameError] = useState('');
  const [files, setFiles] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [url, setUrl] = useState('');
  const [maxCrawlPages, setMaxCrawlPages] = useState(1);
  const [maxCrawlDepth, setMaxCrawlDepth] = useState('');
  const [dynamicWait, setDynamicWait] = useState(5);
  const [rawText, setRawText] = useState('');
  const [numberOfChunks, setNumberOfChunks] = useState(10);
  const [retrievalType, setRetrievalType] = useState('Basic');
  const [scoreThreshold, setScoreThreshold] = useState(0);
  const [retrievedChunks, setRetrievedChunks] = useState([]);
  const [chatResponse, setChatResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showRetrievalSection, setShowRetrievalSection] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCloneMode, setIsCloneMode] = useState(false);
  const [kbId, setKbId] = useState(null);
  const [isChatMode, setIsChatMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Added for error feedback
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [notification, setNotification] = useState({ show: false, type: '', message: '' }); // Notification state

  const embeddingModels = [
    { id: 'BAAI/bge-small-en-v1.5', name: 'BAAI/bge-small-en-v1.5' },
    { id: 'BAAI/bge-base-en-v1.5', name: 'BAAI/bge-base-en-v1.5' },
    { id: 'jina-embeddings-v2-base-en', name: 'jina-embeddings-v2-base-en' }
  ];

  useEffect(() => {
    if (initialData) {
      const isCloning = initialData.name.startsWith('CloneOf-');
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setEmbeddingModel(initialData.embeddingModel || '');
      setUrl(initialData.url || '');
      setMaxCrawlPages(initialData.maxCrawlPages || 1);
      setMaxCrawlDepth(initialData.maxCrawlDepth || '');
      setDynamicWait(initialData.dynamicWait || 5);
      setRawText(initialData.rawText || '');
      setNumberOfChunks(initialData.numberOfChunks || 10);
      setRetrievalType(initialData.retrievalType || 'Basic');
      setScoreThreshold(initialData.scoreThreshold || 0);
      setIsEditMode(!isCloning);
      setIsCloneMode(isCloning);
      setKbId(initialData.id);
      if (!isCloning) {
        setIsCreated(true);
        setShowUploadSection(true);
        if (initialData.fileCount > 0) setShowRetrievalSection(true);
      }
    }
  }, [initialData]);

  const checkNameUniqueness = async (nameToCheck) => {
    if (!nameToCheck) return false;
    if (isEditMode && initialData && initialData.name === nameToCheck) return true;
    try {
      const response = await fetch('http://16.170.162.72:5001/api/knowledge-bases');
      const knowledgeBases = await response.json();
      return !knowledgeBases.some(kb => kb.name.toLowerCase() === nameToCheck.toLowerCase());
    } catch (error) {
      console.error('Error checking name uniqueness:', error);
      setErrorMessage('Failed to check name uniqueness. Please try again.');
      return false;
    }
  };

  const handleNameChange = async (e) => {
    const newName = e.target.value;
    setName(newName);
    if (!newName) {
      setNameError('Name is required');
    } else if (!(await checkNameUniqueness(newName))) {
      setNameError('This name already exists. Please choose a unique name.');
    } else {
      setNameError('');
    }
  };

  const handleCreateKnowledgeBase = async (e) => {
    e.preventDefault();
    if (!name || !embeddingModel) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (!(await checkNameUniqueness(name))) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('embeddingModel', embeddingModel);
    files.forEach(file => formData.append('files', file));
    formData.append('url', url);
    formData.append('maxCrawlPages', maxCrawlPages);
    formData.append('maxCrawlDepth', maxCrawlDepth);
    formData.append('dynamicWait', dynamicWait);
    formData.append('rawText', rawText);
    formData.append('numberOfChunks', numberOfChunks);
    formData.append('retrievalType', retrievalType);
    formData.append('scoreThreshold', scoreThreshold);

    try {
      const response = await fetch('http://16.170.162.72:5001/api/knowledge-bases', {
        method: 'POST',
        body: formData
      });
      setIsLoading(false);
      
      if (response.ok) {
        const result = await response.json();
        setKbId(result.id);
        setErrorMessage('');
        // Show notification instead of alert
        setNotification({
          show: true,
          type: 'success',
          message: `Knowledge base ${isEditMode ? 'updated' : 'created'} successfully!`
        });
        // Auto-hide notification after 3 seconds
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
        setIsCreated(true);
        setShowUploadSection(true);
      } else {
        const error = await response.json();
        setErrorMessage(`Error: ${error.error || 'Failed to create knowledge base.'}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Fetch error:', error);
      setErrorMessage('Network error: Unable to connect to the server. Please check if the server is running.');
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
    
    // Add file information for display
    setFileList([...fileList, ...uploadedFiles.map(file => ({ 
      name: file.name, 
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type 
    }))]);
    
    setErrorMessage('');
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newFileList = [...fileList];
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const handleReset = () => {
    setFiles([]);
    setFileList([]);
    setUrl('');
    setMaxCrawlPages(1);
    setMaxCrawlDepth('');
    setDynamicWait(5);
    setRawText('');
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (files.length > 0 || url || rawText) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('embeddingModel', embeddingModel);
      files.forEach(file => formData.append('files', file));
      formData.append('url', url);
      formData.append('maxCrawlPages', maxCrawlPages);
      formData.append('maxCrawlDepth', maxCrawlDepth);
      formData.append('dynamicWait', dynamicWait);
      formData.append('rawText', rawText);
      formData.append('numberOfChunks', numberOfChunks);
      formData.append('retrievalType', retrievalType);
      formData.append('scoreThreshold', scoreThreshold);

      try {
        const response = await fetch('http://16.170.162.72:5001/api/knowledge-bases', {
          method: 'POST',
          body: formData
        });
        setIsLoading(false);
        
        if (response.ok) {
          const result = await response.json();
          setKbId(result.id);
          setErrorMessage('');
          // Show notification instead of alert
          setNotification({
            show: true,
            type: 'success',
            message: 'Knowledge base content processed successfully!'
          });
          // Auto-hide notification after 3 seconds
          setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
          setShowRetrievalSection(true);
        } else {
          const error = await response.json();
          setErrorMessage(`Error: ${error.error || 'Failed to process knowledge base content.'}`);
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Fetch error:', error);
        setErrorMessage('Network error: Unable to connect to the server. Please check if the server is running.');
      }
    } else {
      setErrorMessage('Please upload files, enter a URL, or add raw text.');
    }
  };

  const handleRetrieve = async () => {
    if (!kbId) {
      setErrorMessage('Please create or upload content to a knowledge base first.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://16.170.162.72:5001/api/knowledge-bases/${kbId}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, numberOfChunks })
      });
      if (response.ok) {
        const results = await response.json();
        setErrorMessage('');

        if (isChatMode) {
          const chunkText = results.map(chunk => chunk.text).join('\n\n');
          const llmResponse = await fetch('http://16.170.162.72:5001/api/llm/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: chunkText,
              query: searchQuery,
              prompt: `Answer the following question: "${searchQuery}" strictly with the given context. Format your response using Markdown for better readability. Use headers, bullet points, bold text, and other formatting as appropriate:\n\n${chunkText}`
            })
          });
          setIsLoading(false);
          if (llmResponse.ok) {
            const { summary } = await llmResponse.json();
            setChatResponse(summary);
            setRetrievedChunks([]);
          } else {
            const error = await llmResponse.json();
            setErrorMessage(`LLM Error: ${error.error}`);
          }
        } else {
          setIsLoading(false);
          setRetrievedChunks(results);
          setChatResponse('');
        }
      } else {
        setIsLoading(false);
        const error = await response.json();
        setErrorMessage(`Search Error: ${error.error}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Fetch error:', error);
      setErrorMessage('Network error: Unable to connect to the server for search.');
    }
  };

  // Add CSS styles for markdown content and new UI components
  const markdownStyles = `
    .markdown-content h1 { font-size: 1.8rem; margin-top: 1rem; margin-bottom: 1rem; font-weight: 600; color: #1a365d; }
    .markdown-content h2 { font-size: 1.5rem; margin-top: 0.8rem; margin-bottom: 0.8rem; font-weight: 600; color: #2c5282; }
    .markdown-content h3 { font-size: 1.25rem; margin-top: 0.6rem; margin-bottom: 0.6rem; font-weight: 600; color: #2b6cb0; }
    .markdown-content p { margin-bottom: 1rem; }
    .markdown-content ul, .markdown-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    .markdown-content li { margin-bottom: 0.25rem; }
    .markdown-content pre { background-color: #f7fafc; padding: 0.75rem; border-radius: 0.25rem; overflow-x: auto; margin-bottom: 1rem; }
    .markdown-content code { background-color: #edf2f7; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; }
    .markdown-content blockquote { border-left: 4px solid #cbd5e0; padding-left: 1rem; margin-left: 0; margin-right: 0; font-style: italic; color: #4a5568; }
    .markdown-content a { color: #3182ce; text-decoration: underline; }
    .markdown-content table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
    .markdown-content th, .markdown-content td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
    .markdown-content th { background-color: #edf2f7; }
    .markdown-content img { max-width: 100%; height: auto; }
    .markdown-content strong { font-weight: 600; }
    .markdown-content em { font-style: italic; }

    /* File list styles */
    .file-list {
      max-height: 200px;
      overflow-y: auto;
      margin-top: 1rem;
      border: 1px solid var(--light-gray);
      border-radius: 6px;
    }
    
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--light-gray);
    }
    
    .file-item:last-child {
      border-bottom: none;
    }
    
    .file-name {
      flex: 1;
    }
    
    .file-size {
      color: var(--secondary-color);
      font-size: 0.875rem;
      margin-right: 1rem;
    }
    
    .file-remove-btn {
      background: none;
      border: none;
      color: var(--secondary-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border-radius: 4px;
    }
    
    .file-remove-btn:hover {
      color: #e53e3e;
      background-color: rgba(229, 62, 62, 0.1);
    }
    
    /* Loading overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--accent-color);
      animation: spinner-rotate 1s linear infinite;
    }
    
    @keyframes spinner-rotate {
      to { transform: rotate(360deg); }
    }
    
    /* Notification styles */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .success-notification {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .error-notification {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; visibility: hidden; }
    }
  `;

  return (
    <div className="knowledge-base-view">
      <style>{markdownStyles}</style>
      <div className="create-form-container">
        <div className="management-header" style={{ marginTop: '0', paddingTop: '0' }}>
          <button className="btn-back" onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.6667 4L6.66667 8L10.6667 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <h2>{isEditMode ? 'Edit Knowledgebase' : (isCloneMode ? 'Clone Knowledgebase' : 'Create Knowledgebase')}</h2>
        </div>

        {errorMessage && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
            {errorMessage}
          </div>
        )}

        {!isCreated ? (
          <form onSubmit={handleCreateKnowledgeBase}>
            <div className="form-group">
              <label htmlFor="kb-name">Name {isEditMode && !isCloneMode ? '' : '*'}</label>
              <input
                id="kb-name"
                type="text"
                className={`form-control ${nameError ? 'error' : ''}`}
                placeholder="Name of your knowledge base"
                value={name}
                onChange={handleNameChange}
                disabled={isEditMode && !isCloneMode}
                required
              />
              {nameError && <div className="error-message" style={{ color: 'red', fontSize: '0.8rem' }}>{nameError}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="kb-description">Description</label>
              <input
                id="kb-description"
                type="text"
                className="form-control"
                placeholder="Description of your knowledge base"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-instruction">
              Choose the embedding model for converting text into vectors
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="embedding-model">LLM Embedding Model*</label>
                <select
                  id="embedding-model"
                  className="form-select"
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  required
                >
                  <option value="">Select Embedding Model</option>
                  {embeddingModels.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="required-note">* marked as required</div>

            <div className="form-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={onBack} style={{ cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: '0.5rem', cursor: 'pointer' }}>
                {isEditMode ? 'Update' : (isCloneMode ? 'Create Clone' : 'Create')}
              </button>
            </div>
          </form>
        ) : (
          <div className="created-info" style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#0369a1' }}>{name}</h3>
            <p style={{ margin: '0', color: '#0c4a6e' }}>{description}</p>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
              <div>Vector Store: pgvector</div>
              <div>Embedding Model: {embeddingModel}</div>
            </div>
          </div>
        )}
      </div>

      {showUploadSection && (
        <div className="management-content" style={{ marginTop: '0.5rem' }}>
          <div className="upload-section">
            <h3>File Upload (.pdf, .docx, .txt)</h3>
            <div className="dropzone">
              <div className="dropzone-content">
                <p>Drag 'n' drop up to 5 files here, or click to select files</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <button
                  className="btn btn-secondary"
                  onClick={() => document.getElementById('file-upload').click()}
                  style={{ cursor: 'pointer' }}
                >
                  Select Files
                </button>
              </div>
            </div>

            {/* Display selected files */}
            {fileList.length > 0 && (
              <div className="file-list">
                {fileList.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{file.size}</div>
                    <button 
                      className="file-remove-btn" 
                      onClick={() => handleRemoveFile(index)}
                      aria-label="Remove file"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="or-divider">OR</div>

            <div className="url-section">
              <h3>URL</h3>
              <div className="form-group">
                <input
                  type="url"
                  className="form-control"
                  placeholder="Enter valid URL"
                  value={url} onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="url-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Max Crawl Pages</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={maxCrawlPages}
                    onChange={(e) => setMaxCrawlPages(e.target.value)}
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
                    onChange={(e) => setDynamicWait(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="or-divider">OR</div>

            <div className="raw-text-section">
              <h3>Raw Text</h3>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Enter text here"
                  rows="6"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="upload-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={handleReset} style={{ cursor: 'pointer' }}>Reset</button>
              <button className="btn btn-primary" onClick={handleUpload} style={{ cursor: 'pointer' }}>Upload</button>
            </div>
          </div>

          {showRetrievalSection && (
            <div className="retrieval-section" style={{ marginTop: '0.5rem', padding: '1.5rem', backgroundColor: '#e9ecef', borderRadius: '6px', boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.08)' }}>
              <h3>Knowledgebase Retrieval</h3>
              <p>Search through your knowledge base by entering a query below. Toggle between retrieving raw chunks or a summarized chat response.</p>

              <div className="mode-toggle-container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontWeight: !isChatMode ? 'bold' : 'normal' }}>Search</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="mode-toggle"
                    checked={isChatMode}
                    onChange={() => setIsChatMode(!isChatMode)}
                  />
                  <label htmlFor="mode-toggle" className="toggle-slider"></label>
                </div>
                <span style={{ fontWeight: isChatMode ? 'bold' : 'normal' }}>Chat</span>
              </div>

              <div className="search-control">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your search query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: '6rem' }}
                />
              </div>

              <div className="retrieval-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Number of Chunks*</label>
                  <input
                    type="number"
                    className="form-control"
                    value={numberOfChunks}
                    onChange={(e) => setNumberOfChunks(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Retrieval Type*</label>
                  <select
                    className="form-select"
                    value={retrievalType}
                    onChange={(e) => setRetrievalType(e.target.value)}
                  >
                    <option>Basic</option>
                    <option>Advanced</option>
                    <option>Semantic</option>
                  </select>
                </div>
              </div>

              <div className="threshold-section" style={{ marginTop: '1rem' }}>
                <div className="threshold-header" style={{ display: 'flex', alignItems: 'center' }}>
                  <label>Score Threshold: {scoreThreshold}*</label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(e.target.value)}
                  className="slider"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="retrieval-actions" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setRetrievedChunks([]); setChatResponse(''); setErrorMessage(''); }} style={{ cursor: 'pointer' }}>Reset</button>
                <button className="btn btn-primary" onClick={handleRetrieve} style={{ cursor: 'pointer' }}>{isChatMode ? 'Chat' : 'Retrieve'}</button>
              </div>

              <div className="retrieved-results" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#dee2e6', borderRadius: '4px' }}>
                <h4>{isChatMode ? 'Chat Response' : 'Retrieved Chunks'}</h4>
                <div className="chunks-container">
                  {isChatMode ? (
                    chatResponse ? (
                      <div className="chat-response" style={{
                        padding: '1rem',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                      }}>
                        <div
                          className="markdown-content"
                          style={{ lineHeight: '1.6' }}
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(chatResponse)
                          }}
                        />
                      </div>
                    ) : (
                      <div className="no-chunks" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        No chat response yet. Enter a query and click Chat.
                      </div>
                    )
                  ) : retrievedChunks.length > 0 ? (
                    retrievedChunks.map(chunk => (
                      <div key={chunk.id} className="chunk-item" style={{ padding: '0.75rem', marginBottom: '0.75rem', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        <div className="chunk-score">Score: {chunk.score.toFixed(2)}</div>
                        <div className="chunk-text">{chunk.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="no-chunks" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      No chunks retrieved yet. Enter a query and click Retrieve.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Notification toast */}
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
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseCreateView;
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ agentConfig }) {
  const [inquiry, setInquiry] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [fullText, setFullText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMetadata, setExpandedMetadata] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const threadId = 1;

  // Toggle metadata dropdown
  const toggleMetadata = (index) => {
    setExpandedMetadata((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type - only allow text files
    const allowedTypes = [
      'text/plain',
      'text/csv',
      'text/markdown',
      'text/html',
      'text/xml',
      'application/json',
      'application/xml'
    ];
    
    const isTextFile = allowedTypes.includes(file.type) || 
                      file.name.match(/\.(txt|md|csv|json|xml|html|log|yml|yaml|ini|cfg|conf)$/i);

    if (!isTextFile) {
      // Show error notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'error-notification';
      errorNotification.textContent = 'Please upload a text file (.txt, .md, .csv, .json, etc.)';
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 3000);
      
      // Reset file input
      event.target.value = '';
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorNotification = document.createElement('div');
      errorNotification.className = 'error-notification';
      errorNotification.textContent = 'File size must be less than 5MB';
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 3000);
      
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const text = await readFileAsText(file);
      
      // Add file content to the current inquiry
      const fileHeader = `--- Content from ${file.name} ---\n`;
      const fileFooter = `\n--- End of ${file.name} ---`;
      const newContent = inquiry ? `${inquiry}\n\n${fileHeader}${text}${fileFooter}` : `${fileHeader}${text}${fileFooter}`;
      
      setInquiry(newContent);
      
      // Show success notification
      const successNotification = document.createElement('div');
      successNotification.className = 'success-notification';
      successNotification.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        File "${file.name}" content added to message
      `;
      document.body.appendChild(successNotification);
      
      setTimeout(() => {
        if (document.body.contains(successNotification)) {
          document.body.removeChild(successNotification);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error reading file:', error);
      
      const errorNotification = document.createElement('div');
      errorNotification.className = 'error-notification';
      errorNotification.textContent = 'Error reading file. Please try again.';
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
      }, 3000);
    } finally {
      setIsUploading(false);
      // Reset file input to allow uploading the same file again
      event.target.value = '';
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (isLoading || isTyping || isUploading) return;
    fileInputRef.current?.click();
  };

  // Typewriter effect
  useEffect(() => {
    if (isTyping && fullText) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i <= fullText.length) {
          setCurrentText(fullText.substring(0, i));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          // Once typing is complete, add the message to the messages array
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'assistant', content: fullText, metadata: fullText.metadata || null },
          ]);
          setFullText('');
          setCurrentText('');
        }
      }, 10); // Speed of typing

      return () => clearInterval(typingInterval);
    }
  }, [isTyping, fullText]);

  // Function to send message to the API
  const sendMessageToAPI = useCallback(async (userMessage) => {
    setIsLoading(true);

    try {
      const response = await axios.post('https://fastapi.enowclear360.com/query', {
        agent_config: agentConfig,
        message: userMessage,
        thread_id: threadId,
      });
      console.log(response)

      // Start the typewriter effect with the API response
      setIsLoading(false);
      setIsTyping(true);
      setFullText({
        result: response.data.response.result,
        metadata: response.data.response.metadata,
      });
    } catch (error) {
      console.error('Error sending message to API:', error);
      setIsLoading(false);
      setIsTyping(true);
      setFullText({
        result: "Sorry, there was an error processing your request. Please try again.",
        metadata: null,
      });
    }
  }, [agentConfig, threadId]);

  // Initial greeting message
  useEffect(() => {
    console.log(agentConfig)
    if (agentConfig && agentConfig.Configuration) {
      agentConfig.Configuration.system_message += agentConfig.Configuration.examples;
    }
    setTimeout(() => {
      setIsTyping(true);
      setFullText({
        result: "Hello! I'm your AI assistant. How can I help you today?",
        metadata: null,
      });
    }, 20);
  }, [agentConfig]);

  const handleSend = () => {
    if (!inquiry.trim() || isLoading || isTyping || isUploading) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: inquiry };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Store the inquiry before clearing input
    const currentInquiry = inquiry;

    // Clear input
    setInquiry('');

    // Send message to API
    sendMessageToAPI(currentInquiry);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea - Modified to prevent expansion with file content
  const handleTextareaChange = (e) => {
    setInquiry(e.target.value);
    
    // Only auto-resize if the content is reasonably short
    // Prevent expansion for large file uploads
    const lineCount = e.target.value.split('\n').length;
    if (lineCount <= 5) {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    } else {
      // Keep fixed height for large content
      e.target.style.height = '120px';
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              <ReactMarkdown>{message.content.result || message.content}</ReactMarkdown>
              {message.metadata && (
                <div className="metadata-container">
                  <button
                    className="metadata-toggle"
                    onClick={() => toggleMetadata(index)}
                  >
                    {expandedMetadata[index] ? 'Hide JSON' : 'Show JSON'}
                  </button>
                  {expandedMetadata[index] && (
                    <pre className="metadata-code">
                      {JSON.stringify(message.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message assistant">
            <div className="message-content">
              <ReactMarkdown>{currentText.result || currentText}</ReactMarkdown>
            </div>
            <span className="typing-indicator">|</span>
          </div>
        )}

        {isLoading && (
          <div className="message assistant loading">
            <div className="typing-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.json,.xml,.html,.log,.yml,.yaml,.ini,.cfg,.conf,text/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="message-textarea"
            placeholder="Type your message..."
            value={inquiry}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isTyping || isUploading}
            rows="1"
          />
          
          <div className="input-buttons">
            {/* File upload button - Plus sign */}
            <button
              className="input-btn upload-btn"
              onClick={handleUploadClick}
              disabled={isLoading || isTyping || isUploading}
              title="Upload file"
            >
              {isUploading ? (
                <svg className="spin" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="33 11"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3.75v10.5M3.75 9h10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            
            {/* Send button - Play arrow */}
            <button
              className="input-btn send-btn"
              onClick={handleSend}
              disabled={isLoading || isTyping || !inquiry.trim() || isUploading}
              title="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.75 9L16.5 2.25L9.75 15.75L7.5 9L3.75 9Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: #ffffff;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .message {
          max-width: 70%;
          padding: 0.875rem 1.125rem;
          border-radius: 1.125rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .message.user {
          align-self: flex-end;
          background-color: #f8fafc;
          color: white;
          border-bottom-right-radius: 0.375rem;
          border: 1px solid #e2e8f0;
        }
        
        .message.user * {
          color: white !important;
        }
        
        .message.user code {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .message.user a {
          color: #bfdbfe !important;
          text-decoration: underline;
        }
        
        .message.assistant {
          align-self: flex-start;
          background-color: #f8fafc;
          color: #1e293b;
          border-bottom-left-radius: 0.375rem;
          border: 1px solid #e2e8f0;
        }
        
        .message-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          width: 100%;
        }
        
        .typing-indicator {
          display: inline-block;
          animation: blink 1s step-end infinite;
          margin-left: 2px;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .message.loading {
          padding: 1rem;
          max-width: 200px;
        }
        
        .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          background-color: #94a3b8;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.6;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .metadata-container {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .message.user .metadata-container {
          border-top-color: rgba(255, 255, 255, 0.2);
        }
        
        .metadata-toggle {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0;
        }
        
        .message.user .metadata-toggle {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .metadata-code {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 0.375rem;
          padding: 0.75rem;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          color: #374151;
          overflow-x: auto;
        }
        
        .message.user .metadata-code {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .chat-input-container {
          padding: 1rem 1.25rem;
          background-color: #ffffff;
          border-top: 1px solid #e5e7eb;
        }
        
        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          background-color: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.5rem;
          transition: border-color 0.2s ease;
        }
        
        .input-row:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .message-textarea {
          flex: 1;
          border: none;
          background: transparent;
          resize: none;
          outline: none;
          font-size: 0.875rem;
          line-height: 1.5;
          padding: 0.5rem 0.75rem;
          color: #1f2937;
          font-family: inherit;
          min-height: 24px;
          max-height: 120px;
          overflow-y: auto;
        }
        
        .message-textarea::placeholder {
          color: #9ca3af;
        }
        
        .message-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .input-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .input-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0;
        }
        
        .upload-btn {
          background-color: #6b7280;
          color: white;
        }
        
        .upload-btn:hover:not(:disabled) {
          background-color: #4b5563;
          transform: translateY(-1px);
        }
        
        .upload-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .send-btn {
          background-color: #2563eb;
          color: white;
        }
        
        .send-btn:hover:not(:disabled) {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }
        
        .send-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .success-notification,
        .error-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 16px;
          border-radius: 0.5rem;
          color: white;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideInRight 0.3s ease-out;
          max-width: 320px;
        }
        
        .success-notification {
          background-color: #10b981;
        }
        
        .error-notification {
          background-color: #ef4444;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .chat-messages {
            padding: 0.75rem;
          }
          
          .chat-input-container {
            padding: 0.75rem 1rem;
          }
          
          .message {
            max-width: 85%;
          }
          
          .input-btn {
            width: 32px;
            height: 32px;
          }
          
          .success-notification,
          .error-notification {
            left: 12px;
            right: 12px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
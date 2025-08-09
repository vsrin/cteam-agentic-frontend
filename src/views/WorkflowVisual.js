import React, { useState, useEffect } from 'react';

const EnhancedSVGWorkflowVisualizer = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [workflow, setWorkflow] = useState(null);
  const [error, setError] = useState('');
  const [svgString, setSvgString] = useState('');
  const [theme, setTheme] = useState('blue'); // blue, green, purple, dark

  // Example workflow JSON
  const exampleJson = {
    "name": "get_submission_analysis",
    "description": "A test workflow with WAIT_FOR_CALLBACK",
    "tasks": [
      {
        "name": "wait_for_file_upload",
        "taskReferenceName": "wait_for_upload",
        "type": "SIMPLE"
      },
      {
        "name": "generate_auth_token",
        "taskReferenceName": "generate_auth",
        "type": "SIMPLE"
      },
      {
        "name": "get_upload_url",
        "taskReferenceName": "upload_task",
        "type": "SIMPLE"
      },
      {
        "name": "upload_file",
        "taskReferenceName": "upload_file_ref",
        "type": "SIMPLE"
      },
      {
        "name": "trigger_processing",
        "taskReferenceName": "trigger_processing_ref",
        "type": "SIMPLE"
      },
      {
        "name": "poll_submission_status",
        "taskReferenceName": "poll_submission_status_ref",
        "type": "SIMPLE"
      }
    ]
  };

  useEffect(() => {
    // Initialize with example JSON
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  }, []);

  const parseAndVisualize = () => {
    try {
      const parsedWorkflow = JSON.parse(jsonInput);
      setWorkflow(parsedWorkflow);
      generateSVG(parsedWorkflow);
      setError('');
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
      setWorkflow(null);
      setSvgString('');
    }
  };

  const getThemeColors = () => {
    const themes = {
      blue: {
        background: '#f8fafc',
        startFill: '#dbeafe',
        startStroke: '#3b82f6',
        titleColor: '#1e40af',
        boxFill: '#ffffff',
        boxStroke: '#93c5fd',
        boxShadow: '#dbeafe',
        primaryText: '#1e40af',
        secondaryText: '#3b82f6',
        arrowColor: '#60a5fa'
      },
      green: {
        background: '#f0fdf4',
        startFill: '#dcfce7',
        startStroke: '#22c55e',
        titleColor: '#166534',
        boxFill: '#ffffff',
        boxStroke: '#86efac',
        boxShadow: '#dcfce7',
        primaryText: '#166534',
        secondaryText: '#22c55e',
        arrowColor: '#4ade80'
      },
      purple: {
        background: '#faf5ff',
        startFill: '#f3e8ff',
        startStroke: '#a855f7',
        titleColor: '#7e22ce',
        boxFill: '#ffffff',
        boxStroke: '#d8b4fe',
        boxShadow: '#f3e8ff',
        primaryText: '#7e22ce',
        secondaryText: '#a855f7',
        arrowColor: '#c084fc'
      },
      dark: {
        background: '#1e293b',
        startFill: '#334155',
        startStroke: '#94a3b8',
        titleColor: '#f1f5f9',
        boxFill: '#334155',
        boxStroke: '#64748b',
        boxShadow: '#0f172a',
        primaryText: '#f1f5f9',
        secondaryText: '#cbd5e1',
        arrowColor: '#94a3b8'
      }
    };
    
    return themes[theme] || themes.blue;
  };

  const generateSVG = (workflowData) => {
    const tasks = workflowData.tasks || [];
    const width = 480;
    const height = (tasks.length + 1) * 120 + 50; // +1 for start node, 120px spacing
    
    const colors = getThemeColors();
    const taskWidth = 240;
    const taskHeight = 70;
    const startRadius = 30;
    const arrowLength = 30;
    const cornerRadius = 8;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Background
    svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="${colors.background}" rx="10" />`;
    
    // Add title
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="${colors.titleColor}">${workflowData.name || 'Workflow Diagram'}</text>`;
    
    // Start node with drop shadow
    svg += `<defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#00000022" />
      </filter>
    </defs>`;
    
    // Start node
    svg += `<circle cx="${width/2}" cy="80" r="${startRadius}" fill="${colors.startFill}" stroke="${colors.startStroke}" stroke-width="2" filter="url(#shadow)"/>`;
    svg += `<text x="${width/2}" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="${colors.primaryText}" font-weight="500">start</text>`;
    
    // Arrow from start to first task
    svg += `<defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${colors.arrowColor}" />
      </marker>
    </defs>`;
    
    svg += `<line x1="${width/2}" y1="${80 + startRadius}" x2="${width/2}" y2="${140 - 10}" stroke="${colors.arrowColor}" stroke-width="2" marker-end="url(#arrowhead)" />`;
    
    // Tasks
    tasks.forEach((task, index) => {
      const y = 140 + index * 120;
      
      // Task box with shadow and gradient
      svg += `<defs>
        <linearGradient id="boxGradient${index}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${colors.boxFill}" />
          <stop offset="100%" stop-color="${colors.boxShadow}" stop-opacity="0.1" />
        </linearGradient>
      </defs>`;
      
      svg += `<rect x="${width/2 - taskWidth/2}" y="${y}" width="${taskWidth}" height="${taskHeight}" rx="${cornerRadius}" 
              fill="url(#boxGradient${index})" stroke="${colors.boxStroke}" stroke-width="2" filter="url(#shadow)"/>`;
      
      // Task reference name (displayed name)
      svg += `<text x="${width/2}" y="${y + 30}" text-anchor="middle" font-family="Arial" font-size="15" fill="${colors.primaryText}" font-weight="500">${task.taskReferenceName}</text>`;
      
      // Task full name
      svg += `<text x="${width/2}" y="${y + 50}" text-anchor="middle" font-family="Arial" font-size="12" fill="${colors.secondaryText}">(${task.name})</text>`;
      
      // Arrow to next task (if not last)
      if (index < tasks.length - 1) {
        svg += `<line x1="${width/2}" y1="${y + taskHeight}" x2="${width/2}" y2="${y + 120 - 10}" 
                stroke="${colors.arrowColor}" stroke-width="2" marker-end="url(#arrowhead)" />`;
      }
    });
    
    svg += '</svg>';
    setSvgString(svg);
  };
  
  const downloadSVG = () => {
    if (!svgString) return;
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow?.name || 'workflow'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Workflow JSON to SVG Visualizer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Workflow JSON:</label>
          <textarea 
            className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your workflow JSON here..."
          />
          
          <div className="mt-6">
            <label className="mb-2 font-medium text-gray-700 block">Theme:</label>
            <div className="flex gap-3 mb-4">
              <button 
                onClick={() => setTheme('blue')} 
                className={`w-6 h-6 rounded-full ${theme === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: '#3b82f6' }}
              ></button>
              <button 
                onClick={() => setTheme('green')} 
                className={`w-6 h-6 rounded-full ${theme === 'green' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}
                style={{ backgroundColor: '#22c55e' }}
              ></button>
              <button 
                onClick={() => setTheme('purple')} 
                className={`w-6 h-6 rounded-full ${theme === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                style={{ backgroundColor: '#a855f7' }}
              ></button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                style={{ backgroundColor: '#1e293b' }}
              ></button>
            </div>
          </div>
          
          <div className="mt-2 flex gap-3">
            <button 
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium transition-all"
              onClick={parseAndVisualize}
            >
              Generate Diagram
            </button>
            <button 
              className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium transition-all disabled:opacity-50 disabled:shadow-none"
              onClick={downloadSVG}
              disabled={!svgString}
            >
              Download SVG
            </button>
          </div>
          {error && <div className="mt-3 text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
        </div>
        
        <div className="flex flex-col">
          <label className="mb-2 font-medium text-gray-700">Workflow Diagram:</label>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 h-96 overflow-auto flex items-center justify-center shadow-inner">
            {svgString ? (
              <div dangerouslySetInnerHTML={{ __html: svgString }} />
            ) : (
              <div className="text-gray-400 text-center">
                <div className="mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <p className="font-medium">No diagram generated yet</p>
                <p className="text-sm mt-1">Generate a diagram using the workflow JSON</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSVGWorkflowVisualizer;
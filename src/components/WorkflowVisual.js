import React, { useState, useEffect } from 'react';

function WorkflowVisualizer() {
  // State for the workflow and visualization
  const [workflow, setWorkflow] = useState({
    name: "Example Workflow",
    description: "A workflow visualization example",
    tasks: [
      {
        name: "wait_for_file_upload",
        taskReferenceName: "wait_for_upload",
        type: "SIMPLE"
      },
      {
        name: "generate_auth_token",
        taskReferenceName: "generate_auth",
        type: "SIMPLE"
      }
    ]
  });
  
  // State for the new task form
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskRef, setNewTaskRef] = useState("");
  const [newTaskType, setNewTaskType] = useState("SIMPLE");
  
  // State for visualization
  const [svgString, setSvgString] = useState("");
  const [theme, setTheme] = useState("blue");
  const [showJson, setShowJson] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Theme colors
  const themes = {
    blue: {
      background: "#f8fafc",
      startFill: "#dbeafe",
      startStroke: "#3b82f6",
      titleColor: "#1e40af",
      boxFill: "#ffffff",
      boxStroke: "#93c5fd",
      boxShadow: "#dbeafe",
      primaryText: "#1e40af",
      secondaryText: "#3b82f6",
      arrowColor: "#60a5fa"
    },
    green: {
      background: "#f0fdf4",
      startFill: "#dcfce7",
      startStroke: "#22c55e",
      titleColor: "#166534",
      boxFill: "#ffffff",
      boxStroke: "#86efac",
      boxShadow: "#dcfce7",
      primaryText: "#166534",
      secondaryText: "#22c55e",
      arrowColor: "#4ade80"
    },
    purple: {
      background: "#faf5ff",
      startFill: "#f3e8ff",
      startStroke: "#a855f7",
      titleColor: "#7e22ce",
      boxFill: "#ffffff",
      boxStroke: "#d8b4fe",
      boxShadow: "#f3e8ff",
      primaryText: "#7e22ce",
      secondaryText: "#a855f7",
      arrowColor: "#c084fc"
    },
    dark: {
      background: "#1e293b",
      startFill: "#334155",
      startStroke: "#94a3b8",
      titleColor: "#f1f5f9",
      boxFill: "#334155",
      boxStroke: "#64748b",
      boxShadow: "#0f172a",
      primaryText: "#f1f5f9",
      secondaryText: "#cbd5e1",
      arrowColor: "#94a3b8"
    }
  };
  
  // Generate SVG visualization
  function generateSVG() {
    const tasks = workflow.tasks || [];
    const width = 480;
    const height = (tasks.length + 1) * 120 + 50;
    
    const colors = themes[theme];
    const taskWidth = 240;
    const taskHeight = 70;
    const startRadius = 30;
    const cornerRadius = 8;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Background
    svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="${colors.background}" rx="10" />`;
    
    // Add title
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="${colors.titleColor}">${workflow.name || 'Workflow Diagram'}</text>`;
    
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
    
    if (tasks.length > 0) {
      svg += `<line x1="${width/2}" y1="${80 + startRadius}" x2="${width/2}" y2="${140 - 10}" stroke="${colors.arrowColor}" stroke-width="2" marker-end="url(#arrowhead)" />`;
    }
    
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
  }
  
  // Update SVG when workflow or theme changes
  useEffect(() => {
    generateSVG();
  }, [workflow, theme]);
  
  // Handle form submission to add a new task
  function handleAddTask(e) {
    e.preventDefault();
    
    if (!newTaskName || !newTaskRef) return;
    
    const newTask = {
      name: newTaskName,
      taskReferenceName: newTaskRef,
      type: newTaskType
    };
    
    setWorkflow({
      ...workflow,
      tasks: [...workflow.tasks, newTask]
    });
    
    // Clear form
    setNewTaskName("");
    setNewTaskRef("");
    setNewTaskType("SIMPLE");
  }
  
  // Handle name change and auto-generate reference name
  function handleNameChange(e) {
    const name = e.target.value;
    setNewTaskName(name);
    
    // Auto-generate reference name if empty
    if (!newTaskRef) {
      const refName = name.toLowerCase().replace(/\s+/g, '_');
      setNewTaskRef(refName);
    }
  }
  
  // Remove a task
  function removeTask(index) {
    const newTasks = [...workflow.tasks];
    newTasks.splice(index, 1);
    setWorkflow({
      ...workflow,
      tasks: newTasks
    });
  }
  
  // Move a task up
  function moveTaskUp(index) {
    if (index === 0) return;
    
    const newTasks = [...workflow.tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[index - 1];
    newTasks[index - 1] = temp;
    
    setWorkflow({
      ...workflow,
      tasks: newTasks
    });
  }
  
  // Move a task down
  function moveTaskDown(index) {
    if (index === workflow.tasks.length - 1) return;
    
    const newTasks = [...workflow.tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[index + 1];
    newTasks[index + 1] = temp;
    
    setWorkflow({
      ...workflow,
      tasks: newTasks
    });
  }
  
  // Update workflow name
  function handleWorkflowNameChange(e) {
    setWorkflow({
      ...workflow,
      name: e.target.value
    });
  }
  
  // Update workflow description
  function handleDescriptionChange(e) {
    setWorkflow({
      ...workflow,
      description: e.target.value
    });
  }
  
  // Download SVG
  function downloadSVG() {
    if (!svgString) return;
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name || 'workflow'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // Download JSON
  function downloadJSON() {
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name || 'workflow'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            color: '#333'
          }}>
            Workflow Builder & Visualizer
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button 
              onClick={() => setShowJson(!showJson)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showJson ? 'Hide JSON' : 'View JSON'}
            </button>
            
            <button 
              onClick={downloadJSON}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Download JSON
            </button>
            
            <button 
              onClick={downloadSVG}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Download SVG
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* JSON View (if toggled) */}
        {showJson && (
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              marginTop: 0,
              marginBottom: '16px'
            }}>Workflow JSON</h2>
            <pre style={{
              backgroundColor: '#f8f9fa',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px',
              border: '1px solid #e9ecef'
            }}>
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </div>
        )}
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          {/* Form Panel */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              borderBottom: '1px solid #e5e5e5',
              padding: '16px',
              backgroundColor: '#f8f9fa'
            }}>
              <h2 style={{
                fontSize: '18px',
                margin: 0
              }}>
                Workflow Configuration
              </h2>
            </div>
            
            <div style={{
              padding: '24px'
            }}>
              {/* Workflow Details */}
              <div style={{
                marginBottom: '16px'
              }}>
                <label 
                  htmlFor="workflowName"
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  Workflow Name
                </label>
                <input 
                  id="workflowName"
                  type="text"
                  value={workflow.name}
                  onChange={handleWorkflowNameChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{
                marginBottom: '24px'
              }}>
                <label 
                  htmlFor="workflowDescription"
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  Description
                </label>
                <input 
                  id="workflowDescription"
                  type="text"
                  value={workflow.description}
                  onChange={handleDescriptionChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              {/* Theme Selection */}
              <div style={{marginBottom: '24px'}}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  Visualization Theme
                </label>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button 
                    onClick={() => setTheme('blue')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      border: theme === 'blue' ? '3px solid #1e40af' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                    aria-label="Blue theme"
                  />
                  <button 
                    onClick={() => setTheme('green')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      border: theme === 'green' ? '3px solid #166534' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                    aria-label="Green theme"
                  />
                  <button 
                    onClick={() => setTheme('purple')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#a855f7',
                      border: theme === 'purple' ? '3px solid #7e22ce' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                    aria-label="Purple theme"
                  />
                  <button 
                    onClick={() => setTheme('dark')}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#1e293b',
                      border: theme === 'dark' ? '3px solid #94a3b8' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                    aria-label="Dark theme"
                  />
                </div>
              </div>
              
              {/* Task List */}
              <div>
                <h3 style={{
                  fontSize: '16px',
                  marginTop: '24px',
                  marginBottom: '12px'
                }}>
                  Tasks
                </h3>
                
                {workflow.tasks.length === 0 ? (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    No tasks added yet. Use the form below to add tasks.
                  </div>
                ) : (
                  <div>
                    {workflow.tasks.map((task, index) => (
                      <div 
                        key={index}
                        style={{
                          border: '1px solid #e5e5e5',
                          borderRadius: '4px',
                          padding: '12px',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <div>
                          <div style={{fontWeight: 'bold'}}>{task.name}</div>
                          <div style={{fontSize: '14px', color: '#6c757d'}}>
                            Ref: {task.taskReferenceName}
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            onClick={() => moveTaskUp(index)}
                            disabled={index === 0}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              opacity: index === 0 ? 0.5 : 1
                            }}
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button 
                            onClick={() => moveTaskDown(index)}
                            disabled={index === workflow.tasks.length - 1}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              opacity: index === workflow.tasks.length - 1 ? 0.5 : 1
                            }}
                            title="Move Down"
                          >
                            ↓
                          </button>
                          <button 
                            onClick={() => removeTask(index)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#dc3545'
                            }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add Task Form */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  marginTop: 0,
                  marginBottom: '16px'
                }}>
                  Add New Task
                </h3>
                
                <form onSubmit={handleAddTask}>
                  <div style={{marginBottom: '12px'}}>
                    <label 
                      htmlFor="taskName"
                      style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: 'bold'
                      }}
                    >
                      Task Name*
                    </label>
                    <input 
                      id="taskName"
                      type="text"
                      value={newTaskName}
                      onChange={handleNameChange}
                      required
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{marginBottom: '12px'}}>
                    <label 
                      htmlFor="taskRef"
                      style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: 'bold'
                      }}
                    >
                      Reference Name*
                    </label>
                    <input 
                      id="taskRef"
                      type="text"
                      value={newTaskRef}
                      onChange={(e) => setNewTaskRef(e.target.value)}
                      required
                      placeholder="Auto-generated from task name"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div style={{marginBottom: '16px'}}>
                    <label 
                      htmlFor="taskType"
                      style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontWeight: 'bold'
                      }}
                    >
                      Task Type
                    </label>
                    <select 
                      id="taskType"
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="SIMPLE">SIMPLE</option>
                      <option value="DECISION">DECISION</option>
                      <option value="HTTP">HTTP</option>
                      <option value="SUB_WORKFLOW">SUB_WORKFLOW</option>
                      <option value="EVENT">EVENT</option>
                      <option value="WAIT">WAIT</option>
                      <option value="LAMBDA">LAMBDA</option>
                    </select>
                  </div>
                  
                  <div style={{textAlign: 'right'}}>
                    <button 
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* Visualization Panel */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              borderBottom: '1px solid #e5e5e5',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '18px',
                margin: 0
              }}>
                Workflow Diagram
              </h2>
              
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6c757d',
                  fontSize: '24px'
                }}
              >
                {isFullscreen ? '↙' : '↗'}
              </button>
            </div>
            
            <div style={{
              padding: '16px',
              position: isFullscreen ? 'fixed' : 'static',
              top: isFullscreen ? '0' : 'auto',
              left: isFullscreen ? '0' : 'auto',
              right: isFullscreen ? '0' : 'auto',
              bottom: isFullscreen ? '0' : 'auto',
              zIndex: isFullscreen ? '9999' : 'auto',
              backgroundColor: isFullscreen ? '#fff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div 
                style={{
                  width: '100%',
                  height: isFullscreen ? '100vh' : '600px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e5e5e5'
                }}
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
              
              {isFullscreen && (
                <button 
                  onClick={() => setIsFullscreen(false)}
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: '#343a40',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{
        marginTop: '48px',
        padding: '24px 0',
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e5e5',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          Workflow Builder & Visualizer — Convert JSON workflow definitions to SVG diagrams
        </div>
      </footer>
    </div>
  );
}

export default WorkflowVisualizer;
import React from 'react';
import AgenticWorkflowModule from '../modules/workflow-builder/AgenticWorkflowModule';
import EnhancedSVGWorkflowVisualizer from '../components/WorkflowVisual';
import WorkflowVisualizer from '../components/WorkflowVisual';

const WorkflowBuilderView = () => {
  // Configuration for Flowise API

  // Callback when a workflow is saved
  const handleWorkflowSave = (workflow) => {
    console.log('Workflow saved:', workflow);
    // Add your custom logic here
  };

  // Callback when a workflow is executed
  const handleWorkflowExecute = (results) => {
    console.log('Workflow execution results:', results);
    // Add your custom logic here
  };

  return (
    // <div className="workflow-builder-view">
    //   <AgenticWorkflowModule
    //     config={workflowConfig}
    //     onWorkflowSave={handleWorkflowSave}
    //     onWorkflowExecute={handleWorkflowExecute}
    //   />
    // </div>
    <WorkflowVisualizer />
  );
};

export default WorkflowBuilderView;
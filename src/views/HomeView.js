import React from 'react';

const HomeView = () => {
  return (
    <div className="home-view">
      <div className="hero-section">
        <h1>Accelerate Insurance Transformation with Agentic Solutions</h1>
        <p className="hero-subtitle">Reimagine Commercial Insurance workflows with Artifi Agentic Integration Framework</p>
        
        <div className="cta-buttons">
          <button className="btn btn-primary">Get Started</button>
          <button className="btn btn-secondary">Schedule Demo</button>
        </div>
      </div>
      
      <div className="benefits-grid">
        <div className="benefit-card">
          <div className="benefit-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13H11V21H3V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 3H11V11H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 3H21V11H13V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 13H21V21H13V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Modular Architecture</h3>
          <p>Build insurance workflows from reusable AI-powered components that can be assembled, tested, and deployed individually.</p>
        </div>
        
        <div className="benefit-card">
          <div className="benefit-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Rapid Innovation</h3>
          <p>Accelerate development cycles by 70% with pre-built agents that automate routine tasks while seamlessly integrating with existing systems.</p>
        </div>
        
        <div className="benefit-card">
          <div className="benefit-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Enhanced Decision-Making</h3>
          <p>Leverage autonomous agents that extract insights from unstructured data, improving risk assessment accuracy by up to 35%.</p>
        </div>
        
        <div className="benefit-card">
          <div className="benefit-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L21 6M9 12H21M9 18H21M5 6C5 6.55228 4.55228 7 4 7C3.44772 7 3 6.55228 3 6C3 5.44772 3.44772 5 4 5C4.55228 5 5 5.44772 5 6ZM5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12ZM5 18C5 18.5523 4.55228 19 4 19C3.44772 19 3 18.5523 3 18C3 17.4477 3.44772 17 4 17C4.55228 17 5 17.4477 5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Process Optimization</h3>
          <p>Streamline submission intake, underwriting, and policy servicing with specialized agents that reduce processing time by 60%.</p>
        </div>
      </div>
      
      <div className="workflow-section">
        <h2>Reimagine Your Insurance Workflows</h2>
        <div className="workflow-diagram">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <h4>Submission Intake</h4>
            <p>Autonomous extraction of critical data from emails, PDFs, and forms with 97% accuracy</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <h4>Risk Analysis</h4>
            <p>AI-powered assessment of exposures and hazards with real-time external data enrichment</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <h4>Underwriting</h4>
            <p>Automated pricing recommendations based on historical data and current market conditions</p>
          </div>
          <div className="workflow-arrow">→</div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <h4>Policy Servicing</h4>
            <p>Proactive risk monitoring and endorsement processing with minimal human intervention</p>
          </div>
        </div>
      </div>
      
      <div className="case-study-section">
        <h2>Success Stories</h2>
        <div className="case-study-card">
          <div className="case-study-content">
            <h3>Global Commercial Insurer</h3>
            <p>"The Artifi Agentic Hub reduced our submission processing time from 48 hours to just 25 minutes while improving data accuracy by 42%. Our underwriters now focus on complex risk assessment rather than data entry."</p>
            <p className="case-study-metrics">
              <span className="metric">
                <strong>85%</strong>
                <span>Reduction in Processing Time</span>
              </span>
              <span className="metric">
                <strong>42%</strong>
                <span>Improved Data Accuracy</span>
              </span>
              <span className="metric">
                <strong>3.2x</strong>
                <span>Underwriter Productivity</span>
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2>Ready to Transform Your Insurance Operations?</h2>
        <p>Start building with our library of insurance-specific agents and tools designed for the unique challenges of commercial insurance.</p>
        <button className="btn btn-primary">Explore Projects</button>
      </div>
    </div>
  );
};

export default HomeView;
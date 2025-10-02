import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import InsightsList from './InsightsList';
import './Message.css';

function Message({ message }) {
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (message.type === 'user') {
    return (
      <div className="message user-message">
        <div className="message-content">
          <p>{message.content}</p>
        </div>
        <div className="user-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    );
  }

  const { insights, formulation, code, solution } = message.content;

  return (
    <div className="message assistant-message">
      <div className="assistant-avatar">α</div>
      <div className="message-content">
        {insights && insights.length > 0 && (
          <InsightsList insights={insights} />
        )}
        
        <section className="response-section">
          <div className="section-header">
            <h3>Mathematical Formulation</h3>
          </div>
          <div className="formulation-box">
            {typeof formulation === 'string' ? (
              <p className="variables">{formulation}</p>
            ) : (
              <>
                <div className="formulation-item">
                  <span className="label">Objective:</span>
                  <code className="formula">{formulation.objective}</code>
                </div>
                <div className="formulation-item">
                  <span className="label">Subject to:</span>
                  <div className="constraints">
                    {formulation.constraints.map((constraint, idx) => (
                      <code key={idx} className="constraint">{constraint}</code>
                    ))}
                  </div>
                </div>
                <div className="formulation-item">
                  <span className="label">Where:</span>
                  <p className="variables">{formulation.variables}</p>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="response-section">
          <div className="section-header">
            <h3>Python Code (Gurobi)</h3>
            <button 
              className="copy-btn"
              onClick={() => handleCopy(typeof code === 'string' ? code : '', 'code')}
            >
              {copiedSection === 'code' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.7'
            }}
          >
            {typeof code === 'string' ? code : ''}
          </SyntaxHighlighter>
        </section>

        <section className="response-section solution-section">
          <div className="section-header">
            <h3>Optimal Solution</h3>
            <span className="status-badge">{typeof solution === 'string' ? 'Complete' : solution.status}</span>
          </div>
          <div className="solution-content">
            {typeof solution === 'string' ? (
              <p className="solution-details">{solution}</p>
            ) : (
              <>
                <div className="solution-grid">
                  {Object.entries(solution.variables).map(([key, value]) => (
                    <div key={key} className="solution-item">
                      <span className="solution-label">{key}</span>
                      <span className="solution-value">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="objective-result">
                  <span className="objective-label">Maximum Profit</span>
                  <span className="objective-value">{solution.objective}</span>
                </div>
                <p className="solution-details">{solution.details}</p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Message;


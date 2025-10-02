import React, { useState } from 'react';
import './ProblemSelector.css';

function ProblemSelector({ problems, loading, onSelect }) {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelect({
        id: 'custom',
        title: 'Custom Problem',
        description: customInput.trim()
      });
    }
  };

  return (
    <div className="problem-selector">
      <div className="selector-header">
        <h1 className="selector-title">Welcome to AlphaOPT</h1>
        <p className="selector-subtitle">
          Describe your optimization problem in natural language, and we'll generate the mathematical formulation, 
          Python code, and optimal solution.
        </p>
      </div>

      <div className="selector-content">
        <div className="custom-input-section">
          <h2 className="section-title">Describe Your Problem</h2>
          <form onSubmit={handleCustomSubmit} className="custom-form">
            <textarea
              className="custom-textarea"
              placeholder="Type your optimization problem here... For example: 'I need to minimize the cost of shipping products from 3 warehouses to 5 stores...'"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              rows={6}
            />
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!customInput.trim()}
            >
              Solve Problem →
            </button>
          </form>
        </div>

        <div className="divider">
          <span className="divider-text">or choose a sample problem</span>
        </div>

        <div className="sample-problems">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Loading sample problems...
            </div>
          ) : problems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No sample problems available. Please check your API connection.
            </div>
          ) : (
            problems.map((problem) => (
              <div
                key={problem.id}
                className="problem-card"
                onClick={() => onSelect(problem)}
              >
                <div className="problem-header">
                  <h3 className="problem-title">{problem.title}</h3>
                  <span className="arrow">→</span>
                </div>
                <p className="problem-description">{problem.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemSelector;


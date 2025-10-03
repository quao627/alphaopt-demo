import React, { useState } from 'react';
import './InsightBox.css';

function InsightBox({ insight }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryColors = {
    domain: { 
      bg: 'linear-gradient(135deg, #fef4e4 0%, #fff9f0 100%)', 
      border: '#f5d19f', 
      text: '#c7923e',
      badgeBg: '#f5d19f'
    },
    formulation: { 
      bg: 'linear-gradient(135deg, #f0e8f8 0%, #f7f0fc 100%)', 
      border: '#c9b3e0', 
      text: '#8b6ba8',
      badgeBg: '#c9b3e0'
    },
    code: { 
      bg: 'linear-gradient(135deg, #e4f0f8 0%, #f0f7fc 100%)', 
      border: '#a8c9e0', 
      text: '#5a7a9b',
      badgeBg: '#a8c9e0'
    }
  };

  const colors = categoryColors[insight.category] || categoryColors.domain;

  return (
    <>
      <div 
        className="insight-box"
        style={{
          background: colors.bg,
          borderColor: colors.border
        }}
        onClick={() => setIsExpanded(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
        aria-label={`View insight: ${insight.taxonomy}`}
      >
        <div className="insight-box-header">
          <span 
            className="insight-category-badge"
            style={{
              backgroundColor: colors.badgeBg,
              color: 'white'
            }}
          >
            {insight.category}
          </span>
          <div className="insight-expand-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
        <div className="insight-box-content">
          <div className="insight-box-title" style={{ color: colors.text }}>
            {insight.taxonomy}
          </div>
          <div className="insight-box-condition">
            {insight.explanation}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div 
          className="insight-modal-overlay"
          onClick={() => setIsExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="insight-modal-title"
        >
          <div 
            className="insight-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ borderTopColor: colors.border }}
          >
            <button 
              className="insight-modal-close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close insight"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="insight-modal-header">
              <span 
                className="insight-modal-category"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderColor: colors.border
                }}
              >
                {insight.category}
              </span>
              <h3 id="insight-modal-title" className="insight-modal-title">
                {insight.taxonomy}
              </h3>
            </div>

            <div className="insight-modal-body">
              <div className="insight-modal-section">
                <h4>Condition</h4>
                <p>{insight.condition}</p>
              </div>

              <div className="insight-modal-section">
                <h4>Explanation</h4>
                <p>{insight.explanation}</p>
              </div>

              <div className="insight-modal-section">
                <h4>Example</h4>
                <code className="insight-modal-example">{insight.example}</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InsightBox;


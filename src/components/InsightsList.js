import React, { useRef } from 'react';
import InsightBox from './InsightBox';
import './InsightsList.css';

function InsightsList({ insights }) {
  const scrollContainerRef = useRef(null);

  if (!insights || insights.length === 0) {
    return null;
  }

  // Sort insights by category: domain first, then formulation, then code
  const categoryOrder = { domain: 1, formulation: 2, code: 3 };
  const sortedInsights = [...insights].sort((a, b) => {
    return (categoryOrder[a.category] || 999) - (categoryOrder[b.category] || 999);
  });

  // Handle wheel event to scroll horizontally
  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      // Prevent default vertical scroll
      e.preventDefault();
      // Scroll horizontally instead
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="insights-section">
      <h4 className="insights-header">Key Insights</h4>
      <div 
        className="insights-scroll-container"
        ref={scrollContainerRef}
        onWheel={handleWheel}
      >
        <div className="insights-list">
          {sortedInsights.map((insight, index) => (
            <InsightBox key={index} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default InsightsList;


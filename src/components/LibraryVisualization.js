import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import './LibraryVisualization.css';

const LibraryVisualization = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [data, setData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [totalInsights, setTotalInsights] = useState(0);

  useEffect(() => {
    // Load the library data
    fetch('/library_refine.json')
      .then(response => response.json())
      .then(rawData => {
        const hierarchyData = processData(rawData);
        setData(hierarchyData);
        setTotalInsights(rawData.length);
      })
      .catch(error => console.error('Error loading library data:', error));
  }, []);

  const processData = (rawData) => {
    // Build hierarchical structure from flat data
    const hierarchy = { name: "Insight Library", children: [] };
    const categoryMap = new Map();

    rawData.forEach(insight => {
      const taxonomy = insight.taxonomy;
      
      Object.keys(taxonomy).forEach(category => {
        // Level 1: Category (e.g., "General Formulation")
        if (!categoryMap.has(category)) {
          const categoryNode = { 
            name: category, 
            children: [],
            insights: []
          };
          categoryMap.set(category, categoryNode);
          hierarchy.children.push(categoryNode);
        }
        const categoryNode = categoryMap.get(category);
        categoryNode.insights.push(insight);

        Object.keys(taxonomy[category]).forEach(subcategory => {
          // Level 2: Subcategory (e.g., "Variable Definition")
          let subcategoryNode = categoryNode.children.find(c => c.name === subcategory);
          if (!subcategoryNode) {
            subcategoryNode = { 
              name: subcategory, 
              children: [],
              insights: []
            };
            categoryNode.children.push(subcategoryNode);
          }
          subcategoryNode.insights.push(insight);

          // Level 3: Specific insights (e.g., "Continuous vs. Discrete Confusion")
          const insights = taxonomy[category][subcategory];
          insights.forEach(insightName => {
            let insightNode = subcategoryNode.children.find(c => c.name === insightName);
            if (!insightNode) {
              insightNode = { 
                name: insightName,
                insights: []
              };
              subcategoryNode.children.push(insightNode);
            }
            insightNode.insights.push(insight);
          });
        });
      });
    });

    return hierarchy;
  };

  const showTooltip = useCallback((event, d) => {
    const tooltip = tooltipRef.current;
    const insightCount = d.data.insights ? d.data.insights.length : 0;
    const isLeafNode = !d.children && !d._children;
    
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY + 10 + 'px';
    
    let content = `<strong>${d.data.name}</strong><br/>`;
    if (insightCount > 0) {
      content += `<span style="color: #888;">Insights: ${insightCount}</span>`;
    }
    if (d.children || d._children) {
      content += `<br/><span style="color: #667eea; font-size: 12px;">Click to ${d.children ? 'collapse' : 'expand'}</span>`;
    } else if (isLeafNode) {
      content += `<br/><span style="color: #667eea; font-size: 12px;">Click to view details</span>`;
    }
    
    tooltip.innerHTML = content;
  }, []);

  const hideTooltip = useCallback(() => {
    tooltipRef.current.style.display = 'none';
  }, []);

  const drawVisualization = useCallback((data) => {
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 30, right: 200, bottom: 30, left: 200 };

    // Counter for node IDs
    let nodeIdCounter = 0;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("font", "14px sans-serif");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeWidth = width - margin.left - margin.right;
    const treeHeight = height - margin.top - margin.bottom;

    const tree = d3.tree()
      .size([treeHeight, treeWidth])
      .separation((a, b) => {
        // Reduce separation to fit nodes within bounds
        const baseSeparation = a.parent === b.parent ? 1.2 : 1.8;
        // Less separation for deeper nodes
        const depthMultiplier = Math.max(a.depth, b.depth) === 1 ? 1.2 : 1;
        return baseSeparation * depthMultiplier;
      });

    // Create hierarchical data
    const root = d3.hierarchy(data);
    
    // Calculate total insights for percentages
    const totalInsights = countInsights(data);
    
    // Collapse all children initially except first level
    root.children.forEach((child, i) => {
      child._children = child.children;
      child.children = null;
    });

    root.x0 = treeHeight / 2;
    root.y0 = 0;

    update(root);

    function update(source) {
      // Compute the new tree layout
      const treeData = tree(root);
      const nodes = treeData.descendants();
      const links = treeData.links();

      // Normalize for fixed-depth with increased spacing
      nodes.forEach(d => {
        d.y = d.depth * 280; // Increased from 250 to 280 for more horizontal space
      });

      // Update nodes
      const node = g.selectAll(".node")
        .data(nodes, d => d.id || (d.id = ++nodeIdCounter));

      // Enter new nodes
      const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on("click", click)
        .style("cursor", "pointer");

      // Add circles for nodes
      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", d => getNodeColor(d))
        .style("stroke", d => d3.rgb(getNodeColor(d)).darker(0.5))
        .style("stroke-width", "2px");

      // Add labels
      nodeEnter.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children || d._children ? -15 : 15)
        .attr("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => {
          const maxLength = 40;
          return d.data.name.length > maxLength ? 
            d.data.name.substring(0, maxLength) + "..." : 
            d.data.name;
        })
        .style("fill-opacity", 1e-6)
        .style("font-weight", d => d.depth === 0 ? "bold" : d.depth === 1 ? "600" : "normal")
        .style("font-size", d => d.depth === 0 ? "16px" : d.depth === 1 ? "14px" : "12px");

      // Add percentage labels for first level children
      nodeEnter.filter(d => d.depth === 1)
        .append("text")
        .attr("class", "percentage-label")
        .attr("dy", "-1.5em")
        .attr("x", -15)
        .attr("text-anchor", "end")
        .text(d => {
          const count = d.data.insights ? d.data.insights.length : 0;
          const percentage = ((count / totalInsights) * 100).toFixed(1);
          return `${percentage}%`;
        })
        .style("fill", "#666")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill-opacity", 1e-6);

      // Add insight count badges
      nodeEnter.filter(d => d.data.insights && d.data.insights.length > 0)
        .append("g")
        .attr("class", "badge")
        .each(function(d) {
          const badge = d3.select(this);
          const count = d.data.insights.length;
          const x = d.children || d._children ? -15 : 15;
          
          badge.append("circle")
            .attr("cx", x)
            .attr("cy", -12)
            .attr("r", 10)
            .style("fill", "#667eea")
            .style("opacity", 0);

          badge.append("text")
            .attr("x", x)
            .attr("y", -12)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(count)
            .style("fill", "white")
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .style("opacity", 0);
        });

      // Merge enter and update selections
      const nodeUpdate = nodeEnter.merge(node);

      // Transition nodes to their new position
      nodeUpdate.transition()
        .duration(750)
        .attr("transform", d => `translate(${d.y},${d.x})`);

      nodeUpdate.select("circle")
        .attr("r", d => d.depth === 0 ? 8 : d.depth === 1 ? 7 : 6)
        .style("fill", d => {
          if (d._children) return getNodeColor(d);
          if (d.children) return "#fff";
          return getNodeColor(d);
        })
        .style("stroke-width", d => d._children ? "3px" : "2px");

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      nodeUpdate.select(".percentage-label")
        .style("fill-opacity", 1);

      nodeUpdate.selectAll(".badge circle, .badge text")
        .transition()
        .duration(750)
        .style("opacity", d => d.children || d._children ? 0 : 1);

      // Transition exiting nodes
      const nodeExit = node.exit().transition()
        .duration(750)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select("circle")
        .attr("r", 1e-6);

      nodeExit.select("text")
        .style("fill-opacity", 1e-6);

      // Update links
      const link = g.selectAll(".link")
        .data(links, d => d.target.id);

      // Enter new links
      const linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        })
        .style("fill", "none")
        .style("stroke", "#ccc")
        .style("stroke-width", "2px");

      // Merge and transition links
      const linkUpdate = linkEnter.merge(link);

      linkUpdate.transition()
        .duration(750)
        .attr("d", d => diagonal(d.source, d.target));

      // Transition exiting links
      link.exit().transition()
        .duration(750)
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store old positions for transition
      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Add hover effects
      nodeUpdate
        .on("mouseover", function(event, d) {
          d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", d => (d.depth === 0 ? 8 : d.depth === 1 ? 7 : 6) * 1.3)
            .style("stroke-width", "3px");
          
          showTooltip(event, d);
        })
        .on("mouseout", function(event, d) {
          d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", d => d.depth === 0 ? 8 : d.depth === 1 ? 7 : 6)
            .style("stroke-width", d => d._children ? "3px" : "2px");
          
          hideTooltip();
        });
    }

    function click(event, d) {
      // Check if this is a leaf node (4th layer - no children at all)
      const isLeafNode = !d.children && !d._children;
      
      if (isLeafNode) {
        // Only show insight panel for leaf nodes
        if (d.data.insights && d.data.insights.length > 0) {
          setSelectedNode(d.data);
        }
      } else {
        // For non-leaf nodes (layers 1-3), just expand/collapse
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }

    function diagonal(s, d) {
      return `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`;
    }

    function getNodeColor(d) {
      const colors = {
        0: "#6366f1",
        1: "#f59e0b",
        2: "#10b981",
        3: "#8b5cf6"
      };
      
      // Get root category for consistent coloring
      let node = d;
      while (node.depth > 1 && node.parent) {
        node = node.parent;
      }
      
      if (node.depth === 1) {
        const categories = ["Domain Modeling", "General Formulation", "Code Implementation"];
        const index = categories.indexOf(node.data.name);
        if (index === 0) return "#ef4444"; // Modern red for Domain Modeling
        if (index === 1) return "#10b981"; // Modern green for General Formulation
        if (index === 2) return "#3b82f6"; // Modern blue for Code Implementation
      }
      
      return colors[d.depth] || "#9ca3af";
    }

    function countInsights(node) {
      if (node.insights) return node.insights.length;
      if (node.children) {
        return node.children.reduce((sum, child) => sum + countInsights(child), 0);
      }
      return 0;
    }
  }, [showTooltip, hideTooltip]);

  useEffect(() => {
    if (data && svgRef.current) {
      drawVisualization(data);
    }
  }, [data, drawVisualization]);

  const handleResetView = () => {
    if (data) {
      setSelectedNode(null);
      drawVisualization(data);
    }
  };

  return (
    <div className="library-visualization">
      <div className="library-header">
        <div className="header-content">
          <h1>Insight Library Taxonomy</h1>
          <p className="subtitle">Explore {totalInsights} insights across the optimization modeling taxonomy</p>
        </div>
        <div className="header-controls">
          <button className="reset-btn" onClick={handleResetView}>
            Reset View
          </button>
        </div>
      </div>
      
      <div className="visualization-container">
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef} className="tooltip"></div>
      </div>

      <div className="legend">
        <h4>Categories</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
            <span>Domain Modeling</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
            <span>General Formulation</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
            <span>Code Implementation</span>
          </div>
        </div>
      </div>

      {selectedNode && selectedNode.insights && (
        <div className="insight-details-panel">
          <div className="insight-panel-overlay" onClick={() => setSelectedNode(null)} />
          <div className="insight-panel-content">
            <div className="insight-details-header">
              <h3>{selectedNode.name}</h3>
              <button className="close-btn" onClick={() => setSelectedNode(null)}>×</button>
            </div>
            <div className="insights-count">
              {selectedNode.insights.length} insight(s)
            </div>
            <div className="insights-list">
              {selectedNode.insights.map((insight, idx) => {
                // Determine category color based on insight taxonomy
                const getCategoryColor = (insight) => {
                  if (!insight.taxonomy) return '#6366f1';
                  const categories = Object.keys(insight.taxonomy);
                  if (categories.includes('Domain Modeling')) return '#ef4444';
                  if (categories.includes('General Formulation')) return '#10b981';
                  if (categories.includes('Code Implementation')) return '#3b82f6';
                  return '#6366f1';
                };
                
                const categoryColor = getCategoryColor(insight);
                
                return (
                  <div key={idx} className="insight-card" style={{ borderLeftColor: categoryColor }}>
                    <div className="insight-header">
                      <span className="insight-id" style={{ color: categoryColor }}>Insight #{insight.insight_id}</span>
                      <span className="insight-task">Task: {insight.task_id}</span>
                    </div>
                    <div className="insight-explanation">{insight.explanation}</div>
                    {insight.condition && (
                      <div className="insight-condition">
                        <strong>Condition:</strong> {insight.condition}
                      </div>
                    )}
                    {insight.example && (
                      <details className="insight-example-details">
                        <summary style={{ color: categoryColor }}>View Example</summary>
                        <pre className="insight-example">{insight.example}</pre>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryVisualization;

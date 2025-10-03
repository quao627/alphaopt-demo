import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { MathJaxContext, MathJax } from 'better-react-mathjax';
import InsightsList from './InsightsList';
import './Message.css';

const config = {
  loader: { load: ['[tex]/ams'] },
  tex: {
    packages: { '[+]': ['ams'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true
  }
};

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

  const { insights, formulation, code, solution, source } = message.content;

  const renderLatexBlock = (text, className = 'variables') => {
    if (!text) return null;
    const stripMathComments = (s) => s.replace(/\s+#.*$/gm, '');
    const cleaned = stripMathComments(text).replace(/#/g, '\\#');
    const hasDelimiters = /\\\[|\\\]|\\\(|\\\)|\$\$|\$|\\begin\{|\\end\{/.test(cleaned);
    const body = cleaned.replace(/\n/g, ' \\\\ ');
    const wrapped = hasDelimiters ? body : `\\[ ${body} \\]`;
    return (
      <MathJax dynamic>
        <div className={className}>{wrapped}</div>
      </MathJax>
    );
  };

  const isMathyLine = (text) => {
    if (!text) return false;
    const mathTokens = /[≤≥=∑∀∈×]|\\bminimize\\b|\\bmaximize\\b|\\bsubject to\\b|\\bx\[|\\bc\[|\\bu\[|\\|N\\|/i;
    return mathTokens.test(text);
  };

  const toLatex = (text) => {
    if (!text) return '';
    let t = text;
    // Replace Unicode math symbols with LaTeX
    t = t.replace(/≤/g, ' \\le ')
         .replace(/≥/g, ' \\ge ')
         .replace(/∑/g, ' \\sum ')
         .replace(/∀/g, ' \\forall ')
         .replace(/∈/g, ' \\in ')
         .replace(/ℝ/g, ' \\mathbb{R} ')
         .replace(/ℤ/g, ' \\mathbb{Z} ')
         .replace(/×/g, ' \\cdot ');
    // Indices: var[i][j] -> var_{i,j}; var[i] -> var_{i}
    t = t.replace(/([A-Za-z]+)\[([^\]]+)\]\[([^\]]+)\]/g, '$1_{$2,$3}')
         .replace(/([A-Za-z]+)\[([^\]]+)\]/g, '$1_{$2}');
    // Use \cdot for asterisks in math
    t = t.replace(/\s\*\s/g, ' \\cdot ');
    return t;
  };

  const hasUnbalancedDelimiters = (text) => {
    if (!text) return false;
    const t = text;
    const doubleDollar = (t.match(/\$\$/g) || []).length;
    if (doubleDollar % 2 !== 0) return true;
    const tNoDD = t.replace(/\$\$[\s\S]*?\$\$/g, '');
    let singles = 0;
    for (let i = 0; i < tNoDD.length; i++) {
      if (tNoDD[i] === '$') {
        const escaped = i > 0 && tNoDD[i - 1] === '\\';
        if (!escaped) singles++;
      }
    }
    if (singles % 2 !== 0) return true;
    const lbr = (t.match(/\\\[/g) || []).length;
    const rbr = (t.match(/\\\]/g) || []).length;
    if (lbr !== rbr) return true;
    const lp = (t.match(/\\\(/g) || []).length;
    const rp = (t.match(/\\\)/g) || []).length;
    if (lp !== rp) return true;
    const begins = (t.match(/\\begin\{[^}]+\}/g) || []).length;
    const ends = (t.match(/\\end\{[^}]+\}/g) || []).length;
    if (begins !== ends) return true;
    return false;
  };

  const hasUnbalancedBraces = (text) => {
    if (!text) return false;
    let balance = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '{') balance++;
      if (ch === '}') balance--;
      if (balance < 0) return true;
    }
    return balance !== 0;
  };

  const shouldFallbackToPlain = (text, strict = false) => {
    if (!text) return false;
    if (strict) {
      return hasUnbalancedDelimiters(text) || hasUnbalancedBraces(text);
    }
    return hasUnbalancedDelimiters(text);
  };

  const renderFormulationString = (text) => {
    if (!text) return null;
    const lines = text.split(/\n/);
    return (
      <div className="variables">
        {lines.map((line, idx) => {
          if (line.trim().length === 0) {
            return <div key={idx} style={{ height: '0.6rem' }} />;
          }
          // Split off trailing inline comment after whitespace then '#'
          const match = line.match(/^(.*?)(?:\s+#\s*(.*))?$/);
          const mathPart = match ? match[1] : line;
          const commentPart = match && match[2] ? match[2] : '';

          if (isMathyLine(mathPart)) {
            const latex = toLatex(mathPart).replace(/#/g, '\\#');
            return (
              <div key={idx} className="constraint">
                <MathJax dynamic>{`\\[ ${latex} \\]`}</MathJax>
                {commentPart ? <span style={{ marginLeft: '0.5rem', color: '#666' }}># {commentPart}</span> : null}
              </div>
            );
          }

          // Non-math line: render as plain text (Markdown headings allowed)
          return (
            <div key={idx} className="variables">
              <ReactMarkdown>{line}</ReactMarkdown>
            </div>
          );
        })}
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="section-loading">
      <div className="loading-spinner"></div>
      <span>Generating...</span>
    </div>
  );

  return (
    <MathJaxContext config={config}>
      <div className="message assistant-message">
        <div className="assistant-avatar">α</div>
        <div className="message-content">
          {/* Insights Section */}
          <section className="response-section">
            <div className="section-header">
              <h3>Insights</h3>
            </div>
            {insights === null ? (
              <LoadingSpinner />
            ) : insights && insights.length > 0 ? (
              <InsightsList insights={insights} />
            ) : null}
          </section>
          
          {/* Mathematical Formulation Section */}
          <section className="response-section">
            <div className="section-header">
              <h3>Mathematical Formulation</h3>
            </div>
            {formulation === null ? (
              <LoadingSpinner />
            ) : formulation ? (
              <div className="formulation-box">
                {typeof formulation === 'string' ? (
                  source !== 'default'
                    ? <div className="variables">{formulation}</div>
                    : (shouldFallbackToPlain(formulation, false)
                        ? <div className="variables">{formulation}</div>
                        : renderFormulationString(formulation))
                ) : (
                  <>
                    <div className="formulation-item">
                      <span className="label">Objective:</span>
                      {source !== 'default'
                        ? <div className="formula">{formulation.objective}</div>
                        : (shouldFallbackToPlain(formulation.objective, false)
                            ? <div className="formula">{formulation.objective}</div>
                            : renderLatexBlock(formulation.objective, 'formula'))}
                    </div>
                    <div className="formulation-item">
                      <span className="label">Subject to:</span>
                      <div className="constraints">
                        {formulation.constraints.map((constraint, idx) => (
                          <React.Fragment key={idx}>
                            {source !== 'default'
                              ? <div className="constraint">{constraint}</div>
                              : (shouldFallbackToPlain(constraint, false)
                                  ? <div className="constraint">{constraint}</div>
                                  : renderLatexBlock(constraint, 'constraint'))}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="formulation-item">
                      <span className="label">Where:</span>
                      {source !== 'default'
                        ? <div className="variables">{formulation.variables}</div>
                        : (shouldFallbackToPlain(formulation.variables, false)
                            ? <div className="variables">{formulation.variables}</div>
                            : renderLatexBlock(formulation.variables, 'variables'))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </section>

        {/* Code Section */}
        <section className="response-section">
          <div className="section-header">
            <h3>Python Code (Gurobi)</h3>
            {code && (
              <button 
                className="copy-btn"
                onClick={() => handleCopy(typeof code === 'string' ? code : '', 'code')}
              >
                {copiedSection === 'code' ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
          {code === null ? (
            <LoadingSpinner />
          ) : code ? (
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
          ) : null}
        </section>

        {/* Solution Section */}
        <section className="response-section solution-section">
          <div className="section-header">
            <h3>Optimal Solution</h3>
            {/* {solution && <span className="status-badge">{typeof solution === 'string' ? 'Complete' : solution.status}</span>} */}
          </div>
          {solution === null ? (
            <LoadingSpinner />
          ) : solution ? (
            <div className="solution-content">
              {typeof solution === 'string' ? (
                <div className="solution-details">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {solution}
                  </ReactMarkdown>
                </div>
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
                    <span className="objective-label">Objective Value</span>
                    <span className="objective-value">{solution.objective}</span>
                  </div>
                  <p className="solution-details">{solution.details}</p>
                </>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
    </MathJaxContext>
  );
}

export default Message;


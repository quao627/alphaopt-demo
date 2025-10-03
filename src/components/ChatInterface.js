import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import './ChatInterface.css';

// Use environment variable if set, otherwise use localhost:5000 for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://4d61dc14.cpolar.io';

function ChatInterface({ initialProblem }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [originalQuestion, setOriginalQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const initialMessageSent = useRef(false);

  // Auto-scroll removed - users can manually scroll to view content
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
    if (initialProblem && !initialMessageSent.current) {
      initialMessageSent.current = true;
      handleSendMessage(initialProblem.description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProblem]);

  // Transform taxonomy from nested object to readable string
  const transformTaxonomy = (taxonomy) => {
    if (typeof taxonomy === 'string') return taxonomy;
    
    // Flatten nested taxonomy structure to a readable path
    const flattenTaxonomy = (obj, path = []) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return flattenTaxonomy(value, [...path, key]);
        } else if (Array.isArray(value)) {
          return [...path, key, ...value].slice(1).join(' > ');
        }
      }
      return path.slice(1).join(' > ');
    };
    
    return flattenTaxonomy(taxonomy);
  };

  const loadDefaultAnswer = async (problemId, onProgress) => {
    try {
      const response = await fetch('/default_answers.json');
      const defaultAnswers = await response.json();
      
      const answer = defaultAnswers[problemId.toString()];
      if (!answer) {
        throw new Error('No default answer found for this problem');
      }

      const result = {
        insights: null,
        formulation: null,
        code: null,
        solution: null,
        source: 'default'
      };

      // Step 1: Show insights after 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Transform insights to match frontend format (same as API transformation)
      const transformedInsights = answer.insights.map(insight => ({
        ...insight,
        category: insight.category.toLowerCase(), // Convert to lowercase for color mapping
        taxonomy: transformTaxonomy(insight.taxonomy) // Flatten nested taxonomy to string
      }));
      result.insights = transformedInsights;
      onProgress({ ...result });

      // Step 2: Show formulation after another 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      result.formulation = answer.formulation;
      onProgress({ ...result });

      // Step 3: Show code after another 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      result.code = answer.code;
      onProgress({ ...result });

      // Step 4: Show solution after another 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      result.solution = answer.solution;
      onProgress({ ...result });

      return result;
    } catch (error) {
      console.error('Error loading default answer:', error);
      throw error;
    }
  };

  const callSolverAPI = async (userMessage, onProgress, isRegenerate = false) => {
    try {
      const result = {
        insights: null,
        formulation: null,
        code: null,
        solution: null,
        source: 'api'
      };

      // Step 1: Get insights
      const insightsResponse = await fetch(`${API_BASE_URL}/api/solve/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: userMessage, regenerate: isRegenerate }),
      });

      if (!insightsResponse.ok) {
        throw new Error(`API error: ${insightsResponse.status}`);
      }

      const insightsData = await insightsResponse.json();
      
      // Transform insights to match frontend format
      const transformedInsights = insightsData.insights.map(insight => ({
        ...insight,
        category: insight.category.toLowerCase(), // Convert to lowercase for color mapping
        taxonomy: transformTaxonomy(insight.taxonomy) // Flatten nested taxonomy to string
      }));
      
      result.insights = transformedInsights;
      onProgress({ ...result });

      // Step 2: Get formulation
      const formulationResponse = await fetch(`${API_BASE_URL}/api/solve/formulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: userMessage, regenerate: isRegenerate }),
      });

      if (!formulationResponse.ok) {
        throw new Error(`API error: ${formulationResponse.status}`);
      }

      const formulationData = await formulationResponse.json();
      result.formulation = formulationData.formulation;
      onProgress({ ...result });

      // Step 3: Get code
      const codeResponse = await fetch(`${API_BASE_URL}/api/solve/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: userMessage, regenerate: isRegenerate }),
      });

      if (!codeResponse.ok) {
        throw new Error(`API error: ${codeResponse.status}`);
      }

      const codeData = await codeResponse.json();
      result.code = codeData.code;
      onProgress({ ...result });

      // Step 4: Get solution
      const solutionResponse = await fetch(`${API_BASE_URL}/api/solve/solution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: userMessage, regenerate: isRegenerate }),
      });

      if (!solutionResponse.ok) {
        throw new Error(`API error: ${solutionResponse.status}`);
      }

      const solutionData = await solutionResponse.json();
      result.solution = solutionData.solution;
      onProgress({ ...result });

      return result;
    } catch (error) {
      console.error('Error calling solver API:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    // Store the original question for regeneration
    setOriginalQuestion(textToSend);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create initial assistant message with loading state
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: {
        insights: null,
        formulation: null,
        code: null,
        solution: null
      },
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Check if this is the Salesman Routing problem (id: 1) and use default answer
      if (initialProblem && initialProblem.id === 1) {
        await loadDefaultAnswer(initialProblem.id, (progressData) => {
          // Update the assistant message with progressive data
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId
              ? { ...msg, content: progressData }
              : msg
          ));
        });
      } else {
        await callSolverAPI(textToSend, (progressData) => {
          // Update the assistant message with progressive data
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId
              ? { ...msg, content: progressData }
              : msg
          ));
        }, false);
      }
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: {
                insights: [],
                formulation: 'Error',
                code: '',
                solution: {
                  status: 'Error',
                  variables: {},
                  objective: '',
                  details: 'Failed to connect to the solver API. Please make sure the backend server is running.'
                }
              }
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Remove the last assistant message
    setMessages(prev => prev.slice(0, -1));
    setIsLoading(true);

    // Create initial assistant message with loading state
    const assistantMessageId = Date.now();
    const assistantMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: {
        insights: null,
        formulation: null,
        code: null,
        solution: null
      },
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Check if this is the Salesman Routing problem (id: 1) and use default answer
      if (initialProblem && initialProblem.id === 1) {
        await loadDefaultAnswer(initialProblem.id, (progressData) => {
          // Update the assistant message with progressive data
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId
              ? { ...msg, content: progressData }
              : msg
          ));
        });
      } else {
        await callSolverAPI(originalQuestion, (progressData) => {
          // Update the assistant message with progressive data
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId
              ? { ...msg, content: progressData }
              : msg
          ));
        }, true);
      }
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: {
                insights: [],
                formulation: 'Error',
                code: '',
                solution: {
                  status: 'Error',
                  variables: {},
                  objective: '',
                  details: 'Failed to connect to the solver API. Please make sure the backend server is running.'
                }
              }
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Check if answer has been generated (messages length >= 2 and not loading)
  const hasAnswer = messages.length >= 2 && !isLoading;
  const showInputForm = messages.length === 0;

  return (
    <div className="chat-interface" role="main" aria-label="Chat interface">
      <div className="messages-container" role="log" aria-live="polite" aria-atomic="false">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">💬</div>
            <p>Start by describing your optimization problem...</p>
          </div>
        )}
        
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {/* {isLoading && (
          <div className="loading-message" role="status" aria-label="Loading response">
            <div className="loading-avatar" aria-hidden="true">α</div>
            <div className="loading-content">
              <div className="loading-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loading-text">Analyzing problem and generating solution...</p>
            </div>
          </div>
        )} */}
        
        <div ref={messagesEndRef} />
      </div>

      {showInputForm && (
        <form onSubmit={handleSubmit} className="input-form" aria-label="Message input form">
          <div className="input-container">
            <textarea
              className="message-input"
              placeholder="Describe your optimization problem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              aria-label="Message input"
              aria-required="true"
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      )}

      {hasAnswer && (
        <div className="regenerate-container">
          <button 
            className="regenerate-btn"
            onClick={handleRegenerate}
            disabled={isLoading}
            aria-label="Regenerate response"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Regenerate Response
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;


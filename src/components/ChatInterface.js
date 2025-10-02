import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import './ChatInterface.css';

// Use environment variable if set, otherwise use localhost:5000 for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ChatInterface({ initialProblem }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [originalQuestion, setOriginalQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const initialMessageSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialProblem && !initialMessageSent.current) {
      initialMessageSent.current = true;
      handleSendMessage(initialProblem.description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProblem]);

  const callSolverAPI = async (userMessage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
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

    try {
      const response = await callSolverAPI(textToSend);
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
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
        },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Remove the last assistant message
    setMessages(prev => prev.slice(0, -1));
    setIsLoading(true);

    try {
      const response = await callSolverAPI(originalQuestion);
      
      const assistantMessage = {
        id: Date.now(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Show error message to user
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
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
        },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
        
        {isLoading && (
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
        )}
        
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


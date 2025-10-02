import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ProblemSelector from './components/ProblemSelector';
import LibraryVisualization from './components/LibraryVisualization';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'library'

  // Fetch problems from API on mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/problems`);
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
        // Fallback to empty array on error
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
  };

  const handleNewChat = () => {
    setSelectedProblem(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">α</span>
          <span className="logo-text">AlphaOPT</span>
        </div>
        
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'chat' ? 'active' : ''}`}
              onClick={() => setViewMode('chat')}
            >
              💬 Chat
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'library' ? 'active' : ''}`}
              onClick={() => setViewMode('library')}
            >
              📚 Library
            </button>
          </div>
          
          {selectedProblem && viewMode === 'chat' && (
            <button className="new-chat-btn" onClick={handleNewChat}>
              New Chat
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {viewMode === 'library' ? (
          <LibraryVisualization />
        ) : (
          !selectedProblem ? (
            <ProblemSelector 
              problems={problems}
              loading={loading}
              onSelect={handleSelectProblem}
            />
          ) : (
            <ChatInterface 
              initialProblem={selectedProblem}
              onNewChat={handleNewChat}
            />
          )
        )}
      </main>
    </div>
  );
}

export default App;


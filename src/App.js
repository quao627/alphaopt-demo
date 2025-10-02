import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ProblemSelector from './components/ProblemSelector';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

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
        {selectedProblem && (
          <button className="new-chat-btn" onClick={handleNewChat}>
            New Chat
          </button>
        )}
      </header>

      <main className="app-main">
        {!selectedProblem ? (
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
        )}
      </main>
    </div>
  );
}

export default App;


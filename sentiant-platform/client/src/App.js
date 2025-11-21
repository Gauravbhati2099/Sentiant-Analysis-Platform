import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import './App.css';

function App() {
  const [user, setUser] = useState(null); // To store user info
  const [videoURL, setVideoURL] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  // Function to handle successful login
  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      const { token, user } = res.data;
      localStorage.setItem('authToken', token); // Store our session token
      setUser(user); // Set user state
    } catch (err) {
      setError("Authentication failed. Please try again.");
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Function to submit video for analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/api/analyze`, 
        { videoURL },
        { headers: { 'Authorization': `Bearer ${token}` } } // Send session token
      );
      setResults(response.data);
    } catch (err) {
      const errorMessage = err.response ? err.response.data.error : 'Failed to connect to the server.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Comment Sentiment Analyzer</h1>
        {user ? (
          <button onClick={handleLogout} className="logout-button">Logout</button>
        ) : (
          <p>Please log in to continue</p>
        )}
      </header>
      <main>
        {!user ? (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => setError('Login Failed')}
          />
        ) : (
          <div>
            <h2>Welcome, {user.name}!</h2>
            <form onSubmit={handleSubmit} className="url-form">
              <input
                type="text"
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder="Enter YouTube Video URL"
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </form>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="results-container">
          {results.map((result, index) => (
            <div key={index} className="comment-card">
              <p className="comment-text">"{result.comment}"</p>
              <p className={`sentiment-text sentiment-${result.classification.toLowerCase()}`}>
                Sentiment: <strong>{result.classification}</strong>
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
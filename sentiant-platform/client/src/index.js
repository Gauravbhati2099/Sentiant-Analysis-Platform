import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="545609210352-84nlsq3ik9c84hn3m32sevl9jtc0mce3.apps.googleusercontent.com"> {/* <-- PASTE YOUR CLIENT ID HERE */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
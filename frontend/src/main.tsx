import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import router from './router'; // Import the configured router
import './index.css'; // Global styles

// Get the root element
const rootElement = document.getElementById('root');

if (rootElement) {
  // Create the root
  const root = ReactDOM.createRoot(rootElement);

  // Render the application
  root.render(
    <React.StrictMode>
      <AuthProvider> { /* AuthProvider wraps the entire application */ }
        <RouterProvider 
          router={router} 
          future={{
            v7_startTransition: true,
          }}
        /> { /* RouterProvider uses the configured router */ }
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}


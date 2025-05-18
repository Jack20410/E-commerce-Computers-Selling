import { createContext, useContext, useState, useEffect } from 'react';
import WebSocketService from '../services/websocket.service';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [reviews, setReviews] = useState({});
  const [connected, setConnected] = useState(false);

  // Initialize connection on mount
  useEffect(() => {
    // Try to connect with stored token
    const storedToken = localStorage.getItem('token') || '';
    if (storedToken) {
      WebSocketService.connect(storedToken);
    }
  }, []);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      WebSocketService.connect(token);
      const handleConnect = () => {
        console.log('WebSocket connected in context');
        setConnected(true);
      };
      
      // Add event listeners
      if (WebSocketService.socket) {
        WebSocketService.socket.on('connect', handleConnect);
        
        // Set connected if already connected
        if (WebSocketService.isConnected()) {
          setConnected(true);
        }
        
        return () => {
          WebSocketService.socket?.off('connect', handleConnect);
        };
      }
    }
  }, [isAuthenticated, token]);

  // Global handler for review updates from any product
  useEffect(() => {
    const handleReviewUpdate = (data) => {
      console.log('Received review update:', data);
      if (data.productId && data.review) {
        setReviews(prev => ({
          ...prev,
          [data.productId]: [...(prev[data.productId] || []), data.review]
        }));
      }
    };

    WebSocketService.subscribeToReviewUpdates(handleReviewUpdate);
    
    return () => {
      WebSocketService.unsubscribeFromReviewUpdates();
    };
  }, []);

  // Bind methods to ensure proper context
  const joinProductRoom = (productId) => {
    WebSocketService.joinProductRoom(productId);
  };

  const leaveProductRoom = (productId) => {
    WebSocketService.leaveProductRoom(productId);
  };

  const value = {
    connected,
    reviews,
    joinProductRoom,
    leaveProductRoom
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 
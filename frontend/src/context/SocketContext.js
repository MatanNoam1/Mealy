import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Socket.IO server is the backend origin (strip the trailing /api from the REST
// base URL). The socket connects once the user is logged in and announces its
// user id so the backend can target this user's room.
const SOCKET_URL = (process.env.REACT_APP_API_BASE || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return undefined;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('user:join', user.userId);
    });
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, user?.userId]);

  return (
    <SocketContext.Provider value={{ socket: socketRef, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Subscribe to a socket event for the lifetime of the calling component.
export function useSocketEvent(event, handler) {
  const ctx = useContext(SocketContext);
  useEffect(() => {
    const socket = ctx?.socket?.current;
    if (!socket) return undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, ctx?.connected, event, handler]);
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
}

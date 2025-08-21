import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import authService from '../services/authService';
import { API_ENDPOINTS } from '../utils/constants';

export const useRealTime = (onOrderUpdate?: (data: any) => void, onNotification?: (data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    const userId = authService.getUserId();
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(API_ENDPOINTS.SOCKET_URL);

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join-room', userId);
    });

    socket.on('order-updated', (data) => {
      console.log('Order updated:', data);
      if (onOrderUpdate) {
        onOrderUpdate(data);
      }
    });

    socket.on('notification', (data) => {
      console.log('New notification:', data);
      if (onNotification) {
        onNotification(data);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [onOrderUpdate, onNotification]);

  const emitOrderStatusUpdate = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit('order-status-update', data);
    }
  };

  const emitNotification = (data: any) => {
    if (socketRef.current) {
      socketRef.current.emit('new-notification', data);
    }
  };

  return {
    emitOrderStatusUpdate,
    emitNotification
  };
};
import { useEffect, useCallback, useState } from 'react';
import { mockWebSocket } from '../api';
import { useMessageStore } from '../store';
import type { Message } from '../types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(mockWebSocket.connected);
  const { addMessage } = useMessageStore();

  const connect = useCallback(() => {
    mockWebSocket.connect();
    setIsConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    mockWebSocket.disconnect();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      addMessage(message);
    };

    const unsubscribe = mockWebSocket.onMessage(handleMessage);

    return () => {
      unsubscribe();
    };
  }, [addMessage]);

  return {
    isConnected,
    connect,
    disconnect
  };
}

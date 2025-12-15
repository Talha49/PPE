import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        if (!url) return;
        
        // Close existing
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(url);
        wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to", url);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
        } catch (e) {
            console.error("Parse error", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        // Attempt reconnect if not intentionally closed (component unmount)
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        // Squelch errors during development/reload to avoid console noise
        console.warn("WebSocket connection error (check backend running):", error);
        ws.close();
      };
    }, [url]);

    useEffect(() => {
        if (url) {
            connect();
        } else {
            // If URL is null, ensure we are disconnected
            if (wsRef.current) {
                wsRef.current.onclose = null; // Prevent reconnect
                wsRef.current.close();
                wsRef.current = null;
            }
            setIsConnected(false);
            clearTimeout(reconnectTimeoutRef.current);
        }

        return () => {
             if (wsRef.current) {
                 wsRef.current.onclose = null; // Prevent reconnect trigger on unmount
                 wsRef.current.close();
             }
             clearTimeout(reconnectTimeoutRef.current);
        };
    }, [connect, url]);

    const sendMessage = useCallback((msg) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    return { isConnected, lastMessage, sendMessage };
}

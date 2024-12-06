import React, { useState, useEffect, useRef } from 'react';

// Define types for our application
interface MousePosition {
  x: number;
  y: number;
}

interface RemoteMousePosition extends MousePosition {
  clientId: string;
}

const MouseTracker: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [remoteMousePositions, setRemoteMousePositions] = useState<{[key: string]: MousePosition}>({});

  // Establish WebSocket connection
  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'clientId':
          // Store the client's unique ID
          setClientId(data.clientId);
          break;
        
        case 'mouseMove':
          // Update remote mouse positions
          setRemoteMousePositions(prev => ({
            ...prev,
            [data.clientId]: { x: data.x, y: data.y }
          }));
          break;
        
        case 'clientDisconnect':
          // Remove disconnected client's mouse
          setRemoteMousePositions(prev => {
            const updated = {...prev};
            delete updated[data.clientId];
            return updated;
          });
          break;
      }
    };

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          clientId: clientId,
          x: e.clientX,
          y: e.clientY
        }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ws.close();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {Object.entries(remoteMousePositions).map(([id, pos]) => (
        <div 
          key={id}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'red',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
};

export default MouseTracker;
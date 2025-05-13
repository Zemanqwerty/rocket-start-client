import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5010');

const Rocket: React.FC = () => {
  const [squares, setSquares] = useState<Array<string>>(Array(5).fill('black'));

  useEffect(() => {
    socket.on('squareUpdate', (data: { index: number }) => {
      setSquares(prev => {
        const newSquares = [...prev];
        newSquares[data.index] = 'red';
        return newSquares;
      });
    });

    return () => {
      socket.off('squareUpdate');
    };
  }, []);

  return (
    <div className="rocket">
      {squares.map((color, index) => (
        <div
          key={index}
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: color,
            margin: '10px',
            display: 'inline-block'
          }}
        />
      ))}
    </div>
  );
};

export default Rocket;
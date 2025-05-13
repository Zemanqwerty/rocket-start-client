import React from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5010');

const Controller: React.FC = () => {
  const handleClick = (index: number) => {
    socket.emit('buttonClick', index);
  };

  return (
    <div className="controller">
      {[0, 1, 2, 3, 4].map((index) => (
        <button 
          key={index} 
          onClick={() => handleClick(index)}
          style={{ margin: '10px', padding: '15px 25px' }}
        >
          Button {index + 1}
        </button>
      ))}
    </div>
  );
};

export default Controller;
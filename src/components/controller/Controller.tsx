import React, { useState } from 'react';
import { WsConfig } from '../../Config/ws';
import styles from './Controller.module.css';

const socket = WsConfig.SOCKET;

const Controller: React.FC = () => {
  const [activeDots, setActiveDots] = useState<boolean[]>(Array(5).fill(false));

  const handleClick = (index: number) => {
    socket.emit('buttonClick', index);
    setActiveDots(prev => {
      const newDots = [...prev];
      newDots[index] = true;
      return newDots;
    });
  };

  return (
    <div className={styles.controllerContainer}>
      <div className={styles.dotsContainer}>
        {activeDots.map((isActive, index) => (
          <div 
            key={index}
            className={`${styles.dot} ${isActive ? styles.dotActive : ''}`}
          />
        ))}
      </div>
      
      <div className={styles.buttonsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <button 
            key={index} 
            onClick={() => handleClick(index)}
            className={styles.controlBtn}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Controller;
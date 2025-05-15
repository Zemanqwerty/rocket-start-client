import React, { useState, useEffect, useRef } from 'react';
import { WsConfig } from '../../Config/ws';
import styles from './Rocket.module.css';

const socket = WsConfig.SOCKET;

const Rocket: React.FC = () => {
  const [squares, setSquares] = useState<Array<string>>(Array(5).fill('black'));
  const [isLaunching, setIsLaunching] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const rocketRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (squares.every(color => color === 'red')) {
      setIsLaunching(true);
    }
  }, [squares]);

  useEffect(() => {
    const rocket = rocketRef.current;
    if (!rocket) return;

    const handleAnimationEnd = () => {
      setShowVideo(true);
      // Автозапуск видео после появления
      setTimeout(() => {
        videoRef.current?.play().catch(e => console.error("Video play failed:", e));
      }, 100);
    };

    if (isLaunching) {
      rocket.addEventListener('animationend', handleAnimationEnd);
    }

    return () => {
      rocket.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [isLaunching]);

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
    <div className={styles.area}>
      <div 
        ref={rocketRef}
        className={`${styles.rocket} ${isLaunching ? styles.launch : ''}`}
      >
        {squares.map((color, index) => (
          <div
            key={index}
            style={{ backgroundColor: color }}
            className={styles.rocketEngines}
          />
        ))}
      </div>
      
      {showVideo && (
        <div className={styles.videoOverlay}>
          <video
            ref={videoRef}
            className={styles.video}
            // loop
            muted // Без звука или пользователь должен взаимодействовать для воспроизведения
            playsInline
          >
            <source src="/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default Rocket;
import React, { useState, useEffect, useRef } from 'react';
import { WsConfig } from '../../Config/ws';
import styles from './Rocket.module.css';
import rocket from '../../images/image.png';
import fire from '../../images/fire4.png';
import background from '../../images/background.jpg';
import soundFirstEngine from '../../sounds/allTime.mp3';
import soundEngine from '../../sounds/onBtn.mp3';
import soundLaunch from '../../sounds/onRocketStart.mp3';

const socket = WsConfig.SOCKET;

const Rocket: React.FC = () => {
  const [squares, setSquares] = useState<Array<string>>(Array(5).fill('black'));
  const [isLaunching, setIsLaunching] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const rocketRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasFirstEngineStarted, setHasFirstEngineStarted] = useState(false);
  const firstEngineSoundRef = useRef<HTMLAudioElement>(null);
  const engineSoundRef = useRef<HTMLAudioElement>(null);
  const launchSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isLaunching) {
      // Останавливаем все звуки двигателей
      
    }
  }, [isLaunching]);

  useEffect(() => {
    socket.on('squareUpdate', (data: { index: number }) => {
      setSquares(prev => {
        const newSquares = [...prev];
        newSquares[data.index] = 'red';
        
        // Проверяем, есть ли хотя бы один активный двигатель
        const hasAnyEngineActive = newSquares.some(color => color === 'red');
        
        if (hasAnyEngineActive) {
          // Если это первый запуск двигателя
          if (!hasFirstEngineStarted && newSquares.filter(c => c === 'red').length === 1) {
            setHasFirstEngineStarted(true);
            firstEngineSoundRef.current?.play().catch(e => console.error("Audio play failed:", e));
          } 
          // Для всех последующих двигателей
          else {
            engineSoundRef.current?.play().catch(e => console.error("Engine sound failed:", e));
          }
        }
        
        return newSquares;
      });
    });

    return () => {
      socket.off('squareUpdate');
    };
  }, [hasFirstEngineStarted]);

  const areaStyles = {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  };

  const rocketStyles = {
    backgroundImage: `url(${rocket})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    height: '600px',
    width: '275px'
  };

  const getEngineStyle = (color: string, index: number) => {
    const isOdd = index % 2 === 0;
    const isActive = color === 'red';
    
    const baseStyle = {
      backgroundImage: `url(${fire})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '50px',
      height: '50px',
      display: 'inline-block',
      transformOrigin: 'center bottom',
      // Убрали transition из базового стиля
    };

    if (!isActive) {
      return {
        ...baseStyle,
        transform: 'translateY(0) scale(1)',
        transition: 'all 1.5s ease-out' // Плавное возвращение в исходное состояние
      };
    }

    return {
      ...baseStyle,
      // Начальное состояние теперь совпадает с анимацией
      transform: isOdd ? 'translateY(104px) scale(2)' : 'translateY(35px) scale(1)',
      transition: 'all 1.5s ease-out', // Плавное изменение к активному состоянию
      animation: `${isOdd ? styles.engineFire : styles.engineFireEven} 1s infinite alternate ease-in-out`,
      animationDelay: '1.5s' // Начинаем покачивание после завершения основного движения
    };
  };

  useEffect(() => {
    if (squares.every(color => color === 'red')) {
      const timer = setTimeout(() => {
        setIsLaunching(true);
      }, 16000);

      firstEngineSoundRef.current?.pause();
      engineSoundRef.current?.pause();
        
      // Запускаем звук взлета
      launchSoundRef.current?.play().catch(e => console.error("Launch sound failed:", e));
      
      return () => clearTimeout(timer);
    }
  }, [squares]);

  useEffect(() => {
    const rocket = rocketRef.current;
    if (!rocket) return;

    const handleAnimationEnd = () => {
      setShowVideo(true);
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
    <div className={styles.area} style={areaStyles}>
      <audio ref={firstEngineSoundRef} src={soundFirstEngine} preload="auto" loop/>
      <audio ref={engineSoundRef} src={soundEngine} preload="auto" />
      <audio ref={launchSoundRef} src={soundLaunch} preload="auto" />
      <div 
        ref={rocketRef}
        className={`${styles.rocketContainer} ${isLaunching ? styles.launch : ''}`}
      >
        <div className={styles.rocketImage} style={rocketStyles} />
        <div className={styles.enginesContainer}>
          {squares.map((color, index) => (
            <div
              key={index}
              style={getEngineStyle(color, index)}
              className={styles.rocketEngine}
            />
          ))}
        </div>
      </div>
      
      {showVideo && (
        <div className={styles.videoOverlay}>
          <video
            ref={videoRef}
            className={styles.video}
            muted
            playsInline
          >
            <source src="/video1.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default Rocket;
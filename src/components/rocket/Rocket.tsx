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
  const [hasFirstEngineStarted, setHasFirstEngineStarted] = useState(false);
  
  const rocketRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstEngineSoundRef = useRef<HTMLAudioElement>(null);
  const engineSoundRef = useRef<HTMLAudioElement>(null);
  const launchSoundRef = useRef<HTMLAudioElement>(null);
  const activeSounds = useRef<Set<HTMLAudioElement>>(new Set());

  const playSound = (soundUrl: string, loop = false) => {
    const audio = new Audio(soundUrl);
    audio.preload = 'auto';
    audio.loop = loop;
    
    audio.play()
      .then(() => {
        activeSounds.current.add(audio);
        audio.onended = () => activeSounds.current.delete(audio);
      })
      .catch(e => console.error("Audio play failed:", e));
  };

  const stopAllSounds = () => {
    activeSounds.current.forEach(audio => {
      const fadeAudio = setInterval(() => {
        if (audio.volume > 0.1) {
          audio.volume -= 0.1;
        } else {
          clearInterval(fadeAudio);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
        }
      }, 100);
    });
    activeSounds.current.clear();
  };

  useEffect(() => {
    if (squares.every(color => color === 'red')) {
      const timer = setTimeout(() => {
        setIsLaunching(true);
      }, 5000);

      stopAllSounds();
      playSound(soundLaunch);
      
      return () => clearTimeout(timer);
    }
  }, [squares]);

  useEffect(() => {
    const rocket = rocketRef.current;
    if (!rocket) return;

    const handleAnimationEnd = () => {
      stopAllSounds();
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
        
        const hasAnyEngineActive = newSquares.some(color => color === 'red');
        
        if (hasAnyEngineActive) {
          if (!hasFirstEngineStarted && newSquares.filter(c => c === 'red').length === 1) {
            setHasFirstEngineStarted(true);
            playSound(soundFirstEngine, true);
          } else {
            playSound(soundEngine);
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
    };

    if (!isActive) {
      return {
        ...baseStyle,
        transform: 'translateY(0) scale(1)',
        transition: 'all 1.5s ease-out'
      };
    }

    return {
      ...baseStyle,
      transform: isOdd ? 'translateY(104px) scale(2)' : 'translateY(35px) scale(1)',
      transition: 'all 1.5s ease-out',
      animation: `${isOdd ? styles.engineFire : styles.engineFireEven} 1s infinite alternate ease-in-out`,
      animationDelay: '1.5s'
    };
  };

  return (
    <div className={styles.area} style={areaStyles}>
      {/* Аудио элементы остаются для предзагрузки */}
      <audio ref={firstEngineSoundRef} src={soundFirstEngine} preload="auto" />
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
            playsInline
          >
            <source src="/video3.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default Rocket;
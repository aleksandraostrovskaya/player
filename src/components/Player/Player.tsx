import React, { useCallback, useState, useRef } from 'react';
import SoundDriver from './SoundDriver';

import styles from './Player.module.css';

function Player() {
  const soundController = useRef<SoundDriver | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadAudio = useCallback(async (audioFile: File | null) => {
    if (!audioFile || !audioFile.type.includes('audio')) {
      console.error('Wrong audio file');
      return;
    }

    setLoading(true);

    const soundInstance = new SoundDriver(audioFile);
    try {
      await soundInstance.init(document.getElementById('waveContainer'));
      soundController.current = soundInstance;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      soundInstance.drawChart();
    }
  }, []);

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      uploadAudio(file);
    },
    [uploadAudio]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0] || null;
      uploadAudio(file);
    },
    [uploadAudio]
  );

  const togglePlayer = useCallback(
    (type: string) => () => {
      if (type === 'play') {
        soundController.current?.play();
      } else if (type === 'stop') {
        soundController.current?.pause(true);
      } else {
        soundController.current?.pause();
      }
    },
    []
  );

  const onVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      soundController.current?.changeVolume(Number(event.target.value));
    },
    []
  );

  return (
    <div style={{ width: '100%' }}>
      {!soundController.current && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.active : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>
              {isDragging
                ? 'Drop the file here'
                : 'Drag and drop an audio file here or select'}
            </p>
            <input type='file' accept='audio/*' onChange={handleFileInput} />
          </div>
          <div className={styles.fileInputContainer}>
            <input
              type='file'
              name='sound'
              onChange={handleFileInput}
              accept='audio/*'
              className={styles.fileInput}
              id='fileUpload'
            />
            <label htmlFor='fileUpload' className={styles.fileLabel}>
              Choose audio file
            </label>
          </div>
        </div>
      )}
      {loading && <p className={styles.loadingText}>Loading...</p>}

      <div style={{ width: '100%', height: '392px' }} id='waveContainer' />

      {!loading && soundController.current && (
        <div className={styles.soundEditor}>
          <div className={styles.controllPanel}>
            <input
              type='range'
              onChange={onVolumeChange}
              defaultValue={1}
              min={-1}
              max={1}
              step={0.01}
              className={styles.volumeSlider}
            />

            <button
              type='button'
              className={styles.button}
              onClick={togglePlayer('play')}
            >
              Play
            </button>

            <button
              type='button'
              className={styles.button}
              onClick={togglePlayer('pause')}
            >
              Pause
            </button>

            <button
              type='button'
              className={styles.button}
              onClick={togglePlayer('stop')}
            >
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Player;

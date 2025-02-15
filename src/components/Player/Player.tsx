import React, { useCallback, useState, useRef } from 'react';
import SoundDriver from './SoundDriver';

function Player() {
  const soundController = useRef<undefined | SoundDriver>(undefined);
  const [loading, setLoading] = useState(false);

  const uploadAudio = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (!files || files.length === 0) {
        return;
      }

      setLoading(true);

      const audioFile = files[0];

      if (!audioFile || !audioFile.type.includes('audio')) {
        throw new Error('Wrong audio file');
      }

      const soundInstance = new SoundDriver(audioFile);
      try {
        await soundInstance.init(document.getElementById('waveContainer'));
        soundController.current = soundInstance;
      } catch (err: unknown) {
        console.log(err);
      } finally {
        setLoading(false);
        soundInstance.drawChart();
      }
    },
    []
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
    [soundController]
  );

  return (
    <div style={{ width: '100%' }}>
      {!soundController.current && (
        <div style={{ textAlign: 'center' }}>
          Choose a sound &nbsp;
          <input
            type='file'
            name='sound'
            onChange={uploadAudio}
            accept='audio/*'
          />
        </div>
      )}
      {loading && 'Loading...'}

      <div style={{ width: '100%', height: '392px' }} id='waveContainer' />

      {!loading && soundController.current && (
        <div id='soundEditor'>
          <div id='controllPanel'>
            <input
              type='range'
              onChange={onVolumeChange}
              defaultValue={1}
              min={-1}
              max={1}
              step={0.01}
            />

            <button type='button' onClick={togglePlayer('play')}>
              Play
            </button>

            <button type='button' onClick={togglePlayer('pause')}>
              Pause
            </button>

            <button type='button' onClick={togglePlayer('stop')}>
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Player;

import Drawer from './Drawer';

class SoundDriver {
  private readonly audiFile;

  private drawer?: Drawer;

  private context: AudioContext;

  private gainNode?: GainNode = undefined;

  private audioBuffer?: AudioBuffer = undefined;

  private bufferSource?: AudioBufferSourceNode = undefined;
  private startedAt = 0;

  private pausedAt = 0;

  private isRunning = false;

  constructor(audioFile: Blob) {
    this.audiFile = audioFile;
    this.context = new AudioContext();
  }

  static showError(error: string) {
    return error;
  }

  public init(parent: HTMLElement | null) {
    // загружает аудиофайл, декодирует звук и создаёт объект для его отображения (Drawer)
    return new Promise((resolve, reject) => {
      if (!parent) {
        reject(new Error('Parent element not found'));
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(this.audiFile);
      reader.onload = (event: ProgressEvent<FileReader>) =>
        this.loadSound(event).then(buffer => {
          this.audioBuffer = buffer;
          this.drawer = new Drawer(
            buffer,
            parent,
            this.getCurrentTime.bind(this),
            this.seekTo.bind(this)
          );
          resolve(undefined);
        });
      reader.onerror = reject;
    });
  }

  private loadSound(readerEvent: ProgressEvent<FileReader>) {
    // декодирует загруженный аудиофайл в формат, понятный браузеру
    if (!readerEvent?.target?.result) {
      throw new Error('Can not read file');
    }

    return this.context.decodeAudioData(
      readerEvent.target.result as ArrayBuffer
    );
  }

  public getCurrentTime() {
    if (!this.isRunning) {
      return this.pausedAt;
    }
    return this.context.currentTime - this.startedAt;
  }

  public seekTo(time: number) {
    if (!this.audioBuffer) {
      throw new Error('Audio buffer not uploaded');
    }

    if (time < 0 || time > this.audioBuffer.duration) {
      throw new Error('Incorrect time');
    }

    if (this.isRunning) {
      this.pause();
    }

    this.pausedAt = time;

    if (this.isRunning) {
      this.play();
    }
  }

  public async play() {
    // создаёт звуковой источник, подключает его к громкости (GainNode) и воспроизводит звук
    if (!this.audioBuffer) {
      throw new Error(
        'Play error. Audio buffer is not exists. Try to call loadSound before Play.'
      );
    }

    if (this.isRunning) {
      return;
    }

    this.gainNode = this.context.createGain();

    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;

    this.bufferSource.connect(this.gainNode);
    this.bufferSource.connect(this.context.destination);

    this.gainNode.connect(this.context.destination);

    await this.context.resume();
    this.bufferSource.start(0, this.pausedAt);

    this.startedAt = this.context.currentTime - this.pausedAt;
    this.pausedAt = 0;

    this.isRunning = true;
  }

  public async pause(reset?: boolean) {
    if (!this.bufferSource || !this.gainNode) {
      throw new Error(
        'Pause - bufferSource is not exists. Maybe you forgot to call Play before?'
      );
    }

    await this.context.suspend();

    this.pausedAt = reset ? 0 : this.context.currentTime - this.startedAt;
    this.bufferSource.stop(this.pausedAt);
    this.bufferSource.disconnect();
    this.gainNode.disconnect();

    this.isRunning = false;
  }

  public changeVolume(volume: number) {
    if (!this.gainNode) {
      return;
    }

    this.gainNode.gain.value = volume;
  }

  public drawChart() {
    this.drawer?.init();
  }
}

export default SoundDriver;

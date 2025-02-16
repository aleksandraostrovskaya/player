import Drawer from './Drawer';

class SoundDriver {
  private readonly audioFile;
  private drawer?: Drawer;

  private context: AudioContext;
  private gainNode?: GainNode;
  private audioBuffer?: AudioBuffer;
  private bufferSource?: AudioBufferSourceNode;
  private startedAt = 0;

  private pausedAt = 0;

  private isRunning = false;

  constructor(audioFile: Blob) {
    this.audioFile = audioFile;
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
      reader.readAsArrayBuffer(this.audioFile);
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
    return this.isRunning
      ? this.context.currentTime - this.startedAt
      : this.pausedAt;
  }

  public seekTo(time: number) {
    if (!this.audioBuffer) {
      throw new Error('Audio buffer not uploaded');
    }

    if (time < 0 || time > this.audioBuffer.duration) {
      throw new Error('Incorrect time');
    }

    const wasPlaying = this.isRunning;
    this.pausedAt = time;

    if (wasPlaying) {
      this.play(true);
    }
  }

  public async play(fromSeek = false) {
    if (!this.audioBuffer) {
      throw new Error(
        'Play error. Audio buffer does not exist. Try to call loadSound before Play.'
      );
    }

    if (this.isRunning && !fromSeek) {
      return;
    }

    this.stopBufferSource();

    this.gainNode = this.context.createGain();

    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;

    this.bufferSource.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    await this.context.resume();
    this.bufferSource.start(0, this.pausedAt);

    this.startedAt = this.context.currentTime - this.pausedAt;
    this.isRunning = true;
  }

  public async pause(reset?: boolean) {
    if (!this.bufferSource) {
      return;
    }

    this.pausedAt = reset ? 0 : this.getCurrentTime();
    this.stopBufferSource();
    this.isRunning = false;
  }

  private stopBufferSource() {
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.bufferSource = undefined;
    }
  }

  public changeVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  public drawChart() {
    this.drawer?.init();
  }
}

export default SoundDriver;

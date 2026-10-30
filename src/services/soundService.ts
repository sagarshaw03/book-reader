/**
 * Realistic Book Page Turning Sound Synthesizer via Web Audio API.
 * 100% offline, zero network requests, lightweight and authentic.
 */
class PageSoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved audio preference
    const saved = localStorage.getItem('folio_sound_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('folio_sound_muted', String(muted));
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Generates a realistic paper turning sound with subtle flutter & friction
   */
  public playPageTurn(isBackward: boolean = false) {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const duration = 0.28 + Math.random() * 0.06;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate shaped white noise
      let lastVal = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Soft brownian smoothing for fibrous texture
        lastVal = (lastVal + 0.03 * white) / 1.03;
        data[i] = (lastVal * 2.8 + white * 0.3) * 0.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter for paper frequency response (crisp page flutter around 1200 - 3200Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const baseFreq = isBackward ? 1400 : 1800;
      filter.frequency.setValueAtTime(baseFreq + (Math.random() * 200 - 100), ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800 + Math.random() * 300, ctx.currentTime + duration);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // Highpass to eliminate low-end rumble
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(450, ctx.currentTime);

      // Gain envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      // Quick attack
      gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.04);
      // Flutter crest
      gainNode.gain.setValueAtTime(0.14, ctx.currentTime + 0.12);
      // Decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      // Connect pipeline
      noiseSource.connect(filter);
      filter.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
    } catch {
      // Audio autoplay policy fallback or unsupported
    }
  }

  /**
   * Gentle bookmark ribbon chime or snap
   */
  public playBookmarkChime() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new PageSoundEngine();

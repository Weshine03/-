/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural audio synthesizer using Web Audio API for 100% reliable sound playback
class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: { stop: () => void }[] = [];
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSound(type: 'rain' | 'bell' | 'wind' | 'bird' | 'water_kettle' = 'rain', onEnd?: () => void) {
    this.stopSound();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;

    switch (type) {
      case 'bell':
        this.playBell(onEnd);
        break;
      case 'rain':
        this.playRain(onEnd);
        break;
      case 'wind':
        this.playWind(onEnd);
        break;
      case 'bird':
        this.playBird(onEnd);
        break;
      case 'water_kettle':
        this.playKettle(onEnd);
        break;
      default:
        this.playRain(onEnd);
    }
  }

  public stopSound() {
    this.currentSourceNodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {
        // ignore already stopped nodes
      }
    });
    this.currentSourceNodes = [];
    this.isPlaying = false;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  // Campus bell chime (pleasant, multi-harmonic acoustic chime)
  private playBell(onEnd?: () => void) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 4.5;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Do-Mi-Sol-Do chord)

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.4);

      // Attack and long natural decay
      gain.gain.setValueAtTime(0.001, now + idx * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.35 / (idx + 1), now + idx * 0.4 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.4 + 2.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.4);
      osc.stop(now + idx * 0.4 + 3.0);
      this.currentSourceNodes.push(osc);
    });

    setTimeout(() => {
      this.isPlaying = false;
      onEnd?.();
    }, (duration + 0.2) * 1000);
  }

  // Soothing rain sound (filtered pink noise + raindrop blips)
  private playRain(onEnd?: () => void) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 5; // 5 seconds loopable
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.07;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime + 4.5);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 5.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 5.2);
    this.currentSourceNodes.push(noise);

    // Add gentle random droplets
    for (let d = 0; d < 8; d++) {
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      const dropTime = this.ctx.currentTime + 0.3 + d * 0.6 + Math.random() * 0.3;

      dropOsc.type = 'sine';
      dropOsc.frequency.setValueAtTime(800 + Math.random() * 800, dropTime);
      dropOsc.frequency.exponentialRampToValueAtTime(250, dropTime + 0.08);

      dropGain.gain.setValueAtTime(0.001, dropTime);
      dropGain.gain.linearRampToValueAtTime(0.04, dropTime + 0.01);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.08);

      dropOsc.connect(dropGain);
      dropGain.connect(this.ctx.destination);

      dropOsc.start(dropTime);
      dropOsc.stop(dropTime + 0.1);
      this.currentSourceNodes.push(dropOsc);
    }

    setTimeout(() => {
      this.isPlaying = false;
      onEnd?.();
    }, 5200);
  }

  // Wind rustling through leaves
  private playWind(onEnd?: () => void) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 4.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 2.0);
    filter.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 4.0);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 1.0);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 4.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 4.6);
    this.currentSourceNodes.push(noise);

    setTimeout(() => {
      this.isPlaying = false;
      onEnd?.();
    }, 4600);
  }

  // Little bird chirping (cheerful sine frequency sweeps)
  private playBird(onEnd?: () => void) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chirps = [0.2, 0.45, 0.7, 1.4, 1.65, 2.3, 2.55, 2.8];

    chirps.forEach((t) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startT = now + t;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800 + Math.random() * 400, startT);
      osc.frequency.linearRampToValueAtTime(4200 + Math.random() * 600, startT + 0.07);
      osc.frequency.linearRampToValueAtTime(3200, startT + 0.14);

      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.linearRampToValueAtTime(0.12, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startT);
      osc.stop(startT + 0.16);
      this.currentSourceNodes.push(osc);
    });

    setTimeout(() => {
      this.isPlaying = false;
      onEnd?.();
    }, 3200);
  }

  // Water boiling kettle whistle
  private playKettle(onEnd?: () => void) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 1.5);
    osc.frequency.setValueAtTime(1180, now + 3.0);
    osc.frequency.linearRampToValueAtTime(700, now + 3.8);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 4.0);
    this.currentSourceNodes.push(osc);

    setTimeout(() => {
      this.isPlaying = false;
      onEnd?.();
    }, 4000);
  }
}

export const soundEngine = new AudioSynthesizer();

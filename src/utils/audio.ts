/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Offline Web Audio API sound synthesizer for Pomodoro notifications & ambient sounds
class SoundService {
  private audioCtx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a pleasant chime for timer completion
  playChime(type: 'complete' | 'break' | 'start' = 'complete'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes =
        type === 'complete'
          ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (celebratory chord)
          : type === 'break'
          ? [783.99, 659.25, 523.25] // Descending relaxing chord
          : [440, 554.37, 659.25]; // A4, C#5, E5 (focus start)

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.9);
      });
    } catch {
      // Audio playback fails silently if browser policy blocks autoplay before gesture
    }
  }

  // Synthesized ambient noise (white noise / pink noise / rain)
  startAmbient(type: 'rain' | 'white_noise' | 'stream' = 'rain'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.stopAmbient();

    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft pink/brown noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Rain simulation: low-pass pink noise with intermittent raindrop pulses
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else {
          lastOut = (lastOut + 0.05 * white) / 1.05;
          data[i] = lastOut * 2.5;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter for mellow sound
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.ambientSource = noise;
      this.ambientGain = gain;
    } catch {
      // Audio fallback
    }
  }

  stopAmbient(): void {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
      } catch {
        // Ignored
      }
      this.ambientSource = null;
    }
    this.ambientGain = null;
  }
}

export const soundService = new SoundService();

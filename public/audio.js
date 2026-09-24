// Advanced Web Audio API Procedural Sound Engine
class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.lastHitTime = 0;
    this.lastLockBeep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Deep, punchy, meaty WW2 autocannon sound (Tok, mechanical thud)
  playCannon(isSelf = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const pitchOffset = (Math.random() - 0.5) * 30;

    // 1. Heavy Muzzle Noise Crack & Breech Clack
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.10);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.025));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1100 + pitchOffset, t);
    noiseFilter.Q.setValueAtTime(1.8, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isSelf ? 0.45 : 0.22, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);

    // 2. Punchy Deep Sub-Bass Thump (The 'Tok' low-end body)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(240 + pitchOffset, t);
    subOsc.frequency.exponentialRampToValueAtTime(38, t + 0.11);

    subGain.gain.setValueAtTime(isSelf ? 0.70 : 0.32, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.13);

    // 3. 20mm Barrel Resonance Bark
    const barkOsc = this.ctx.createOscillator();
    const barkGain = this.ctx.createGain();
    barkOsc.type = 'triangle';
    barkOsc.frequency.setValueAtTime(140 + pitchOffset, t);
    barkOsc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

    barkGain.gain.setValueAtTime(isSelf ? 0.40 : 0.18, t);
    barkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    barkOsc.connect(barkGain);
    barkGain.connect(this.masterGain);
    barkOsc.start(t);
    barkOsc.stop(t + 0.10);
  }

  // Heavy rocket ignition whoosh
  playMissileLaunch(isSelf = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isSelf ? 0.45 : 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.32);

    oscGain.gain.setValueAtTime(isSelf ? 0.5 : 0.25, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.33);
  }

  // Classic WW2 Falling Bomb Screech / Whistle
  playBombWhistle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Drops from high screech down towards impact
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 1.25);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.3);
  }

  // Hit Marker Sound (Crisp metallic clink)
  playHitMarker(isHeavy = false) {
    if (!this.ctx) return;
    const now = Date.now();
    if (!isHeavy && now - this.lastHitTime < 40) return;
    this.lastHitTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isHeavy) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.18);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.06);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + (isHeavy ? 0.19 : 0.07));
  }

  playTakeDamage() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Earth-shaking heavy explosion with rumble & shockwave crunch
  playExplosion(isHeavy = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = isHeavy ? 1.2 : 0.45;

    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isHeavy ? 400 : 700, t);
    filter.frequency.exponentialRampToValueAtTime(25, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isHeavy ? 0.95 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);

    // Deep sub-bass thud for heavy bombs
    if (isHeavy) {
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(95, t);
      sub.frequency.exponentialRampToValueAtTime(25, t + 0.7);

      subGain.gain.setValueAtTime(0.85, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(t);
      sub.stop(t + 0.72);
    }
  }

  playLockBeep(isSolid = false) {
    if (!this.ctx) return;
    const now = Date.now();
    if (!isSolid && now - this.lastLockBeep < 180) return;
    this.lastLockBeep = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isSolid ? 1150 : 850, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isSolid ? 0.2 : 0.08));

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + (isSolid ? 0.21 : 0.09));
  }

  playLevelUp() {
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.19);
    });
  }
}

window.soundManager = new SoundManager();

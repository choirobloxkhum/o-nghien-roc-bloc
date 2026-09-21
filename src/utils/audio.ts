/**
 * Web Audio API synthesizer for Roblox-style sound effects
 * Requires no external audio files, always reliable and low-latency.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playUiClick(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio errors
  }
}

export function playHoverTick(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio errors
  }
}

export function playVictoryChime(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);

      gain.gain.setValueAtTime(0, now + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.22, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.45);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playSparkleSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [784, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.4);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playOofSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Ignore audio errors
  }
}

export function playBoingSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch {
    // Ignore audio errors
  }
}

// Running Footstep sound synthesizer & loop
let footstepInterval: number | null = null;
let footstepStepCount = 0;

export function playFootstep(isLeft = false, enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Cute anime / cartoon footstep pop (slightly different pitch per foot)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    const startFreq = isLeft ? 370 : 420;
    const endFreq = isLeft ? 150 : 180;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.065);

    // 2. Light crisp shoe patter on the surface
    const tapOsc = ctx.createOscillator();
    const tapGain = ctx.createGain();
    tapOsc.type = 'triangle';
    tapOsc.frequency.setValueAtTime(isLeft ? 840 : 980, now);
    tapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.025);

    tapGain.gain.setValueAtTime(0.09, now);
    tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    tapOsc.connect(tapGain);
    tapGain.connect(ctx.destination);

    tapOsc.start(now);
    tapOsc.stop(now + 0.035);
  } catch {
    // Ignore audio errors
  }
}

export function startRunningSoundLoop(enabled = true) {
  if (!enabled) return;
  stopRunningSoundLoop();

  // Trigger initial step
  footstepStepCount = 0;
  playFootstep(false, enabled);

  // Interval matches the Maruko3DRunner stride (0.34s loop => 0.17s per step)
  footstepInterval = window.setInterval(() => {
    footstepStepCount++;
    playFootstep(footstepStepCount % 2 === 0, enabled);
  }, 170);
}

export function stopRunningSoundLoop() {
  if (footstepInterval !== null) {
    clearInterval(footstepInterval);
    footstepInterval = null;
  }
}

// Creepy Horror Ambiance & Panic Heartbeat Loop State
let creepyAmbianceInterval: number | null = null;
let creepyDroneNodes: { stop: () => void }[] = [];

export function startCreepyHorrorAmbiance(enabled = true) {
  if (!enabled) return;
  stopCreepyHorrorAmbiance();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Deep Terrifying Low-Frequency Horror Drone with LFO sweep
    const droneOsc1 = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const droneFilter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();

    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(58.27, ctx.currentTime); // A#1 slight detuned dissonant minor second

    // LFO for creepy wavering pitch drone
    const droneLfo = ctx.createOscillator();
    const droneLfoGain = ctx.createGain();
    droneLfo.type = 'sine';
    droneLfo.frequency.setValueAtTime(0.3, ctx.currentTime);
    droneLfoGain.gain.setValueAtTime(3.5, ctx.currentTime);
    droneLfo.connect(droneOsc1.frequency);
    droneLfo.connect(droneOsc2.frequency);

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(240, ctx.currentTime);
    droneFilter.Q.setValueAtTime(4.0, ctx.currentTime);

    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.3);

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(ctx.destination);

    droneLfo.start(ctx.currentTime);
    droneOsc1.start(ctx.currentTime);
    droneOsc2.start(ctx.currentTime);

    // 2. Eerie High-Pitched Tinnitus / Ghost Whistle
    const highRingOsc = ctx.createOscillator();
    const highRingGain = ctx.createGain();
    highRingOsc.type = 'sine';
    highRingOsc.frequency.setValueAtTime(3700, ctx.currentTime);
    highRingGain.gain.setValueAtTime(0, ctx.currentTime);
    highRingGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.4);

    highRingOsc.connect(highRingGain);
    highRingGain.connect(ctx.destination);
    highRingOsc.start(ctx.currentTime);

    creepyDroneNodes = [
      {
        stop: () => {
          try {
            droneGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            highRingGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            setTimeout(() => {
              try {
                droneLfo.stop();
                droneOsc1.stop();
                droneOsc2.stop();
                highRingOsc.stop();
              } catch {}
            }, 200);
          } catch {}
        },
      },
    ];

    // 3. Realistic Panic Heartbeat loop ("LUB-DUB... LUB-DUB")
    const playHeartbeatDoubleThump = () => {
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1st Thump (LUB)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(75, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.12);

      gain1.gain.setValueAtTime(0.65, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // 2nd Thump (DUB - 120ms later)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(68, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(28, now + 0.26);

      gain2.gain.setValueAtTime(0.48, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.3);
    };

    playHeartbeatDoubleThump();
    creepyAmbianceInterval = window.setInterval(playHeartbeatDoubleThump, 520);
  } catch {}
}

export function stopCreepyHorrorAmbiance() {
  if (creepyAmbianceInterval !== null) {
    clearInterval(creepyAmbianceInterval);
    creepyAmbianceInterval = null;
  }
  creepyDroneNodes.forEach((node) => node.stop());
  creepyDroneNodes = [];
}

function makeDistortionCurve(amount = 30): Float32Array {
  const k = amount;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function playJumpscareSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 2.8;

    // Distortion Waveshaper node for guttural raspy demon scream texture
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(65) as unknown as Float32Array<ArrayBuffer>;
    distortion.oversample = '4x';

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.95, now);
    masterGain.gain.setValueAtTime(0.9, now + 1.4);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    distortion.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 1. SUB-BASS IMPACT THUD (Sudden heart-stopping shock slam)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(220, now);
    subOsc.frequency.exponentialRampToValueAtTime(24, now + 1.2);

    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.005, now + 1.3);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.4);

    // 2. TERRIFYING DEMONIC ROAR & VOCAL AGONY SCREAM
    const screamCarrier = ctx.createOscillator();
    screamCarrier.type = 'sawtooth';
    screamCarrier.frequency.setValueAtTime(1450, now);
    screamCarrier.frequency.linearRampToValueAtTime(1200, now + 0.6);
    screamCarrier.frequency.linearRampToValueAtTime(880, now + 1.4);
    screamCarrier.frequency.exponentialRampToValueAtTime(220, now + 2.5);

    // Tremolo/Vibrato modulator
    const screamMod = ctx.createOscillator();
    const screamModGain = ctx.createGain();
    screamMod.type = 'sawtooth';
    screamMod.frequency.setValueAtTime(52, now);
    screamMod.frequency.linearRampToValueAtTime(28, now + 2.0);
    screamModGain.gain.setValueAtTime(260, now);
    screamModGain.gain.linearRampToValueAtTime(90, now + 2.0);
    screamMod.connect(screamCarrier.frequency);

    const screamGain = ctx.createGain();
    screamGain.gain.setValueAtTime(0.9, now);
    screamGain.gain.setValueAtTime(0.85, now + 1.2);
    screamGain.gain.linearRampToValueAtTime(0.45, now + 2.0);
    screamGain.gain.exponentialRampToValueAtTime(0.005, now + 2.6);

    // Throat resonance formant filter
    const formantFilter = ctx.createBiquadFilter();
    formantFilter.type = 'bandpass';
    formantFilter.frequency.setValueAtTime(2100, now);
    formantFilter.frequency.linearRampToValueAtTime(1350, now + 1.2);
    formantFilter.frequency.exponentialRampToValueAtTime(580, now + 2.4);
    formantFilter.Q.setValueAtTime(3.8, now);

    screamCarrier.connect(formantFilter);
    formantFilter.connect(screamGain);
    screamGain.connect(distortion);

    screamMod.start(now);
    screamCarrier.start(now);
    screamMod.stop(now + 2.7);
    screamCarrier.stop(now + 2.7);

    // 3. PIERCING PSYCHO-STYLE METALLIC VIOLIN SCREECH
    const shriekOsc = ctx.createOscillator();
    const shriekGain = ctx.createGain();
    shriekOsc.type = 'sawtooth';
    shriekOsc.frequency.setValueAtTime(2350, now);
    shriekOsc.frequency.linearRampToValueAtTime(1850, now + 0.9);
    shriekOsc.frequency.exponentialRampToValueAtTime(380, now + 2.4);

    shriekGain.gain.setValueAtTime(0.75, now);
    shriekGain.gain.setValueAtTime(0.6, now + 1.2);
    shriekGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    shriekOsc.connect(shriekGain);
    shriekGain.connect(distortion);
    shriekOsc.start(now);
    shriekOsc.stop(now + 2.5);

    // 4. HAUNTING HORROR TRITONE (Devil's Chord Dissonance Stabs)
    [622.25, 659.25, 880.0, 932.33, 1244.51, 1318.51, 1760.0, 2489.02].forEach((freq, idx) => {
      const clusterOsc = ctx.createOscillator();
      const clusterGain = ctx.createGain();
      clusterOsc.type = 'sawtooth';
      clusterOsc.frequency.setValueAtTime(freq, now);
      clusterOsc.frequency.linearRampToValueAtTime(freq * 0.88, now + 1.4);
      clusterOsc.frequency.exponentialRampToValueAtTime(freq * 0.35, now + 2.3);

      clusterGain.gain.setValueAtTime(0.28, now);
      clusterGain.gain.setValueAtTime(0.2, now + 1.0);
      clusterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.1 + idx * 0.08);

      clusterOsc.connect(clusterGain);
      clusterGain.connect(ctx.destination);
      clusterOsc.start(now);
      clusterOsc.stop(now + 2.2 + idx * 0.08);
    });

    // 5. RUSHING RASPY AIR & GHOSTLY STATIC BURST
    const bufferSize = Math.floor(ctx.sampleRate * 2.2);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.frequency.linearRampToValueAtTime(1600, now + 1.1);
    noiseFilter.frequency.exponentialRampToValueAtTime(450, now + 2.1);
    noiseFilter.Q.setValueAtTime(2.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, now);
    noiseGain.gain.setValueAtTime(0.5, now + 1.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 2.2);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(distortion);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.3);
  } catch {
    // Ignore audio errors
  }
}

export function playGachaSpinTick(pitchOffset = 0, enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = 600 + pitchOffset * 15;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio errors
  }
}

export function playRobuxDonateSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Two bright ascending coin pings
    const freqs = [987.77, 1318.51, 1760.0]; // B5, E6, A6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.26);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playHeartPopSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Warm bubbly heart pop: G5 -> C6 -> E6
    const freqs = [783.99, 1046.50, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + idx * 0.04 + 0.05);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.04 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.3);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playGachaRevealFanfare(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Magical sparkle chime sequence: F5, A5, C6, E6, G6, C7
    const notes = [698.46, 880.00, 1046.50, 1318.51, 1567.98, 2093.00];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0, now + index * 0.06);
      gain.gain.linearRampToValueAtTime(0.25, now + index * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.55);
    });

    // Secondary glitter harmonics
    [1396.91, 1760.00, 2093.00, 2637.02].forEach((freq, idx) => {
      const glitter = ctx.createOscillator();
      const glitterGain = ctx.createGain();

      glitter.type = 'triangle';
      glitter.frequency.setValueAtTime(freq, now + 0.35 + idx * 0.05);

      glitterGain.gain.setValueAtTime(0, now + 0.35 + idx * 0.05);
      glitterGain.gain.linearRampToValueAtTime(0.15, now + 0.35 + idx * 0.05 + 0.01);
      glitterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.05 + 0.3);

      glitter.connect(glitterGain);
      glitterGain.connect(ctx.destination);

      glitter.start(now + 0.35 + idx * 0.05);
      glitter.stop(now + 0.35 + idx * 0.05 + 0.35);
    });
  } catch {
    // Ignore audio errors
  }
}

export function playFlowerTributeChime(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Heavenly harp & chime sequence: C5, E5, G5, B5, D6, F#6, A6, C7
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1479.98, 1760.00, 2093.00];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);

      gain.gain.setValueAtTime(0, now + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.7);
    });
  } catch {
    // Ignore audio errors
  }
}

// 1. Hell Transition Dramatic Screen Shatter & Thunder Impact
export function playHellTransitionShatter(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub-bass heavy thunder boom
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.3);

    // Glass shatter sharp high noise burst
    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(4500, now + 0.3);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.35);

    // Dramatic minor gong chord (C3, Eb3, F#3, A3)
    [130.81, 155.56, 185.00, 220.00, 311.13].forEach((f, i) => {
      const gong = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gong.type = 'sawtooth';
      gong.frequency.setValueAtTime(f, now);
      gongGain.gain.setValueAtTime(0.12, now + i * 0.02);
      gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      gong.connect(gongGain);
      gongGain.connect(ctx.destination);
      gong.start(now);
      gong.stop(now + 1.8);
    });
  } catch {
    // Ignore audio errors
  }
}

// 2. Hell Flame Fire Whoosh
export function playHellFlameSwoosh(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.8;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const flameNoise = ctx.createBufferSource();
    flameNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.75);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    flameNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    flameNoise.start(now);
    flameNoise.stop(now + 0.8);
  } catch {
    // Ignore
  }
}

// 3. Falling Scream Pitch Glide Sound Effect
export function playFallingScreamSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 1.6); // falling screaming pitch

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.8);
  } catch {
    // Ignore
  }
}

// 4. Return to Heaven / Earth Shimmer Sound
export function playReturnToHeaven(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.85);
    });
  } catch {
    // Ignore
  }
}

// 5. Cóc Kiện Trời - Trống Đăng Văn Kêu Oan (Punchy Resonant Ancient Drum Beat)
export function playDrumBeatSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Drum body low frequency thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency drops from 180Hz to 45Hz (resonant drum membrane)
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);

    // Drum mallet snap/strike click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(420, now);
    clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.05);
  } catch {
    // Ignore
  }
}

// 6. Cóc Kêu Oan (Playful Frog Croak)
export function playFrogCroakSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low guttural pulse
    const croaks = [0, 0.09];
    croaks.forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now + delay);
      osc.frequency.linearRampToValueAtTime(110, now + delay + 0.06);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  } catch {
    // Ignore
  }
}

// 7. Mở Khóa Gợi Ý / Mốc Thiên Đình (Celestial Fanfare)
export function playMilestoneUnlockSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.65);
    });
  } catch {
    // Ignore
  }
}

// 8. Tiếng Chụt Nụ Hôn Ngọt Ngào (Kiss Sound / Smooch Pop with Love Twinkles)
export function playKissSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Suction & Lip smack / Pop (Tiếng chụt mwah)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // 2. High sparkle "mwah" pop
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.14);

    gain2.gain.setValueAtTime(0.01, now + 0.02);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.19);

    // 3. Heart melody bells / harmonic twinkle
    const sweetNotes = [659.25, 880, 1046.5, 1318.51, 1567.98]; // E5, A5, C6, E6, G6
    sweetNotes.forEach((freq, idx) => {
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq, now + 0.08 + idx * 0.06);

      bellGain.gain.setValueAtTime(0, now + 0.08 + idx * 0.06);
      bellGain.gain.linearRampToValueAtTime(0.2, now + 0.08 + idx * 0.06 + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + idx * 0.06 + 0.35);

      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now + 0.08 + idx * 0.06);
      bell.stop(now + 0.08 + idx * 0.06 + 0.38);
    });
  } catch {
    // Ignore audio errors
  }
}






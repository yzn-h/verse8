import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outDir = join(__dirname, "..", "public", "audio");

const SAMPLE_RATE = 44100;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toWavBuffer = (samples, sampleRate = SAMPLE_RATE) => {
  const numSamples = samples.length;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");

  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // Bits per sample

  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const clamped = clamp(samples[i], -1, 1);
    const intSample = Math.round(clamped * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
};

const easeInOut = (t) => t * t * (3 - 2 * t);

const generateAmbientHum = (durationSeconds = 12) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let slowNoise = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / SAMPLE_RATE;
    const progress = i / totalSamples;
    const fadeIn = Math.min(1, i / (SAMPLE_RATE * 1.5));
    const fadeOut = Math.min(1, (totalSamples - i) / (SAMPLE_RATE * 1.5));
    const pad = Math.min(fadeIn, fadeOut);

    const base1 = Math.sin(2 * Math.PI * 52 * t + Math.sin(2 * Math.PI * 0.09 * t) * 0.8);
    const base2 = Math.sin(2 * Math.PI * 79 * t + Math.sin(2 * Math.PI * 0.07 * t + 1.3) * 0.6);
    const base3 = Math.sin(2 * Math.PI * 122 * t + Math.sin(2 * Math.PI * 0.11 * t + 2.6) * 0.4);

    slowNoise = slowNoise * 0.985 + (Math.random() * 2 - 1) * 0.015;
    const shimmer = Math.sin(2 * Math.PI * 0.17 * t) * 0.3;

    const drift = 0.55 + 0.35 * Math.sin(2 * Math.PI * 0.02 * t + slowNoise * 0.5);
    const texture = slowNoise * 0.45 + shimmer * 0.2;

    const value = (base1 * 0.45 + base2 * 0.35 + base3 * 0.25 + texture) * drift;
    data[i] = value * pad * 0.28;

    if (progress > 0.75) {
      const tail = easeInOut((progress - 0.75) / 0.25);
      data[i] *= 1 - tail * 0.35;
    }
  }
  return data;
};

const generateAmbientShimmer = (durationSeconds = 14) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let lfo = 0.2;
  let noise = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, i / (SAMPLE_RATE * 2));
    const fadeOut = Math.min(1, (totalSamples - i) / (SAMPLE_RATE * 2));
    const pad = Math.min(fade, fadeOut);

    lfo = lfo * 0.9995 + (Math.sin(2 * Math.PI * 0.05 * t) + Math.sin(2 * Math.PI * 0.033 * t + 1.4)) * 0.00025;
    noise = noise * 0.96 + (Math.random() * 2 - 1) * 0.04;

    const shimmer = Math.sin(2 * Math.PI * 180 * t + Math.sin(2 * Math.PI * 0.27 * t) * 1.6);
    const airy = Math.sin(2 * Math.PI * 320 * t + Math.sin(2 * Math.PI * 0.17 * t + 2.1) * 1.3);
    const texture = shimmer * 0.4 + airy * 0.35 + noise * 0.6 + lfo * 0.2;
    data[i] = texture * pad * 0.18;
  }
  return data;
};

const generateAmbientGrit = (durationSeconds = 16) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let slow = 0;
  let rumblePhase = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, i / (SAMPLE_RATE * 3));
    const fadeOut = Math.min(1, (totalSamples - i) / (SAMPLE_RATE * 3));
    const pad = Math.min(fade, fadeOut);

    slow = slow * 0.995 + (Math.random() * 2 - 1) * 0.005;
    rumblePhase += (2 * Math.PI * (28 + Math.sin(2 * Math.PI * 0.04 * t) * 6)) / SAMPLE_RATE;
    const rumble = Math.sin(rumblePhase) * 0.8;
    const grit = slow * 0.6 + (Math.random() * 2 - 1) * 0.08;
    const gust = Math.sin(2 * Math.PI * 0.12 * t) * 0.35;
    data[i] = (rumble * 0.55 + grit * 0.45 + gust * 0.2) * pad * 0.24;
  }
  return data;
};

const generateWaveWhoosh = (durationSeconds = 1.25) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let noise = 0;
  let phase = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / totalSamples;
    const env = Math.pow(Math.sin(Math.PI * clamp(t, 0, 1)), 1.4);
    const freq = 220 + 560 * (1 - t * 0.8);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const tonal = Math.sin(phase);
    noise = noise * 0.7 + (Math.random() * 2 - 1) * 0.3;
    const airy = noise * 0.75 + tonal * 0.35;
    const swell = 0.8 + 0.2 * Math.sin(2 * Math.PI * t * 3);
    data[i] = airy * env * swell * 0.66;
  }
  return data;
};

const generateUiSoftBlip = (durationSeconds = 0.22) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let phase = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / totalSamples;
    const envelope = Math.pow(1 - t, 2.5);
    const freq = 660 + 220 * Math.sin(2 * Math.PI * t * 2.5);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const tone = Math.sin(phase) + Math.sin(phase * 2) * 0.25;
    data[i] = tone * envelope * 0.28;
  }
  return data;
};

const generateEnemyHitVariant = (
  variant = "soft",
  durationSeconds = 0.24
) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let noise = 0;
  let phase = 0;
  let sparklePhase = 0;

  const settings = {
    soft: {
      baseFreq: 180,
      noiseMix: 0.35,
      overdrive: 0.2,
      sparkleMix: 0.05,
      decay: 2.8,
      body: 0.9,
    },
    mid: {
      baseFreq: 195,
      noiseMix: 0.4,
      overdrive: 0.28,
      sparkleMix: 0.12,
      decay: 2.5,
      body: 0.8,
    },
    bright: {
      baseFreq: 208,
      noiseMix: 0.46,
      overdrive: 0.34,
      sparkleMix: 0.18,
      decay: 2.2,
      body: 0.7,
    },
  };

  const cfg = settings[variant] || settings.soft;

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / totalSamples;
    const env = Math.pow(1 - t, cfg.decay);
    const bodyEnv = Math.pow(1 - t, cfg.body);
    const bend = Math.sin(2 * Math.PI * t * 6) * cfg.overdrive;
    phase += (2 * Math.PI * (cfg.baseFreq + 38 * bend)) / SAMPLE_RATE;
    const body = Math.sin(phase);
    noise = noise * 0.52 + (Math.random() * 2 - 1) * cfg.noiseMix;
    sparklePhase += (2 * Math.PI * (540 + Math.sin(2 * Math.PI * t * 3) * 90)) / SAMPLE_RATE;
    const sparkle = Math.sin(sparklePhase) * cfg.sparkleMix;
    data[i] = (body * 0.6 + noise * 0.4) * env * 0.58 + sparkle * bodyEnv * 0.35;
  }
  return data;
};

const generatePlayerHit = (durationSeconds = 0.32) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let noise = 0;
  let phase = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / totalSamples;
    const env = Math.pow(1 - t, 3.4);
    const rumbleEnv = Math.pow(1 - t, 1.8);
    phase += (2 * Math.PI * (110 + 28 * Math.sin(2 * Math.PI * t * 2))) / SAMPLE_RATE;
    const body = Math.sin(phase) * 0.8;
    noise = noise * 0.68 + (Math.random() * 2 - 1) * 0.32;
    const rumble = noise * rumbleEnv * 0.6;
    data[i] = (body * 0.55 + rumble * 0.45) * env * 0.6;
  }
  return data;
};

const generateUpgradeSoft = (durationSeconds = 0.6) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let phase = 0;
  let shimmerPhase = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / totalSamples;
    const env = easeInOut(t);
    const tail = Math.pow(1 - t, 1.4);
    phase += (2 * Math.PI * (420 + 140 * t)) / SAMPLE_RATE;
    shimmerPhase += (2 * Math.PI * (980 + Math.sin(2 * Math.PI * t * 3) * 80)) / SAMPLE_RATE;
    const tone = Math.sin(phase) * 0.5 + Math.sin(phase * 0.5) * 0.3;
    const shimmer = Math.sin(shimmerPhase) * Math.pow(1 - t, 1.8) * 0.22;
    data[i] = (tone * env + shimmer) * tail * 0.5;
  }
  return data;
};

const generateXpPickup = (durationSeconds = 0.24) => {
  const totalSamples = Math.floor(durationSeconds * SAMPLE_RATE);
  const data = new Float32Array(totalSamples);
  let phase = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / totalSamples;
    const env = Math.pow(1 - t, 3.2);
    const freq = 480 + 240 * t;
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const tone = Math.sin(phase) + Math.sin(phase * 1.5) * 0.18;
    data[i] = tone * env * 0.32;
  }
  return data;
};

const tasks = [
  {
    filename: "ambient-hum.wav",
    generator: generateAmbientHum,
    description: "ambient hum loop",
  },
  {
    filename: "ambient-shimmer.wav",
    generator: generateAmbientShimmer,
    description: "ambient shimmer layer",
  },
  {
    filename: "ambient-grit.wav",
    generator: generateAmbientGrit,
    description: "ambient sand/grit layer",
  },
  {
    filename: "wave-whoosh.wav",
    generator: generateWaveWhoosh,
    description: "wave spawn whoosh",
  },
  {
    filename: "ui-soft-blip.wav",
    generator: generateUiSoftBlip,
    description: "ui confirmation blip",
  },
  {
    filename: "enemy-hit-soft.wav",
    generator: () => generateEnemyHitVariant("soft"),
    description: "enemy hit soft impact",
  },
  {
    filename: "enemy-hit-mid.wav",
    generator: () => generateEnemyHitVariant("mid"),
    description: "enemy hit mid impact",
  },
  {
    filename: "enemy-hit-bright.wav",
    generator: () => generateEnemyHitVariant("bright"),
    description: "enemy hit bright impact",
  },
  {
    filename: "player-hit.wav",
    generator: generatePlayerHit,
    description: "player damage thud",
  },
  {
    filename: "upgrade-soft.wav",
    generator: generateUpgradeSoft,
    description: "upgrade confirm swell",
  },
  {
    filename: "xp-pickup.wav",
    generator: generateXpPickup,
    description: "xp shard pickup",
  },
];

const main = async () => {
  await mkdir(outDir, { recursive: true });
  for (const task of tasks) {
    const samples = task.generator();
    const buffer = toWavBuffer(samples);
    const fullPath = join(outDir, task.filename);
    await writeFile(fullPath, buffer);
    console.log(`Generated ${task.description} -> ${fullPath}`);
  }
};

main().catch((err) => {
  console.error("Failed to generate audio", err);
  process.exit(1);
});

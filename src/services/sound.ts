// Простые синтезированные звуки. По умолчанию ВЫКЛЮЧЕНЫ; включать в профиле.

let enabled = false;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function beep(freqs: number[], duration = 0.12, type: OscillatorType = 'sine') {
  if (!enabled) return;
  try {
    const ctx = new AudioContext();
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * duration);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * duration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (i + 1) * duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * duration);
      osc.stop(ctx.currentTime + (i + 1) * duration + 0.05);
    });
  } catch {
    /* аудио недоступно — молча пропускаем */
  }
}

export type SoundName = 'coins' | 'achievement' | 'tap' | 'success';

export function playSound(name: SoundName) {
  switch (name) {
    case 'coins':
      beep([880, 1320], 0.09, 'triangle');
      break;
    case 'achievement':
      beep([523, 659, 784, 1047], 0.11);
      break;
    case 'success':
      beep([659, 880], 0.1);
      break;
    case 'tap':
      beep([600], 0.05, 'square');
      break;
  }
}

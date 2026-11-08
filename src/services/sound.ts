// Простые синтезированные звуки. Включаются настройкой профиля (по умолчанию ВКЛ);
// отключить можно в «Настройках для мамы».

let enabled = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function audioCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function beep(freqs: number[], duration = 0.12, type: OscillatorType = 'sine') {
  if (!enabled) return;
  const ac = audioCtx();
  if (!ac) return;
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + i * duration);
    gain.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + i * duration + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (i + 1) * duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + i * duration);
    osc.stop(ac.currentTime + (i + 1) * duration + 0.05);
  });
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
      beep([540], 0.05, 'triangle');
      break;
  }
}

/** Глобальный звук клика по кнопкам и ссылкам */
export function installClickSound() {
  document.addEventListener(
    'click',
    (e) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('button, a, [role="button"], input[type="checkbox"], select')) {
        playSound('tap');
      }
    },
    true,
  );
}

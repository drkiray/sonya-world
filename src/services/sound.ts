// Волшебные синтезированные звуки. Включаются настройкой профиля (по умолчанию ВКЛ);
// отключить можно в «Настройках для мамы». Каждое действие имеет свой узнаваемый звук:
// пентатонические арпеджио, колокольчики и мерцающие обертоны.

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

interface Note {
  f: number; // частота, Гц
  at: number; // смещение от начала, сек
  d: number; // длительность, сек
  type?: OscillatorType;
  g?: number; // громкость
  slide?: number; // если задано — частота плавно уходит в slide к концу ноты
}

function play(notes: Note[]) {
  if (!enabled) return;
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime;
  for (const n of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = n.type ?? 'sine';
    const start = t0 + n.at;
    osc.frequency.setValueAtTime(n.f, start);
    if (n.slide) osc.frequency.exponentialRampToValueAtTime(n.slide, start + n.d);
    const vol = n.g ?? 0.12;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + n.d + 0.05);
  }
}

const rnd = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

export type SoundName =
  | 'tap' // обычное нажатие кнопки
  | 'coins' // покупка/начисление монет
  | 'achievement' // открытие значка
  | 'success' // отправка, сохранение
  | 'hatch' // вылупление яйца
  | 'levelup' // новый уровень
  | 'error'; // ошибка

export function playSound(name: SoundName) {
  switch (name) {
    case 'tap':
      // лёгкий колокольчик, слегка разный тон, чтобы не приедалось
      play([{ f: rnd([740, 830, 932, 1046]), at: 0, d: 0.12, type: 'triangle', g: 0.08 }]);
      break;
    case 'coins':
      // пентатоническое мерцание: монетка звенит вверх
      play([
        { f: 1568, at: 0, d: 0.1, type: 'sine', g: 0.1 },
        { f: 2093, at: 0.07, d: 0.14, type: 'sine', g: 0.09 },
        { f: 2637, at: 0.14, d: 0.2, type: 'sine', g: 0.07 },
      ]);
      break;
    case 'achievement':
      // фанфары колокольчиков: до–ми–соль–до
      play([
        { f: 523, at: 0, d: 0.14, type: 'triangle', g: 0.1 },
        { f: 659, at: 0.11, d: 0.14, type: 'triangle', g: 0.1 },
        { f: 784, at: 0.22, d: 0.16, type: 'triangle', g: 0.11 },
        { f: 1046, at: 0.33, d: 0.42, type: 'sine', g: 0.12 },
        { f: 2093, at: 0.36, d: 0.4, type: 'sine', g: 0.04 },
      ]);
      break;
    case 'success':
      // двойной волшебный перезвон
      play([
        { f: 987, at: 0, d: 0.12, type: 'sine', g: 0.1 },
        { f: 1318, at: 0.09, d: 0.22, type: 'sine', g: 0.1 },
      ]);
      break;
    case 'hatch':
      // скольжение вверх + сияющий финал — яйцо раскрывается
      play([
        { f: 392, at: 0, d: 0.3, type: 'sine', slide: 784, g: 0.09 },
        { f: 1046, at: 0.28, d: 0.16, type: 'triangle', g: 0.1 },
        { f: 1568, at: 0.4, d: 0.5, type: 'sine', g: 0.12 },
        { f: 2093, at: 0.44, d: 0.45, type: 'sine', g: 0.05 },
      ]);
      break;
    case 'levelup':
      // торжественное арпеджио с обертонами
      play([
        { f: 523, at: 0, d: 0.13, type: 'triangle', g: 0.1 },
        { f: 659, at: 0.1, d: 0.13, type: 'triangle', g: 0.1 },
        { f: 784, at: 0.2, d: 0.13, type: 'triangle', g: 0.11 },
        { f: 1046, at: 0.3, d: 0.13, type: 'triangle', g: 0.11 },
        { f: 1318, at: 0.4, d: 0.6, type: 'sine', g: 0.13 },
        { f: 2637, at: 0.44, d: 0.55, type: 'sine', g: 0.04 },
      ]);
      break;
    case 'error':
      // мягкое предупреждение, не пугающее
      play([
        { f: 311, at: 0, d: 0.12, type: 'triangle', g: 0.09 },
        { f: 233, at: 0.12, d: 0.2, type: 'triangle', g: 0.09 },
      ]);
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

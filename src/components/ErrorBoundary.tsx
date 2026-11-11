import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Ловит любые падения рендера (в т.ч. ошибки загрузки JS-чанков при обновлении
 * версии приложения) и спасает экран: вместо пустого тёмного фона показывает
 * понятную кнопку, а при первой ошибке пытается обновиться сама. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error('Ошибка приложения:', error);
    // Одна автоматическая перезагрузка на сессию — обычно это обновление версии
    if (!sessionStorage.getItem('sonya-auto-reload')) {
      sessionStorage.setItem('sonya-auto-reload', '1');
      setTimeout(() => window.location.reload(), 800);
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-night p-8 text-center text-white">
        <img src="./icons/icon.svg" alt="Мир Сонечки" className="h-20 w-20 animate-floaty" />
        <p className="text-lg font-black">Ой, что-то пошло не так</p>
        <p className="text-sm font-semibold text-white/60">
          Приложение обновилось или произошла ошибка. Нажми кнопку — всё заработает!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-sun px-6 py-3 font-black text-night active:scale-95"
        >
          Обновить
        </button>
      </div>
    );
  }
}

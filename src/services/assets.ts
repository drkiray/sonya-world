// ─── Система подмены процедурного арта настоящими иллюстрациями ────────────
// Положите файлы в public/assets/pets/<id питомца>.webp (512×512, прозрачный фон)
// и зарегистрируйте их в public/assets/manifest.json:
//   { "demo-01": "pets/demo-01.webp", "demo-02": "pets/demo-02.webp" }
// Компонент PetImage подставит их автоматически вместо процедурного SVG.

const manifestCache = new Map<string, Promise<Record<string, string>>>();

export function loadAssetManifest(): Promise<Record<string, string>> {
  let p = manifestCache.get('m');
  if (!p) {
    p = fetch('assets/manifest.json')
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
    manifestCache.set('m', p);
  }
  return p;
}

/** Разрешает путь из манифеста относительно папки assets/ */
export function getAssetUrl(path: string): string {
  return `assets/${path}`;
}

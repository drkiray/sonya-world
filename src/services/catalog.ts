import type { CatalogImportItem, ImportResult, Rarity } from '../types';
import { RARITIES, LEGACY_RARITIES } from '../types';

// Валидация JSON-каталога питомцев перед импортом.
// Ожидаемый формат записи:
// { id, name, rarity, category, description, imageUrl, source, sourceVerified }

export function parseCatalogJson(text: string): { items: CatalogImportItem[]; errors: string[] } {
  const errors: string[] = [];
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { items: [], errors: ['Файл не является корректным JSON'] };
  }

  const arr = Array.isArray(raw) ? raw : [raw];
  if (arr.length === 0) errors.push('Файл пуст');

  const items: CatalogImportItem[] = [];
  arr.forEach((entry, i) => {
    if (typeof entry !== 'object' || entry === null) {
      errors.push(`Запись ${i + 1}: не объект`);
      return;
    }
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== 'string' || !e.id) {
      errors.push(`Запись ${i + 1}: нет строкового поля id`);
      return;
    }
    if (typeof e.name !== 'string' || !e.name.trim()) {
      errors.push(`Запись ${i + 1}: нет названия (name)`);
      return;
    }
    const rawRarity = typeof e.rarity === 'string' ? e.rarity : '';
    // принимаем новые русские названия и старые английские
    const rarity = (RARITIES as string[]).includes(rawRarity)
      ? (rawRarity as Rarity)
      : LEGACY_RARITIES[rawRarity];
    if (!rarity) {
      errors.push(`Запись ${i + 1} (${e.name}): редкость должна быть одной из ${RARITIES.join(', ')}`);
      return;
    }
    items.push({
      id: e.id,
      name: e.name.trim(),
      rarity,
      category: typeof e.category === 'string' ? e.category : 'Без категории',
      description: typeof e.description === 'string' ? e.description : '',
      imageUrl: typeof e.imageUrl === 'string' ? e.imageUrl : null,
      source: typeof e.source === 'string' ? e.source : 'Steal an Egg',
      sourceVerified: Boolean(e.sourceVerified),
    });
  });

  return { items, errors };
}

export function emptyImportResult(): ImportResult {
  return { added: 0, skippedDuplicates: 0, errors: [] };
}

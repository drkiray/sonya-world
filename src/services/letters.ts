/** Formspree accepts the letter on behalf of the game; recipient lives in its dashboard. */
export async function deliverLetter(message: string, formId: string, fetcher: typeof fetch = fetch): Promise<void> {
  const text = message.trim();
  if (!text) throw new Error('Напиши хоть пару слов!');
  if (text.length > 2000) throw new Error('Письмо слишком длинное (до 2000 символов).');
  if (!/^[a-z0-9]+$/i.test(formId)) throw new Error('Почта ещё не настроена. Попроси взрослого помочь.');

  const body = new FormData();
  body.set('subject', 'Письмо от Сони — Мир Сонечки');
  body.set('message', text);

  let response: Response;
  try {
    response = await fetcher(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
    });
  } catch {
    throw new Error('Нет связи с почтой. Проверь интернет и попробуй ещё раз.');
  }
  if (!response.ok) {
    if (response.status === 429) throw new Error('Почта занята. Попробуй отправить письмо позже.');
    throw new Error('Не получилось отправить письмо. Попробуй позже.');
  }
}

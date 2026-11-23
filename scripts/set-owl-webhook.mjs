const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.env.OWL_FUNCTION_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
if (!token || !url || !secret) throw new Error('Missing webhook configuration');
if (!url.startsWith('https://')) throw new Error('Webhook URL must use HTTPS');

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url, secret_token: secret, allowed_updates: ['message'], drop_pending_updates: false }),
});
const result = await response.json();
if (!response.ok || !result.ok) throw new Error('Telegram did not accept the webhook');
process.stdout.write('Telegram webhook configured\n');

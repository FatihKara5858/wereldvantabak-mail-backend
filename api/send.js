/**
 * Vercel serverless function: /api/send
 * Minimal backend for WereldVanTabak iOS app.
 */

const TARGET_EMAIL = process.env.TARGET_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  const data = Buffer.concat(chunks).toString('utf8').trim();
  if (!data) return {};
  return JSON.parse(data);
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function sanitizeString(value) {
  return String(value || '').replace(/\r/g, '').trim();
}

function buildEmailText(payload) {
  const { name, email, phone, items, note } = payload;

  const lines = [
    'Neue Reservierung – WereldVanTabak',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Telefon: ${phone}`,
    '',
    'Items:',
  ];

  if (Array.isArray(items) && items.length) {
    for (const item of items) {
      if (typeof item === 'string') lines.push(`- ${item}`);
      else lines.push(`- ${JSON.stringify(item)}`);
    }
  } else {
    lines.push('- (leer)');
  }

  lines.push('', 'Notiz:', note ? note : '(keine)', '', `Gesendet am: ${new Date().toISOString()}`);
  return lines.join('\n');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { success: false });
  }

  if (!TARGET_EMAIL || !RESEND_API_KEY) {
    return sendJson(res, 500, { success: false });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return sendJson(res, 400, { success: false });
  }

  const name = sanitizeString(body.name);
  const email = sanitizeString(body.email);
  const phone = sanitizeString(body.phone);
  const note = sanitizeString(body.note);

  if (!name || !email || !phone || !Array.isArray(body.items)) {
    return sendJson(res, 400, { success: false });
  }

  const text = buildEmailText({ name, email, phone, items: body.items, note });
  const fromEmail = process.env.FROM_EMAIL || TARGET_EMAIL;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `WereldVanTabak <${fromEmail}>`,
        to: [TARGET_EMAIL],
        subject: 'Neue Reservierung – WereldVanTabak',
        text,
        reply_to: email,
      }),
    });

    if (!response.ok) {
      return sendJson(res, 500, { success: false });
    }

    return sendJson(res, 200, { success: true });
  } catch (_err) {
    return sendJson(res, 500, { success: false });
  }
};

/**
 * DEBUG VERSION – Minimal Resend Test
 * No validation
 * No dynamic payload
 * Only tests API key + Resend
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  if (!RESEND_API_KEY) {
    return sendJson(res, 500, {
      success: false,
      error: 'RESEND_API_KEY missing'
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['DEINE_PRIVATE_EMAIL_HIER'],
        subject: 'Resend Test',
        text: 'Wenn diese Mail ankommt, funktioniert Resend korrekt.',
      }),
    });

    const body = await response.text();

    console.log('RESEND STATUS:', response.status);
    console.log('RESEND BODY:', body);

    return sendJson(res, 200, {
      resendStatus: response.status,
      resendBody: body
    });

  } catch (error) {
    console.log('FETCH ERROR:', error);
    return sendJson(res, 500, {
      success: false,
      error: 'Fetch failed',
      details: error.message
    });
  }
};

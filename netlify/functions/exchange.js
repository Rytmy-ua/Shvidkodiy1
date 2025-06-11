const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const clientId = process.env.NV_CLIENT_ID;
  const clientSecret = process.env.NV_CLIENT_SECRET;
  const refreshToken = process.env.NV_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing environment variables' }),
    };
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error, details: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Token exchange failed', details: err.message }),
    };
  }
};

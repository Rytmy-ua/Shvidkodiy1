const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const refreshToken = process.env.NV_REFRESH_TOKEN;
    const clientId = process.env.NV_CLIENT_ID;
    const clientSecret = process.env.NV_CLIENT_SECRET;

    // Отримуємо access_token через refresh_token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Не вдалося отримати токен доступу.' }),
      };
    }

    // Сьогоднішня дата
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    // Отримуємо події календаря
    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${todayStart}&timeMax=${todayEnd}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const events = await eventsRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify(events),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

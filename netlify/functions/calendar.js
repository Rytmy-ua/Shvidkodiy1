const fetch = require('node-fetch');

exports.handler = async (event) => {
  const token = event.queryStringParameters.access_token;

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No access_token provided' }),
    };
  }

  const now = new Date().toISOString();
  const timeMax = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message }),
      };
    }

    const events = data.items.map(event => ({
      summary: event.summary || '(без назви)',
      start: event.start?.dateTime || event.start?.date,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ events }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

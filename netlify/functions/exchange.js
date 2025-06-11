const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const {
    NV_CLIENT_ID,
    NV_CLIENT_SECRET,
    NV_REFRESH_TOKEN
  } = process.env;

  if (!NV_CLIENT_ID || !NV_CLIENT_SECRET || !NV_REFRESH_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing environment variables" }),
    };
  }

  const params = new URLSearchParams();
  params.append("client_id", NV_CLIENT_ID);
  params.append("client_secret", NV_CLIENT_SECRET);
  params.append("refresh_token", NV_REFRESH_TOKEN);
  params.append("grant_type", "refresh_token");

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "invalid_grant", details: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in,
        scope: data.scope,
        token_type: data.token_type,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Exception", details: error.message }),
    };
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const eventsContainer = document.getElementById('events');
  const button = document.getElementById('loadEvents');

  button.addEventListener('click', async () => {
    eventsContainer.innerHTML = 'Завантаження...';

    try {
      // 1. Отримати access_token із Netlify function
      const tokenResponse = await fetch('/.netlify/functions/exchange');
      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new Error('Access token not received');
      }

      // 2. Отримати події з Google Calendar API
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true',
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      const calendarData = await calendarResponse.json();

      // 3. Відобразити події
      if (!calendarData.items || calendarData.items.length === 0) {
        eventsContainer.innerHTML = 'Подій не знайдено';
        return;
      }

      eventsContainer.innerHTML = '';
      calendarData.items.forEach((event) => {
        const start = event.start.dateTime || event.start.date;
        const listItem = document.createElement('li');
        listItem.textContent = `${start}: ${event.summary}`;
        eventsContainer.appendChild(listItem);
      });
    } catch (error) {
      console.error(error);
      eventsContainer.innerHTML = 'Помилка завантаження подій.';
    }
  });
});

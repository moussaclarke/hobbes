import { createDAVClient, getBasicAuthHeaders } from 'tsdav';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const authHeaders = getBasicAuthHeaders({
    username: config.davUser,
    password: config.davPassword,
  });
  try {
    const client = await createDAVClient({
        serverUrl: 'https://my.baikal.server/dav.php',
        defaultAccountType: 'caldav',
        credentials: {
          username: config.davUser,
          password: config.davPassword,
        },
        authMethod: 'Basic',
      });
    const calendars = await client.fetchCalendars();
    const calendar = calendars.find((calendar) => calendar.displayName === 'Project Name Backlog');
    if (!calendar) {
      return {
        statusCode: 404,
        body: 'Calendar not found',
      }
    }

    const todos = await client.fetchCalendarObjects({ calendar, filters: [
      {
        'comp-filter': {
          _attributes: { name: 'VCALENDAR' },
          'comp-filter': {
            _attributes: { name: 'VTODO' },
          },
        },
      },
    ]}
    )

    return todos
  } catch (error) {
    return error
  }
})

import { createDAVClient, getBasicAuthHeaders } from "tsdav";
import davClient from "~/utils/davClient";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const client = await davClient().getDavClient();
    const calendars = await client.fetchCalendars();
    const calendar = calendars.find(
      (calendar) => calendar.displayName === config.davCalName,
    );
    if (!calendar) {
      return {
        statusCode: 404,
        body: "Calendar not found",
      };
    }

    const todos = await client.fetchCalendarObjects({
      calendar,
      filters: [
        {
          "comp-filter": {
            _attributes: { name: "VCALENDAR" },
            "comp-filter": {
              _attributes: { name: "VTODO" },
            },
          },
        },
      ],
      headers: await davClient().getCalendarHeaders(),
    });

    return todos;
  } catch (error) {
    return error;
  }
});

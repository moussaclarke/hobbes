import {
  createDAVClient,
  DAVClient,
  DAVObject,
  getBasicAuthHeaders,
} from "tsdav";
import { ClientDigestAuth } from "@mreal/digest-auth";

let client: any | undefined;
let incomingDigest:
  | { scheme: string; realm: string; nonce: string }
  | undefined;

export default function () {
  const getCalendarHeaders = async (method: string) => {
    const config = useRuntimeConfig();
    await getDavClient();

    if (!client || !incomingDigest) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unable to authenticate with DAV server",
      });
    }

    if (config.davAuthMethod === "basic") {
      return getBasicAuthHeaders({
        username: config.davUser,
        password: config.davPassword,
      });
    }

    const digest = ClientDigestAuth.generateProtectionAuth(
      incomingDigest,
      config.davUser,
      config.davPassword,
      {
        uri: config.davURI,
        method,
        counter: 1,
      },
    ).raw;

    return {
      Authorization: digest,
    };
  };

  const createTask = async (vtodo: string, filename: string) => {
    const config = useRuntimeConfig();
    const client = await getDavClient();

    // Get calendar to add task to
    const calendars = await client.fetchCalendars();
    const calendar = calendars.find(
      (calendar) => calendar.displayName === config.davCalName,
    );
    if (!calendar) {
      throw createError({
        statusCode: 404,
        message: "Calendar not found",
      });
    }
    const res = await client.createCalendarObject({
      calendar,
      iCalString: vtodo,
      filename,
      headers: await getCalendarHeaders("PUT"),
    });

    return res;
  };

  const updateTask = async (todoObject: DAVObject) => {
    const client = await getDavClient();

    const res = await client.updateCalendarObject({
      calendarObject: todoObject,
      headers: await getCalendarHeaders("PUT"),
    });

    return res;
  };

  const getDavClient = async (): Promise<DAVClient> => {
    if (client) {
      return client;
    }

    const config = useRuntimeConfig();

    if (config.davAuthMethod === "basic") {
      client = await createDAVClient({
        serverUrl: config.davBase + config.davURI,
        defaultAccountType: "caldav",
        credentials: {
          username: config.davUser,
          password: config.davPassword,
        },
        authMethod: "Basic",
      });

      return client;
    } else if (config.davAuthMethod === "digest") {
      const res = await fetch(config.davBase + config.davURI);
      const authenticateHeader = res.headers.get("www-authenticate");

      if (!authenticateHeader) {
        throw createError({
          statusCode: 401,
          statusMessage: "Unauthorized",
        });
      }

      incomingDigest = ClientDigestAuth.analyze(authenticateHeader);

      const digest = ClientDigestAuth.generateProtectionAuth(
        incomingDigest,
        config.davUser,
        config.davPassword,
        {
          uri: config.davURI,
          method: "PROPFIND",
          counter: 1,
        },
      ).raw.replace("Digest ", "");

      try {
        client = await createDAVClient({
          serverUrl: config.davBase + config.davURI,
          defaultAccountType: "caldav",
          credentials: {
            digestString: digest,
          },
          authMethod: "Digest",
        });

        return client;
      } catch (error) {
        // coerce error to error type
        if (error instanceof Error) {
          throw createError({
            statusCode: 500,
            statusMessage: "Error authenticating with digest auth",
            cause: error,
          });
        }
      }
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Unsupported auth method. Check your config.",
    });
  };

  const getCalendar = async () => {
    const client = await getDavClient();
    const config = useRuntimeConfig();
    const calendars = await client.fetchCalendars();
    const calendar = calendars.find(
      (calendar) => calendar.displayName === config.davCalName,
    );

    if (!calendar) {
      throw createError({
        statusCode: 404,
        message: "Calendar not found",
      });
    }

    return calendar;
  };

  const getTasks = async () => {
    const client = await getDavClient();
    const calendar = await getCalendar();

    const tasks = await client.fetchCalendarObjects({
      calendar,
      filters: [
        {
          "comp-filter": {
            _attributes: { name: "VCALENDAR" },
            "comp-filter": {
              _attributes: { name: "VTODO" },
              "prop-filter": {
                _attributes: { name: "CATEGORIES" },
                "text-match": {
                  _attributes: { "negate-condition": "yes" },
                  _text: "private",
                },
              },
            },
          },
        },
      ],
      headers: await getCalendarHeaders("REPORT"),
    });

    return tasks;
  };

  const getTask = async (uid: string) => {
    const client = await getDavClient();
    const calendar = await getCalendar();

    const tasks = await client.fetchCalendarObjects({
      calendar,
      filters: [
        {
          "comp-filter": {
            _attributes: { name: "VCALENDAR" },
            "comp-filter": {
              _attributes: { name: "VTODO" },
              "prop-filter": {
                _attributes: { name: "UID" },
                "text-match": uid,
              },
            },
          },
        },
      ],
      headers: await getCalendarHeaders("REPORT"),
    });

    if (tasks.length === 0) {
      throw createError({
        statusCode: 404,
        message: "Task not found",
      });
    }

    return tasks[0];
  };

  return {
    getTasks,
    createTask,
    getTask,
    updateTask,
  };
}

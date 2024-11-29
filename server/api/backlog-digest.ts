import { createDAVClient } from "tsdav";
import { ClientDigestAuth } from "@mreal/digest-auth";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  let res = await fetch("https://my.baikal.server/dav.php");
  let authenticateHeader = res.headers.get("www-authenticate");

  if (!authenticateHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  let incomingDigest = ClientDigestAuth.analyze(authenticateHeader);

  let digest = ClientDigestAuth.generateProtectionAuth(
    incomingDigest,
    config.davUser,
    config.davPassword,
    {
      uri: "/dav.php",
      method: "PROPFIND",
      counter: 1,
    },
  ).raw.replace("Digest ", "");

  let client;

  try {
    client = await createDAVClient({
      serverUrl: "https://my.baikal.server/dav.php",
      defaultAccountType: "caldav",
      credentials: {
        digestString: digest,
      },
      authMethod: "Digest",
    });
  } catch (error) {
    return error;
  }
  const calendars = await client.fetchCalendars();

  const calendar = calendars.find(
    (calendar) => calendar.displayName === config.davCalName,
  );
  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: "Calendar not found",
    });
  }

  digest = ClientDigestAuth.generateProtectionAuth(
    incomingDigest,
    config.davUser,
    config.davPassword,
    {
      uri: "/dav.php",
      method: "REPORT",
      counter: 2,
    },
  ).raw;

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
    headers: {
      Authorization: digest,
    },
  });

  return todos;
});

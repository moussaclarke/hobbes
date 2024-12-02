import davClient from "~/server/utils/davClient";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const client = davClient();

  // Convert priority to iCalendar format (1-9 scale)
    // 1-4: high, 5: medium, 6-9: low
    const priorityMap = {
      high: 1,
      medium: 5,
      low: 9
    };

   const formattedSummary = `${body.issueType.charAt(0).toUpperCase() + body.issueType.slice(1)}: ${body.summary}`;

   const fullDescription = [
       body.description,
       "",  // Empty line between description and context
       "Context:",
       body.context
     ].filter(Boolean).join("\n");

  // Generate unique ID for the task
  const uid = crypto.randomUUID();

  // Create task in iCalendar format
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const vcalendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//tasks.moussaclarke.dev//EN",
    "BEGIN:VTODO",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `CREATED:${now}`,
    `LAST-MODIFIED:${now}`,
    `SUMMARY:${formattedSummary}`,
    `DESCRIPTION:${fullDescription.replace(/[,\\]/g, "\\$&").replace(/\n/g, "\\n")}`,
    "STATUS:NEEDS-ACTION",
    "PERCENT-COMPLETE:0",
    `PRIORITY:${priorityMap[body.priority as keyof typeof priorityMap]}`,
    `CATEGORIES:Triage`,
    "END:VTODO",
    "END:VCALENDAR"
  ].join("\r\n");

  try {
    // Create the task on the CalDAV server
    const res = await client.sendTask(vcalendar, `${uid}.ics`);

    console.log(res)

    return {
      success: true,
      message: "Task created successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to create task",
      cause: error instanceof Error ? error : undefined,
    });
  }
});

import { getEmailFromEvent } from "./getEmailFromEvent";
import { H3Event } from "h3";

export const formEventToTask = async (event: H3Event) => {
  const body = await readBody(event);
  const { email } = getEmailFromEvent(event);

  // Convert priority to iCalendar format (1-9 scale)
  // 1-4: high, 5: medium, 6-9: low
  const priorityMap = {
    high: 1,
    medium: 5,
    low: 9,
  };

  const formattedSummary = `${body.issueType.charAt(0).toUpperCase() + body.issueType.slice(1)}: ${body.summary}`;

  const fullDescription = [
    "## Description",
    body.description,
    "\n", // Empty line between description and context
    "## Context",
    body.context,
  ]
    .filter(Boolean)
    .join("\n");

  // Generate unique ID for the task
  const uid = crypto.randomUUID();

  // Create task in iCalendar format
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // Prepare the VTODO properties
  const todoProperties = [
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `CREATED:${now}`,
    `LAST-MODIFIED:${now}`,
    `SUMMARY:${formattedSummary}`,
    `DESCRIPTION:${fullDescription.replace(/\n/g, "\\n")}`,
    "PERCENT-COMPLETE:0",
    `PRIORITY:${priorityMap[body.priority as keyof typeof priorityMap]}`,
    `CATEGORIES:Triage`,
  ];

  // Add ORGANIZER if email is available
  if (email) {
    todoProperties.push(`ORGANIZER;CN=${email}:mailto:${email}`);
  }

  return {
    uid,
    email,
    formattedSummary,
    vcalendar: [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//tasks.moussaclarke.dev//EN",
      "BEGIN:VTODO",
      ...todoProperties,
      "END:VTODO",
      "END:VCALENDAR",
    ].join("\r\n"),
  };
};

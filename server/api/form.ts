import davClient from "~/server/utils/davClient";
import { sendEmail } from "../utils/email";
import { getEmailFromEvent } from "../utils/getEmailFromEvent";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const client = davClient();
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
    body.description,
    "", // Empty line between description and context
    "Context:",
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
    `DESCRIPTION:${fullDescription.replace(/[,\\]/g, "\\$&").replace(/\n/g, "\\n")}`,
    "STATUS:NEEDS-ACTION",
    "PERCENT-COMPLETE:0",
    `PRIORITY:${priorityMap[body.priority as keyof typeof priorityMap]}`,
    `CATEGORIES:Triage`,
  ];

  // Add ORGANIZER if email was provided in the body
  if (email) {
    todoProperties.push(`ORGANIZER;CN=${email}:mailto:${email}`);
  }

  const vcalendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//tasks.moussaclarke.dev//EN",
    "BEGIN:VTODO",
    ...todoProperties,
    "END:VTODO",
    "END:VCALENDAR",
  ].join("\r\n");

  try {
    // Create the task on the CalDAV server
    await client.sendTask(vcalendar, `${uid}.ics`);

    // Send email notification
    await sendEmail({
      to: config.notificationEmail,
      subject: `New Task Created: ${formattedSummary}`,
      text: `
    A new task has been created:

    From: ${email ?? "unknown"}
    Type: ${body.issueType}
    Summary: ${body.summary}
    Priority: ${body.priority}
    Description: ${body.description}

    Context:
    ${body.context}
          `.trim(),
      html: `
    <h2>New Task Created</h2>
    <p><strong>From:</strong> ${email ?? "unknown"}</p>
    <p><strong>Type:</strong> ${body.issueType}</p>
    <p><strong>Summary:</strong> ${body.summary}</p>
    <p><strong>Priority:</strong> ${body.priority}</p>
    <p><strong>Description:</strong><br>${body.description}</p>
    <p><strong>Context:</strong><br>${body.context}</p>
          `.trim(),
    });

    return {
      success: true,
      message: "Task created successfully",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to create task or send notification",
      cause: error instanceof Error ? error : undefined,
    });
  }
});

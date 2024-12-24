import davClient from "~/server/utils/davClient";
import { sendEmail } from "../utils/email";
import { formEventToTask } from "../utils/formEventToTask";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const client = davClient();

  const task = await formEventToTask(event);

  try {
    // Create the task on the CalDAV server
    await client.createTask(task.vcalendar, `${task.uid}.ics`);

    // Send email notification
    await sendEmail({
      to: config.notificationEmail,
      subject: `New Task Created: ${task.formattedSummary}`,
      text: `
    A new task has been created:

    From: ${task.email ?? "unknown"}
    Type: ${body.issueType}
    Summary: ${body.summary}
    Priority: ${body.priority}
    Description: ${body.description}

    Context:
    ${body.context}
          `.trim(),
      html: `
    <h2>New Task Created</h2>
    <p><strong>From:</strong> ${task.email ?? "unknown"}</p>
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

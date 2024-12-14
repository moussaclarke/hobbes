import davClient from "~/server/utils/davClient";
import { sendEmail } from "../utils/email";
import { getEmailFromEvent } from "../utils/getEmailFromEvent";

const escapeDescription = (description: string): string => {
  // First, escape special characters
  const escaped = description
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

  // todo wrap lines as per caldav spec?
  return escaped;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const client = davClient();
  const { email } = getEmailFromEvent(event);

  const userName = email ? email : "unknown";

  const uid = body.taskId;
  const content = body.content;

  const task = await client.getTask(uid);

  // todo update the task data element

  // get the description section using the parser
  const { description, summary } = parseTask(task);
  // get existing updates section if there is one
  const sections = description?.split(/^## /m) ?? [];
  let updatesSectionIndex = sections.findIndex((section) =>
    section.trim().startsWith("Updates"),
  );
  let updates;

  if (updatesSectionIndex === -1) {
    // No Updates section found, create one
    updates = "Updates\n";
    updatesSectionIndex = sections.length;
  } else {
    updates = sections[updatesSectionIndex];
  }

  updates += `@${userName} [${new Date().toUTCString()}]\n${content}\n`;

  const newSections = sections
    .slice(0, updatesSectionIndex)
    .concat(updates)
    .concat(sections.slice(updatesSectionIndex + 1))
    .filter((section) => section.trim().length > 0)
    .map((section) => `## ${section}`);

  // we need to join them back together, maintaining the headings
  const escapedDescription = escapeDescription(newSections.join("\n"));

  if (typeof description !== "undefined") {
    const descriptionRegex =
      // the lack of colon after DESCRIPTION is intentional
      /DESCRIPTION(.*?)(?=\r?\n[A-Z-]+:|\r?\nEND:VTODO)/s;
    task.data = task.data.replace(
      descriptionRegex,
      `DESCRIPTION:${escapedDescription}`,
    );
  } else {
    task.data = task.data.replace(
      "\nEND:VTODO\n",
      `\nDESCRIPTION:${escapedDescription}\nEND:VTODO\n`,
    );
  }

  try {
    // Create the task on the CalDAV server
    await client.updateTask(task);

    // Send email notification
    await sendEmail({
      to: config.notificationEmail,
      subject: `New Comment`,
      text: `
    A new comment has been added:

    From: ${userName}
    Task Summary: ${summary}
    Content: ${content}
          `.trim(),
      html: `
    <h2>New Comment</h2>
    <p><strong>From:</strong> ${userName}</p>
    <p><strong>Task Summary:</strong> ${summary}</p>
    <p><strong>Content:</strong> ${content}</p>
          `.trim(),
    });

    return {
      success: true,
      message: "Comment added successfully",
      data: parseTask(task),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to add comment or send notification",
      cause: error instanceof Error ? error : undefined,
    });
  }
});

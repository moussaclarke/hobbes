import { micromark } from "micromark";

const renderDescription = (markdown: string) => {
  const sections = markdown.split(/^## /m);
  const updatesSectionIndex = sections.findIndex((section) =>
    section.trim().startsWith("Updates"),
  );

  if (updatesSectionIndex === -1) {
    // No Updates section found, just render the entire markdown text
    return micromark(markdown);
  }

  const beforeUpdates = sections.slice(0, updatesSectionIndex).join("## ");
  const updatesSection = sections[updatesSectionIndex];
  const afterUpdates = sections.slice(updatesSectionIndex + 1).join("## ");

  const renderedBeforeUpdates = micromark(beforeUpdates);
  const comments = parseComments(updatesSection);
  const renderedAfterUpdates = micromark(afterUpdates);

  const renderedComments = comments
    .map((comment) => {
      const renderedCommentContent = micromark(comment.text);
      return `<div class="comment | stack flow"><span class="user">@${comment.user}</span> <span class="timestamp">${comment.timestamp}</span> <div class="content | stack flow">${renderedCommentContent}</div></div>`;
    })
    .join("");

  return `${renderedBeforeUpdates}<h2>Updates</h2>${renderedComments}${renderedAfterUpdates}`;
};

const parseComments = (
  markdown: string,
): { user: string; timestamp: string; text: string }[] => {
  // Custom logic to parse the ## Updates section into individual comments with metadata
  // first we need to split the into comments - each comment block starts with @username
  const comments = markdown.split(/^@/m);

  if (comments.length === 1) {
    // No comments found, just return an empty array
    return [];
  }

  const parsedComments = comments.slice(1).map((comment) => {
    const lines = comment.trim().split("\n");
    const firstLine = lines[0];
    const [user, timestamp] = firstLine.split(/\s+/, 2);
    const text = lines.slice(1).join("\n").trim();

    return {
      user,
      timestamp: timestamp ? timestamp.replace(/[\[\]]/g, "") : "",
      text,
    };
  });

  return parsedComments;
};

export function useDescriptionRenderer() {
  // TODO: add our messages extension
  // we could add GFM in future, but for now just commonmark
  return {
    render: (markdown: string) => {
      const result = renderDescription(markdown)
        // disallow h1 and h2
        .replace(/<h1>/g, "<h3>")
        .replace(/<\/h1>/g, "</h3>")
        .replace(/<h2>/g, "<h3>")
        .replace(/<\/h2>/g, "</h3>");

      return result;
    },
  };
}

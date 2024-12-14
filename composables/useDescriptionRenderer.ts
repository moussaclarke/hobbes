import { micromark } from "micromark";

const renderDescription = (markdown: string) => {
  const sections = markdown.split(/^## /m);
  const updatesSectionIndex = sections.findIndex((section) =>
    section.trim().startsWith("Updates"),
  );

  if (updatesSectionIndex === -1) {
    // No Updates section found, just render the entire markdown text
    return {
      content: disallowBigHeadings(micromark(markdown)),
      truncatedContent: disallowBigHeadings(micromark(truncate(markdown))),
      comments: [],
    };
  }

  const beforeUpdates = sections.slice(0, updatesSectionIndex).join("## ");
  const updatesSection = sections[updatesSectionIndex];
  const afterUpdates = sections.slice(updatesSectionIndex + 1).join("## ");

  const content = disallowBigHeadings(
    micromark([beforeUpdates, afterUpdates].join("\n")),
  );

  const truncatedContent = disallowBigHeadings(
    micromark(truncate([beforeUpdates, afterUpdates].join("\n"))),
  );
  const comments = parseComments(updatesSection);

  return {
    content,
    truncatedContent,
    comments,
  };
};

const truncate = (text: string) => {
  return text.length > 100 ? text.slice(0, 100) + "..." : text;
};

const parseComments = (
  markdown: string,
): { user: string; timestamp: string; content: string; id: string }[] => {
  // Custom logic to parse the ## Updates section into individual comments with metadata
  // first we need to split into comments - each comment block starts with @username
  const comments = markdown.split(/^@/m);

  if (comments.length === 1) {
    // No comments found, just return an empty array
    return [];
  }

  const parsedComments = comments.slice(1).map((comment) => {
    const lines = comment.trim().split("\n");
    const firstLine = lines[0];
    const [user, timestamp] = firstLine.split(/\[+/, 2);
    const content = disallowBigHeadings(
      micromark(lines.slice(1).join("\n").trim()),
    );

    return {
      user,
      timestamp: timestamp ? timestamp.replace(/[\[\]]/g, "") : "",
      content,
      id: crypto.randomUUID(),
    };
  });

  return parsedComments;
};

const disallowBigHeadings = (markdown: string) => {
  // disallow h1 and h2
  return markdown
    .replace(/<h1>/g, "<h3>")
    .replace(/<\/h1>/g, "</h3>")
    .replace(/<h2>/g, "<h3>")
    .replace(/<\/h2>/g, "</h3>");
};

export function useDescriptionRenderer() {
  return {
    render: (markdown: string) => {
      return renderDescription(markdown);
    },
  };
}

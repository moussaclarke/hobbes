import { micromark } from "micromark";

export function useMarkdown() {
  // TODO: add our messages extension
  // we could add GFM in future, but for now just commonmark
  return {
    compileMarkdown: (markdown: string) => {
      const result = micromark(markdown)
        // disallow h1
        .replace(/<h1>/g, "<h2>")
        .replace(/<\/h1>/g, "</h2>");

      return result;
    },
  };
}

import { micromark } from "micromark";

export function useMarkdown() {
  // TODO: add our messages extension
  // we could add GFM in future, but for now just commonmark
  return {
    compileMarkdown: (markdown: string) => {
      const result = micromark(markdown);

      return result;
    },
  };
}

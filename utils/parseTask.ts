const parseValue = (line: string) => {
  // Split only on first occurrence of ':' to handle ALTREP and other parameters
  const splitIndex = line.indexOf(':');
  const key = line.substring(0, splitIndex);
  const value = line.substring(splitIndex + 1);
  return { key: key.split(';')[0], value }; // Take base key without parameters
};

const unescapeDescription = (description: string): string =>
  description
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\\\/g, '\\');

const parseCalDAVDate = (value: string) => {
  // Format: 20241127T095607Z -> 2024-11-27T09:56:07Z
  const formatted = value
    .replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
      '$1-$2-$3T$4:$5:$6Z');
  return new Date(formatted);
};

const parsers: Record<string, (value: string) => any> = {
  UID: (value) => ({ id: value }),
  SUMMARY: (value) => ({ summary: value }),
  DESCRIPTION: (value) => {
      // Check if the value contains an ALTREP encoded description
      const hasAltrep = value.includes('text/html,');
      if (hasAltrep) {
        // Take the part after the last colon which contains the actual description
        const actualDescription = value.split(':').pop() || '';
        return { description: unescapeDescription(actualDescription) };
      }
      return { description: unescapeDescription(value) };
    },
  STATUS: (value) => ({ status: value }),
  CATEGORIES: (value) => ({ categories: value.split(',') }),
  CREATED: (value) => ({ created: parseCalDAVDate(value) }),
  'LAST-MODIFIED': (value) => ({ lastModified: parseCalDAVDate(value) }),
  'PERCENT-COMPLETE': (value) => ({ percentComplete: parseInt(value, 10) })
};

export function parseTask(rawTask: { url: string; etag?: string | undefined; data?: string | undefined }): Task {
  if (!rawTask.data) {
    // todo: this might not need to throw an error, just return empty values
    throw new Error('Invalid task data');
  }

  const lines = rawTask.data.split('\n');

  // Handle multiline descriptions by joining continued lines
  const joinedLines = lines.reduce((acc: string[], line: string) => {
    if (line.startsWith(' ')) {
      const lastIndex = acc.length - 1;
      acc[lastIndex] = acc[lastIndex] + line.substring(1);
      return acc;
    }
    return [...acc, line];
  }, []);

  const parsedProperties = joinedLines
    .map(parseValue)
    .filter(({ key }) => key in parsers)
    .map(({ key, value }) => parsers[key](value))
    .reduce((acc, curr) => {
        // Special handling for categories
        if ('categories' in curr) {
          return {
            ...acc,
            categories: [...(acc.categories || []), ...curr.categories]
          };
        }
        // Normal handling for other properties
        return { ...acc, ...curr };
      }, {});

  return {
    url: rawTask.url,
    etag: rawTask.etag?.replace(/^"|"$/g, ''), // Remove quotes at start and end
    rawData: rawTask.data,
    ...parsedProperties
  } as Task;
}

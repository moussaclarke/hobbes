const taskTypes = [
  {
    value: "bug",
    emoji: "🐛",
  },
  {
    value: "change",
    emoji: "🔧",
  },
  {
    value: "feature",
    emoji: "✨",
  },
  {
    value: "performance",
    emoji: "🚀",
  },
  {
    value: "maintenance",
    emoji: "⚙️",
  },
  {
    value: "undefined",
    emoji: "🃏",
  },
];

const getTaskTypeEmoji = (value: string) => {
  return taskTypes.find((taskType) => taskType.value === value)?.emoji || "🃏";
};

export { getTaskTypeEmoji };

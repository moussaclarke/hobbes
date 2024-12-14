const taskStatuses: {
  value: TaskStatus;
  emoji: string;
}[] = [
  {
    value: "NEEDS-ACTION",
    emoji: "⌛️",
  },
  {
    value: "IN-PROCESS",
    emoji: "⚡",
  },
  {
    value: "COMPLETED",
    emoji: "✅",
  },
  {
    value: "CANCELLED",
    emoji: "🚫",
  },
];

const getStatusEmoji = (value: string) => {
  return (
    taskStatuses.find((taskStatus) => taskStatus.value === value)?.emoji || "❓"
  );
};

export { getStatusEmoji };

const taskPriorities: {
  value: TaskPriority;
  label: string;
  emoji: string;
}[] = [
  {
    value: "NONE",
    label: "None",
    emoji: "😶",
  },
  {
    value: "LOW",
    label: "Low",
    emoji: "😐",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    emoji: "🤔",
  },
  {
    value: "HIGH",
    label: "High",
    emoji: "😱",
  },
];

const getPriorityValue = (number: number | undefined): TaskPriority => {
  // 0 or undefined is NONE
  // 1-3 is HIGH
  // 4-6 is MEDIUM
  // 7-9 is LOW
  if (number === 0 || number === undefined) {
    return "NONE";
  } else if (number >= 1 && number <= 3) {
    return "HIGH";
  } else if (number >= 4 && number <= 6) {
    return "MEDIUM";
  } else if (number >= 7 && number <= 9) {
    return "LOW";
  }

  return "NONE";
};

const getPriority = (value: number | undefined) => {
  const priority = getPriorityValue(value);
  return taskPriorities.find((taskPriority) => taskPriority.value === priority);
};

export { getPriority };

export function setTaskDates(task: Task) {
  return {
    ...task,
    completed: task.completed ? new Date(task.completed) : undefined,
    created: new Date(task.created),
    lastModified: new Date(task.lastModified),
  };
}

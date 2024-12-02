import davClient from "~/server/utils/davClient";
import { parseTask } from "~/server/utils/parseTask";

export default defineEventHandler(async () => {
  const rawTasks = await davClient().getTasks();
  const tasks: Task[] = rawTasks
    .map(parseTask)
    .sort((a, b) => b.created.getTime() - a.created.getTime());

  return {
    data: tasks,
  };
});

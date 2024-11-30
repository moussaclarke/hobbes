import davClient from "~/utils/davClient";
import { parseTask } from "~/utils/parseTask";

export default defineEventHandler(async () => {
  const rawTasks = await davClient().getTasks();
  const tasks: Task[] = rawTasks.map(parseTask).sort((a, b) => b.created.getTime() - a.created.getTime());

  return {
    data: tasks,
  };
});

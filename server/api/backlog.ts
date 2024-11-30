import davClient from "~/utils/davClient";
import { parseTask } from "~/utils/parseTasks";

export default defineEventHandler(async () => {
  const rawTasks = await davClient().getTasks();
  const tasks: Task[] = rawTasks.map(parseTask);

  return {
    data: tasks,
  };
});

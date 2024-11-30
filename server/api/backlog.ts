import davClient from "~/utils/davClient";
import { parseTodo } from "~/utils/parseTodo";

export default defineEventHandler(async () => {
  const rawTodos = await davClient().getTodos();
  const todos: Todo[] = rawTodos.map(parseTodo);

  return {
    data: todos,
  };
});

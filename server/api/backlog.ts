import davClient from "~/utils/davClient";

export default defineEventHandler(async () => {
  const todos = await davClient().getTodos();

  return {
    data: todos,
  };
});

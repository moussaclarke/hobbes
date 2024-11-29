import { createDAVClient, getBasicAuthHeaders } from "tsdav";
import davClient from "~/utils/davClient";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const todos = await davClient().getTodos();

  return {
    data: todos
  }
});

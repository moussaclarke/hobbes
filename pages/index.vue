<template>
  <div class="box stack flow">
    <h1>{{ filter }} Tasks</h1>
    <div class="cluster">
      <button class="button vibrant small" @click="filter = 'All'">All</button>
      <button class="button secondary small" @click="filter = 'Todo'">
        Todo
      </button>
      <button class="button secondary small" @click="filter = 'Done'">
        Done
      </button>
    </div>
    <div class="grid constrained">
      <TaskCard v-for="task in filteredData" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch("/api/backlog");
const filter: Ref<"All" | "Todo" | "Done"> = ref("All");
const filteredData = computed(() => {
  if (filter.value === "All") {
    return data.value.data;
  }

  if (filter.value === "Todo") {
    return data.value.data.filter((task) => {
      return task.status !== "COMPLETED" && task.status !== "CANCELLED";
    });
  }

  return data.value.data.filter((task) => {
    return task.status === "COMPLETED" || task.status === "CANCELLED";
  });
});
</script>

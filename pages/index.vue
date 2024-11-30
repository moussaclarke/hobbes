<template>
  <div class="box stack flow">
    <div class="stack">
      <h1>{{ statusFilter }} Tasks</h1>
      <h2 class="large primary">
        {{ categoryFilter ? `${categoryFilter}` : "All categories" }}
      </h2>
    </div>
    <div class="cluster">
      <button class="button vibrant small" @click="statusFilter = 'All'">
        All
      </button>
      <button class="button secondary small" @click="statusFilter = 'Todo'">
        Todo
      </button>
      <button class="button secondary small" @click="statusFilter = 'Done'">
        Done
      </button>
    </div>
    <div class="cluster">
      <CategoryTag
        v-for="category in categories"
        :key="category"
        :category="category"
        :selected="categoryFilter === category"
        @click="categoryFilter = category"
      />
      <CategoryTag key="All" category="All" @click="categoryFilter = null" />
    </div>
    <div class="grid constrained">
      <TaskCard v-for="task in filteredData" :key="task.id" :task="task" />
      <div v-if="filteredData.length === 0" class="box">
        <p>No tasks found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch("/api/backlog");
const statusFilter: Ref<"All" | "Todo" | "Done"> = ref("All");
const categories = computed(() => [
  ...new Set(
    data.value.data.reduce((acc, curr) => {
      return [...acc, ...curr.categories];
    }, []),
  ),
]);
const categoryFilter: Ref<string | null> = ref(null);
const filteredData = computed(() => {
  let filtered = data.value?.data;

  // Apply status filter
  if (statusFilter.value !== "All") {
    filtered = filtered.filter((task) => {
      if (statusFilter.value === "Todo") {
        return task.status !== "COMPLETED" && task.status !== "CANCELLED";
      } else {
        return task.status === "COMPLETED" || task.status === "CANCELLED";
      }
    });
  }

  // Apply category filter if one is selected
  if (categoryFilter.value) {
    filtered = filtered.filter((task) => {
      return task.categories.includes(categoryFilter.value);
    });
  }

  return filtered;
});
</script>

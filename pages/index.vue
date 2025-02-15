<template>
  <div class="box stack flow">
    <div class="stack">
      <div class="cluster | justify-between">
        <div class="stack">
          <h1>{{ statusFilter }} Tasks</h1>
          <h2 class="large primary">
            {{ categoryFilter ? `${categoryFilter}` : "All categories" }}
          </h2>
        </div>
        <SearchBox @closePanel="closePanel" />
      </div>
    </div>
    <div class="cluster">
      <button
        :class="
          'button secondary small' +
          (statusFilter === 'Todo' ? ' selected' : '')
        "
        @click="statusFilter = 'Todo'"
      >
        Todo
      </button>
      <button
        :class="
          'button secondary small' +
          (statusFilter === 'Done' ? ' selected' : '')
        "
        @click="statusFilter = 'Done'"
      >
        Done
      </button>
      <button
        :class="
          'button vibrant small' + (statusFilter === 'All' ? ' selected' : '')
        "
        @click="statusFilter = 'All'"
      >
        All
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
      <CategoryTag
        key="All"
        category="All"
        @click="categoryFilter = null"
        :selected="!categoryFilter"
      />
    </div>
    <div class="muted medium" v-if="filteredData.length === 0">
      No tasks found with these criteria
    </div>
    <div v-else class="muted medium">
      Showing {{ filteredData.length }} task{{
        filteredData.length === 1 ? "" : "s"
      }}
    </div>
    <div class="grid constrained">
      <TaskCard
        @openFull="openFull"
        v-for="task in filteredData"
        :key="task.id"
        :task="task"
      />
      <TaskPanel
        v-if="showingPanel"
        :task="panelTask"
        @closePanel="closePanel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Hobbes | Task List",
});
const { data } = await useFetch("/api/tasks");
const taskData = ref(data.value?.data);
provide("taskData", taskData);

const statusFilter: Ref<"All" | "Todo" | "Done"> = ref("Todo");
const categories = computed(() => [
  ...new Set(
    data.value.data.reduce((acc, curr) => {
      return [...acc, ...curr.categories];
    }, []),
  ),
]);

const showingPanel = ref(false);
const panelTask = ref<Task | null>(null);
const openFull = (task: Task) => {
  showingPanel.value = true;
  panelTask.value = task;
};
provide("openFull", openFull);
const closePanel = () => {
  showingPanel.value = false;
  panelTask.value = null;
};

const categoryFilter: Ref<string | null> = ref(null);
const filteredData = computed(() => {
  let filtered = taskData.value || [];

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

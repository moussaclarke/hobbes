<template>
  <div class="stack flow">
    <div class="cluster">
      <CategoryTag
        v-for="category in props.task?.categories"
        :key="category"
        :category="category"
      />
    </div>
    <div class="stack text-right border-t border-x-0 border-solid py-1">
      <strong class="x-small">
        {{ status }}
      </strong>
      <span class="x-small">
        Created: {{ taskWithDates?.created.toLocaleDateString() }}
      </span>
      <span class="x-small">
        Last modified: {{ taskWithDates?.lastModified.toLocaleDateString() }}
      </span>
      <span class="x-small" v-if="taskWithDates?.organizer">
        Opened by: {{ taskWithDates?.organizer }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ task: Task | null }>();
const taskWithDates = props.task && useTaskDates(props.task);

const statusFormatters = {
  COMPLETED: (task: Task) =>
    `Marked as completed on ${task.completed?.toLocaleDateString()}`,
  CANCELLED: () => "This task was cancelled",
  "NEEDS-ACTION": () => "This task is open",
  "IN-PROCESS": () => "This task is in progress",
};

const status = computed(() => {
  if (!props.task?.status) {
    return "No status assigned";
  }

  const formatter = statusFormatters[props.task.status];
  if (formatter && taskWithDates) {
    return formatter(taskWithDates);
  }
  return props.task.status;
});
</script>

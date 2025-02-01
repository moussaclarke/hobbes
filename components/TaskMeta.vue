<template>
  <div class="stack flow">
    <div class="cluster">
      <CategoryTag
        v-for="category in props.task?.categories"
        :key="category"
        :category="category"
      />
    </div>
    <div class="cluster justify-between border-t border-x-0 border-solid py-1">
      <div>
        {{ emoji }}
      </div>
      <div class="stack text-right">
        <strong class="x-small">
          {{ status }}
        </strong>
        <span class="x-small" v-if="priority">
          Priority: {{ priority.label }} {{ priority.emoji }}
        </span>
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
  </div>
</template>
<script setup lang="ts">
import { getStatusEmoji } from "../utils/taskStatuses";
import { getPriority } from "~/utils/taskPriorities";
const props = defineProps<{ task: Task | null }>();
const taskWithDates = computed(() => props.task && setTaskDates(props.task));

const statusFormatters = {
  COMPLETED: (task: Task) =>
    `Marked as completed on ${task.completed?.toLocaleDateString()}`,
  CANCELLED: () => "This task was cancelled",
  "NEEDS-ACTION": () => "This task might be worked on in future",
  "IN-PROCESS": () => "This task is scheduled or in progress",
};

const status = computed(() => {
  if (!props.task?.status) {
    return "This task needs assessing";
  }

  const formatter = statusFormatters[props.task.status];
  if (formatter && taskWithDates.value) {
    return formatter(taskWithDates.value);
  }
  return props.task.status;
});

const priority = computed(() => getPriority(props.task?.priority));

const emoji = computed(() => getStatusEmoji(props.task?.status));
</script>

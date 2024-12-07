<template>
  <div
    class="stack flow justify-between box border border-solid border-primary rounded"
  >
    <div class="task | stack flow">
      <h2 class="medium primary">{{ props.task.summary }}</h2>
      <div
        class="description | small stack flow"
        v-html="description.content"
      />
      <div
        v-if="description.comments.length"
        class="comments | small stack flow"
      >
        <h3>Updates</h3>
        <TaskComment
          v-for="comment in description.comments"
          :key="comment.id"
          :user="comment.user"
          :timestamp="comment.timestamp"
          :content="comment.content"
        />
      </div>
    </div>
    <div class="stack flow">
      <div class="cluster">
        <CategoryTag
          v-for="category in props.task.categories"
          :key="category"
          :category="category"
        />
      </div>
      <div class="stack text-right border-t border-x-0 border-solid py-1">
        <strong class="x-small">
          {{ status }}
        </strong>
        <span class="x-small">
          Created: {{ taskWithDates.created.toLocaleDateString() }}
        </span>
        <span class="x-small">
          Last modified: {{ taskWithDates.lastModified.toLocaleDateString() }}
        </span>
        <span class="x-small" v-if="taskWithDates.organizer">
          Opened by: {{ taskWithDates.organizer }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDescriptionRenderer } from "~/composables/useDescriptionRenderer";
const props = defineProps<{ task: Task }>();
const taskWithDates = useTaskDates(props.task);
const { render } = useDescriptionRenderer();

const description = computed(() => {
  if (!props.task.description) return { content: "", comments: [] };
  return render(props.task.description);
});

const statusFormatters = {
  COMPLETED: (task: Task) =>
    `Marked as completed on ${task.completed?.toLocaleDateString()}`,
  CANCELLED: () => "This task was cancelled",
  "NEEDS-ACTION": () => "This task is open",
  "IN-PROCESS": () => "This task is in progress",
};

const status = computed(() => {
  if (!props.task.status) {
    return "No status assigned";
  }

  const formatter = statusFormatters[props.task.status];
  if (formatter) {
    return formatter(taskWithDates);
  }
  return props.task.status;
});
</script>

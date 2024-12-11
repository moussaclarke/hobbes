<template>
  <div class="panel | stack flow box">
    <div class="flex justify-end">
      <span class="pointer" @click="$emit('closePanel')">X</span>
    </div>
    <div class="task | stack flow">
      <h2 class="medium primary">{{ props.task?.summary }}</h2>
      <div
        class="description | small stack flow"
        v-html="description.content"
      />
      <div class="comments | small stack flow">
        <h3>Updates</h3>
        <TaskComment
          v-for="comment in description.comments"
          :key="comment.id"
          :user="comment.user"
          :timestamp="comment.timestamp"
          :content="comment.content"
        />
        <CommentInput :task="props.task" />
      </div>
    </div>
    <TaskMeta :task="props.task" />
  </div>
</template>
<script setup lang="ts">
import { useDescriptionRenderer } from "~/composables/useDescriptionRenderer";
const props = defineProps<{ task: Task | null }>();
const { render } = useDescriptionRenderer();
const emit = defineEmits(["closePanel"]);

const description = computed(() => {
  if (!props.task?.description) return { content: "", comments: [] };
  return render(props.task.description);
});

const escapePanel = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    emit("closePanel");
  }
};

onMounted(() => {
  document.addEventListener("keydown", escapePanel);
});

onUnmounted(() => {
  document.removeEventListener("keydown", escapePanel);
});
</script>

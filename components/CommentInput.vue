<template>
  <form class="stack flow" @submit.prevent="addComment">
    <div class="form-group">
      <textarea
        v-model="comment"
        class="w-full"
        placeholder="Add a comment..."
        required
      />
    </div>
    <button :disabled="disabled" class="button">Add Comment</button>
  </form>
</template>
<script setup lang="ts">
const props = defineProps<{ task: Task }>();

const comment = ref("");
const disabled = ref(false);
const taskData = inject("taskData") as Ref<Task[]>;
const openFull = inject("openFull") as (task: Task) => void;

const addComment = async () => {
  disabled.value = true;
  const res = await $fetch("/api/comment", {
    method: "POST",
    body: {
      taskId: props.task.id,
      content: comment.value,
    },
  });
  // get the task index
  const index = taskData.value.findIndex((task) => task.id === props.task.id);
  if (index !== -1 && res.success) {
    const taskWithDates = useTaskDates(res.data);
    taskData.value.splice(index, 1, taskWithDates);
    openFull(taskWithDates);
  }
  disabled.value = false;
};
</script>

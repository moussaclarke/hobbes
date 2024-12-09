<template>
  <div class="stack flow">
    <div class="form-group">
      <textarea
        v-model="comment"
        class="w-full"
        placeholder="Add a comment..."
      />
    </div>
    <button class="button" @click="addComment">Add Comment</button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ task: Task }>();

const comment = ref("");

const addComment = async () => {
  // todo
  console.log("add comment for task", props.task.id);
  const res = await $fetch("/api/comment", {
    method: "POST",
    body: {
      taskId: props.task.id,
      content: comment.value,
    },
  });

  console.log(res);
};
</script>

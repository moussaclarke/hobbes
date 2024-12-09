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
    <button class="button">Add Comment</button>
  </form>
</template>
<script setup lang="ts">
const props = defineProps<{ task: Task }>();

const comment = ref("");

const addComment = async () => {
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

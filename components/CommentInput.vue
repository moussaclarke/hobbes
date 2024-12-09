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

const addComment = async () => {
  disabled.value = true;
  const res = await $fetch("/api/comment", {
    method: "POST",
    body: {
      taskId: props.task.id,
      content: comment.value,
    },
  });
  disabled.value = false;
  console.log(res);
};
</script>

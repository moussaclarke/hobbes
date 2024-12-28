<template>
  <div
    class="stack flow justify-between box border border-solid border-primary rounded pointer"
    @click="$emit('openFull', props.task)"
    tabindex="0"
    @keydown.enter="$emit('openFull', props.task)"
  >
    <div class="task | stack flow">
      <TaskTitle :summary="props.task.summary" />
      <div
        class="description | small stack flow"
        v-html="description.truncatedContent"
      />
      <div v-if="description.comments.length">
        <span class="large"> ✉️</span>
        <sup class="x-small bg-info inverse rounded-full p-1">{{
          description.comments.length
        }}</sup>
      </div>
    </div>
    <TaskMeta :task="props.task" />
  </div>
</template>
<script setup lang="ts">
import { render } from "~/utils/descriptionRenderer";
const props = defineProps<{ task: Task }>();

const description = computed(() => {
  if (!props.task.description)
    return { content: "", truncatedContent: "", comments: [] };
  return render(props.task.description);
});
</script>

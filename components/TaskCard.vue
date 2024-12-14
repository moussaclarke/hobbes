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
    </div>
    <TaskMeta :task="props.task" />
  </div>
</template>
<script setup lang="ts">
import { useDescriptionRenderer } from "~/composables/useDescriptionRenderer";
const props = defineProps<{ task: Task }>();
const { render } = useDescriptionRenderer();

const description = computed(() => {
  if (!props.task.description)
    return { content: "", truncatedContent: "", comments: [] };
  return render(props.task.description);
});
</script>

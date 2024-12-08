<template>
  <div
    class="stack flow justify-between box border border-solid border-primary rounded pointer"
    @click="$emit('openFull', props.task)"
  >
    <div class="task | stack flow">
      <h2 class="medium primary">{{ props.task.summary }}</h2>
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

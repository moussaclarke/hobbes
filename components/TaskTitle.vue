<template>
  <div class="cluster justify-between">
    <h2 class="medium primary max-w-[85%]">{{ summary }}</h2>
    <span class="medium">{{ emoji }}</span>
  </div>
</template>
<script setup lang="ts">
import { getTaskTypeEmoji } from "../utils/taskTypes";
const props = defineProps<{ summary?: string }>();

// summary might start with Bug: or Change: etc
const emoji = computed(() => {
  const type = props.summary?.split(":")[0].toLowerCase() || "undefined";

  return getTaskTypeEmoji(type);
});
</script>

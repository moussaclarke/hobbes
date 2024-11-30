<template>
  <div class="stack flow box border border-solid border-primary rounded">
    <h2 class="medium primary">{{ props.task.summary }}</h2>
    <p class="small">{{ props.task.description }}</p>
    <div class="cluster">
      <CategoryTag
        v-for="category in props.task.categories"
        :key="category"
        :category="category"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ task: Task }>();
</script>

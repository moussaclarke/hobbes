<template>
  <span class="badge bg-info">{{ props.category }}</span>
</template>
<script setup lang="ts">
const props = defineProps<{ category: string }>();
</script>

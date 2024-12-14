<template>
  <span
    :class="'badge pointer ' + (props.selected ? 'selected' : '')"
    :style="{ backgroundColor: backgroundColor }"
    >{{ category }}</span
  >
</template>
<script setup lang="ts">
const props = defineProps<{ category: string; selected?: boolean }>();

const backgroundColor = computed(() => {
  // Generate a hash from the category string
  const str = props.category.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to HSL (Hue, Saturation, Lightness)
  const hue = 180 - Math.abs(hash % 360); // 0-360
  const saturation = props.selected ? 100 : 50;
  const lightness = 35;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
});
</script>

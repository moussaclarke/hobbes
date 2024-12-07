<template>
  <div class="comment">
    <span class="user"> @{{ user }} </span>
    <span class="timestamp">
      {{ timestamp }}
    </span>
    <div class="content | stack flow" v-html="content" />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  user: string;
  timestamp: string;
  content: string;
}>();
</script>

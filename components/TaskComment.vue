<template>
  <div class="comment | stack flow">
    <div class="cluster">
      <span class="user"> 👤 @{{ user }} </span>
      <span class="timestamp">
        {{ timestamp }}
      </span>
    </div>
    <div class="content | prose stack flow" v-html="content" />
  </div>
</template>
<script setup lang="ts">
defineProps<{
  user: string;
  timestamp: string;
  content: string;
}>();
</script>

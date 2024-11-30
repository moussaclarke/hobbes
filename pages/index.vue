<template>
  <div class="box">
    <h1>All Tasks</h1>
    <div class="grid">
      <TaskCard v-for="task in data.data" :key="task.id" :task="task" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch("/api/backlog");
</script>

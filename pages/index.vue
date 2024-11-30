<template>
  <div class="container">
    <h1>Hello World</h1>
    <ul>
      <li v-for="task in data.data" :key="task.id">
        {{ task.summary }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch("/api/backlog");
</script>

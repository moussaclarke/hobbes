<template>
  <nav class="py-1em bg-inverse w-full sticky top-0 z-2">
    <div class="container cluster justify-between">
      <NuxtLink to="/">Project Management - {{ projectName }}</NuxtLink>
      <div class="cluster">
        <NuxtLink to="/">Task List</NuxtLink>
        <NuxtLink to="/form">Open an Issue</NuxtLink>
      </div>
    </div>
  </nav>
</template>
<script setup lang="ts">
const projectName = useRuntimeConfig().public.davCalName;
</script>

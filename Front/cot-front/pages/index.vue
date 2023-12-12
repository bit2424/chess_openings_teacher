<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="main-container">
    <h1>Nuxt Routing set up successfully!</h1>
    <p>Current route: {{ route.path }}</p>
    <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a>
  </div>
</template>

<style>
  .center-container {
    display: flex;
    justify-content: center;
    align-items: center;
    /* height: 100vh; Set the container to 100% of the viewport height */
    width:100vw;
  }
</style>

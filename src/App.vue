<script setup lang="ts">
import ChatbotWidget from './components/ChatbotWidget.vue'
</script>

<template>
  <router-view />
  <ChatbotWidget />
</template>

<style>
/* Estilos globales básicos */
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #f8fafc;
}
</style>
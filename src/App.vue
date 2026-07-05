<script setup lang="ts">
import ChatbotWidget from './components/ChatbotWidget.vue'
import AvisoFlotante from './components/AvisoFlotante.vue'
</script>

<template>
  <router-view />
  <ChatbotWidget />
  <AvisoFlotante />
</template>

<style>
/* Estilos globales básicos */
body {
  margin: 0;
  font-family: sans-serif;
  background-color: #f8fafc;
}
</style>
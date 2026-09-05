<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3 flex gap-8">
        <router-link to="/" class="text-lg font-bold text-blue-600">
          Alert System
        </router-link>
        <router-link to="/alerts" class="text-sm font-medium text-gray-600 hover:text-gray-900">
          My Alerts
        </router-link>
        <router-link to="/news" class="text-sm font-medium text-gray-600 hover:text-gray-900">
          News Feed
        </router-link>
        <router-link to="/admin" class="text-sm font-medium text-gray-600 hover:text-gray-900">
          Admin
        </router-link>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto py-12 px-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>

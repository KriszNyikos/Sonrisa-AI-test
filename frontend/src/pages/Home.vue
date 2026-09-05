<template>
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Alert System</h1>
    <p class="text-lg text-gray-600 mb-8">
      Get notified about important events via email and Slack
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <router-link
        to="/alerts"
        class="p-6 bg-white rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
      >
        <h2 class="text-xl font-semibold text-blue-600 mb-2">My Alerts</h2>
        <p class="text-gray-600">Create and manage your notification alerts</p>
      </router-link>
      <router-link
        to="/news"
        class="p-6 bg-white rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
      >
        <h2 class="text-xl font-semibold text-green-600 mb-2">News Feed</h2>
        <p class="text-gray-600">View breaking news, market movements, and more</p>
      </router-link>
      <router-link
        to="/admin"
        class="p-6 bg-white rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
      >
        <h2 class="text-xl font-semibold text-purple-600 mb-2">Admin</h2>
        <p class="text-gray-600">Monitor system status and notifications</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

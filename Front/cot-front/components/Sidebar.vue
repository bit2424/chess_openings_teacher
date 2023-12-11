<template>
    <aside class="sidebar">
      <nav>
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.text" class="nav-item">
            <NuxtLink :to="item.link" class="n-link-base">
              <span class="icon">{{ item.icon }}</span>
              <span class="text">{{ item.text }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script>
  export default {
    name: 'SidebarNav',
    data() {
      return {
        navItems: [
          { icon: '🏠', text: 'Home', link: '/' },
          { icon: '🧩', text: 'Train', link: '/game' },
          { icon: '📚', text: 'Learn', link: '/learn' },
        ]
      };
    }
  }
  </script>
  
  <style scoped>
  .sidebar {
    width: 200px;
    height: 100vh;
    background-color: #333;
    color: white;
    padding: 1rem;
  }
  
  .nav-list {
    list-style: none;
    padding: 0;
  }
  
  .nav-item {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }
  
  .nav-item a {
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
  }
  
  .icon {
    margin-right: 1rem;
  }
  
  .text {
    font-weight: bold;
  }
  </style>
  
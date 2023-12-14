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
    width: 10vw;
    height: 100vh;
    background-color: #1f2833;
    padding: 1rem;
    font-size: 1.2vw;
  }
  
  .nav-list {
    list-style: none;
    padding: 0;
  }
  
  .nav-item {
    background-color: #1f2833;
    border-radius: 4px;
    /* padding: 0.5rem 1rem; */
    margin-bottom: 0.5rem;
  }


  .nav-item a:hover .text{
    color: #2c3e50;
  }
  
  
  .nav-item a {
    text-decoration: none;
    display: flex;
    
    /* align-items: center; */
    color:#f5f5f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .nav-item a:hover {
    background-color: #f5f5f5;
  }
  
  .icon {
    margin-right: 0.5vw;
    color: #99aab5;
  }
  
  .text {
    font-weight: bold;
  }
  </style>
  
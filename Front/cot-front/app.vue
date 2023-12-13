<template>
  <div class="main-container">
    <Sidebar />
    <div class="content-container">
      <NuxtLoadingIndicator />
      <NuxtPage />
    </div>
  </div>
</template>

<script>
import Chessboard_with_API from '~/components/Chessboard_with_API.vue'
import ChatInterface from '../components/ChatInterface.vue';
import Sidebar from '../components/Sidebar.vue';

export default {
  components: {
    Chessboard_with_API,
    ChatInterface,
    Sidebar
  }
}
</script>

<style>
.content-container {
  /* display: flex;
  flex-direction: column; Aligns children vertically */
  justify-content: center;
  align-items: center;
  padding:1vw;
  width:100%;
  height: 100%;
  overflow-y: scroll;
}

.main-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 102vh;
}

</style>

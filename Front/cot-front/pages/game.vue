<template>
    <div>
        <div class="center-container">
          <div class="container">
            <div class="board-div">
              <Chessboard_with_API />
            </div>
            <div class="chat-div">
              <ChatInterface />
            </div>
          </div>
        </div>
    </div>
  </template>
  
  <script >
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
  .center-container {
    display: flex;
    justify-content: center;
    align-items: center;
    /* height: 100vh; Set the container to 100% of the viewport height */
    width:100vw;
  }
  
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    
  }
  
  .board-div{
    margin: 3vw;
    width: 100%;
    height: 100%;
    /* border: 1px solid red; */
  }
  
  .chat-div {
    margin: 3vw;
  }
  
  
  </style>
  
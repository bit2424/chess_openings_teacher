<template>
    <div class="chat">
  
      <!-- Chat header -->
      <div class="chat-header">
        <h2>Chat</h2>
      </div>
  
      <!-- Chat message container -->
      <div class="message-container">
      
        <!-- Individual message -->
        <div class="message">
          <p>Hello!</p>
        </div>
  
        <!-- Individual message -->
        <div class="message my-message">
          <p>Hi there!</p>
        </div>
  
      </div>
  
      <!-- Chat input -->
      <form class="chat-input">
        <input type="text" placeholder="Type message...">
        <button>Send</button>  
      </form>
  
    </div>
  </template>
  
  <script>
  export default {
    name: 'Chat'
  }
  </script>
  
  <style>
  /* Chat styles */
  </style>
  
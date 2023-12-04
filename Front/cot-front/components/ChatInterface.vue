<!-- components/Chat.vue -->
<template>
  <div class="chat">
    <div class="message-list">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <span v-if="message.type === 'user'">{{ message.user }}:</span>
        {{ message.text }}
      </div>
    </div>
    <div class="input-box">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />

      <button @click="sendMessage" class="opt-button" >
        <font-awesome-icon :icon="['fas', 'paper-plane']" />
      </button>

    </div>
  </div>
</template>

<script>

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';

library.add(faPaperPlane);

export default {
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      messages: [],
      newMessage: '',
    };
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        this.messages.push({
          type: 'user',
          user: 'You',
          text: this.newMessage.trim(),
        });
        this.newMessage = '';
      }
    },
  },
};
</script>

<style scoped>
.chat {
  max-width: 100%; /* Adjust the maximum width as needed */
  margin: auto;
  /* padding: 5vw; Adjust padding as a percentage of the viewport width */
}

.message-list {
  border: 2px solid #ccc;
  padding: 3vw; /* Adjust padding as a percentage of the viewport width */
  max-height: 60vh; /* Adjust the maximum height as needed */
  width:20vw;
  height:40vw;
  overflow-y: auto;
}

.message {
  margin-bottom: 1.5vw; /* Adjust margin as a percentage of the viewport width */
}

.input-box {
  margin-top: 3vw; /* Adjust margin as a percentage of the viewport width */
  display: flex;
}

input {
  flex: 1;
  /* padding: 2vw; Adjust padding as a percentage of the viewport width */
  margin-right: 0.5vw; /* Adjust margin as a percentage of the viewport width */
  width:10vw;
  height:4.5vw;
  font-size: 1.5vw;
}

button {
  /* padding: 2vw; Adjust padding as a percentage of the viewport width */
  width:5vw;
  height:5vw;
  font-size: 1.5vw;
}
</style>

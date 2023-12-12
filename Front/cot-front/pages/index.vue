<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="landing-page">

    
    <main>
      <div>
        <img src="your-image.png" alt="Project hero image" />
        <h1>Mini Chess Engine: Play & Learn with AI</h1>
        <p>Practice your openings, explore LLM technology, and hone your Vue.js skills.</p>
      </div>
      <h2>Features & Benefits</h2>
      <ul>
        <li>Play against a fully functional chess engine.</li>
        <li>Get move recommendations from a powerful language model.</li>
        <li>Learn from your mistakes and improve your opening strategy.</li>
        <li>Experience the power of AI in action.</li>
      </ul>

      <h2>How it Works</h2>
      <p>Simply start playing, and the LLM will analyze the board and suggest moves based on its knowledge and your playing style.</p>
      <ul>
        <li>Click on a piece to move it.</li>
        <li>The LLM will highlight its recommended move.</li>
        <li>You can choose to follow the recommendation or play your own move.</li>
      </ul>

      <h2>Your Learning Journey</h2>
      <p>This project is not just about playing chess, it's about learning and growing.</p>
      <ul>
        <li>Experiment with different strategies and see how the LLM reacts.</li>
        <li>Analyze your games and learn from your mistakes.</li>
        <li>Discover how AI can enhance your chess skills.</li>
      </ul>

      <h2>Start Playing Now!</h2>
      <!-- <button @click="playGame">Play Chess & Learn with AI</button> -->

      <a href="/learn-more">Learn More About the LLM Technology</a>
      <a href="/my-journey">Follow My AI & Vue.js Learning Journey</a>
    </main>

    <footer>
      <p>&copy; Your Name 2023</p>
    </footer>
  </div>
</template>



<style>
  .landing-page{
    /* display: flex; */
    justify-content: center;
    width:96w;
    height:100vh;
    margin:3vw;
  }
</style>

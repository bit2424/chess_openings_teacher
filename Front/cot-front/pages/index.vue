  <script setup lang="ts">
  const route = useRoute()
  </script>

  <template>
    <div class="landing-page">
      <main>
        <div>
          <img src="/images/banner.png" alt="banner image" class="custom-image"/>
          <h1>Mini Chess Engine: Play & Learn with AI</h1>
          <!-- <p>Practice your openings knowledge</p> -->
        </div>
        <div class="features-section">
          <h3>Features & Benefits</h3>
          <ul>
            <li>Play against an LLM-powered chess engine tailored to adjust to different openings.</li>
            <li>You can also get move recommendations from the same engine.</li>
            <li>Learn from your mistakes and refine your opening strategy.</li>
          </ul>
        </div>


        <div class="how-it-works-section">
          <h3>How it Works</h3>
          <p>You can start playing, and the LLM analyzes the board, suggesting moves based on its knowledge and your chat input.</p>
          <ul>
            <li>Click a piece to move it.</li>
            <li>The LLM highlights its recommended move.</li>
            <li>Interact with the chat interface to adjust the move recommendation based on the opening you want to practice.</li>
            <li>Follow the recommendations or play your own move.</li>
            <li>Let the LLM make the opponent's move automatically or play them yourself.</li>
          </ul>
        </div>


        <div class="tech-stack-section">
          <h3>Tech Stack</h3>
          <p>This project is not just about playing chess, is also a passion project to help hone and showcase my skills. Here are the technologies I used:</p>
          <ul>
            <li>
              Front (Nuxt3): Handles UI and API interaction.
              <a href="https://github.com/bit2424/chess_openings_teacher/tree/main/Front">Front code repository.</a>
            </li>
            <li>
              Backend (FastAPI): Runs game logic, interacts with LLMs, and provides API access.
              <a href="https://github.com/bit2424/chess_openings_teacher/tree/main/BE">Backend code repository.</a>
            </li>
            <li>
              ML (Pytorch): Houses pre-trained LLM models, training data, and training algorithms.
              <a href="https://github.com/bit2424/chess_openings_teacher/tree/main/ML"> Training algorithms repository</a>,
              <a href="https://huggingface.co/nelson2424/distilroberta-base-finetuned-cot"> Model repository</a>,
              <a href="https://huggingface.co/datasets/nelson2424/Chess_openings_dataset"> Dataset repository</a>.
            </li>
            <li>Docker: To help me build and deploy the previous systems easily.</li>
          </ul>
        </div>


        <div class="cta-section">
          <NuxtLink :to="'/game'" class="n-link-base">
            Start Playing Now!
          </NuxtLink>
        </div>

      </main>

      <!-- <footer>
        <p>&copy; Your Name 2023</p>
      </footer> -->
    </div>
  </template>



  <style>

    body {
      font-family: Arial, sans-serif;
      /* color: #fff; */
      background-color: #2c3e50;
      margin: 0;
      padding: 0;
    }
    .custom-image {
      width: 80vw;
      height: 20vw;
    }

    a {
      color: #fff;
      text-decoration: none;
    }

    li {
      margin-bottom: 0.5rem;
    }

    .landing-page {
      justify-content: center;
      width:96w;
      margin:2vw;
    }

    main {
      display: flex;
      flex-direction: column;
      color: #f5f5f5;
    }

    .n-link-base {
      display: inline-block;
      padding: 0.5rem 1rem;
      border: 1px solid #fff;
      border-radius: 5px;
      font-weight: bold;
    }

    .n-link-base:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .features-section {
      padding: 1rem;
      border-bottom: 1px solid #ddd;
    }

    h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .how-it-works-section li {
      margin-left: 1rem;
      list-style: decimal;
      margin-bottom: 0.5rem;
    }

    .tech-stack-section ul li,
    .features-section ul li {
      list-style: inside;
      margin-bottom: 0.5rem;
    }

    .how-it-works-section {
      padding: 1rem;
      border-bottom: 1px solid #ddd;
    }

    .how-it-works-section p {
      margin-bottom: 1rem;
    }

    .tech-stack-section {
      padding: 1rem;
      /* display: flex; */
      flex-wrap: nowrap; /* Single horizontal row */
      justify-content: flex-start; /* Align cards to left */
    }

    .how-it-works-section ul,
    .features-section ul{
      margin-right: 1rem; /* Spacing between cards */
      padding: 1rem;
      border-radius: 5px; /* Rounded corners */
      background-color: #46617b; /* Slightly different background */
    }

    .tech-stack-section li {
      margin-right: 1rem; /* Spacing between cards */
      padding: 1rem;
      border-radius: 5px; /* Rounded corners */
      background-color: #46617b; /* Slightly different background */
    }

    .tech-stack-section li img {
      width: 50px; /* Consistent logo size */
      height: auto;
      margin-bottom: 0.5rem;
    }

    .tech-stack-section li h4 {
      font-size: 16px;
      margin-bottom: 0.5rem;
    }

    .tech-stack-section li p {  
      font-size: 14px;
      line-height: 1.5;
    }

    .tech-stack-section li a {
      color: #ffc107; /* Change the text color to a distinct one */
      text-decoration: none;
      transition: color 0.1s ease-in-out; /* Smooth transition effect on color change */
    }

    .tech-stack-section li a:hover {
      color: #ffea00; /* Change the text color on hover for emphasis */
      text-decoration: underline; /* Add an underline on hover */
    }


    .cta-section {
      padding: 1rem;
      text-align: center;
    }

    .cta-section p {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }


  </style>

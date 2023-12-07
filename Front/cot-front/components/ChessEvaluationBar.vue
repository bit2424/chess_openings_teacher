<template>
    <div class="vertical-chess-evaluation-bar">
      
      <div class="bar" :style="{ height: negativeHeight, backgroundColor: negativeColor }">
        <div class="evaluation-number" :class="{ 'top': evaluation >= 0, 'bottom': evaluation < 0 }">
          {{ evaluation }}
        </div>
      </div>

    </div>
  </template>
  
  <script>
  export default {
    props: {
      evaluation: {
        type: Number,
        required: true,
      },
      maxHeight: {
        type: Number,
        default: 200, // Adjust the default max height as needed
      },
      positiveColor: {
        type: String,
        default: "#4caf50", // Adjust the positive color as needed
      },
      negativeColor: {
        type: String,
        default: "#f44336", // Adjust the negative color as needed
      },
    },
    computed: {
      positiveHeight() {
        return this.evaluation >= 0 ? `${(this.evaluation / this.maxHeight) * 100}%` : "0";
      },
      negativeHeight() {
        return this.evaluation < 0 ? `${(Math.abs(this.evaluation) / this.maxHeight) * 100}%` : "0";
      },
    },
  };
  </script>
  
  <style scoped>
  .vertical-chess-evaluation-bar {
    width: 20px; /* Adjust the width as needed */
    height: 20vw; /* Adjust the height as needed */
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 0.1vw solid black;
  }
  
  .bar {
    width: 100%;
    flex-grow: 1;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }
  
  .evaluation-number {
    position: absolute;
    width: 100%;
    text-align: center;
    font-size: 12px; /* Adjust the font size as needed */
    font-weight: bold;
  }
  
  .top {
    
    top: 0;
  }
  
  .bottom {
    bottom: 0;
  }
  </style>
  
<template>
  <div class="evaluation-bar-container" v-if="boardOrientation == 0">
    <div class="evaluation-bar" :style="positiveBarStyle"> <div class="up-text"> {{ positiveText }}</div></div>
    <div class="evaluation-bar" :style="negativeBarStyle"> <div class="bottom-text">{{ negativeText }}</div></div>
  </div>
  
  
  <div class="evaluation-bar-container" v-if="boardOrientation == 1">
    <div class="evaluation-bar" :style="negativeBarStyle"> <div class="up-text">{{ negativeText }}</div></div>
    <div class="evaluation-bar" :style="positiveBarStyle"> <div class="bottom-text"> {{ positiveText }}</div></div>
  </div>

</template>

<script>
export default {
  name: 'ChessEvaluationBar',
  props: {
    score: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      default: 10
    },
    boardOrientation: {
      type: Number,
      default: 1
    }
  },
  computed: {
    positiveText(){
      if(this.score>=0)return this.score;
      return "";
    },
    negativeText(){
      if(this.score<0)return Math.abs(this.score);
      return "";
    },
    positiveBarStyle() {
      const positiveHeight = this.score >= 0 ? 50 + Math.min((this.score / this.maxScore) * 50, 50): 52 - Math.min((Math.abs(this.score) / this.maxScore) * 50, 50);
      return {
        height: `${positiveHeight}%`,
        backgroundColor: '#FFFFFF',
        color: '#000000',
      };
    },
    negativeBarStyle() {
      const negativeHeight = this.score < 0 ? 50 + Math.min(((Math.abs(this.score) / this.maxScore) * 50), 50): 52 - Math.min((Math.abs(this.score) / this.maxScore) * 50, 50);
      return {
        height: `${negativeHeight}%`,
        backgroundColor: '#777',
        color: '#FFFFFF',
        
      };
    }
  }
}
</script>

<style scoped>
.evaluation-bar-container {
  width: 2vw;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 38vw; 
  border:#000000 solid 1px;
}

.evaluation-bar {
  /* height: 100%; */
  width: 100%;
  transition: height 0.3s ease-in-out;
  font-family: Arial, sans-serif;
  font-size: 1.5vw;
  position:relative;
}

.up-text {
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
}

.bottom-text {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
}
</style>

<template>
  <div class="center-container">
    <div class="board-div">
      <Chessboard_with_API />
    </div>
  </div>
</template>

<script>
import Chessboard_with_API from '~/components/Chessboard_with_API.vue'

export default {
  components: {
    Chessboard_with_API
  }
}
</script>

<style>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Set the container to 100% of the viewport height */
}

.board-div {
  margin:20px;
}

</style>

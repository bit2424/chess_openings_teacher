<template>
  <div class="board-div">
    <Chessboard />
  </div>
  <div class="board-div">
    <Chessboard_with_API />
  </div>
</template>

<script>
import Chessboard from '~/components/Chessboard.vue'
import Chessboard_with_API from '~/components/Chessboard_with_API.vue'

export default {
  components: {
    Chessboard,
    Chessboard_with_API
  }
}
</script>

<style>
.board-div {
  margin: 50px; 
}
</style>

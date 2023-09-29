<!-- components/Chessboard.vue -->
<template>
    <div :class="`chessboard ${ isRotated ? '':'rotated-component' }`">
        <div
            v-for="col in 8"
            :key="`col-${col}`"
            class="chessboard-col"
            >
            <div
                v-for="row in 8"
                :key="`row-${row}`"
                :class="`tile ${((row + col) % 2 === 0) ? 'light' : 'dark'} ${`${selectedTile.join('-')}` === `${row}-${col}` ? 'selected' : ''} row-${row} col-${col}`"
                @click="handleTileClick(row, col)"
            >
                <!-- <ChessPiece :icon="['fas', 'chess-pawn']" /> -->
                <div v-if="chessboard[row-1][col-1] != 't'" class="piece"> <ChessPiece :icon="chessboard[row-1][col-1]" /> </div>
                
            </div>
        </div>

    </div>
  </template>
  
  <script>
  import ChessPiece from '../components/ChessPiece.vue';
  import { useChessBoardStore } from '@/store/chessboard_store';
  import { storeToRefs } from 'pinia';

  
  
  export default {
    name: 'Chessboard',
    components: {
      ChessPiece,
    },
    setup(){
      const chessboardStore = useChessBoardStore();
      const { chessboard,selectedTile,prevSelectedTile,lastSelectedType,isRotated,whiteTurn } = storeToRefs(chessboardStore);
      const { initialize, handlePieceMove} = (chessboardStore);
      // console.log(chessboard);
      initialize();
      //chessboardStore.initialize();
      return{ chessboard,selectedTile,prevSelectedTile,lastSelectedType,isRotated,whiteTurn,
              initialize,handlePieceMove};
    },
    data() {
    return {
    };
  },
  methods: {

    handleTileClick(row, col) {
      // Toggle selected tile on click
        if(this.selectedTile.join('-') == `${row}-${col}`){
          this.selectedTile = [-1,-1];
          this.prevSelectedTile = [-2,-2];
        }
        else{
          if(this.selectedTile[0] < 0){
            this.lastSelectedType = 't';
          }else{
            this.lastSelectedType = this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1];
          }
          this.prevSelectedTile = this.selectedTile;
          this.selectedTile = [row,col];
          
          if(this.lastSelectedType != 't'){
             this.handlePieceMove();
          }

        }
      
      console.log(["#####  ",this.lastSelectedType,this.prevSelectedTile.join('-'),this.selectedTile.join('-')]);
    },    

  },


  }
  </script>
  
  <style scoped>
    .chessboard {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(8, 1fr);
        width: 400px; /* Adjust the width as needed */
        height: 400px; /* Adjust the height as needed */
    }

    .tile {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border:2px solid transparent;
    }

    .light {
        background-color: #f0d9b5; /* Set a light color */
    }

    .dark {
        background-color: #b58863; /* Set a dark color */
    }

    .selected {
        border: 2px solid blue; /* Add a border to indicate selection */
    }

    .rotated-component {
      transform: rotate(180deg);
    }

  </style>
  
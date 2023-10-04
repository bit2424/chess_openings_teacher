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
                :class="`tile ${((row + col) % 2 === 0) ? 'light' : 'dark'} ${isSelected(row,col)} row-${row} col-${col}`"
                @click="handleTileClick(row, col)"
            >
                <div v-if="chessboard[row-1][col-1] == 't' && chessboard_piece_projection[row-1][col-1] === 'm'" :class="`${isHighlighted(row,col,'tile')}`" ></div>
                <div v-if="chessboard[row-1][col-1] != 't'"> <ChessPiece :class="`piece ${isHighlighted(row,col,'piece')}`" :icon="chessboard[row-1][col-1]" /> </div>
                
            </div>
        </div>

    </div>
  </template>
  
  <script>
  import ChessPiece from '../components/ChessPiece.vue';
  import { useChessBoardStore } from '@/store/chessboard_store';
  import { useHistoryStore } from '@/store/history_store';
  import { storeToRefs } from 'pinia';

  
  
  export default {
    name: 'Chessboard',
    components: {
      ChessPiece,
    },
    setup(){
      const chessboardStore = useChessBoardStore();
      const historyStore = useHistoryStore();
      const { chessboard,chessboard_piece_projection ,selectedTile,prevSelectedTile,lastSelectedType,isRotated,whiteTurn } = storeToRefs(chessboardStore);
      const { initialize, handlePieceMove, highlightPossibleMoves} = (chessboardStore);
      const { addMove } = (historyStore);
      // console.log(chessboard);
      initialize();
      //chessboardStore.initialize();
      return{ chessboard, chessboard_piece_projection, selectedTile,prevSelectedTile,lastSelectedType,isRotated,whiteTurn,
              initialize,handlePieceMove,highlightPossibleMoves};
    },
    data() {
    return {
    };
  },
  methods: {

    handleTileClick(row, col) {
      // Toggle selected tile on click
        if(this.chessboard[row-1][col-1]!='t'){
          this.highlightPossibleMoves(row-1,col-1);
        }

        if(this.selectedTile.join('-') == `${row}-${col}`){
          this.selectedTile = [-1,-1];
          this.prevSelectedTile = [-2,-2];
          this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
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
             let moved = this.handlePieceMove();
             if(moved){
              this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
             }
          }

        }
      
      console.log(["#####  ",this.lastSelectedType,this.prevSelectedTile.join('-'),this.selectedTile.join('-')]);
    },
    isSelected(row,col){
      if(this.selectedTile.join('-') === `${row}-${col}`){
        return 'selected';
      }else{
        return '';
      }
    },
    isHighlighted(row,col,type){
      if(this.chessboard_piece_projection[row-1][col-1] == 'm'){
        if(type == 'piece'){
          return 'highlight-piece';
        }else{
          return 'highlight';
        }
      }else{
        return '';
      }
    }    

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
        /* border: 4px solid #99B2DD; Add a border to indicate selection */
        background-color: #99B2DD;
    }

    .rotated-component {
      transform: rotate(180deg);
    }

    .highlight {
      /* position: absolute; */
      width: 10px;
      height: 10px;
      border-radius: 100%;
      /* background: rgba(141,128,173,0.8); */
      background: rgba(153,178,221,0.8);
    }

    .piece{
      top: 50%; 
      left: 50%;
      width: 25px;
      height: 25px;
      border: 3px;
      padding: 5px;
    }

    .highlight-piece{
      /* position:absolute; */
      width: 25px;
      height: 25px;
      border-radius: 100%;
      border: 3px solid #99B2DD;
      background: none;
    }

  </style>
  
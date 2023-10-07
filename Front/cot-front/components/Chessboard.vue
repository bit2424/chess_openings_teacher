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
                <div v-if="row == 8" :class=" `col_ids ${((row + col) % 2 === 0) ? `light_txt` : `dark_txt`} ` ">{{ col_ids[col-1] }}</div>
                
                <div v-if="col == 1" :class="`row_ids ${((row + col) % 2 === 0) ? `light_txt` : `dark_txt`}`">{{ row_ids[row-1] }}</div>

                <div v-if="chessboard[row-1][col-1] == 't' && chessboard_piece_projection[row-1][col-1] === 'm'" :class="`${isHighlighted(row,col,'tile')}`" ></div>
                
                <div v-if="chessboard[row-1][col-1] != 't'">
                   <ChessPiece :class="`piece ${isHighlighted(row,col,'piece')} ${isChecked(row,col)}`" :icon="chessboard[row-1][col-1]" />
                </div>

                <div v-if="promoting && isPromotedPawn(row,col)"><PromotionMenu/></div>
            </div>
        </div>

    </div>
  </template>
  
  <script>
  import ChessPiece from '../components/ChessPiece.vue';
  import PromotionMenu from '../components/PromotionMenu.vue';
  import { useChessBoardStore } from '@/store/chessboard_store';
  import { useHistoryStore } from '@/store/history_store';
  import { storeToRefs } from 'pinia';

  
  
  export default {
    name: 'Chessboard',
    components: {
      ChessPiece,
      PromotionMenu,
    },
    setup(){
      const chessboardStore = useChessBoardStore();
      const historyStore = useHistoryStore();
      const { chessboard,chessboard_piece_projection ,selectedTile,prevSelectedTile,lastSelectedType,isRotated,whiteTurn,promoting,inCheck,inCheckMate } = storeToRefs(chessboardStore);
      const { initialize, handlePieceMove, highlightPossibleMoves} = (chessboardStore);
      const { addMove,initialize_history } = (historyStore);
      initialize();
      initialize_history();
      //chessboardStore.initialize();
      return{ chessboard, chessboard_piece_projection, selectedTile,prevSelectedTile,lastSelectedType,isRotated,whiteTurn,promoting,inCheck,inCheckMate,
              initialize,handlePieceMove,highlightPossibleMoves};
    },
    data() {
    return {
      col_ids:['a','b','c','d','e','f','g','h','i'],
      row_ids:[1,2,3,4,5,6,7,8,9],
    };
  },
  methods: {

    handleTileClick(row, col) {
      // Toggle selected tile on click
        if(this.chessboard[row-1][col-1]!='t'){
          this.highlightPossibleMoves(row-1,col-1);
        }

        if(this.selectedTile.join('-') == `${row}-${col}` && !this.promoting){
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
        if(this.chessboard[row-1][col-1].includes('w') && this.whiteTurn){
          return 'selected';
        }
        if(this.chessboard[row-1][col-1].includes('b') && !this.whiteTurn){
          return 'selected';
        }
      }
      return '';
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
    },
    isChecked(row,col){
      
      if(this.inCheckMate == this.chessboard[row-1][col-1]){
        console.log("in check mate",this.inCheck,this.chessboard[row-1][col-1]);
        return 'checkMated';
      }
      if(this.inCheck == this.chessboard[row-1][col-1]){
        console.log("in check",this.inCheck,this.chessboard[row-1][col-1]);
        return 'checked';
      }

      return '';
    },
    isPromotedPawn(row,col){
      if((row == 8 || row == 1) && this.chessboard[row-1][col-1].includes('P')){
        return true;
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
        position: relative;
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

    .light_txt {
        /* background-color: #f0d9b5; Set a light color */
        color: #b58863;
        font-size: 100%;
    }

    .dark_txt {
        color: #f0d9b5; /* Set a dark color */
        font-size: 100%;
    }

    .row_ids {
      position: absolute;
      top: 0;
      left: 0;
    }

    .col_ids {
      position: absolute;
      bottom: 0;
      right: 0;
    }

    .selected {
        /* border: 4px solid #99B2DD; Add a border to indicate selection */
        background-color: #99B2DD;
    }

    .checked {
      width: 25px;
      height: 25px;
      border-radius: 100%;
      background-color: #99B2DD;

    }

    .checkMated {
      width: 25px;
      height: 25px;
      border-radius: 100%;
      background-color: #573280;
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
      position: relative;
      /* top: 50%; 
      left: 50%; */
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
  
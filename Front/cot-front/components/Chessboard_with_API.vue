<!-- components/Chessboard.vue -->
<template>

    <div class="chessboard-container">

      

      <div class="buttons-container">
        <button @click="resetGame()" class="opt-button" >
          <font-awesome-icon class="opt-button-content" :icon="['fas', 'trash-arrow-up']" />
        </button>
    
        <button @click="undoLastMove()" class="opt-button" >
          <font-awesome-icon class="opt-button-content" :icon="['fas', 'rotate-left']" />
        </button>
      </div>

      <div class="evaluation-container">
        <ChessEvaluationBar :score="evalBar" />
      </div>
  
      <!-- <button @click="invertBo()" class="opt-button" >
        <font-awesome-icon :icon="['fas', 'rotate-left']" />
      </button> -->
  
  
      <div :class="`chessboard ${ isRotated ? '':'rotated-component' }`">
          <div
              v-for="col in 8"
              :key="`col-${col}`"
              class="chessboard-col"
              >
              <div
                  v-for="row in 8"
                  :key="`row-${row}`"
                  :class="`tile ${((row + col) % 2 === 0) ? 'light' : 'dark'} ${getSelectedState(row,col)} row-${row} col-${col}`"
                  @click="handleTileClick(row, col)"
              >
                  <div v-if="row == 8" :class=" `col_ids ${((row + col) % 2 === 0) ? `light_txt` : `dark_txt`} ` ">{{ col_ids[col-1] }}</div>
                  
                  <div v-if="col == 1" :class="`row_ids ${((row + col) % 2 === 0) ? `light_txt` : `dark_txt`}`">{{ row_ids[row-1] }}</div>
  
                  <div v-if="chessboard[row-1][col-1] == 't' && chessboard_piece_projection[row-1][col-1].includes('m')" :class="`${getHighlightedClass(row,col,'tile')}`" ></div>
  
                  <div v-if="chessboard[row-1][col-1] != 't'">
                     <ChessPiece :class="`piece ${getHighlightedClass(row,col,'piece')} ${getCheckedInfo(row,col)}`" :icon="chessboard[row-1][col-1]" />
                  </div>
  
                  <div v-if="promoting && isThisCellPromoted(row,col)"><PromotionMenu/></div>
              </div>
          </div>
  
      </div>
    </div>

  </template>
  
<script>
  import ChessPiece from '../components/ChessPiece.vue';
  import PromotionMenu from '../components/PromotionMenu.vue';
  import ChessEvaluationBar from "@/components/ChessEvaluationBar.vue";
  import { useChessBoardStoreAPI } from '@/store/chessboard_store_API';
  import { useHistoryStore } from '@/store/history_store';
  import { storeToRefs } from 'pinia';
  import { icon, library } from '@fortawesome/fontawesome-svg-core';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import {faRotateLeft,faTrashArrowUp} from '@fortawesome/free-solid-svg-icons';

  library.add(faRotateLeft,faTrashArrowUp);

  
  
  export default {
    name: 'Chessboard_with_API',
    components: {
      ChessPiece,
      PromotionMenu,
      FontAwesomeIcon,
      ChessEvaluationBar
    },
    async setup(){
      const chessboardStore = useChessBoardStoreAPI();
      const { chessboard,chessboard_piece_projection ,selectedTile,prevSelectedTile,lastSelectedPiece,isRotated,whiteTurn,promoting,inCheck,inCheckMate } = storeToRefs(chessboardStore);
      const { initialize, handlePieceMove, highlightPossibleMoves,printMatrix,undoMove} = (chessboardStore);
      await initialize();
      //chessboardStore.initialize();
      return{ chessboard, chessboard_piece_projection, selectedTile,prevSelectedTile,lastSelectedPiece,isRotated,whiteTurn,promoting,inCheck,inCheckMate,
              initialize,handlePieceMove,highlightPossibleMoves,printMatrix,undoMove};
    },
    data() {
    return {
      col_ids:['a','b','c','d','e','f','g','h','i'],
      row_ids:[8,7,6,5,4,3,2,1],
      evalBar:10,
    };
  },
  methods: {

    async handleTileClick(row, col) {
      // Toggle selected tile on click
        if(this.chessboard[row-1][col-1]!='t'){
          await this.highlightPossibleMoves(row-1,col-1);
        }

        if(this.selectedTile.join('-') == `${row}-${col}`){
          this.selectedTile = [-1,-1];
          this.prevSelectedTile = [-2,-2];
          this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
        }
        else{

          if(this.selectedTile[0] < 0){
            this.lastSelectedPiece = 't';
          }else{
            this.lastSelectedPiece = this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1];
          }

          this.prevSelectedTile = this.selectedTile;
          this.selectedTile = [row,col];
          
          if(this.lastSelectedPiece != 't'){
             const moved = await this.handlePieceMove();
             if(moved){
              this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
             }
          }

        }
      
      console.log(["#####  ",this.lastSelectedPiece,this.prevSelectedTile.join('-'),this.selectedTile.join('-')]);
    },
    getSelectedState(row,col){
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
    getHighlightedClass(row,col,type){
      if(this.chessboard_piece_projection[row-1][col-1].includes('m')){
        if(type == 'piece'){
          if(this.chessboard_piece_projection[row-1][col-1] == 'bm'){
            return 'highlight-best-piece';
          }else{
            return 'highlight-piece';
          }
        }else{
          if(this.chessboard_piece_projection[row-1][col-1] == 'bm'){
            return 'best-move-highlight';
          }else{
            return 'move-highlight';
          }
        }
      }else{
        return '';
      }
    },
    isThisCellPromoted(row,col){
      if((row == 8 || row == 1) && this.selectedTile.join('-') === `${row}-${col}`){
        console.log("LOOOOOOL");
        return true;
      }
    },
    getCheckedInfo(row,col){
      
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
    undoLastMove(){
      this.undoMove();
    },
    resetGame(){
      this.initialize();
    }

  },


  }
  </script>
  
  <style scoped>

    :root {
      --tile-size: 4vw;
      --piece-size: 2vw;
    }
    
    .chessboard-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      /* margin: 2vw; */
    }

    .buttons-container {
      display: flex;
      /* height: 54vh; */
      flex-direction: column;
      align-items: center;
      margin: 2vw;
    }
    .chessboard {
      display: grid;
      grid-template-columns: repeat(8, 5vw);
      grid-template-rows: repeat(8, 5vw);
      /* width: 20vw; Adjust the width as a percentage of the viewport width */
      /* height: 20vw; Adjust the height as a percentage of the viewport width */
      /* max-width: 400px; Set a maximum width if needed */
      /* max-height: 400px; Set a maximum height if needed */
      margin: 2vw; /* Adjust the margin as a percentage of the viewport width */
    }

    .tile {
      position: relative;
      width: 5vw; /* Take up the full width of the parent container */
      height: 5vw; /* Take up the full height of the parent container */
      display: flex;
      justify-content: center;
      align-items: center;
      /* border: 0.5vw solid transparent; */
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
        font-size: 1.5vw;
        margin:0.15vw;
    }

    .dark_txt {
        color: #f0d9b5; /* Set a dark color */
        font-size: 1.5vw;
        margin:0.15vw;
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
        background-color: #246EB9;
    }

    .checked {
      width: 2vw;
      height: 2vw;
      border-radius: 100%;
      background-color: #931F1D;
    }

    .checkMated {
      width: 2vw;
      height: 2vw;
      border-radius: 100%;
      background-color: #931F1D;
    }

    .rotated-component {
      transform: rotate(180deg);
    }

    .move-highlight {
      /* position: absolute; */
      /* width: 0.9vw;
      height: 0.9vw; */
      /* border-radius: 100%; */
      /* background: rgba(141,128,173,0.8); */
      border: #246EB9 0.5vw solid;
      /* background: rgba(153,178,221,0.8); */
    }

    .best-move-highlight {
      /* position: absolute; */
      /* width: 0.9vw; */
      /* height: 0.9vw; */
      /* border-radius: 100%; */
      /* background: rgba(141,128,173,0.8); */
      /* background: rgba(167, 221, 153, 0.8); */
      border: #246EB9 0.5vw solid;
      animation: blink 1.5s ease-in-out infinite;
    }

    @keyframes blink {
      50% {
        opacity: 0;
      }
    }

    .piece{
      position: relative;
      width: 2.5vw;
      height: 2.5vw;
      border: 1vw;
      padding: 1vw;
    }

    .highlight-piece{
      /* position:absolute; */
      width: 2vw;
      height: 2vw;
      /* border-radius: 100%; */
      border: 3px solid #246EB9;
      background: none;
    }

    .highlight-best-piece{
      /* position:absolute; */
      width: 2vw;
      height: 2vw;
      /* border-radius: 100%; */
      border: 3px solid  #246EB9;
      background: none;
      animation: blink 1.5s ease-in-out infinite;
    }

    .opt-button{
      
      /* width: 3vw;
      height: 3vw; */
      padding: 1vw; /* Adjust the padding as a percentage of the viewport width*/
      margin-bottom: 1vw; 

      border: 0.3vw solid #246EB9;
      background: none;
      color: #246EB9;
      font-size: 100%;
      transition: background-color 0.2s;
    }

    .opt-button-content{
      /* position: absolute; */
      padding:1px;
      width: 1.5vw;
      height: 1.5vw;
    }

    .opt-button:hover {
      background-color: #246EB9;
      color: white;
    }

    .opt-button:active {
      background-color: #667d99;
    }

    .opt-button:hover, .opt-button:active {
      box-shadow: 0px 0px 5px rgba(0,0,0,0.2);
    }

  </style>
  
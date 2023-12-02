<template>
    <div :class="`menu`">
        <div
            v-for="col in 1"
            :key="`col-${col}`"
            class="col"
            >
            <div
                v-for="row in 4"
                :key="`row-${row}`"
                :class="`tile light row-${row} col-${col}`"
                @click="handleTileClick(row, col)"
            >
                <ChessPiece :class="`piece`" :icon="determinePiece(row,col)" />
            </div>
        </div>

    </div>
  </template>
  
  <script>
  import ChessPiece from '../components/ChessPiece.vue';
  import { useChessBoardStoreAPI } from '@/store/chessboard_store_API';
  import { useHistoryStore } from '@/store/history_store';
  import { storeToRefs } from 'pinia';

  
  
  export default {
    name: 'PromotionMenu',
    components: {
      ChessPiece,
    },
    setup(){
      const chessboardStore = useChessBoardStoreAPI();
      const { prevSelectedTile,selectedTile,whiteTurn,chessboard,promoting } = storeToRefs(chessboardStore);
      const { processMove} = (chessboardStore);
      //chessboardStore.initialize();
      return{selectedTile,prevSelectedTile,whiteTurn,chessboard,processMove,promoting};
    },
    data() {
    return {
    };
  },
  methods: {

    determinePiece(row,col){
        let piece = '';
        if(row == 1) piece += "Q";
        if(row == 2) piece += "N";
        if(row == 3) piece += "R";
        if(row == 4) piece += "B";
        if(this.whiteTurn){
            piece+="-w";
        }else{
            piece+="-b";
        }
        console.log(piece);
        return piece;
    },

    async handleTileClick(row, col) {
        console.log("promotingggg", row, col);
        let piece = '';
        if(row == 1) piece += "q";
        if(row == 2) piece += "n";
        if(row == 3) piece += "r";
        if(row == 4) piece += "b";
        
        await this.processMove(piece);
        this.promoting = false;
    }
  },


  }
  </script>
  
  <style scoped>
    .menu {
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 50%;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-template-rows: repeat(8, 1fr);
        width: 50px; /* Adjust the width as needed */
        height: 400px; /* Adjust the height as needed */
    }

    .tile {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border:1px solid black;
        padding:1px;
    }

    .selected {
        /* border: 4px solid #99B2DD; Add a border to indicate selection */
        background-color: #99B2DD;
    }

    .light {
        background-color: #f0d9b5; /* Set a light color */
    }

    .selected {
        /* border: 4px solid #99B2DD; Add a border to indicate selection */
        background-color: #99B2DD;
    }

  </style>
  
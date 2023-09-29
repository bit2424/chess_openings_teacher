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
  
  export default {
    name: 'Chessboard',
    components: {
      ChessPiece,
    },
    data() {
        
    return {
      selectedTile: [-1,-1], // Keep track of selected tile
      prevSelectedTile: [-2,-2],
      lastSelectedType: "tile",
      chessboard: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't')),
      isRotated: true,
      whiteTurn: true,
    };
  },
  created(){
    for (let i = 0; i < 8; i++) {
        this.chessboard[1][i] = 'P-w';
        this.chessboard[6][i] = 'P-b';
    }
    this.chessboard[0][0] = "R-w"; 
    this.chessboard[0][7] = "R-w"; 
     
    this.chessboard[7][0] = "R-b";
    this.chessboard[7][7] = "R-b";

    // this.chessboard[0][1] = "N-w"; 
    // this.chessboard[0][6] = "N-w"; 
     
    // this.chessboard[7][1] = "N-b";
    // this.chessboard[7][6] = "N-b";

    // this.chessboard[0][2] = "N-w"; 
    // this.chessboard[0][5] = "N-w"; 
     
    // this.chessboard[7][2] = "B-b";
    // this.chessboard[7][5] = "B-b";

    // this.chessboard[0][2] = "B-w"; 
    // this.chessboard[0][5] = "B-w"; 
     
    // this.chessboard[0][3] = "Q-w"; 
    // this.chessboard[0][4] = "K-w"; 

    // this.chessboard[7][3] = "Q-b"; 
    // this.chessboard[7][4] = "K-b"; 
     
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

    handlePieceMove() {
      // Logic to move the piece here
      if(this.whiteTurn && this.lastSelectedType.includes('b')) return
      if(!this.whiteTurn && this.lastSelectedType.includes('w')) return

      if (this.lastSelectedType.includes('P')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidPawnForwardMove(color) || this.checkValidPawnLateralMove(color));
        
        if(this.checkValidPawnForwardMove(color) || this.checkValidPawnLateralMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `P-${color}`;
          this.whiteTurn = !this.whiteTurn;
        }
      }

      if (this.lastSelectedType.includes('R')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidPawnForwardMove(color) || this.checkValidPawnLateralMove(color));
        
        if(this.checkValidPawnForwardMove(color) || this.checkValidPawnLateralMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `R-${color}`;
          this.whiteTurn = !this.whiteTurn;
        }
      }
    },
    checkValidPawnForwardMove(color){
      const rowDiff = this.selectedTile[0] - this.prevSelectedTile[0];
      const colDiff = this.selectedTile[1] - this.prevSelectedTile[1];

      console.log(rowDiff,colDiff,this.prevSelectedTile.join('-'));

      if(this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] != 't'){
        return false;
      }
      
      if (color === 'b') {
        // White pawn moves forward
        if (rowDiff === -1 && colDiff === 0) {
          return true;
        }
        if(this.prevSelectedTile[0] === 7 && rowDiff === -2 && colDiff === 0){
          return true;
        }

      } else if (color === 'w') {
        // Black pawn moves forward
        if (rowDiff === 1 && colDiff === 0) {
          return true;
        }
        if(this.prevSelectedTile[0] === 2 && rowDiff === 2 && colDiff === 0){
          return true;
        }
      }

      return false;
    },

    checkValidPawnLateralMove(color){
      const rowDiff = this.selectedTile[0] - this.prevSelectedTile[0];
      const colDiff = this.selectedTile[1] - this.prevSelectedTile[1];
      console.log(rowDiff,colDiff,this.prevSelectedTile.join('-'));

      if(this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] == 't'){
        return false;
      }

      
      if(this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1].includes(color)) return false;
      
      if (color === 'b') {
        // White pawn moves forward
        if (rowDiff === -1 && Math.abs(colDiff) === 1) {
          return true;
        }

      } else if (color === 'w') {
        // Black pawn moves forward
        if (rowDiff === 1 && Math.abs(colDiff) === 1) {
          return true;
        }
      }

      return false;
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
  
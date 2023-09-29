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

    this.chessboard[0][1] = "N-w"; 
    this.chessboard[0][6] = "N-w"; 
     
    this.chessboard[7][1] = "N-b";
    this.chessboard[7][6] = "N-b";

    this.chessboard[0][2] = "N-w"; 
    this.chessboard[0][5] = "N-w"; 
     
    this.chessboard[7][2] = "B-b";
    this.chessboard[7][5] = "B-b";

    this.chessboard[0][2] = "B-w"; 
    this.chessboard[0][5] = "B-w"; 
     
    this.chessboard[0][3] = "Q-w"; 
    this.chessboard[0][4] = "K-w";

    this.chessboard[7][3] = "Q-b";
    this.chessboard[7][4] = "K-b"; 
     
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
      // Logic to handle turns
      // if(this.whiteTurn && this.lastSelectedType.includes('b')) return
      // if(!this.whiteTurn && this.lastSelectedType.includes('w')) return
      
      // Logic to handle the pawns
      if (this.lastSelectedType.includes('P')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidPawnForwardMove(color) || this.checkValidPawnLateralMove(color));
        
        if(this.checkValidPawnForwardMove(color) || this.checkValidPawnLateralMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `P-${color}`;
          this.whiteTurn = !this.whiteTurn;
        }
      }

      //Logic to move the rook
      if (this.lastSelectedType.includes('R')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidRookMove(color));
        
        if(this.checkValidRookMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `R-${color}`;
          this.whiteTurn = !this.whiteTurn;
        }

        //Implement castling logic later
      }

      //Logic to move the Bishop
      if (this.lastSelectedType.includes('B')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidBishopMove(color));
        
        if(this.checkValidBishopMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `B-${color}`;
          this.whiteTurn = !this.whiteTurn;
        }
      }

      //Logic to move the Knight
      if (this.lastSelectedType.includes('N')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidKnightMove(color));
        
        if(this.checkValidKnightMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `N-${color}`;
          this.whiteTurn = !this.whiteTurn;
        }
      }

      //Logic to move the Queen
      if (this.lastSelectedType.includes('Q')) {
        const color = this.lastSelectedType.split('-')[1];
        console.log(this.checkValidQueenMove(color));
        
        if(this.checkValidQueenMove(color)){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `Q-${color}`;
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
      
      let expectedRowDiff = 0;
      if (color === 'b') expectedRowDiff = -1;
      if (color === 'w') expectedRowDiff = 1;

      if (rowDiff === expectedRowDiff && Math.abs(colDiff) === 1) {
        return true;
      }

      return false;
    },

    checkValidRookMove(color){
      if(this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1].includes(color)){
        return false;
      }

      const rowDiff = Math.abs(this.selectedTile[0] - this.prevSelectedTile[0]);
      const colDiff = Math.abs(this.selectedTile[1] - this.prevSelectedTile[1]);

      // Rooks can only move either horizontally or vertically
      if (rowDiff > 0 && colDiff > 0) {
        return false;
      }

      // Check if there are no pieces in the rook's path
      if (rowDiff > 0) {
        const startRow = Math.min(this.selectedTile[0], this.prevSelectedTile[0])-1;
        const endRow = Math.max(this.selectedTile[0], this.prevSelectedTile[0])-1;
        
        for (let i = startRow+1; i < endRow; i++) {
          if (this.chessboard[i][this.selectedTile[1] - 1] != 't') {
            return false;
          }
        }
      }

      if (colDiff > 0) {
        const startCol = Math.min(this.selectedTile[1], this.prevSelectedTile[1])-1;
        const endCol = Math.max(this.selectedTile[1], this.prevSelectedTile[1])-1;
        for (let j = startCol+1; j < endCol; j++) {
          if (this.chessboard[this.selectedTile[0] - 1][j] != 't') {
            return false;
          }
        }
      }

      return true;
    },

    checkValidBishopMove(color){
      if (this.chessboard[this.selectedTile[0] - 1][this.selectedTile[1] - 1].includes(color)) {
        return false;
      }
      const rowDiff = this.selectedTile[0] - this.prevSelectedTile[0];
      const colDiff = this.selectedTile[1] - this.prevSelectedTile[1];

      // Check if the move is diagonal
      if (Math.abs(rowDiff) !== Math.abs(colDiff)) {
        return false;
      }

      let startRow = this.prevSelectedTile[0]-1;
      let startCol = this.prevSelectedTile[1]-1;
      let endRow = this.selectedTile[0]-1;
      let endCol = this.selectedTile[1]-1;
      if(startRow>endRow){
        startRow = this.selectedTile[0]-1;
        startCol = this.selectedTile[1]-1;
        endRow = this.prevSelectedTile[0]-1;
        endCol = this.prevSelectedTile[1]-1;
      }
      console.log("Start ",startRow,startCol,endRow,endCol);

      if(rowDiff*colDiff>0){
        // Check if there are no pieces in the bishop's path
        for (let i = startRow + 1, j = startCol + 1; i < endRow; i++, j++) {
          console.log("Moves 1",i,j)
          if (this.chessboard[i][j] !== 't') {
            return false;
          }
        }
      }else{
        for (let i = startRow + 1, j = startCol - 1; i < endRow; i++, j--) {
          console.log("Moves 2",i,j)
          if (this.chessboard[i][j] !== 't') {
            return false;
          }
        }
      }

      return true;
    },

    checkValidKnightMove(color) {
      if (this.chessboard[this.selectedTile[0] - 1][this.selectedTile[1] - 1].includes(color)) {
        return false;
      }
  
      const rowDiff = Math.abs(this.selectedTile[0] - this.prevSelectedTile[0]);
      const colDiff = Math.abs(this.selectedTile[1] - this.prevSelectedTile[1]);
  
      console.log("Moves",rowDiff,colDiff);
      // Check that the move is in an L shape
      if((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        return true; 
      }
  
      return false;
    },

    checkValidQueenMove(color) {
      if (this.chessboard[this.selectedTile[0] - 1][this.selectedTile[1] - 1].includes(color)) {
        return false;
      }
  
      if(this.checkValidRookMove(color) || this.checkValidBishopMove(color)){
        return true;
      }
  
      return false;
    },
    checkValidKingMove(color) {
      if (this.chessboard[this.selectedTile[0]][this.selectedTile[1]].includes(color)) {
        return false; 
      }

      const rowDiff = Math.abs(this.selectedTile[0] - this.prevSelectedTile[0]);
      const colDiff = Math.abs(this.selectedTile[1] - this.prevSelectedTile[1]);

      // Check that the move is only 1 square in any direction
      if(rowDiff <= 1 && colDiff <= 1) { 
        return true;
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
  
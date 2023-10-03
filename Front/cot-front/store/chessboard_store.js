import { defineStore } from 'pinia'


export const useChessBoardStore = defineStore('chessBoardStore', {
    state: () => ({ 
        chessboard: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't')),
        chessboard_white_projection: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't')),
        chessboard_black_projection: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't')),
        chessboard_piece_projection: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't')),
        selectedTile: [-1,-1], // Keep track of selected tile
        prevSelectedTile: [-2,-2],
        lastSelectedType: "t",
        isRotated: true,
        whiteTurn: true,
    }),
  
    actions: {
      initialize(){
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
      handlePieceMove() {
        // Logic to handle turns
        // if(this.whiteTurn && this.lastSelectedType.includes('b')) return
        // if(!this.whiteTurn && this.lastSelectedType.includes('w')) return
        
        let color = this.lastSelectedType.split('-')[1];
        let pieceType = this.lastSelectedType.split('-')[0];
        let projected_squares = [];

        // Logic to move the pawns
        if (this.lastSelectedType.includes('P')) {
          projected_squares = this.projectPawnMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1);
        
        }
  
        //Logic to move the rook
        if (this.lastSelectedType.includes('R')) {
          projected_squares = this.projectRockMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);
        
          //Implement castling logic later
        }
  
        //Logic to move the Bishop
        if (this.lastSelectedType.includes('B')) {
          
          if(this.checkValidBishopMove(color)){
            this.movePiece(color,pieceType);
          }
        }
  
        //Logic to move the Knight
        if (this.lastSelectedType.includes('N')) {
          
          if(this.checkValidKnightMove(color)){
            this.movePiece(color,pieceType);
          }
        }
  
        //Logic to move the Queen
        if (this.lastSelectedType.includes('Q')) {
          if(this.checkValidQueenMove(color)){
            this.movePiece(color,pieceType);
          }
        }
  
        //Logic to move the King
        if (this.lastSelectedType.includes('K')) {
          if(this.checkValidKingMove(color)){
            this.movePiece(color,pieceType);
          }
        }

        console.log(projected_squares);
        for(let i = 0; i < projected_squares.length; i++){
          if(projected_squares[i][0]+1 == this.selectedTile[0] && projected_squares[i][1]+1 ==  this.selectedTile[1]){
            this.movePiece(color,pieceType);
          }
        }

      },
      movePiece(color, pieceType) {
        this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
        this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `${pieceType}-${color}`;
        this.whiteTurn = !this.whiteTurn;
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
            if (this.chessboard[i][j] !== 't') {
              return false;
            }
          }
        }else{
          for (let i = startRow + 1, j = startCol - 1; i < endRow; i++, j--) {
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
        if (this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1].includes(color)) {
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

       projectWholeBoardMoves(color){
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              if (this.chessboard[i][j].includes(color)) {
                
              }
            }
          }
          return whiteSquares;
       },

       projectSinglePieceMove(row,col){
        projected_squares = [];
        if(this.chessboard[row][col].includes('P')){
          projected_squares = this.projectPawnMove(row,col);
        }
        if(this.chessboard[row][col].includes('R')){

        }
        if(this.chessboard[row][col].includes('B')){

        }
        if(this.chessboard[row][col].includes('N')){

        }
        if(this.chessboard[row][col].includes('Q')){

        }
        if(this.chessboard[row][col].includes('K')){

        }
       },
       projectPawnMove(row,col){
        let projected_squares = [];

        if(this.chessboard[row][col].includes('b')){
          if(row-1==-1)return projected_squares;

          if(this.chessboard[row-1][col].includes('t')){
            projected_squares.push([row-1,col]);
          }
          if(row == 6 && this.chessboard[row-2][col].includes('t')){
            projected_squares.push([row-2,col]);
          }
          if(col != 0 && this.chessboard[row-1][col-1].includes('w')){
            projected_squares.push([row-1, col-1]); 
          }
          if(col != 7 && this.chessboard[row-1][col+1].includes('w')){
            projected_squares.push([row-1, col+1]);
          }
        }else{
          if(row+1==8)return projected_squares;

          if(this.chessboard[row+1][col].includes('t')){
            projected_squares.push([row+1,col]);
          }
          if(row == 1 && this.chessboard[row+2][col].includes('t')){
            projected_squares.push([row+2,col]);
          }
          if(col != 7 && this.chessboard[row+1][col+1].includes('b')){
            projected_squares.push([row+1, col+1]); 
          }
          if(col != 0 && this.chessboard[row+1][col-1].includes('b')){
            projected_squares.push([row+1, col-1]);
          }
        }
        
        return projected_squares;
       },
       projectRockMove(row,col,color){
        let projected_squares = [];
        let opposing_color = 'w';
        if(color === 'w'){
          opposing_color = 'b';
        }
        // Check left
        for(let c = col - 1; c >= 0; c--) {
          if(this.chessboard[row][c] === 't') {
            projected_squares.push([row, c]);
          } else if(this.chessboard[row][c].includes(opposing_color)) {
            projected_squares.push([row, c]);
            break;
          }else {
            break;
          }
        }

        // Check right 
        for(let c = col + 1; c < 8; c++) {
          if(this.chessboard[row][c] === 't') {
            projected_squares.push([row, c]);
          } else if(this.chessboard[row][c].includes(opposing_color)) {
            projected_squares.push([row, c]);
            break;
          }else {
            break;
          }
        }

        // Check up
        for(let r = row - 1; r >= 0; r--) {
          if(this.chessboard[r][col] === 't') {
            projected_squares.push([r, col]);
          } else if(this.chessboard[r][col].includes(opposing_color)) {
            projected_squares.push([r, col]);
            break;
          }else {
            break;
          }
        }

        // Check down
        for(let r = row + 1; r < 8; r++) {
          if(this.chessboard[r][col] === 't') {
            projected_squares.push([r, col]);
          } else if(this.chessboard[r][col].includes(opposing_color)) {
            projected_squares.push([r, col]);
            break;
          }else {
            break;
          }
        }

        return projected_squares;

       },

  
    }
  })
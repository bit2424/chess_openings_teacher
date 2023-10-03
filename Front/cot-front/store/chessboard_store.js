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
          projected_squares = this.projectBishopMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);
        }
  
        //Logic to move the Knight
        if (this.lastSelectedType.includes('N')) {
          projected_squares = this.projectKnightMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);
        }
  
        //Logic to move the Queen
        if (this.lastSelectedType.includes('Q')) {
          const rockMoves = this.projectRockMove(this.prevSelectedTile[0]-1, this.prevSelectedTile[1]-1, color);
          const bishopMoves = this.projectBishopMove(this.prevSelectedTile[0]-1, this.prevSelectedTile[1]-1, color);

          projected_squares.push(...rockMoves, ...bishopMoves);
        }
  
        //Logic to move the King
        if (this.lastSelectedType.includes('K')) {
          projected_squares = this.projectKingMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);
        }

        console.log(projected_squares);
        for(let i = 0; i < projected_squares.length; i++){
          if(projected_squares[i][0]+1 == this.selectedTile[0] && projected_squares[i][1]+1 ==  this.selectedTile[1]){
            this.movePiece(color,pieceType);
            break;
          }
        }

      },
      movePiece(color, pieceType) {
        let opposing_color = 'w';
        if(color === 'w'){
          opposing_color = 'b';
        }
        //Make the move
        this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
        this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `${pieceType}-${color}`;

        //Check for check
        this.projectWholeBoardMoves(opposing_color);
        let valid_move = false;
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (this.chessboard[i][j].includes('K') && this.chessboard[i][j].includes(color)) {
              if(color == 'w'){
                if (this.chessboard_black_projection[i][j]  == 't') {
                  valid_move = true;
                }

              }else{
                if (this.chessboard_white_projection[i][j]  == 't') {
                  valid_move = true;
                }
              }
              break;
            }
          }
        }
        
        if(valid_move){
          this.whiteTurn = !this.whiteTurn;
        }else{
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = `${pieceType}-${color}`;
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = 't';
        }
      },

      projectWholeBoardMoves(color){
        
        let projected_squares = [];
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (this.chessboard[i][j].includes(color)) {
              projected_squares.push(...this.projectSinglePieceMove(i,j,color));
            }
          }
        }
        if(color == 'w'){
          this.chessboard_white_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
          for (let i = 0; i < projected_squares.length; i++) {
            this.chessboard_white_projection[projected_squares[i][0]][projected_squares[i][1]] = 'a';
          }
          this.printMatrix(this.chessboard_white_projection);
        }else{
          this.chessboard_black_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
          for (let i = 0; i < projected_squares.length; i++) {
            this.chessboard_black_projection[projected_squares[i][0]][projected_squares[i][1]] = 'a';
          }
          this.printMatrix(this.chessboard_black_projection);
        }
      },
      printMatrix(matrix) {
        let str = '';
        for (let i = 0; i < matrix.length; i++) {
          for (let j = 0; j < matrix.length; j++) {
            str += matrix[i][j] +'';
          }
          str += '\n';
        }
        console.log(str);
      },
      projectSinglePieceMove(row,col,color){
        let projected_squares = [];
        if(this.chessboard[row][col].includes('P')){
          projected_squares = this.projectPawnMove(row,col);
        }
        if(this.chessboard[row][col].includes('R')){
          projected_squares = this.projectRockMove(row,col,color);
        }
        if(this.chessboard[row][col].includes('B')){
          projected_squares = this.projectBishopMove(row,col,color);
        }
        if(this.chessboard[row][col].includes('N')){
          projected_squares = this.projectKnightMove(row,col,color);
        }
        if(this.chessboard[row][col].includes('Q')){
          const rockMoves = this.projectRockMove(row, col, color);
          const bishopMoves = this.projectBishopMove(row, col, color);

          projected_squares.push(...rockMoves, ...bishopMoves);
        }
        if(this.chessboard[row][col].includes('K')){
          projected_squares = this.projectKingMove(row,col,color);
        }
        return projected_squares;
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

      projectBishopMove(row,col,color){
      let projected_squares = [];
      let opposing_color = 'w';
      if(color === 'w') {
        opposing_color = 'b';
      }

      // Check top left
      for(let r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--) {
        if(this.chessboard[r][c] === 't') {
          projected_squares.push([r, c]); 
        } else if(this.chessboard[r][c].includes(opposing_color)) {
          projected_squares.push([r, c]);
          break;
        } else {
          break;
        }
      }

      // Check top right
      for(let r = row - 1, c = col + 1; r >= 0 && c < 8; r--, c++) {
        if(this.chessboard[r][c] === 't') {
          projected_squares.push([r, c]);
        } else if(this.chessboard[r][c].includes(opposing_color)) {
          projected_squares.push([r, c]);
          break;
        } else {
          break;
        }
      }

      // Check bottom left
      for(let r = row + 1, c = col - 1; r < 8 && c >= 0; r++, c--) {
        if(this.chessboard[r][c] === 't') {
          projected_squares.push([r, c]);
        } else if(this.chessboard[r][c].includes(opposing_color)) {
          projected_squares.push([r, c]);
          break;
        } else {
          break; 
        }
      }

      // Check bottom right
      for(let r = row + 1, c = col + 1; r < 8 && c < 8; r++, c++) {
        if(this.chessboard[r][c] === 't') {
          projected_squares.push([r, c]);
        } else if(this.chessboard[r][c].includes(opposing_color)) {
          projected_squares.push([r, c]);
          break;
        } else {
          break;
        }
      }

      return projected_squares;
      },
      projectKnightMove(row,col,color){
        let projected_squares = [];

        let directions = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1] 
        ];
      
        for (let d of directions) {
          let r = row + d[0];
          let c = col + d[1];
      
          if (r >= 0 && r < 8 && c >= 0 && c < 8 && !this.chessboard[r][c].includes(color)) {
            projected_squares.push([r, c]);
          }
        }
      
        return projected_squares;      
      },
      projectKingMove(row,col,color){
        let projected_squares = [];

        let directions = [
          [-1, -1], [-1, 1], [-1, 0], [1, -1], [1, 1],
          [1, 0], [0, -1], [0, 1], [0, 0] 
        ];
      
        for (let d of directions) {
          let r = row + d[0];
          let c = col + d[1];
      
          if (r >= 0 && r < 8 && c >= 0 && c < 8 && !this.chessboard[r][c].includes(color)) {
            projected_squares.push([r, c]);
          }
        }
      
        return projected_squares;    
      }
    }
  })
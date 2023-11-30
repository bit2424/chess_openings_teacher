import { defineStore } from 'pinia'

import { useHistoryStore } from '@/store/history_store';



export const useChessBoardStoreAPI = defineStore('chessBoardStoreAPI', {
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
        promoting: false,
        inCheck: 'n',
        inCheckMate: 'n',
        game_data: '',
    }),
  
    actions: {
      async initializeGame(){
        try {
          const response = await fetch('http://localhost:8000/games/create_empty_game', 
          { method: 'POST'},
          {mode: 'no-cors'},
          );
          const data = await response.json();
          console.log(data.game_id);
          this.game_id = data.game_id;
        } catch (error) {
          console.error('Fetch error:', error);
        }
      },
      async getBoard(){
        try {
          const url = `http://localhost:8000/games/${this.game_id}/get_game_board`;
          console.log(url);
          const response = await fetch(url, 
          { method: 'GET'},
          {mode: 'no-cors'},
          );
          const data = await response.json();
          const data_split = data.split('\n');

          for (let i = 0; i < data_split.length; i++) {
            const line = data_split[i];
            const chars = line.split(" ");
          
            for (let j = 0; j < chars.length; j++) {
              let char = chars[j];
              const upperChar = char.toUpperCase();
              if (char != '.') {
                let color = 'w';
                if (char != upperChar) {
                  color = 'b';
                  char = upperChar;
                }

                this.chessboard[i][j] = char+"-"+color;
              }
              else {
                this.chessboard[i][j] = 't';
              }
            }
          }
          console.log(this.chessboard);

        } catch (error) {
          console.error('Fetch error:', error);
        }
      },
      async getMovesFromSelectedTile(row,col){
        try {
          const url = `http://localhost:8000/games/${this.game_id}/get_moves_for_position/${this.getIntegerPositionFromTile(row,col)}`;
          console.log(url);
          const response = await fetch(url, 
          { method: 'GET'},
          {mode: 'no-cors'},
          );
          const data = await response.json();
          console.log(data);
          this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
          for (let i = 0; i < data.length; i++) {
            const to_squares = this.getRowColFromInteger(data[i].to_square);
            this.chessboard_piece_projection[to_squares[0]][to_squares[1]] = 'm';
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }
      },
      async initialize(){
        this.whiteTurn = true;
        this.chessboard = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));

        await this.initializeGame();
        await this.getBoard();

      },
      async handlePieceMove() {
        // Logic to handle turns
        if(this.whiteTurn && this.lastSelectedType.includes('b')) return
        if(!this.whiteTurn && this.lastSelectedType.includes('w')) return
        
        let color = this.lastSelectedType.split('-')[1];
        let pieceType = this.lastSelectedType.split('-')[0];
        let projected_squares = this.projectSinglePieceMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);

        //Implement logic to handle castling
        let cnt_sqrs = this.checkCastling(color, pieceType);
        if(cnt_sqrs>0){
          return this.castle(color,pieceType,cnt_sqrs);
        }
        //Implement logic to handle en passant
        if(pieceType == 'P' && this.checkEnPassant(color,pieceType,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,this.selectedTile[0]-1,this.selectedTile[1]-1)){
          return this.enPassant(color,pieceType);
        }
        //Implement logic to handle promotion
        if(pieceType == 'P'){
          this.checkPromotion(color,pieceType);
        }

        for(let i = 0; i < projected_squares.length; i++){
          if(projected_squares[i][0]+1 == this.selectedTile[0] && projected_squares[i][1]+1 ==  this.selectedTile[1]){
            return this.movePiece(color,pieceType);
          }
        }
        return false;
      },
      movePiece(color, pieceType) {
        const historyStore = useHistoryStore();
        let prev_val = this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1];
        
        //Make the move
        this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
        this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `${pieceType}-${color}`;

        let check = this.isCheck(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);
        
        if(check){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = `${pieceType}-${color}`;
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = prev_val;
          
          return false;
        }else{
          historyStore.addMove(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1],prev_val,"normal");
          this.checkOrMate(color);
          this.whiteTurn = !this.whiteTurn;
        }
        return true;
      },
      getIntegerPositionFromTile(row,col){
        if (this.isRotated) {
          return (7 - row) * 8 + (col);
        } else {
          return (row) * 8 + (col);
        }
      },
      getRowColFromInteger(tilePos) {
        let row, col;
        if (this.isRotated) {
          row = 7 - Math.floor(tilePos / 8);
          col = tilePos % 8;
        } else {
          row = Math.floor(tilePos / 8); 
          col = tilePos % 8;
        }
      
        return [row, col];
      },
      checkOrMate(color){
        let isTheOpponentChecked = this.isCheck(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color=='w'?'b':'w');
        if(isTheOpponentChecked){
          console.log("Opponent is checked");
          this.inCheck = `K-${color=='w'?'b':'w'}`;
          let checkMate = this.isCheckmate(color=='w'?'b':'w');
          if(checkMate){
            this.inCheckMate = `K-${color=='w'?'b':'w'}`;
            console.log("Opponent is Checkmate!!!!");
          }
        }else{
          this.inCheck = 'n';
          this.inCheckMate = 'n';
        }
      },
      isCheck(row,col,prevRow,prevCol,color
        ){
        let check = true;
        let opposing_color = 'w';
        if(color === 'w'){
          opposing_color = 'b';
        }

        //Check for check
        this.projectWholeBoardMoves(opposing_color);
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (this.chessboard[i][j].includes('K') && this.chessboard[i][j].includes(color)) {
              if(color == 'w'){
                if (this.chessboard_black_projection[i][j]  == 't') {
                  check = false;
                }

              }else{
                if (this.chessboard_white_projection[i][j]  == 't') {
                  check = false;
                }
              }
              break;
            }
          }
        }
        return check;
      },

      isCheckmate(color){
        let checkmate = true;

        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if(this.chessboard[i][j].includes(color)){

              let moves_to_try = this.projectSinglePieceMove(i,j,color);
              for(let k = 0; k<moves_to_try.length; k++){
                let next_prev_val = this.chessboard[moves_to_try[k][0]][moves_to_try[k][1]];
                let curr_prev_val = this.chessboard[i][j];
                let pieceType = curr_prev_val.split('-')[0];
                let pieceColor = curr_prev_val.split('-')[1];
                //Make the move
                this.chessboard[i][j] = 't';
                this.chessboard[moves_to_try[k][0]][moves_to_try[k][1]] = `${pieceType}-${pieceColor}`;
                if(!this.isCheck(moves_to_try[k][0],moves_to_try[k][1],i,j,pieceColor)){
                  checkmate = false;
                }
                this.chessboard[i][j] = curr_prev_val;
                this.chessboard[moves_to_try[k][0]][moves_to_try[k][1]] = next_prev_val;
              }
            }
          }
        }

        return checkmate;
      },
      checkPromotion(color,pieceType){
        if(color == 'w'){
          if(this.selectedTile[0] == 8){
            this.promoting = true;
          }
        }else{
          if(this.selectedTile[0] == 1){
            this.promoting = true;
          }
        }
        console.log("Promoting? ",color,this.selectedTile[0],this.promoting);
      },
      
      promote(row,col,new_piece){
        this.chessboard[row][col] = new_piece;
        let color = this.chessboard[row][col].split('-')[1];
        this.checkOrMate(color);
      },

      checkEnPassant(color,pieceType,row,col,next_row,next_col){
        const historyStore = useHistoryStore();
        let last_move = historyStore.moves_history[historyStore.moves_history.length-1];
        // let removed_piece = historyStore.convertToChessNotation();
        let possible = false
        let next_col_algebraic = historyStore.getAlgebraicCoordinates(next_row,next_col)[1];
        let check_not_moved = [];

        if(this.chessboard[next_row][next_col] != 't'){
          return false;
        }
        
        // console.log(last_move,next_col_algebraic+String(row+1));

        if(last_move == next_col_algebraic+String(row+1)){
          if(color == 'w'){
            if(row == 4 && this.chessboard[6][next_col] != 'P-b'){
              check_not_moved.push(next_col_algebraic+'6');
            }
          }else{
            if(row == 3 && this.chessboard[1][next_col] != 'P-w'){
              check_not_moved.push(next_col_algebraic+'3');
            }
          }
          // console.log("Not moved",check_not_moved);
          if(check_not_moved.length>0){
            let i = 0;
            for(; i<historyStore.moves_history.length; i++){
              if(historyStore.moves_history[i] == check_not_moved[0]){
                if(color == 'w'){
                  if(i%2==1){
                    // console.log("To sleep ",check_not_moved[0]);
                    break;
                  }
                }else{
                  if(i%2==0){
                    // console.log("To sleep ",check_not_moved[0]);
                    break;
                  }
                }
              }
            }
            if(i == historyStore.moves_history.length){
              possible = true;
            }
          }
        }
        
        // console.log("Possible en passant",possible);
        return possible;
      },
      enPassant(color,pieceType){
        const historyStore = useHistoryStore();
        let prev_val = this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1];
        let prev_val_passant = this.chessboard[this.prevSelectedTile[0]-1][this.selectedTile[1]-1];
        
        //Make the move
        this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
        this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = `${pieceType}-${color}`;
        this.chessboard[this.prevSelectedTile[0]-1][this.selectedTile[1]-1] = `t`;
        

        let check = this.isCheck(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,color);

        if(check){
          this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = `${pieceType}-${color}`;
          this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = prev_val;
          this.chessboard[this.prevSelectedTile[0]-1][this.selectedTile[1]-1] = prev_val_passant;
          let checkMate = this.isCheckmate(color);
          if(checkMate){
            console.log("Checkmate!!!!");
          }
          return false;
        }else{
          historyStore.addMove(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1],prev_val,"enPassant");
          this.checkOrMate(color);
          this.whiteTurn = !this.whiteTurn;
          return true;
        }
      },

      checkCastling(color, pieceType){
        let castling = true;
        let cnt = 0;
        let same_color = this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1].split('-')[1] == this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1].split('-')[1];
        if(!this.checkKingMoved(color)){
          if(pieceType == 'K' && this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1].includes('R') && same_color){
            if(color == 'w'){
              this.projectWholeBoardMoves("b");
              if(this.chessboard_black_projection[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] != 't'){
                castling = false;
              }
              for(let i = Math.min(this.selectedTile[1]-1,this.prevSelectedTile[1]-1)+1; i < Math.max(this.selectedTile[1]-1,this.prevSelectedTile[1]-1); i++){
                // console.log("castle",i);
                cnt++;
                if(this.chessboard[0][i] != 't' || this.chessboard_black_projection[0][i] != 't'){
                  castling = false;
                  break;
                }
              }
            }else{
              this.projectWholeBoardMoves("w");
              if(this.chessboard_white_projection[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] != 't'){
                castling = false;
              }
              for(let i = Math.min(this.selectedTile[1]-1,this.prevSelectedTile[1]-1)+1; i < Math.max(this.selectedTile[1]-1,this.prevSelectedTile[1]-1); i++){
                // console.log("castle",i);
                cnt++;
                if(this.chessboard[7][i] != 't' || this.chessboard_white_projection[7][i] != 't'){
                  castling = false;
                  break;
                }
              }
            }
          }else{
            castling = false;
          }
        }else{
          castling = false;
        }
        // console.log("Did we castle? ",castling);
        if(castling){
          return cnt;
        }else{
          return 0;
        }
      },

      checkKingMoved(color){
        const historyStore = useHistoryStore();
        let king_moved = false;
        for(let i = 0; i < historyStore.moves_history.length; i++){
          if(historyStore.moves_history[i].includes('K') || historyStore.moves_history[i].includes('O')){
            if(color == 'w'){
              if(i%2 == 0){
                king_moved = true;
                break;
              }
            }else{
              if(i%2 == 1){
                king_moved = true;
                break;
              }
            }
          }
        }
        return king_moved;
      },
      castle(color,pieceType,cnt_sqrs){
        const historyStore = useHistoryStore();

        let prev_val = this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1];
        let val = this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1];
        
        //Make the move
        this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
        this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = 't';
        if(color == 'w'){
          if(cnt_sqrs == 2){
            this.chessboard[0][5] = prev_val;
            this.chessboard[0][6] = `${pieceType}-${color}`;
            historyStore.addMove(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,val,prev_val,"castle king side");
          }else{
            this.chessboard[0][3] = prev_val;
            this.chessboard[0][2] = `${pieceType}-${color}`;
            historyStore.addMove(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,val,prev_val,"castle queen side");
          }
        }else{
          if(cnt_sqrs == 2){
            this.chessboard[7][5] = prev_val;
            this.chessboard[7][6] = `${pieceType}-${color}`;
            historyStore.addMove(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,val,prev_val,"castle king side");

          }else{
            this.chessboard[7][3] = prev_val;
            this.chessboard[7][2] = `${pieceType}-${color}`;
            historyStore.addMove(this.selectedTile[0]-1,this.selectedTile[1]-1,this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1,val,prev_val,"castle queen side");
          }
        }
        this.checkOrMate(color);
        this.whiteTurn = !this.whiteTurn;
        return true;
        
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
          if(col!= 0 && this.checkEnPassant('b','P',row,col,row-1,col-1)){
            projected_squares.push([row-1, col-1]);
          }
          if(col != 7 && this.checkEnPassant('b','P',row,col,row-1,col+1)){
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
          if(col != 7 && this.checkEnPassant('w','P',row,col,row+1,col+1)){
            projected_squares.push([row+1, col+1]); 
          }
          if(col != 0 && this.checkEnPassant('w','P',row,col,row+1,col-1)){
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
      },
      async highlightPossibleMoves(row,col){
        
        
        this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
        if(this.whiteTurn){
          if(this.chessboard[row][col].includes('w')){
            await this.getMovesFromSelectedTile(row,col);
          }
        }else{
          if(this.chessboard[row][col].includes('b')){
            await this.getMovesFromSelectedTile(row,col);
          }
        }
        this.printMatrix("Piece projection: ",this.chessboard_piece_projection);
      }
    }
  }
  )
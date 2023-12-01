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
        lastSelectedPiece: "t",
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
      async processMove(prev_row,prev_col,row,col){
        try {
          const initial_square = this.getIntegerPositionFromTile(prev_row,prev_col);
          const final_square = this.getIntegerPositionFromTile(row,col);
          const url = `http://localhost:8000/games/${this.game_id}/process_move/${initial_square}/${final_square}`;
          console.log(url);
          const response = await fetch(url, 
          { method: 'POST'},
          );
          const data = await response.json();
          console.log(data);
          return data;
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
        if(this.whiteTurn && this.lastSelectedPiece.includes('b')) return
        if(!this.whiteTurn && this.lastSelectedPiece.includes('w')) return
        
        let color = this.lastSelectedPiece.split('-')[1];
        let pieceType = this.lastSelectedPiece.split('-')[0];
        const move_info = await this.processMove(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1, this.selectedTile[0]-1, this.selectedTile[1]-1);
        console.log(move_info);

        if(move_info.isValid == false) return false;

        //Implement logic to handle castling
        if(move_info.moveType == 'castling'){
          return this.castle(color,pieceType,cnt_sqrs);
        }
        //Implement logic to handle en passant
        if(move_info.moveType == 'en passant'){
          return this.enPassant(color,pieceType);
        }
        //Implement logic to handle promotion
        if(move_info.moveType == 'promotion'){
          this.checkPromotion(color,pieceType);
        }
        
        this.movePiece(color,pieceType);

        this.printMatrix(this.chessboard);

        return true;
        // for(let i = 0; i < projected_squares.length; i++){
        //   if(projected_squares[i][0]+1 == this.selectedTile[0] && projected_squares[i][1]+1 ==  this.selectedTile[1]){
        //     return this.movePiece(color,pieceType);
        //   }
        // }
      },
      movePiece(color, pieceType) {
        const prev_val = this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1];
        //Make the move
        this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1] = 't';
        this.chessboard[this.selectedTile[0]-1][this.selectedTile[1]-1] = prev_val;
        // this.checkOrMate(color);
        this.whiteTurn = !this.whiteTurn;
        
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
      isCheck(row,col,prevRow,prevCol,color){
        let check = true;
        let opposing_color = 'w';
        
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
        let possible = false;
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
        // console.log("Piece projection: ");
        // this.printMatrix(this.chessboard_piece_projection);
      }
    }
  }
  )
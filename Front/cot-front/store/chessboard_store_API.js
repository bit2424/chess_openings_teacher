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
      async initializeGameFromAPI(){
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
      async getBoardFromAPI(){
        try {
          const url = `http://localhost:8000/games/${this.game_id}/get_game_board`;
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
          
          this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));

        } catch (error) {
          console.error('Fetch error:', error);
        }
      },
      async getMovesFromSelectedTileFromAPI(row,col){
        try {
          const url = `http://localhost:8000/games/${this.game_id}/get_moves_for_position/${this.getIntegerPositionFromTile(row,col)}`;
          const response = await fetch(url, 
          { method: 'GET'},
          {mode: 'no-cors'},
          );
          const data = await response.json();
          // this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
          return data;
        } catch (error) {
          console.error('Fetch error:', error);
        }
      },
      async getBestMovesFromSelectedTileFromAPI(row,col){
        try {
          const url = `http://localhost:8000/games/${this.game_id}/get_best_moves_for_position/${this.getIntegerPositionFromTile(row,col)}`;
          const response = await fetch(url, 
          { method: 'GET'},
          {mode: 'no-cors'},
          );
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Fetch error:', error);
        }
      },
      async processMoveFromAPI(prev_row,prev_col,row,col,promotion_piece){
        try {
          const initial_square = this.getIntegerPositionFromTile(prev_row,prev_col);
          const final_square = this.getIntegerPositionFromTile(row,col);
          const url = `http://localhost:8000/games/${this.game_id}/process_move/${initial_square}/${final_square}/${promotion_piece}`;
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
      async undoMoveFromAPI(){
        try {
          const url = `http://localhost:8000/games/${this.game_id}/undo_last_move`;
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

        await this.initializeGameFromAPI();
        await this.getBoardFromAPI();

      },
      async handlePieceMove() {
        // Logic to handle turns
        if(this.whiteTurn && this.lastSelectedPiece.includes('b')) return false
        if(!this.whiteTurn && this.lastSelectedPiece.includes('w')) return false

        await this.isPawnPromotable(this.selectedTile[0]-1,this.selectedTile[1]-1);
        
        if(!this.promoting){
          const pieceMoved = await  this.processMove();
          return pieceMoved;
        }
        return false;
      },
      async processMove(promotion_piece = "t"){
          const move_info = await this.processMoveFromAPI(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1, this.selectedTile[0]-1, this.selectedTile[1]-1, promotion_piece);
          
          console.log("MOVE INFO",move_info);
  
          if(move_info.isValid == false) return false;
  
          const game_info = move_info.gameInfo;
          
          await this.getBoardFromAPI();
          
          this.printMatrix(this.chessboard);
          
          this.updateGameState(game_info);
          
          this.whiteTurn = !this.whiteTurn;
  
          return true;
      },
      async undoMove(){
        const move_info = await this.undoMoveFromAPI();
          
        console.log("MOVE INFO",move_info);

        if(move_info.isValid == false) return false;

        const game_info = move_info.gameInfo;
        
        await this.getBoardFromAPI();
        
        this.printMatrix(this.chessboard);
        
        this.updateGameState(game_info);
        
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
      updateGameState(game_info){
        const checked = game_info.includes("check");
        const checkedMate = game_info.includes("checkmate");
        let draw = false;
        for(let i = 0; i < game_info.length; i++){
          if(game_info[i].includes('draw')){
            draw = true;
            break;
          }
        }

        if(checked){
          console.log("Opponent is checked");
          this.inCheck = `K-${this.whiteTurn?'b':'w'}`;
          if(checkedMate){
            this.inCheckMate = `K-${this.whiteTurn?'b':'w'}`;
            console.log("Opponent is Checkmate!!!!");
          }
        }else if(draw){
          console.log("DRAW!!!!");
          this.inCheck = `K-${this.whiteTurn?'b':'w'}`;
          
        }
        else{
          this.inCheck = 'n';
          this.inCheckMate = 'n';
        }
      },

      async isPawnPromotable(row,col){
        let condition = (row == 7 || row == 0);
        condition &= this.chessboard[this.prevSelectedTile[0]-1][this.prevSelectedTile[1]-1].includes('P');
        
        const possible_moves =  await this.getMovesFromSelectedTileFromAPI(this.prevSelectedTile[0]-1,this.prevSelectedTile[1]-1);

        let isPossible = false;
        for (let i = 0; i < possible_moves.length; i++) {
          const to_squares = this.getRowColFromInteger(possible_moves[i].to_square);
          if(row == to_squares[0] && col == to_squares[1]){
            break;
          }
        }
        
        condition &= isPossible;
        
        this.promoting = condition;
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
        console.log("HIGHLIGHT POSSIBLE MOVES");
        this.chessboard_piece_projection = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => 't'));
        
        if( (this.whiteTurn && this.chessboard[row][col].includes('w'))

        || (!this.whiteTurn && this.chessboard[row][col].includes('b'))
        
        ){
          
          const possible_moves = await this.getMovesFromSelectedTileFromAPI(row,col);
          const possible_best_moves = await this.getBestMovesFromSelectedTileFromAPI(row,col);

          for (let i = 0; i < possible_moves.length; i++) {
            const to_squares = this.getRowColFromInteger(possible_moves[i].to_square);
            this.chessboard_piece_projection[to_squares[0]][to_squares[1]] = 'm';
          }
          for (let i = 0; i < possible_best_moves.length; i++) {
            const to_squares = this.getRowColFromInteger(possible_best_moves[i].to_square);
            this.chessboard_piece_projection[to_squares[0]][to_squares[1]] = 'bm';
          }

          this.printMatrix(this.chessboard_piece_projection);

        }
      }
    }
  }
  
  )
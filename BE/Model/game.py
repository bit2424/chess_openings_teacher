import chess
import uuid
from pydantic import BaseModel, Field
from typing import Optional

class Game():
    def __init__(self, move_list=[], result="..."):
        self.game_id = str(uuid.uuid4())
        self.board = chess.Board()
        self.move_list = move_list
        self.game_history = []
        self.redo_stack = []
        
        for move in self.move_list:
            if move is str:
                self.board.push(chess.Move.from_uci(move))
        self.result = result

    def to_json(self):
        return {
            "game_id": self.game_id,
            "board": self.board, 
            "move_list": self.move_list,
            "result": self.result,
            "history": self.game_history
        }
    
    def get_moves_for_position(self, start_square):
        # Get list of legal moves for the piece
        legal_moves = self.board.generate_legal_moves()

        # Filter to only moves by the given piece
        piece_moves = []
        
        moves_matrix = [[0 for _ in range(8)] for _ in range(8)]
        
        for move in legal_moves:
            
            row = move.from_square // 8
            col = move.from_square % 8
        
            moves_matrix[row][col] = 1
            if move.from_square == start_square:
                piece_moves.append(move)
                moves_matrix[row][col] += 1
                piece_moves.append(move)
        
            
        for row in range(8):
            for col in range(8):
                print(moves_matrix[row][col], end=" ")
            print()

        return piece_moves
    
    def process_move(self, init_square, end_square, promotion_piece):
            
        init_pos = chess.square_name(init_square)
        end_pos = chess.square_name(end_square)
        promotion_piece = "" if promotion_piece == "t" else promotion_piece
        
        move = chess.Move.from_uci(init_pos + end_pos + promotion_piece)
        
        self.game_history.append([init_pos, end_pos, promotion_piece])
        
        if self.board.is_legal(move):
            
            if(len(self.redo_stack)>0 and move  == self.redo_stack[-1]):
                self.redo_stack.pop()
            else:
                self.redo_stack = []

            move_type = []

            if self.board.is_castling(move):
                move_type.append("castling")
            elif self.board.is_capture(move):
                move_type.append("capture")
            else:
                move_type.append("quiet move")
            
            if self.board.piece_at(init_square).piece_type == chess.PAWN:
                if promotion_piece!= "":
                    move_type.append("promotion")
                else:
                    move_type.append("pawn move")

            self.board.push(move)
            print("BOARD: \n",self.board)
            
            if self.board.is_check():
                move_type.append("check")
            
            move_type.extend(self.check_game_state())
            
            return {"isValid":True,"gameInfo":move_type}
        else:
            return {"isValid":False,"gameInfo":None}
        

    def undo_move(self):
        if len(self.board.move_stack) > 0:
            move_type = []
            last_move = self.board.pop()
            
            self.redo_stack.append(last_move)
            
            if self.board.is_check():
                move_type.append("check")

            move_type.extend(self.check_game_state())

            return {"isValid": True, "gameInfo": move_type}
        else:
            return {"isValid": False, "gameInfo": None}

    def redo_move(self):
        if len(self.redo_stack) > 0:
            move_type = []

            self.board.push(self.redo_stack.pop())

            if self.board.is_check():
                move_type.append("check")

            move_type.extend(self.check_game_state())

            return {"isValid": True, "gameInfo": move_type}
        else:
            return {"isValid": False, "gameInfo": None}
    
    def check_game_state(self):
        """
        Checks if the game is over and returns the result.
        """
        game_state = []
        
        # Check for checkmate
        if self.board.is_checkmate():
            game_state.append("checkmate")

        # Check for stalemate  
        if self.board.is_stalemate():
            game_state.append("draw-stalemate")

        # Check for insufficient material
        if self.board.is_insufficient_material():
            game_state.append("draw-insufficient material")

        # Check for 75 move rule
        if self.board.is_seventyfive_moves():
            game_state.append("draw-75 move rule")

        # Check for 5-fold repetition
        if self.board.is_fivefold_repetition():
            game_state.append("draw-5-fold repetition")

        # Game is still in progress
        return game_state
        
    def index_to_chess_pos(index):
        rows = "87654321" 
        cols = "abcdefgh"

        row = rows[index // 8]
        col = cols[index % 8]

        return col + row
           

class Game_DTO(BaseModel):
    game_id: Optional[str] = None
    board: Optional[object] = None
    move_list: list = Field(default=[])
    result: str = Field(default="...",max_length=8)
    
    class Config:
        schema_extra = {
            "example": {
                "game_id": "32323232-3232-3232-3232-323232323232",
                "board": chess.Board(),
                "move_list": ["e2e4", "e7e5"],
                "result": "1-0"
            }
        }
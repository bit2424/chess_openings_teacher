import chess
import uuid
from pydantic import BaseModel, Field
from typing import Optional

class Game():
    def __init__(self, move_list=[], result="..."):
        self.game_id = str(uuid.uuid4())
        self.board = chess.Board()
        self.move_list = move_list
        for move in self.move_list:
            if move is str:
                self.board.push(chess.Move.from_uci(move))
        self.result = result

    def to_json(self):
        return {
            "game_id": self.game_id,
            "board": self.board, 
            "move_list": self.move_list,
            "result": self.result
        }
    
    def get_moves_for_position(self, start_square):
        # Get list of legal moves for the piece
        legal_moves = list(self.board.legal_moves)

        # Filter to only moves by the given piece
        piece_moves = []
        for move in legal_moves:
            if move.from_square == start_square:
                piece_moves.append(move)

        return piece_moves
    
    def process_move(self, init_square, end_square):
            
        init_pos = chess.square_name(init_square)
        end_pos = chess.square_name(end_square)
        
        print("HOLLAAAA ",init_pos + end_pos)
        
        if self.board.is_legal(chess.Move.from_uci(init_pos + end_pos)):
                
            move = chess.Move.from_uci(init_pos + end_pos)

            move_type = []

            if self.board.is_castling(move):
                move_type.append("castling")
            elif self.board.is_capture(move):
                move_type.append("capture")
            else:
                move_type.append("quiet move")
            
            if self.board.piece_at(init_square).piece_type == chess.PAWN:
                if int(end_pos[-1]) in [0, 7]:
                    move_type.append("promotion")
                else:
                    move_type.append("pawn move")

            # Make the move
            self.board.push(move)
            
            if self.board.is_check():
                move_type.append("check")
                
            if self.board.is_checkmate():
                move_type.append("checkmate")

            
            return {"isValid":True,"moveTypes":move_type}
        else:
            return {"isValid":False,"moveTypes":None}
        
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
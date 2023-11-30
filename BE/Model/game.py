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
    
    def get_moves_for_position(self, position):
        # Get list of legal moves for the piece
        legal_moves = list(self.board.legal_moves)

        # Filter to only moves by the given piece
        piece_moves = []
        for move in legal_moves:
            print(move.from_square, position)
            if move.from_square == position:
                piece_moves.append(move)

        return piece_moves
        

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
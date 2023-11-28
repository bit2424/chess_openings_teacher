from fastapi import FastAPI, Body, Path, Query, status, HTTPException
from fastapi.responses import HTMLResponse,JSONResponse
import uuid
import chess
import sys
from typing import List

sys.path.append('chess_openings_teacher\BE\Model') 
from Model.game import Game,Game_DTO


games = [
    Game(move_list=[]),
]

app = FastAPI()
app.title = "Chess Openings teacher API"
app.version = "0.0.1"

@app.get("/", tags=["root"])
def read_root():
    return {"Hello": "World"}

@app.get("/games", tags=["game"], response_model=List[Game_DTO])
def get_games():
    return [x.to_json() for x in games]

@app.get("/games/{game_id}/get_game_board", tags=["game"], response_model=str)
def get_game_board(game_id: str = Path(default="",min_length=36,max_length=36, title="Game id")):
    board = [x for x in filter(lambda x: x.game_id == game_id, games)]
    if len(board) == 0:
        raise HTTPException(status_code=404, detail="Invalid game id")
    return board[0]

@app.get("/games/{game_id}/get_game_element/{game_element}", tags=["game"], response_model=str)
def get_game_element(game_id: str, game_element: str):
    game_with_id = [x for x in filter(lambda x: x.game_id == game_id, games)]
    if len(game_with_id) == 0:
        raise HTTPException(status_code=404, detail="Invalid game id")
    
    game_with_id = game_with_id[0].__dict__
    if game_element not in game_with_id.keys():
        raise HTTPException(status_code=400, detail="Invalid game element")
    
    return str(game_with_id[game_element])

@app.get("/games/", tags=["game"], response_model=List[Game_DTO])
def get_games_by_result(result: str = Query(default="...",title="Game result")):
    if result not in ["1-0", "0-1", "1/2-1/2", "..."]:
        raise HTTPException(status_code=400, detail="Invalid game result")
    games_with_result = [x.to_json() for x in filter(lambda x: x.result == result, games)]
    return games_with_result

@app.post("/games/create_empty_game", tags=["game"], response_model=Game_DTO)
def create_empty_game():
    new_game = Game()
    games.append(new_game)
    return new_game.to_json()
    
@app.post("/games/create_game_with_moves", tags=["game"], response_model=Game_DTO)
def create_game_with_moves(game_DTO: Game_DTO):
    new_game = Game(move_list = game_DTO.move_list, result = game_DTO.result)
    games.append(new_game)
    return new_game.to_json()

@app.put("/games/{game_id}/update_game_moves", tags=["game"], response_model=Game_DTO)
def update_game_moves(game_id:str = Path(default="",min_length=36,max_length=36, title="Game id"), move: str = Body(default="e2e3",title="Move")):
    for i, g in enumerate(games):
        if g.game_id == game_id:
            games[i].board.push(chess.Move.from_uci(move))
            games[i].move_list.append(move)
            return games[i].to_json()

    raise HTTPException(status_code=404, detail="Invalid game id")

@app.delete("/games/{game_id}", tags=["game"])
def delete_game(game_id: str = Path(default="",min_length=36,max_length=36, title="Game id")):
    for i, g in enumerate(games):
        if g.game_id == game_id:
            del games[i]
            return {"message": "Game deleted {}".format(game_id)}
    
    raise HTTPException(status_code=404, detail="Invalid game id")
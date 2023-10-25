from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL
from datasets import load_dataset
import chess.pgn
import io
import random
import pandas as pd

random.seed(42)

def classify_move(board, move):
    board_efects = []
    if(board.is_capture(move)):
        board_efects.append("1")
    else:
        board_efects.append("0")
        
    if(board.is_check()):
        board_efects.append("2")
        
    if(board.is_checkmate()):
        board_efects.append("3")
    
    if(board.is_en_passant(move)):
        board_efects.append("4")
    
    if(board.is_kingside_castling(move)):
        board_efects.append("5")
    
    if(board.is_queenside_castling(move)):
        board_efects.append("6")
        
    if(board.is_stalemate()):
        board_efects.append("7")
    
    if(board.is_insufficient_material()):
        board_efects.append("8")
        
    if(board.is_seventyfive_moves()):
        board_efects.append("9")
        
    if(board.is_fivefold_repetition()):
        board_efects.append("10")
    
    return ','.join(board_efects)

def process_games():
    # Load the IMDb Reviews dataset
    dataset = load_dataset("patrickfrank1/chess-pgn-games")
        

    game_cnt = 20

    games_txt = []
    
    while(game_cnt>0):
        for game_format_row in dataset["train"]:
            row_txt = game_format_row['text']
            if("Event" in row_txt):
                game_cnt = game_cnt - 1
                if(game_cnt == 0): break
                games_txt.append(row_txt)
            else:
                games_txt[len(games_txt)-1] = games_txt[len(games_txt)-1] + "\n" + row_txt

    game_id = 0
    
    # Create an empty list to store the data
    data = []
    avrg_len = 0

    for game_txt in games_txt:
        pgn = chess.pgn.read_game(io.StringIO(game_txt))
        game_id+=1

        print(f"Opening {pgn.headers.get('Opening')}")
        whiteElo = int(pgn.headers.get('WhiteElo'))
        blackElo = int(pgn.headers.get('BlackElo'))
        
        if pgn.headers.get('Opening')!= None and (whiteElo > 1500 or blackElo > 1500):
            
            game_moves = 0
            for move in pgn.mainline_moves():
                game_moves += 1
            
            
            for sample in range(5):
                
                context = ""
                random_size = random.randint(2, min(game_moves,14))
                start_index = random.randint(0, min(game_moves - random_size,14))
                board = chess.Board()
                move_id = 0
                for move in pgn.mainline_moves():
                    if move_id >= start_index and move_id < start_index + random_size:
                        move_type = classify_move(board, move)
                        context += f"{board} {move} {move_type}\n"
                        print(move,move_type)
                        print(board)
                    elif move_id >= start_index + random_size:
                        break
                    board.push(move)
                    move_id += 1
                move_type = classify_move(board, move)
                context += f"{board}\n"
                avrg_len += len(context)
                data.append({"opening_type":pgn.headers.get('Opening') ,"context": context, "move_type_pred": move_type, "move_pred": move})
    
            if(game_id == 1000):
                break
    
    df = pd.DataFrame(data, columns=['opening_type', 'context', 'move_type_pred', 'move_pred'])
    #print(avrg_len/len(data))
    print(df.head())
    df.to_csv('chess_openings_samples_small.csv', index=False)

process_games()
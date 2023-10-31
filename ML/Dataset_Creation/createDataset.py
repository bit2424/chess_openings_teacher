from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL
from datasets import load_dataset
import chess.pgn
import io
import random
import pandas as pd
from sklearn.model_selection import train_test_split
from huggingface_hub import HfApi

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

    games_txt = []
    game_cnt = 10000
    
    
    for game_format_row in dataset["train"]:
        row_txt = game_format_row['text']
        if("Event" in row_txt):
            game_cnt = game_cnt - 1
            print(game_cnt)
            if(game_cnt < 0): break
            games_txt.append(row_txt)
        else:
            games_txt[len(games_txt)-1] = games_txt[len(games_txt)-1] + "\n" + row_txt

    game_id = 0
    
    # Create an empty list to store the data
    data = []
    avrg_len = 0

    for game_txt in games_txt:
        pgn = chess.pgn.read_game(io.StringIO(game_txt))

        print(f"Opening {pgn.headers.get('Opening')}")
        whiteElo = 0
        if pgn.headers.get('WhiteElo').isdigit():
            whiteElo = int(pgn.headers.get('WhiteElo'))
        
        blackElo = 0
        if pgn.headers.get('BlackElo').isdigit():
            blackElo = int(pgn.headers.get('BlackElo'))
        
        if pgn.headers.get('Opening')!= None and (whiteElo > 1700 or blackElo > 1700):
            game_id+=1
            game_moves = 0
            for move in pgn.mainline_moves():
                game_moves += 1
            
            opening_moves = 8 
            opening_end = 14 
            for sample in range(6):
                
                context = ""
                random_size = random.randint(2, min(game_moves,opening_moves))
                start_index = random.randint(0, min(game_moves - random_size,opening_end))
                board = chess.Board()
                move_id = 0
                for move in pgn.mainline_moves():
                    if move_id >= start_index and move_id < start_index + random_size:
                        move_type = classify_move(board, move)
                        context += f"{board} {move} {move_type}\n"
                        #print(move,move_type)
                        #print(board)
                    elif move_id >= start_index + random_size:
                        break
                    board.push(move)
                    move_id += 1
                move_type = classify_move(board, move)
                context += f"{board}\n"
                avrg_len += len(context)
                data.append({"opening_type":pgn.headers.get('Opening') ,"context": context, "move_type_pred": move_type, "move_pred": move})
    
            # if(game_id == 100000):
            #     break
    
    df = pd.DataFrame(data, columns=['opening_type', 'context', 'move_type_pred', 'move_pred'])
    print("Avrg game sample length",avrg_len/len(data))
    print(df.head())
    print(df.shape)
    print("Games,sampled ",game_id)
    df.to_csv('chess_openings_samples_small.csv', index=False)

def split_data():
    df = pd.read_csv('chess_openings_samples_small.csv')
    train_data, val_data = train_test_split(df, test_size=0.2, random_state=42, stratify=df['opening_type'])
    print(train_data.shape)
    print(val_data.shape)
    train_data.to_csv('V1_small/train.csv', index=False)
    val_data.to_csv('V1_small/test.csv', index=False)

def upload_to_hf():
    api = HfApi()
    api.upload_folder(
        folder_path="./V1_small",
        repo_id="nelson2424/Chess_openings_dataset",
        path_in_repo="V1_small",
        repo_type="dataset",
        commit_message="Created V1_small dataset"
    )

process_games()
split_data()
upload_to_hf()
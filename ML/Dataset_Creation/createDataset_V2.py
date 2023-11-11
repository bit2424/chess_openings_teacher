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
    game_cnt = 60000
    
    
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
        
        if pgn.headers.get('Opening')!= None and (whiteElo > 1800 or blackElo > 1800):
            game_id+=1
            game_moves = 0
            pgn_history= []
            move_history = []
            board = chess.Board()
            
            for move in pgn.mainline_moves():
                pgn_history_string = ' '.join(pgn_history)
                move_type = classify_move(board, move)
                move_type = move_type.ljust(4, '_')
                move_str = board.san(move)
                move_str = move_str.ljust(7, '_')
                context = f"{pgn_history_string}\nm:{move_str}\nt:{move_type}\n"
                
                pgn_history.append(board.san(move))
                move_history.append(context)
                board.push(move)
                
                
                game_moves += 1
            
            move_type = classify_move(board, move)
            move_type = move_type.ljust(4, '_')
            game_end = pgn.headers.get('Result')
            game_end = game_end.ljust(7, '_')
            pgn_history_string = ' '.join(pgn_history)
            context = f"{pgn_history_string}\nm:{game_end}\nt:{move_type}\n"
            move_history.append(context)
            # print("pgn_history_string: ",pgn_history_string)
            # print()
            # print("move_history: ",move_history)
            # print()
            # print(game_txt)
            # print()
            
            opening_moves = 2
            opening_end = 14 
            for sample in range(8):
                
                context = ""
                start_index = random.randint(2, min(game_moves,opening_end))
                board = chess.Board()
                
                split_last_move = move_history[start_index].split('\n')
                context = split_last_move[0]
                avrg_len += len(context) 
                data.append({"opening_type":pgn.headers.get('Opening') ,"context": context, "move_type_pred": split_last_move[2], "move_pred": split_last_move[1]})
    
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
    train_data.to_csv('V2_small/train.csv', index=False)
    val_data.to_csv('V2_small/test.csv', index=False)

def upload_to_hf():
    api = HfApi()
    api.upload_folder(
        folder_path="./V2_small",
        repo_id="nelson2424/Chess_openings_dataset",
        path_in_repo="V2_small",
        repo_type="dataset",
        commit_message="Added a padding to the move and move_type strings for better prediction, with correction"
    )

process_games()
split_data()
upload_to_hf()
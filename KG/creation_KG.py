from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL
from datasets import load_dataset
import chess.pgn
import io



def index_to_chess_pos(index):
  rows = "87654321"
  cols = "abcdefgh"
  
  row = rows[index // 8]
  col = cols[index % 8]
  
  return col + row

def chess_pos_to_index(pos):
  cols = "abcdefgh"
  rows = "87654321"
  
  col = cols.index(pos[0])
  row = rows.index(pos[1])
  
  return row * 8 + col  

def add_action(game_id,turn_id, move, rel_type):
    action_instance = URIRef(f"{ontology_url}game_{game_id}/turn_{turn_id}/action_{move}")
    initial_position_instance = URIRef(f"{ontology_url}game_{game_id}/turn_{turn_id}/position_{chess.square_name(move.from_square)}")
    final_position_instance = URIRef(f"{ontology_url}game_{game_id}/turn_{turn_id}/position_{chess.square_name(move.to_square)}")
    g.add((action_instance, RDF.type, action))
    g.add((initial_position_instance, has_action, action_instance))
    g.add((action_instance, rel_type, final_position_instance))

def process_turn(game_id, turn_id, board, game_instance,move):
    turn_instance = URIRef(f"{ontology_url}game_{game_id}/turn_{turn_id}")
    g.add((turn_instance, RDF.type, turn))
    g.add((game_instance, has_turn, turn_instance))
    
    for piece_pos in board.piece_map():
        piece = board.piece_at(piece_pos)
        piece_type = piece.piece_type
        color = piece.color
        position_instance = URIRef(f"{ontology_url}game_{game_id}/turn_{turn_id}/position_{chess.square_name(piece_pos)}")
        g.add((position_instance, RDF.type, position))
        g.add((turn_instance, has_position, position_instance))
        #add piece type
        if(piece_type == chess.PAWN):
            g.add((position_instance, has_piece, pawn_instance))
        if(piece_type == chess.ROOK):
            g.add((position_instance, has_piece, rook_instance))
        if(piece_type == chess.KNIGHT):
            g.add((position_instance, has_piece, knight_instance))
        if(piece_type == chess.BISHOP):
            g.add((position_instance, has_piece, bishop_instance))
        if(piece_type == chess.QUEEN):
            g.add((position_instance, has_piece, queen_instance))
        if(piece_type == chess.KING):
            g.add((position_instance, has_piece, king_instance))
        #add color type
        if(color == chess.WHITE):
            g.add((position_instance, has_color, white_instance))
        if(color == chess.BLACK):
            g.add((position_instance, has_color, black_instance))
    
    if board.is_checkmate():
        print("The last move was a checkmate.")
    elif board.is_castling(move):
        print("The last move was castling.")
        add_action(game_id,turn_id, move, castling)
    elif board.is_en_passant(move):
        print("The last move was en passant.")
        add_action(game_id,turn_id, move, en_passant)
    elif board.is_capture(move):
        print("The last move was a capture.")
        add_action(game_id,turn_id, move, capture)
    elif move.promotion!= None:
        print("The last move was a promotion.")
        add_action(game_id,turn_id, move, promotion)
    else:
        print("The last move was a normal move.")
        add_action(game_id,turn_id, move, simple_move)        
        
    #print(f'game: \n{board}\n')
    return turn_instance

def process_games():
    # Load the IMDb Reviews dataset
    dataset = load_dataset("patrickfrank1/chess-pgn-games")

    game_cnt = 20

    global ontology_url
    ontology_url = "http://example.com/chess_ontology#"
    
    # Define your ontology namespace
    ont = Namespace(ontology_url)

    # Create a new RDF graph
    global g
    g = Graph()

    # Define classes and properties
    global game,turn, piece_type, color, position, action
    game = ont.Game
    g.add((game, RDF.type, OWL.Class))
    g.add((game, RDFS.subClassOf, OWL.Thing))
    turn = ont.Turn
    g.add((turn, RDF.type, OWL.Class))
    g.add((turn, RDFS.subClassOf, OWL.Thing))
    piece_type = ont.PieceType
    g.add((piece_type, RDF.type, OWL.Class))
    g.add((piece_type, RDFS.subClassOf, OWL.Thing))
    color = ont.Color
    g.add((color, RDF.type, OWL.Class))
    g.add((color, RDFS.subClassOf, OWL.Thing))
    position = ont.Position
    g.add((position, RDF.type, OWL.Class))
    g.add((position, RDFS.subClassOf, OWL.Thing))
    action = ont.Action
    g.add((action, RDF.type, OWL.Class))
    g.add((action, RDFS.subClassOf, OWL.Thing))

    # Define relationships

    global has_turn, next_turn, has_action, has_position, has_next_position, has_color, has_piece, simple_move, castling, en_passant, promotion, capture, checkmate
    
    #
    #Should has_turn and next_turn be in the same class?
    has_turn = ont.hasTurn
    g.add((has_turn, RDFS.domain, game))
    g.add((has_turn, RDFS.range, turn))
    next_turn = ont.nextTurn
    g.add((next_turn, RDFS.domain, turn))
    g.add((next_turn, RDFS.range, turn))
    has_piece = ont.hasPiece
    g.add((has_piece, RDFS.domain, position))
    g.add((has_piece, RDFS.range, piece_type))
    has_color = ont.hasColor
    g.add((has_color, RDFS.domain, position))
    g.add((has_color, RDFS.range, color))
    has_action = ont.hasAction
    g.add((has_action, RDFS.domain, position))
    g.add((has_action, RDFS.range, action))
    has_position = ont.hasPosition
    g.add((has_position, RDFS.domain, turn))
    g.add((has_position, RDFS.range, position))
    has_next_position = ont.hasNextPosition
    g.add((has_next_position, RDFS.domain, position))
    g.add((has_next_position, RDFS.range, position))
    simple_move = ont.simpleMove
    g.add((simple_move, RDFS.domain, action))
    g.add((simple_move, RDFS.range, position))
    en_passant = ont.enPassant
    g.add((en_passant, RDFS.domain, action))
    g.add((en_passant, RDFS.range, position))
    capture = ont.capture
    g.add((capture, RDFS.domain, action))
    g.add((capture, RDFS.range, position))
    castling = ont.castling
    g.add((castling, RDFS.domain, action))
    g.add((castling, RDFS.range, position))
    promotion = ont.promotion
    g.add((promotion, RDFS.domain, action))
    g.add((promotion, RDFS.range, position))

    # Should this instances be a subclass of piece_type and color? 
    global pawn_instance, rook_instance, knight_instance, bishop_instance, queen_instance, king_instance, white_instance, black_instance
    pawn_instance = URIRef(f"{ontology_url}Pawn")
    g.add((pawn_instance, RDF.type, piece_type))
    rook_instance = URIRef(f"{ontology_url}Rook")
    g.add((rook_instance, RDF.type, piece_type))
    knight_instance = URIRef(f"{ontology_url}Knight")
    g.add((knight_instance, RDF.type, piece_type))
    bishop_instance = URIRef(f"{ontology_url}Bishop")
    g.add((bishop_instance, RDF.type, piece_type))
    queen_instance = URIRef(f"{ontology_url}Queen")
    g.add((queen_instance, RDF.type, piece_type))
    king_instance = URIRef(f"{ontology_url}King")
    g.add((king_instance, RDF.type, piece_type))

    white_instance = URIRef(f"{ontology_url}white")
    g.add((white_instance, RDF.type, color))
    black_instance = URIRef(f"{ontology_url}black")
    g.add((black_instance, RDF.type, color))

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


    for game_txt in games_txt:
        pgn = chess.pgn.read_game(io.StringIO(game_txt))
        
        game_instance = URIRef(f"{ontology_url}game_{game_id}")
        g.add((game_instance, RDF.type, game))
        
        turn_id = 0

        # Accessing the game metadata
        print(f"Event: {pgn.headers.get('Event')}")
        print(f"Site: {pgn.headers.get('Site')}")
        print(f"Date: {pgn.headers.get('Date')}")
        print(f"White Player: {pgn.headers.get('White')}")
        print(f"Black Player: {pgn.headers.get('Black')}")
        print(f"Result: {pgn.headers.get('Result')}")
        

        # Processing the moves
        board = pgn.board()
        board.piece_at(0)
        global turns
        turns = []
        
        for move in pgn.mainline_moves():
            turns.append(process_turn(game_id, turn_id, board, game_instance,move))
            if(turn_id>0):
                g.add((turns[len(turns)-2], next_turn, turns[len(turns)-1]))
            turn_id = turn_id + 1
            board.push(move)
        
        turns.append(process_turn(game_id, turn_id, board, game_instance,None))
        g.add((turns[len(turns)-2], next_turn, turns[len(turns)-1]))
        
        for i in range(len(turns)-1):
            g.add((turns[i], next_turn, turns[i+1]))
            
        break

    g.serialize("chess_KG_20.rdf", format="xml")

process_games()
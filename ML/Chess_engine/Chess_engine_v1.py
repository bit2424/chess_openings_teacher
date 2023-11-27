import chess
import chess.svg

def evaluate_board(board):
    # This is a very basic evaluation function.
    # You should replace it with a more sophisticated one.
    return random.uniform(-1, 1)

def minimax(board, depth, maximizing_player, alpha, beta):
    if depth == 0 or board.is_game_over():
        return evaluate_board(board)

    legal_moves = list(board.legal_moves)

    if maximizing_player:
        max_eval = float('-inf')
        for move in legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1, False, alpha, beta)
            board.pop()
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for move in legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1, True, alpha, beta)
            board.pop()
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval

def get_best_move(board, depth):
    legal_moves = list(board.legal_moves)
    best_move = None
    best_eval = float('-inf')

    for move in legal_moves:
        board.push(move)
        eval = minimax(board, depth - 1, False, float('-inf'), float('inf'))
        board.pop()

        if eval > best_eval:
            best_eval = eval
            best_move = move

    return best_move

def main():
    board = chess.Board()

    while not board.is_game_over():
        print(board)
        
        # Get the user's move
        user_move_uci = input("Enter your move (in UCI format, e.g., 'e2e4'): ")
        user_move = chess.Move.from_uci(user_move_uci)
        
        # Make the user's move
        if user_move in board.legal_moves:
            board.push(user_move)
        else:
            print("Invalid move. Try again.")
            continue

        # Check for game over
        if board.is_game_over():
            break

        # Get the engine's move
        engine_move = get_random_move(board)
        print("Engine's move:", engine_move.uci())

        # Make the engine's move
        board.push(engine_move)

    print("Game over. Result:", board.result())

if __name__ == "__main__":
    main()
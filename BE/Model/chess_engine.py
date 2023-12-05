import chess
import random

class ChessEngine:
    def __init__(self, depth=3):
        self.depth = depth

    def evaluate_board(self, board):
        # Piece values
        piece_values = {
            chess.PAWN: 1,
            chess.KNIGHT: 3,
            chess.BISHOP: 3,
            chess.ROOK: 5,
            chess.QUEEN: 9,
            chess.KING: 100
        }

        # Evaluate based on piece values
        evaluation = sum(
            (len(board.pieces(piece, chess.WHITE)) - len(board.pieces(piece, chess.BLACK))) * value
            for piece, value in piece_values.items()
        )

        # Evaluate based on piece mobility
        mobility_evaluation = sum(
            (len(list(board.generate_legal_moves(color))) - len(list(board.generate_legal_moves(not color)))) 
            for color in [chess.WHITE, chess.BLACK]
        )

        evaluation += mobility_evaluation * 0.1  # Adjust weight for piece mobility

        # Evaluate based on pawn structure
        # pawn_structure_evaluation = sum(
            
        #     for square in chess.SQUARES:
        #         if board.piece_at(square) is not None and board.piece_at(square).piece_type == chess.PAWN:
        #             if 
        # )

        # evaluation += pawn_structure_evaluation
        # print(board.pawns)

        # Evaluate based on king safety
        king_safety_evaluation = sum(
            (len(list(board.attacks(square))) - len(list(board.attacks(square))))
            for color in [chess.WHITE, chess.BLACK]
            for square in [board.king(color)]
        )

        evaluation += king_safety_evaluation * 0.1  # Adjust weight for king safety

        # Evaluate based on control of the center
        center_squares = [chess.D4, chess.E4, chess.D5, chess.E5]
        center_control_evaluation = sum(
            (len(list(board.attackers(color, square))) - len(list(board.attackers(not color, square))))
            for color in [chess.WHITE, chess.BLACK]
            for square in center_squares
        )

        evaluation += center_control_evaluation * 0.05  # Adjust weight for center control

        return evaluation

    def minimax(self, board, depth, maximizing_player, alpha, beta):
        if depth == 0 or board.is_game_over():
            return self.evaluate_board(board)

        legal_moves = list(board.legal_moves)

        if maximizing_player:
            max_eval = float('-inf')
            for move in legal_moves:
                board.push(move)
                eval = self.minimax(board, depth - 1, False, alpha, beta)
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
                eval = self.minimax(board, depth - 1, True, alpha, beta)
                board.pop()
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            return min_eval

    def get_best_move(self, board):
        legal_moves = list(board.legal_moves)
        best_move = None
        best_eval = float('-inf')

        for move in legal_moves:
            board.push(move)
            eval = self.minimax(board, self.depth - 1, False, float('-inf'), float('inf'))
            board.pop()

            if eval > best_eval:
                best_eval = eval
                best_move = move
        return best_move
    
    def get_best_moves_for_piece(self, board, piece_square):
        legal_moves = list(board.legal_moves)

        # Filter legal moves for the specific piece
        piece_moves = [move for move in legal_moves if move.from_square == piece_square]

        # Sort the moves based on their evaluations
        piece_moves.sort(
            key=lambda move: self.minimax(board, self.depth - 1, False, float('-inf'), float('inf')),
            reverse=True
        )

        # Return the top three moves
        return piece_moves[:3]
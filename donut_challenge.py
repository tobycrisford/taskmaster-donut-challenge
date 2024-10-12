import numpy as np

win_check_cache = {}

def find_winning_moves(player_moves: list[int], max_move: int) -> tuple[list[int]]:
    """Given list of other player's moves, find the win and draw options for an additional player."""

    # Use cache here because logic below will repeatedly call this fn with different orderings, and check is relatively slow
    moves = tuple(sorted(player_moves))
    cache_key = moves + (max_move,)
    if cache_key in win_check_cache:
        return win_check_cache[cache_key]
    
    move_counter = [0 for _ in range(max_move)]
    for move in moves:
        move_counter[move] += 1

    n_ones = 0
    for mc in move_counter:
        if mc == 1:
            n_ones += 1
    
    winning_moves = []
    draw_moves = []
    for i in range(max_move):
        if move_counter[i] == 0:
            winning_moves.append(i)
        elif move_counter[i] > 1:
            if n_ones == 0:
                draw_moves.append(i)
        elif move_counter[i] == 1:
            if n_ones == 1:
                draw_moves.append(i)
            break

    win_check_cache[cache_key] = winning_moves, draw_moves
    return win_check_cache[cache_key]

def find_win_probs(
    move_probs: np.ndarray,
    n_players_to_move: int,
    win_probs: np.ndarray | None = None,
    player_moves: list[int] | None = None
) -> np.ndarray:
    """Given probability of each move for given number of players, find win probability of each move for an additional player."""

    if win_probs is None:
        win_probs = np.zeros(len(move_probs))

    if player_moves is None:
        player_moves = []

    if n_players_to_move > 0:
        for i in range(len(move_probs)):
            player_moves.append(i)
            find_win_probs(move_probs, n_players_to_move - 1, win_probs, player_moves)
            player_moves.pop()

    elif n_players_to_move == 0:
        prob = 1.0
        for move in player_moves:
            prob *= move_probs[move]
        
        winning_moves, draw_moves = find_winning_moves(player_moves, len(move_probs))
        for move in winning_moves:
            win_probs[move] += prob
        for move in draw_moves:
            win_probs[move] += (1/(len(player_moves) + 1)) * prob

    
    return win_probs
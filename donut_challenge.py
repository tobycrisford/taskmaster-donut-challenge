import json

import numpy as np

win_check_cache = {}

def count_player_moves(player_moves: list[int], max_move: int) -> list[int]:
    """Given list of player moves, count how many players have selected each move."""

    move_counter = [0 for _ in range(max_move)]
    for move in player_moves:
        move_counter[move] += 1

    return move_counter

def find_winning_moves(player_moves: list[int], max_move: int) -> tuple[list[int]]:
    """Given list of other player's moves, find the win and draw options for an additional player."""

    # Use cache here because logic below will repeatedly call this fn with different orderings, and check is relatively slow
    moves = tuple(sorted(player_moves))
    cache_key = moves + (max_move,)
    if cache_key in win_check_cache:
        return win_check_cache[cache_key]
    
    move_counter = count_player_moves(moves, max_move)

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

def prob_and_derivs(player_moves: list[int], move_probs: np.ndarray) -> tuple[float, np.ndarray]:
    """Find the probability of the given player moves, along with derivative w.r.t. each move prob."""

    prob = 1.0
    for move in player_moves:
        prob *= move_probs[move]
    
    move_counter = count_player_moves(player_moves, len(move_probs))
    
    derivs = np.zeros(len(move_probs))
    for i in range(len(move_counter)):
        if move_counter[i] == 0:
            continue
        derivs[i] = 1.0
        for j in range(len(move_counter)):
            if j == i:
                exponent = move_counter[j] - 1
            else:
                exponent = move_counter[j]
            if exponent == 0:
                continue
            derivs[i] *= (move_probs[j])**(exponent)
        derivs[i] *= move_counter[i]

    return prob, derivs

def find_win_probs(
    move_probs: np.ndarray,
    n_players_to_move: int,
    win_probs: np.ndarray | None = None,
    win_prob_derivs: np.ndarray | None = None,
    player_moves: list[int] | None = None,
) -> tuple[np.ndarray]:
    """Given probability of each move for given number of players, find win probability of each move for an additional player,
    along with derivatives of this win probability.
    """

    if win_probs is None:
        win_probs = np.zeros(len(move_probs))
        assert win_prob_derivs is None
        win_prob_derivs = np.zeros((len(move_probs), len(move_probs)))

    if player_moves is None:
        player_moves = []

    if n_players_to_move > 0:
        for i in range(len(move_probs)):
            player_moves.append(i)
            find_win_probs(move_probs, n_players_to_move - 1, win_probs, win_prob_derivs, player_moves)
            player_moves.pop()

    elif n_players_to_move == 0:
        prob, derivs = prob_and_derivs(player_moves, move_probs)
        winning_moves, draw_moves = find_winning_moves(player_moves, len(move_probs))
        for move in winning_moves:
            win_probs[move] += prob
            win_prob_derivs[move, :] += derivs
        for move in draw_moves:
            win_probs[move] += (1/(len(player_moves) + 1)) * prob
            win_prob_derivs[move, :] += (1/(len(player_moves) + 1)) * derivs

    
    return win_probs, win_prob_derivs


def solve_game(n_players: int, n_moves: int | None = None, tolerance: float = 10**(-6)):
    """Find the Nash equilibrium strategy for n_players playing the donut game with n_moves possible moves,
    using Newton-Raphson.
    """

    if n_moves is None:
        n_moves = n_players
    
    soln = np.random.rand(n_moves)

    while True:
        win_probs, win_prob_derivs = find_win_probs(soln, n_players - 1)
        diff = (1/n_players) - win_probs
        if np.all(np.abs(diff) < tolerance):
            break

        update = np.linalg.solve(win_prob_derivs, diff)
        soln += update
        
    reduced_moves = n_moves
    while np.any(soln > 1.0 + tolerance) or np.any(soln < 0.0 - tolerance):
        print('No solution found, repeating with highest potential move removed.')
        reduced_moves -= 1
        candidate_soln = solve_game(n_players, n_moves = reduced_moves, tolerance=tolerance)
        full_soln = np.concatenate((candidate_soln, np.zeros(n_moves - reduced_moves)))
        
        # Need to check that can't break equilibrium by selecting one of the removed moves
        win_probs, _ = find_win_probs(full_soln, n_players - 1)
        solution_valid = not any(win_prob > (1 / n_players) + tolerance for win_prob in win_probs)
        if solution_valid:
            soln = full_soln

    
    return soln

def create_strategy_jsons(up_to_n_players: int):
    """Create Nash equilibrium strategy json files up to n-player game,
    assuming moves available equals number of players.
    """

    for i in range(2, up_to_n_players + 1):
        soln = solve_game(i)
        with open(f'nash_{i}.json', 'w') as f:
            json.dump({'probs': list(soln)}, f)
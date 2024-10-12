const ai_players = [
    "Nash",
    "Randy",
    "Dory",
    "Sage",
]

const human_player = 'You';

let last_move = {};
let last_winner = null;
let draw = null;
let total_score = {};

let table_size = 0;

let nash_strategy_probs = null;
let sage_tracker = null;

async function set_defaults() {
    last_move = {};
    total_score = {};
    for (const player of ai_players) {
        last_move[player] = null;
        total_score[player] = 0;
    }
    if (human_player in last_move || human_player in total_score) {
        throw "AI player can't be called ".concat(human_player);
    }
    last_move[human_player] = null;
    total_score[human_player] = 0;

    last_winner = null;
    draw = null;

    nash_strategy_probs = await fetch('nash_strategies/nash_' + (ai_players.length + 1).toString() + '.json').then((response) => response.json());
    sage_tracker = Array(ai_players.length + 1).fill(0);
}

function recreate_move_table() {
    let row = document.getElementById('move_options');
    row.textContent = '';
    for (let i = 0;i < ai_players.length + 1;i++) {
        let move_option = document.createElement('td');
        move_option.textContent = (i + 1).toString();
        move_option.setAttribute('onclick', 'next_move(' + i.toString() + ')');
        row.appendChild(move_option);
    }
}

function create_empty_results_row(row, player_name) {
    const column_keys = ['last_move', 'last_points', 'total_score'];
    
    let player_label = document.createElement('td');
    player_label.textContent = player_name;
    row.appendChild(player_label);
    for (const col of column_keys) {
        let table_el = document.createElement('td');
        table_el.setAttribute('id', player_name + '_' + col);
        row.appendChild(table_el);
    }
}

function recreate_results_table() {
    let table = document.getElementById('result_table');
    let header = document.getElementById('result_header');
    table.textContent = '';
    table.appendChild(header);

    let row = document.createElement('tr');
    create_empty_results_row(row, human_player);
    table.appendChild(row);
    for (const player of ai_players) {
        row = document.createElement('tr');
        create_empty_results_row(row, player);
        table.appendChild(row);
    }
}

function recreate_tables() {
    recreate_move_table();
    recreate_results_table();
    table_size = ai_players.length + 1;
}

function update_result_message(msg) {
    document.getElementById('result_display').textContent = msg;
}

function update_results_column(values_obj, col_key, offset) {
    for (const player in values_obj) {
        let table_el = document.getElementById(player + '_' + col_key);
        if (values_obj[player] === null) {
            table_el.textContent = '';
        }
        else {
            table_el.textContent = (values_obj[player] + offset).toString();
        }
    }
}

function update_results_table() {
    update_results_column(last_move, 'last_move', 1);
    update_results_column(total_score, 'total_score', 0);
    let last_points = {};
    for (const player in total_score) {
        if (player === last_winner) {
            last_points[player] = 1;
        }
        else {
            last_points[player] = 0;
        }
    }
    update_results_column(last_points, 'last_points', 0);
}

function update_display() {
    if (table_size != ai_players.length + 1) {
        recreate_tables();
    }

    if (draw !== null) {
        if (draw) {
            update_result_message('Draw!');
        }
        else {
            update_result_message('Round winner: ' + last_winner);
        }
    }
    else {
        update_result_message('');
    }

    update_results_table();
}

async function reset_game() {
    console.log("Starting new game...");
    await set_defaults();
    update_display();
}

function find_winning_moves(move, max_move) {
    // Find winning move (if any) plus all moves s.t. if any player had done this move instead of their actual move,
    // with other player moves fixed, they would have won.

    let move_counts = Array(max_move).fill(0);
    for (const player in move) {
        move_counts[move[player]] += 1;
    }

    let winning_moves = [];
    for (let i = 0;i < move_counts.length;i++) {
        if (move_counts[i] == 0) {
            winning_moves.push(i);
        }
        else if (move_counts[i] == 1) {
            winning_moves.push(i);
            break;
        }
    }
    return winning_moves;
}

function select_move_from_dist(move_dist) {
    // Select a move from 0,1,... using given probability distribution

    r = Math.random();
    let prob_total = 0;
    for (let i = 0;i < move_dist.length;i++) {
        prob_total += move_dist[i];
        if (r < prob_total) {
            return i;
        }
    }
    throw "Bad distribution";
}

function random_strategy(max_move) {
    return select_move_from_dist(Array(max_move).fill(1 / max_move));
}

function nash_strategy(max_move) {
    if (nash_strategy_probs['probs'].length != max_move) {
        throw 'Nash strategy is broken';
    }
    return select_move_from_dist(nash_strategy_probs['probs']);
}

function dory_strategy(max_move) {
    let winning_moves = null;
    if (draw !== null) {
        let dist = Array(max_move).fill(0.0);
        winning_moves = find_winning_moves(last_move, max_move);
        let prob = 1 / winning_moves.length;
        for (const winning_move of winning_moves) {
            dist[winning_move] = prob;
        }
        return select_move_from_dist(dist);
    }
    else {
        return random_strategy(max_move);
    }
}

function sage_strategy(max_move) {
    let max_count = 0;
    for (const count of sage_tracker) {
        if (count > max_count) {
            max_count = count;
        }
    }

    let choices = [];
    for (let i = 0;i < sage_tracker.length;i++) {
        if (sage_tracker[i] === max_count) {
            choices.push(i);
        }
    }

    let prob = 1 / choices.length;
    let dist = Array(max_move).fill(0.0);
    for (const choice of choices) {
        dist[choice] = prob;
    }
    console.log('Sage choices: ');
    console.log(choices);

    return select_move_from_dist(dist);
}

const ai_strategies = {
    Nash: nash_strategy,
    Randy: random_strategy,
    Dory: dory_strategy,
    Sage: sage_strategy
};

function update_winner(move) {
    let move_to_players = [];
    for (let i = 0;i < ai_players.length + 1;i++) {
        move_to_players.push([]);
    }
    for (const player in move) {
        move_to_players[move[player]].push(player);
    }
    for (const players of move_to_players) {
        if (players.length == 1) {
            draw = false;
            last_winner = players[0];
            return;
        }
    }
    draw = true;
    last_winner = null;
}

function increment_total_points(player) {
    total_score[player] += 1;
}

function update_sage_tracker(move, max_move) {
    // Sage keeps track of winning moves across the entire game

    let winning_moves = find_winning_moves(move, max_move);
    for (const winning_move of winning_moves) {
        sage_tracker[winning_move] += 1;
    }
}

function next_move(human_move) {
    let move = {};
    move[human_player] = human_move;
    for (const player of ai_players) {
        move[player] = ai_strategies[player](ai_players.length + 1);
    }

    update_winner(move);
    if (!draw) {
        increment_total_points(last_winner);
    }
    update_sage_tracker(move, ai_players.length + 1);

    last_move = move;

    update_display();
}
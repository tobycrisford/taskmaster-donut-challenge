const available_ai_players = {
    "Nash": 1,
    "Karl": 1,
    "Dory": 1,
    "Sage": 1,
    "Randy": 0,
};

let ai_players = [];
let nash_included = false;

const human_player = 'You';

let last_move = {};
let last_winner = null;
let draw = null;
let total_score = {};

let game_over = false;
let game_limit = null;
let overall_winner = null;

let table_size = 0;

let nash_strategy_probs = null;
let sage_tracker = null;
let karl_tracker = null;

function read_ai_players() {
    // Read the selected AI players from the user inputs

    ai_players = [];
    nash_included = false;
    for (const ai_player in available_ai_players) {
        let n_players = parseInt(document.getElementById(ai_player + '_select').value);
        if (n_players == 1) {
            ai_players.push(ai_player);
        }
        else if (n_players > 1) {
            for (let i = 0;i < n_players;i++) {
                ai_players.push(ai_player + ' ' + (i + 1).toString());
            }
        }

        if (n_players > 0 && ai_player == 'Nash') {
            nash_included = true;
        }
    }

    if (ai_players.length + 1 > 7 && nash_included) {
        ai_players = [];
        nash_included = false;
        alert("Can't use Nash players in a game with more than 7 players total");
    }
}

async function set_defaults() {

    read_ai_players();

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

    if (nash_included) {
        nash_strategy_probs = await fetch('nash_strategies/nash_' + (ai_players.length + 1).toString() + '.json').then((response) => response.json());
    }
    else {
        nash_strategy_probs = null;
    }
    sage_tracker = Array(ai_players.length + 1).fill(0);
    karl_tracker = {};
    for (const player of ai_players) {
        karl_tracker[player] = Array(ai_players.length + 1).fill(0);
    }
    karl_tracker[human_player] = Array(ai_players.length + 1).fill(0);

    game_over = false;
    overall_winner = null;
    try {
        game_limit = parseInt(document.getElementById('game_limit').value);
    }
    catch (err) {
        alert('Bad input in game limit field - must be an integer!');
        end_game();
    }
}


function end_game(winner) {
    game_over = true;
    game_limit = null;
    overall_winner = winner;
}

function recreate_move_table() {
    let row = document.getElementById('move_options');
    row.textContent = '';
    for (let i = 0;i < ai_players.length + 1;i++) {
        let move_option_cell = document.createElement('td');
        let move_option = document.createElement('button');
        move_option.textContent = (i + 1).toString();
        move_option.setAttribute('onclick', 'next_move(' + i.toString() + ')');
        move_option_cell.appendChild(move_option);
        row.appendChild(move_option_cell);
    }
}

function create_empty_results_row(row, player_name) {
    const column_keys = ['last_move', 'total_score'];
    
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
    //let last_points = {};
    //for (const player in total_score) {
    //    if (player === last_winner) {
    //        last_points[player] = 1;
    //    }
    //    else {
    //        last_points[player] = 0;
    //    }
   // }
    //update_results_column(last_points, 'last_points', 0);
}

function update_display() {

    if (game_over) {
        update_result_message('Game has ended - winner is: ' + overall_winner);
    }
    else if (draw !== null) {
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

function create_inputs() {
    let player_select = document.getElementById('player_select');
    for (const ai_player in available_ai_players) {
        let select = document.createElement('select');
        select.setAttribute('id', ai_player+'_select');
        for (let i = 0;i < 5;i++) {
            let opt = document.createElement('option');
            opt.setAttribute('value', i.toString());
            opt.textContent = i.toString();
            if (i == available_ai_players[ai_player]) {
                opt.setAttribute('selected', 'selected');
            }
            select.appendChild(opt);
        }
        let div = document.createElement('div');
        div.textContent = 'Number of ' + ai_player + ' players:  ';
        div.appendChild(select);
        player_select.appendChild(div);
    }
}

async function reset_game() {
    console.log("Starting new game...");
    await set_defaults();
    recreate_tables();
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
    let empty_switch_allowed = true;
    for (let i = 0;i < move_counts.length;i++) {
        if (move_counts[i] == 0) {
            if (empty_switch_allowed) {
                winning_moves.push(i);
            }
        }
        else if (move_counts[i] == 1) {
            winning_moves.push(i);
            break;
        }
        else if (move_counts[i] == 2) {
            empty_switch_allowed = false;
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
    console.log(prob_total);
    throw "Bad distribution";
}

function random_strategy(max_move, player_name) {
    return select_move_from_dist(Array(max_move).fill(1 / max_move));
}

function nash_strategy(max_move, player_name) {
    if (nash_strategy_probs['probs'].length != max_move) {
        throw 'Nash strategy is broken';
    }
    return select_move_from_dist(nash_strategy_probs['probs']);
}

function distribution_over_choices(choices, max_move) {
    // Return a distribution over the given choices

    let dist = Array(max_move).fill(0.0);
    let prob = 1 / choices.length;
    for (const choice of choices) {
        dist[choice] = prob;
    }
    return dist;
}

function dory_strategy(max_move, player_name) {
    // Dory randomly selects from the 'winning' moves of the last round
    // See find_winning_moves for defn of 'winning'

    if (draw !== null) {
        let winning_moves = find_winning_moves(last_move, max_move);
        if (winning_moves.length === 0) {
            return random_strategy(max_move);
        }
        let dist = distribution_over_choices(winning_moves, max_move);
        return select_move_from_dist(dist);
    }
    else {
        return random_strategy(max_move);
    }
}

function find_max_value_indices(arr) {
    let max_val = null;
    for (const val of arr) {
        if (max_val === null) {
            max_val = val;
        }
        else if (val > max_val) {
            max_val = val;
        }
    }

    let indices = [];
    for (let i = 0;i < arr.length;i++) {
        if (arr[i] === max_val) {
            indices.push(i);
        }
    }

    return indices;
}

function sage_strategy(max_move, player_name) {
    // Sage remembers all rounds and goes for the move which has been 'winning' most often
    // See find_winning_moves for defn of 'winning'

    let choices = find_max_value_indices(sage_tracker);
    let dist = distribution_over_choices(choices, max_move);

    console.log('Sage choices: ');
    console.log(choices);

    return select_move_from_dist(dist);
}

function karl_strategy(max_move, player_name) {
    // Karl targets players currently doing well,
    // and has a particular dislike of the human player.

    let max_score = -1;
    let top_player = null;
    for (const player in total_score) {
        if (player === player_name) {
            continue;
        }
        if (total_score[player] > max_score) {
            max_score = total_score[player];
            top_player = player;
        }
        else if (total_score[player] * 1.5 > max_score && player === human_player) {
            max_score = total_score[player] * 1.5;
            top_player = player;
        }
    }

    let choices = find_max_value_indices(karl_tracker[top_player]);
    let dist = distribution_over_choices(choices, max_move);
    
    console.log('Karl choices: ');
    console.log(choices);

    return select_move_from_dist(dist);
}

const ai_strategies = {
    Nash: nash_strategy,
    Randy: random_strategy,
    Dory: dory_strategy,
    Sage: sage_strategy,
    Karl: karl_strategy,
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

function update_karl_tracker(move) {
    for (const player in move) {
        karl_tracker[player][move[player]] += 1;
    }
}

function next_move(human_move) {
    if (game_over) {
        return;
    }

    let move = {};
    move[human_player] = human_move;
    for (const player of ai_players) {
        move[player] = ai_strategies[player.split(' ')[0]](ai_players.length + 1, player);
    }

    update_winner(move);
    if (!draw) {
        increment_total_points(last_winner);
    }
    update_sage_tracker(move, ai_players.length + 1);
    update_karl_tracker(move);

    last_move = move;

    for (const player in total_score) {
        if (total_score[player] >= game_limit) {
            end_game(player);
            break;
        }
    }

    update_display();
}
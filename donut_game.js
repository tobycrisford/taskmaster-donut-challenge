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

function set_defaults() {
    last_move = {};
    total_score = {};
    for (const player of ai_players) {
        last_move[player] = null;
        total_score[player] = null;
    }
    if (human_player in last_move || human_player in total_score) {
        throw "AI player can't be called ".concat(human_player);
    }
    last_move[human_player] = null;
    total_score[human_player] = null;

    last_winner = null;
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

function reset_game() {
    console.log("Starting new game...");
    set_defaults();
    update_display();
}

function next_move(move) {
    console.log('Trying to do move: ' + move.toString());
}
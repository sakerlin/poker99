const socket = io();

const el = (id) => document.getElementById(id);
const logEl = el('log');

function addLog(text) {
  const p = document.createElement('div');
  p.textContent = text;
  logEl.appendChild(p);
  logEl.scrollTop = logEl.scrollHeight;
}

function promptPlayerSelection(room, card, meId) {
    const otherPlayers = room.players.filter(p => p.id !== meId && !p.eliminated);
    if (otherPlayers.length === 0) {
        // No one to select, play without target
        socket.emit('play_card', { roomId: room.id, cardId: card.id });
        return;
    }
    // In 2-player game, auto-select other player
    if (room.players.filter(p => !p.eliminated).length === 2) {
        socket.emit('play_card', { roomId: room.id, cardId: card.id, targetId: otherPlayers[0].id });
        return;
    }

    const selectionDiv = document.createElement('div');
    selectionDiv.id = 'player-selection';
    selectionDiv.style.position = 'fixed';
    selectionDiv.style.top = '50%';
    selectionDiv.style.left = '50%';
    selectionDiv.style.transform = 'translate(-50%, -50%)';
    selectionDiv.style.backgroundColor = 'white';
    selectionDiv.style.border = '1px solid black';
    selectionDiv.style.padding = '1em';
    selectionDiv.style.zIndex = '100';

    selectionDiv.innerHTML = '<h3>Select a player:</h3>';
    
    otherPlayers.forEach(p => {
        const pBtn = document.createElement('button');
        pBtn.textContent = p.name;
        pBtn.onclick = () => {
            socket.emit('play_card', { roomId: room.id, cardId: card.id, targetId: p.id });
            document.body.removeChild(selectionDiv);
        };
        selectionDiv.appendChild(pBtn);
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        document.body.removeChild(selectionDiv);
    };
    selectionDiv.appendChild(cancelBtn);

    document.body.appendChild(selectionDiv);
}

el('join').onclick = () => {
  const name = el('name').value || 'Player';
  const roomId = el('room').value || 'room1';
  socket.emit('join_room', { roomId, name });
};

el('start').onclick = () => {
  const roomId = el('room').value || 'room1';
  socket.emit('start_game', { roomId });
};

socket.on('room_update', (data) => {
  const playersDiv = el('players');
  playersDiv.innerHTML = '<strong>Players:</strong> ' + data.players.map(p => `${p.name}${p.eliminated? '(elim)':''} [${p.handCount}]`).join(' | ');
});

socket.on('game_state', ({ room }) => {
  el('currentValue').textContent = room.currentValue;
  // update hand for this client
  const meId = socket.id;
  const me = room.players.find(p => p.id === meId);
  const handDiv = el('hand');
  handDiv.innerHTML = '';
  if (me) {
    me.hand.forEach(c => {
      const btn = document.createElement('button');
      btn.textContent = `${c.suit}-${c.rank}`;
      
      if (c.rank === '5') {
        btn.onclick = () => promptPlayerSelection(room, c, meId);
      } else {
        btn.onclick = () => {
          const roomId = room.id;
          socket.emit('play_card', { roomId, cardId: c.id });
        };
      }

      if (me.eliminated) {
        btn.disabled = true;
      }
      handDiv.appendChild(btn);
    });
  }
});

socket.on('turn_to', ({ playerId }) => {
  const info = playerId === socket.id ? 'Your turn' : `Player ${playerId} turn`;
  el('turnInfo').textContent = info;
});

socket.on('log', (text) => addLog(text));

socket.on('player_eliminated', ({ name }) => addLog(`${name} eliminated`));

socket.on('game_over', ({ winners }) => {
  addLog('Game over. Winners: ' + winners.map(w => w.name).join(', '));
});

socket.on('error_message', (m) => addLog('[ERROR] ' + m));
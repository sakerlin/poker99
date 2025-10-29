const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from our frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

// Simple in-memory rooms store (for prototype)
const rooms = {};

function createDeck(multi = 1) {
  const suits = ['S','H','D','C'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const deck = [];
  for (let m = 0; m < multi; m++) {
    for (const s of suits) {
      for (const r of ranks) {
        deck.push({ id: `${s}-${r}-${m}-${Math.random().toString(36).slice(2,8)}`, suit: s, rank: r });
      }
    }
  }
  return deck;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function nextAliveIndex(room, startIndex, step = 1) {
  const players = room.players;
  if (!players.length) return -1;

  let currentIdx = startIndex;
  let playersToSkip = step; // Number of players to effectively skip

  for (let attempts = 0; attempts < players.length * 2; attempts++) { // Iterate more than once around the table to be safe
    currentIdx = (currentIdx + room.direction + players.length) % players.length; // Move to the next player in direction

    if (!players[currentIdx].eliminated) {
      playersToSkip--; // This player is alive, so we can "skip" them if playersToSkip > 0
    }

    if (playersToSkip === 0 && !players[currentIdx].eliminated) {
      return currentIdx; // Found the target alive player after skipping
    }
  }
  return -1; // No suitable alive player found
}

function applyCardEffect(room, playerId, card, optionalTarget) {
  // returns an object {log, skipNext:boolean, setNextPlayer: string | null}
  let log = '';
  let skip = false;
  let setNextPlayer = null;
  const r = card.rank;
  const player = room.players.find(p => p.id === playerId);
  const playerName = player ? player.name : 'Unknown';

  if (r === 'A') {
    room.currentValue += 1;
    log = `${playerName} plays A: +1`;
  } else if (r === 'J') {
    // J card now acts as a normal card, turn advances to next player
    log = `${playerName} plays J: normal turn advance`;
    console.log(`Server: Player ${playerName} played J. skipNext is now false.`);
  } else if (r === '4') {
    room.direction *= -1;
    log = `${playerName} plays 4: reverse direction`;
  } else if (r === '5') {
    const alivePlayers = room.players.filter(p => !p.eliminated);
    if (alivePlayers.length <= 2) { // also handles 1 player left
        const otherPlayer = alivePlayers.find(p => p.id !== playerId);
        if (otherPlayer) {
            setNextPlayer = otherPlayer.id;
            log = `${playerName} plays 5: next turn for ${otherPlayer.name}`;
        } else {
            log = `${playerName} plays 5: (no-op, no other players)`;
        }
    } else {
        if (optionalTarget) {
            const targetPlayer = room.players.find(p => p.id === optionalTarget);
            if (targetPlayer && !targetPlayer.eliminated) {
                setNextPlayer = optionalTarget;
                log = `${playerName} plays 5: next turn for ${targetPlayer.name}`;
            } else {
                 log = `${playerName} plays 5: (invalid target)`;
            }
        } else {
            log = `${playerName} plays 5: (no target selected)`;
        }
    }
  } else if (r === 'K') {
    room.currentValue = 99;
    log = `${playerName} plays K: set to 99`;
  } else if (r === 'Q') {
    if (room.currentValue + 20 > 99) {
      room.currentValue -= 20;
      log = `${playerName} plays Q: -20`;
    } else {
      room.currentValue += 20;
      log = `${playerName} plays Q: +20`;
    }
  } else {
    // numeric 2-10 and others
    const v = parseInt(r, 10);
    if (!isNaN(v)) {
      if (v === 10) {
        if (room.currentValue + 10 > 99) {
          room.currentValue -= 10;
          log = `${playerName} plays 10: -10`;
        } else {
          room.currentValue += 10;
          log = `${playerName} plays 10: +10`;
        }
      } else {
        room.currentValue += v;
        log = `${playerName} plays ${r}: +${v}`;
      }
    } else {
      // fallback
      room.currentValue += 0;
      log = `${playerName} plays ${r}: (no-op)`;
    }
  }
  return { log, skipNext: skip, setNextPlayer };
}

io.on('connection', (socket) => {
  socket.on('join_room', ({ roomId, name }) => {
    if (!roomId) return socket.emit('error_message', 'roomId required');
    if (!rooms[roomId]) {
      rooms[roomId] = { id: roomId, players: [], settings: { initialHandSize: 5 }, deck: [], pile: [], currentValue: 0, turnIndex: 0, direction: 1, started: false };
    }
    const room = rooms[roomId];
    const player = { id: socket.id, name: name || `P${room.players.length+1}`, eliminated: false, hand: [] };
    room.players.push(player);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = player.name;
    io.to(roomId).emit('room_update', { players: room.players.map(p => ({ id: p.id, name: p.name, eliminated: p.eliminated, handCount: p.hand.length })), settings: room.settings });
  });

  socket.on('start_game', ({ roomId }) => {
    console.log('Server: Received start_game event for roomId:', roomId);
    const room = rooms[roomId];
    if (!room) {
      console.log('Server: Room not found for roomId:', roomId);
      return socket.emit('error_message', 'room not found');
    }
    if (room.started) {
      console.log('Server: Game already started for roomId:', roomId);
      return;
    }
    console.log('Server: Players in room', roomId, ':', room.players.length);
    if (room.players.length < 2) {
      console.log('Server: Not enough players in room', roomId, '. Emitting error_message.');
      return socket.emit('error_message', 'Not enough players to start the game (minimum 2 required).');
    }
    room.deck = createDeck(1);
    shuffle(room.deck);
    room.pile = [];
    room.currentValue = 0;
    room.direction = 1;
    room.turnIndex = 0;
    room.started = true;
    // deal
    for (const p of room.players) {
      p.eliminated = false;
      p.hand = [];
      for (let i = 0; i < room.settings.initialHandSize; i++) {
        const c = room.deck.pop();
        if (c) p.hand.push(c);
      }
    }
    io.to(roomId).emit('game_state', { room });
    io.to(roomId).emit('log', `Game started. currentValue=${room.currentValue}`);
    io.to(roomId).emit('turn_to', { playerId: room.players[room.turnIndex].id });
  });

  socket.on('play_card', ({ roomId, cardId, targetId }) => {
    const room = rooms[roomId];
    if (!room || !room.started) return socket.emit('error_message', 'game not started');
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return socket.emit('error_message', 'not in room');
    if (room.players[room.turnIndex].id !== socket.id) return socket.emit('error_message', 'not your turn');
    const player = room.players[playerIndex];
    const cardIdx = player.hand.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return socket.emit('error_message', 'card not in hand');
    const [card] = player.hand.splice(cardIdx, 1);
    room.pile.push(card);
    const res = applyCardEffect(room, player.id, card, targetId);
    io.to(roomId).emit('log', res.log + ` -> currentValue=${room.currentValue}`);

    // draw
    if (room.deck.length === 0) {
      // reshuffle pile into deck
      room.deck = room.pile.splice(0, room.pile.length - 0);
      shuffle(room.deck);
      io.to(roomId).emit('log', 'Reshuffled pile into deck');
    }
    const drawn = room.deck.pop();
    if (drawn) player.hand.push(drawn);

    // check elimination
    if (room.currentValue > 99) {
      player.eliminated = true;
      io.to(roomId).emit('player_eliminated', { playerId: player.id, name: player.name });
      io.to(roomId).emit('log', `${player.name} eliminated (value ${room.currentValue} > 99)`);
    }

    // advance turn
    console.log(`Server: Before turn advancement. Current turnIndex: ${room.turnIndex}, Direction: ${room.direction}, skipNext: ${res.skipNext}, setNextPlayer: ${res.setNextPlayer}`);
    let next = -1;
    if (res.setNextPlayer) {
        const targetPlayerIndex = room.players.findIndex(p => p.id === res.setNextPlayer);
        if (targetPlayerIndex !== -1 && !room.players[targetPlayerIndex].eliminated) {
            next = targetPlayerIndex;
        }
    }
    
    if (next === -1) { // if target not set or invalid, proceed as normal
        let step = 1;
        if (res.skipNext) {
            step = step * 2;
            console.log(`Server: J card played, step adjusted to: ${step}`);
        }
        next = nextAliveIndex(room, room.turnIndex, step);
        console.log(`Server: nextAliveIndex returned next: ${next}`);
    }
    console.log(`Server: After turn calculation, next turnIndex will be: ${next}`);

    // Check for game over condition: only one or zero players left
    const alivePlayers = room.players.filter(p => !p.eliminated);
    if (alivePlayers.length <= 1) {
      io.to(roomId).emit('game_over', { winners: alivePlayers.map(w => ({ id: w.id, name: w.name })) });
      room.started = false;
      return; // Game is over, stop processing turn
    }

    room.turnIndex = next;
    console.log(`Server: Turn advanced to player at index: ${room.turnIndex}, ID: ${room.players[room.turnIndex].id}`);

    io.to(roomId).emit('game_state', { room });
    io.to(roomId).emit('turn_to', { playerId: room.players[room.turnIndex].id });
  });

  socket.on('leave_room', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx !== -1) {
      room.players.splice(idx, 1);
      socket.leave(roomId);
      socket.data.roomId = undefined; // Clear roomId from socket data
      socket.data.name = undefined; // Clear name from socket data
    }
    // If room becomes empty, delete it
    if (room.players.length === 0) {
      delete rooms[roomId];
      console.log(`Server: Room ${roomId} is empty and deleted.`);
    } else {
      io.to(roomId).emit('room_update', { players: room.players.map(p => ({ id: p.id, name: p.name, eliminated: p.eliminated, handCount: p.hand.length })) });
      // If game was started and now only one player left, end game
      if (room.started && room.players.filter(p => !p.eliminated).length <= 1) {
        const alivePlayers = room.players.filter(p => !p.eliminated);
        io.to(roomId).emit('game_over', { winners: alivePlayers.map(w => ({ id: w.id, name: w.name })) });
        room.started = false;
      }
    }
    console.log(`Server: Player ${socket.id} left room ${roomId}.`);
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const room = rooms[roomId];
    if (!room) return;
    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx !== -1) {
      room.players.splice(idx, 1);
    }
    io.to(roomId).emit('room_update', { players: room.players.map(p => ({ id: p.id, name: p.name, eliminated: p.eliminated, handCount: p.hand.length })) });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

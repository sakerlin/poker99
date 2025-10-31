import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import './App.css';

import JoinGame from './components/JoinGame';
import GameLobby from './components/GameLobby';
import InGame from './components/InGame';
import GameOver from './components/GameOver';

// 自動檢測當前主機的 IP 地址
const getServerUrl = () => {
  const hostname = window.location.hostname;
  const port = '8080';
  return `http://${hostname}:${port}`;
};

const socket = io(getServerUrl()); // Connect to the backend server

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('room1');
  const [players, setPlayers] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [hand, setHand] = useState([]);
  const [turnInfo, setTurnInfo] = useState('');

  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [cardToPlayForFive, setCardToPlayForFive] = useState(null);
  const [gameWinners, setGameWinners] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);

  const handleRequestRooms = useCallback(() => {
    socket.emit('request_rooms');
  }, []);

  const meId = socket.id;

  useEffect(() => {
    // Redirect if playerName is empty and trying to access /lobby
    if (!playerName && location.pathname === '/lobby') {
      navigate('/');
    }

    // 當返回首頁時，請求房間列表
    if (location.pathname === '/') {
      socket.emit('request_rooms');
    }

    socket.on('room_created', ({ roomId }) => {
      setRoomId(roomId);
      navigate('/lobby');
    });

    socket.on('room_update', (data) => {
      setPlayers(data.players);
      console.log('room_update received:', data);
      console.log('meId:', meId, 'gameStarted:', gameStarted);
      const playerInRoom = data.players.some(p => p.id === meId);
      console.log('playerInRoom:', playerInRoom);
      // If we are in the join game screen and successfully joined, navigate to lobby
      if (playerInRoom && !gameStarted) {
        console.log('Navigating to /lobby');
        navigate('/lobby');
      }
    });

    socket.on('game_state', ({ room }) => {
      setCurrentValue(room.currentValue);
      const me = room.players.find(p => p.id === meId);
      if (me) {
        setHand(me.hand);
      }
      setPlayers(room.players);
      if (room.started) {
        setGameStarted(true);
        navigate('/in-game');
      }
    });

    socket.on('turn_to', ({ playerId }) => {
      setTurnInfo(playerId === meId ? 'Your turn' : `Player ${players.find(p => p.id === playerId)?.name || playerId} turn`);
    });





    socket.on('game_over', ({ winners, gameStats, playerStats }) => {
      console.log('Game Over event received!', winners, gameStats, playerStats);
      setGameWinners(winners);
      setGameStats(gameStats);
      setPlayerStats(playerStats || []);
      setGameStarted(false);
      navigate('/game-over');
    });

    socket.on('error_message', (m) => {
      console.error('Client: Received error_message from server:', m);
    });

    socket.on('rooms_list', ({ rooms }) => {
      console.log('Client: Received rooms_list:', rooms);
      console.log('Client: Current location:', location.pathname);
      setAvailableRooms(rooms);
    });

    return () => {
      socket.off('room_created');
      socket.off('room_update');
      socket.off('game_state');
      socket.off('turn_to');


      socket.off('game_over');
      socket.off('error_message');
      socket.off('rooms_list');
    };
  }, [meId, navigate, players, gameStarted, playerName, location.pathname]);

  const handleJoinRoom = (id, name) => {
    setRoomId(id);
    setPlayerName(name);
    socket.emit('join_room', { roomId: id, name });
  };

  const handleCreateRoom = (name) => {
    setPlayerName(name);
    socket.emit('create_room', { name });
  };

  const handleStartGame = () => {
    console.log('Client: Emitting start_game event for roomId:', roomId);
    socket.emit('start_game', { roomId });
  };

  const handlePlayCard = (cardId, targetId = null) => {
    socket.emit('play_card', { roomId, cardId, targetId });
    setShowPlayerSelection(false);
    setCardToPlayForFive(null);
  };

  const promptPlayerSelection = (card) => {
    setCardToPlayForFive(card);
    setShowPlayerSelection(true);
  };

  const handlePlayAgain = () => {
    setGameWinners([]);
    setGameStats(null);
    setPlayerStats([]);
    setHand([]);
    setCurrentValue(0);
    setTurnInfo('');
    setGameStarted(false);
    navigate('/lobby'); // Go back to lobby to start a new game
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', { roomId }); // Emit event to server
    setPlayerName(''); // Reset player name
    setRoomId('room1'); // Reset room ID to default
    setPlayers([]); // Clear players list
    setGameStarted(false); // Reset game started state
    setGameWinners([]); // Clear game winners
    setGameStats(null); // Clear game stats
    setPlayerStats([]); // Clear player stats
    setHand([]); // Clear hand
    setCurrentValue(0); // Reset current value
    setTurnInfo(''); // Reset turn info
    setShowPlayerSelection(false); // Reset selection state
    setCardToPlayForFive(null); // Reset card for five
    navigate('/'); // Navigate to JoinGame page
    // 請求房間列表
    setTimeout(() => {
      socket.emit('request_rooms');
    }, 100);
  };

  const handleConcede = () => {
    socket.emit('concede', { roomId });
  };

  return (
    <Routes>
      <Route path="/" element={<JoinGame onJoin={handleJoinRoom} onCreate={handleCreateRoom} availableRooms={availableRooms} onRequestRooms={handleRequestRooms} />} />
      <Route
        path="/lobby"
        element={<GameLobby
              players={players}
              onStartGame={handleStartGame}
              roomId={roomId}
              onLeaveRoom={handleLeaveRoom}
              meId={meId}
            />}
      />
      <Route
        path="/in-game"
        element={<InGame
              players={players}
              currentValue={currentValue}
              hand={hand}
              turnInfo={turnInfo}
              meId={meId}
              handlePlayCard={handlePlayCard}
              promptPlayerSelection={promptPlayerSelection}
              showPlayerSelection={showPlayerSelection}
              cardToPlayForFive={cardToPlayForFive}
              setShowPlayerSelection={setShowPlayerSelection}
              onLeaveRoom={handleLeaveRoom}
              onConcede={handleConcede}
            />}
      />
      <Route
        path="/game-over"
        element={<GameOver
              winners={gameWinners}
              players={players}
              gameStats={gameStats}
              playerStats={playerStats}
              onPlayAgain={handlePlayAgain}
              onLeaveRoom={handleLeaveRoom}
            />}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

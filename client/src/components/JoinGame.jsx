import React, { useState, useEffect } from 'react';
import './JoinGame.css';

const STORAGE_KEY = 'poker99_player_name';

function JoinGame({ onJoin, onCreate, availableRooms = [], onRequestRooms }) {
  const [name, setName] = useState('');

  // 從 localStorage 讀取保存的 name
  useEffect(() => {
    const savedName = localStorage.getItem(STORAGE_KEY);
    if (savedName) {
      setName(savedName);
    }
  }, []);

  useEffect(() => {
    // 請求房間列表
    if (onRequestRooms) {
      console.log('JoinGame: Requesting rooms list');
      onRequestRooms();
    }
  }, [onRequestRooms]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    // 如果輸入不為空，則保存到 localStorage
    if (newName.trim()) {
      localStorage.setItem(STORAGE_KEY, newName);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (name) {
      onCreate(name);
    }
  };

  const handleJoinFromList = (roomId) => {
    if (name) {
      onJoin(roomId, name);
    }
  };

  return (
    <div className="join-game-container">
      <main className="wrap" role="main">
        <div className="logo panel" aria-hidden="true">
          <span className="material-symbols-outlined" aria-hidden="true">playing_cards</span>
        </div>

        <h1>Join a Game</h1>

        <div className="form">
          <div className="group">
            <label className="label" htmlFor="name">Your Name</label>
            <div className="input panel">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Player1"
                required
                value={name}
                onChange={handleNameChange}
              />
            </div>
          </div>
        </div>

        <div className="room-list-section">
          <div className="room-list-header">
            <h2>Room List</h2>
            <button className="btn-create panel" type="button" onClick={handleCreate} disabled={!name}>
              <span className="material-symbols-outlined">add</span>
              Create Room
            </button>
          </div>

          <div className="room-list">
            {availableRooms.length === 0 ? (
              <div className="room-empty">
                <span className="material-symbols-outlined">info</span>
                <p>No rooms available</p>
              </div>
            ) : (
              availableRooms.map((room) => (
                <div key={room.id} className="room-item">
                  <div className="room-item-left">
                    <span className={`material-symbols-outlined ${room.started ? 'room-locked' : 'room-open'}`}>
                      {room.started ? 'lock_open' : 'groups'}
                    </span>
                    <div className="room-info">
                      <span className="room-name">Room {room.id}</span>
                      <span className="room-host">
                        {room.players.length > 0 ? `${room.players[0].name}'s Game` : 'Public Game'}
                      </span>
                    </div>
                  </div>
                  <div className="room-item-right">
                    <div className="room-players">
                      <span className="material-symbols-outlined">person</span>
                      <span>{room.players.length}/4</span>
                    </div>
                    <button
                      className="btn-join-room"
                      onClick={() => handleJoinFromList(room.id)}
                      disabled={!name || room.started || room.players.length >= 4}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default JoinGame;

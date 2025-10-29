import React, { useState } from 'react';
import './JoinGame.css';

function JoinGame({ onJoin, onCreate }) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (name && roomId) {
      onJoin(roomId, name);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (name) {
      onCreate(name);
    }
  };

  return (
    <div className="join-game-container">
      <main className="wrap" role="main">
        <div className="logo panel" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="4" width="14" height="16" rx="3" fill="#0ea5e9" opacity=".18" />
            <rect x="7" y="6" width="10" height="12" rx="2" stroke="#4cc3ff" strokeWidth="1.6" fill="none" />
            <path d="M12 9.2l2.2 3.8H9.8L12 9.2z" fill="#4cc3ff" />
          </svg>
        </div>

        <h1>Join a Game</h1>

        <div className="form">
          <div className="group">
            <label className="label" htmlFor="name">Your Name</label>
            <div className="input panel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="#b6c3d8" strokeWidth="1.5" />
                <path d="M4 20a8 8 0 0 1 16 0" stroke="#b6c3d8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Player1"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="group">
            <label className="label" htmlFor="room">Room Code</label>
            <div className="input panel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="10.5" r="3.5" stroke="#b6c3d8" strokeWidth="1.5" />
                <path d="M11.5 10.5H20m0 0v3m0-3v-3" stroke="#b6c3d8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="room"
                name="room"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength="4"
                placeholder="Enter 4–digit code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
          </div>

          <button className="btn panel" type="submit" onClick={handleJoin}>Join Game</button>
          <p className="helper">Or <a href="#" onClick={handleCreate}>create a new game</a></p>
        </div>
      </main>
    </div>
  );
}

export default JoinGame;

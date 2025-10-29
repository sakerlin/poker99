import React from 'react';
import './GameLobby.css';

function GameLobby({ players, onStartGame, roomId, onLeaveRoom }) {
  const avatarColors = ['alt', '', 'pink'];

  return (
    <div className="game-lobby-body">
      <div className="topbar">
        <div className="room-badge">
          <span className="dot" aria-hidden="true"></span>
          <strong>Room Code:</strong>&nbsp;<span>{roomId}</span>
        </div>
        <button className="leave" onClick={onLeaveRoom}>Leave Room</button>
      </div>
      <div className="line" aria-hidden="true"></div>

      <main className="game-lobby-main">
        <h1>Game Lobby</h1>
        <div className="sub">{players.length}/8 Players Joined</div>

        <section className="card" aria-label="Players">
          <div className="list">
            {players.map((p, i) => (
              <div className="item" key={p.id}>
                <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>
                  {p.isHost && (
                    <span className="host-badge" title="Host">
                      <svg viewBox="0 0 24 24"><path d="M12 2l2.2 6.8H21l-5.6 4.1 2.1 6.9L12 15.8 6.5 19.8 8.6 13 3 8.8h6.8z" /></svg>
                    </span>
                  )}
                </div>
                <div className="name">{p.name}</div>
                {p.isHost && <div className="meta">(Host)</div>}
              </div>
            ))}
            {Array.from({ length: 8 - players.length }).map((_, i) => (
              <div className="item waiting" key={`waiting-${i}`}>
                <div className="avatar">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" strokeWidth="1.6" stroke="currentColor" />
                    <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="name">Waiting for player…</div>
              </div>
            ))}
          </div>
        </section>

        <div className="cta-wrap">
          <button className="cta" onClick={onStartGame} disabled={players.length < 2}>Start Game</button>
        </div>
      </main>
    </div>
  );
}

export default GameLobby;
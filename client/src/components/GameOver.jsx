import React from 'react';
import './GameOver.css';

function GameOver({ winners, onPlayAgain, onLeaveRoom }) {
  const winner = winners.length > 0 ? winners[0] : null;

  return (
    <div className="game-over-body">
      <div className="container">
        <h1>Game Over!</h1>

        {winner && (
          <section className="winner" aria-label="Winner">
            <div className="top">
              <div className="avatar" aria-hidden="true">
                <div className="ring"></div>
                <svg viewBox="0 0 100 100" width="100" height="100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <defs>
                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#7be1ff" />
                      <stop offset="1" stopColor="#2b5f79" />
                    </linearGradient>
                  </defs>
                  <rect width="100" height="100" fill="url(#g)" />
                  <circle cx="65" cy="30" r="24" fill="#143b4c" opacity=".5" />
                  <circle cx="45" cy="38" r="18" fill="#8ae3ff" />
                  <rect x="28" y="55" width="44" height="30" rx="12" fill="#0f2d3a" />
                </svg>
                <div className="trophy" title="Winner">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10v2h3v3a5 5 0 0 1-4 4.9A5 5 0 0 1 12 16a5 5 0 0 1-4-2.1A5 5 0 0 1 4 9V6h3V4zm12 4V6h-2v4.1A3 3 0 0 0 19 8zM7 10.1V6H5v2a3 3 0 0 0 2 2.1zM12 18c1.7 0 3.2-.8 4.1-2H7.9A5 5 0 0 0 12 18zm-6 2h12v2H6z" /></svg>
                </div>
              </div>
              <div>
                <div className="name">{winner.name}</div>
                <div className="subwin">Winner</div>
              </div>
            </div>
          </section>
        )}

        <button className="cta" onClick={onPlayAgain}>Play Again</button>
        <a className="back" onClick={onLeaveRoom}>Return to Lobby</a>

      </div>
    </div>
  );
}

export default GameOver;
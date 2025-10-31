import React from 'react';
import './GameOver.css';

function GameOver({ winners, players = [], gameStats, playerStats = [], onPlayAgain, onLeaveRoom }) {
  const winner = winners.length > 0 ? winners[0] : null;

  // Format duration (seconds to mm:ss)
  const formatDuration = (seconds) => {
    if (!seconds) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Get player stats with score
  const getPlayerWithStats = (playerId) => {
    return playerStats.find(p => p.id === playerId) || { score: 0, roundsWon: 0 };
  };

  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    const statsA = getPlayerWithStats(a.id);
    const statsB = getPlayerWithStats(b.id);
    return statsB.score - statsA.score; // 從高到低排序
  });

  return (
    <div className="game-over-body">
      <div className="container">
        <h1>Game Over!</h1>

        {winner && (
          <section className="winner" aria-label="Winner">
            <div className="winner-content">
              <div className="winner-avatar-wrapper">
                <div className="winner-avatar" aria-hidden="true">
                  {winner.name.charAt(0)}
                </div>
                <div className="trophy-badge">
                  <span className="material-symbols-outlined">workspace_premium</span>
                </div>
              </div>
              <div className="winner-info">
                <div className="winner-name">{winner.name}</div>
                <div className="winner-label">Winner</div>
              </div>
            </div>
          </section>
        )}

        {players.length > 0 && (
          <>
            <h2 className="section-title">Game Records</h2>

            {gameStats && (
              <div className="game-records">
                <div className="record-card">
                  <div className="record-label">Game Duration</div>
                  <div className="record-value">{formatDuration(gameStats.duration)}</div>
                </div>
                <div className="record-card">
                  <div className="record-label">Total Rounds</div>
                  <div className="record-value">{gameStats.roundCount}</div>
                </div>
              </div>
            )}

            <div className="summary-list" role="list">
              {sortedPlayers.map((p) => {
                const isWinner = winners.some((w) => w.id === p.id);
                const stats = getPlayerWithStats(p.id);
                return (
                  <div className={`summary-item ${isWinner ? 'winner-item' : ''}`} role="listitem" key={p.id}>
                    <div className="item-avatar">
                      {p.name.charAt(0)}
                    </div>
                    <div className="item-info">
                      <div className="item-name">{p.name}</div>
                      <div className="item-meta">Rounds Won: {stats.roundsWon}</div>
                    </div>
                    <div className="item-score">
                      {stats.score} <span className="pts-label">Pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="actions">
          <button className="btn-secondary" onClick={onLeaveRoom}>
            Leave Room
          </button>
          <button className="btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOver;

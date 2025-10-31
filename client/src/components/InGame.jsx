import React, { useState } from 'react';
import './InGame.css';

function InGame({
  players,
  currentValue,
  hand,
  turnInfo,
  meId,
  handlePlayCard,
  promptPlayerSelection,
  showPlayerSelection,
  cardToPlayForFive,
  setShowPlayerSelection,
  onLeaveRoom,
  onConcede
}) {
  const [showConcedeConfirm, setShowConcedeConfirm] = useState(false);
  const me = players.find(p => p.id === meId);
  const otherPlayers = players.filter(p => p.id !== meId && !p.eliminated);

  const getSuitColor = (suit) => {
    const isRed = suit === 'H' || suit === 'D' || suit === '♥' || suit === '♦';
    return isRed ? 'red' : 'black';
  };

  const getSuitSymbol = (suit) => {
    switch (suit) {
      case 'D':
        return '♦';
      case 'S':
        return '♠';
      case 'C':
        return '♣';
      case 'H':
        return '♥';
      default:
        return suit;
    }
  };

  const handleConcedeClick = () => {
    setShowConcedeConfirm(true);
  };

  const handleConcedeConfirm = () => {
    setShowConcedeConfirm(false);
    if (onConcede) {
      onConcede();
    }
  };

  const handleConcedeCancel = () => {
    setShowConcedeConfirm(false);
  };

  return (
    <div className="ingame-body">
      <section className="board" role="application" aria-label="Game Board">
        <header className="topbar">
          <div className="logo" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"></path>
            </svg>
          </div>
          <div className="app-title">Poker 99</div>
          <div className="spacer"></div>
          <button className="btn-leave-room" onClick={onLeaveRoom}>
            <span className="material-symbols-outlined">arrow_forward</span>
            Leave Room
          </button>
          <button className="btn-concede" onClick={handleConcedeClick}>
            <span className="material-symbols-outlined">flag</span>
            Concede
          </button>
        </header>

        <div className="players">
          {players.map((p) => (
            <div className={`p ${p.eliminated ? 'out' : ''}`} key={p.id}>
              {p.eliminated && <div className="close">×</div>}
              <div className="avatar" style={{ borderColor: turnInfo.includes(p.name) ? '#ffe28a' : '#3a4652' }}>
                {p.name.charAt(0)}
                <div className="small">{p.handCount}</div>
              </div>
              <div className="name">{p.name}</div>
              <div className="tag">{p.eliminated ? 'Eliminated' : turnInfo.includes(p.name) ? 'Playing…' : 'Waiting'}</div>
            </div>
          ))}
        </div>

        <div className="center">
          <div className="label">Current Value</div>
          <div className="value">{currentValue}</div>
          <div className="turn" dangerouslySetInnerHTML={{ __html: turnInfo.replace(/Player (\w+)/, '<b>Player $1</b>') }}></div>
        </div>

        <div className="hand">
          <div className="hand-title"><span className="me"></span> Your Hand ({hand.length})</div>
          <div className="cards" aria-label="Your hand">
            {hand.map((card, i) => {
              const suitSymbol = getSuitSymbol(card.suit);
              const suitColor = getSuitColor(card.suit);
              return (
                <div
                  className={`card ${suitColor}`}
                  key={card.id}
                  onClick={() => (card.rank === '5' ? promptPlayerSelection(card) : handlePlayCard(card.id))}
                >
                  <div className="card-top">
                    <span className="card-rank">{card.rank}</span>
                    <span className={`card-suit ${suitColor}`}>{suitSymbol}</span>
                  </div>
                  <div className="card-center">
                    <span className={`card-suit-large ${suitColor}`}>{suitSymbol}</span>
                  </div>
                  <div className="card-bottom">
                    <span className="card-rank">{card.rank}</span>
                    <span className={`card-suit ${suitColor}`}>{suitSymbol}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {showPlayerSelection && (
        <div className="player-selection-overlay">
          <div className="player-selection-modal">
            <h3>Select a player for card '5':</h3>
            {otherPlayers.length === 0 ? (
              <p>No other players to select.</p>
            ) : (
              otherPlayers.map((p) => (
                <button key={p.id} onClick={() => handlePlayCard(cardToPlayForFive.id, p.id)}>
                  {p.name}
                </button>
              ))
            )}
            <button onClick={() => setShowPlayerSelection(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showConcedeConfirm && (
        <div className="concede-confirm-overlay" onClick={handleConcedeCancel}>
          <div className="concede-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="concede-confirm-title">Concede Game?</h2>
            <p className="concede-confirm-message">
              Are you sure you want to concede? This action cannot be undone and will result in a loss.
            </p>
            <div className="concede-confirm-buttons">
              <button className="btn-concede-cancel" onClick={handleConcedeCancel}>
                Cancel
              </button>
              <button className="btn-concede-confirm" onClick={handleConcedeConfirm}>
                Yes, Concede
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InGame;

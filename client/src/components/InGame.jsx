import React from 'react';
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
  onLeaveRoom
}) {
  const me = players.find(p => p.id === meId);
  const otherPlayers = players.filter(p => p.id !== meId && !p.eliminated);

  const getSuitColor = (suit) => {
    if (suit === '♥' || suit === '♦') {
      return 'red';
    }
    return 'black';
  };

  return (
    <div className="ingame-body">
      <section className="board" role="application" aria-label="Game Board">
        <header className="topbar">
          <div className="logo" aria-hidden="true"></div>
          <div className="app-title">Poker 99</div>
          <div className="spacer"></div>
          <button className="icon-btn" title="Leave Room" onClick={onLeaveRoom}>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5z"/><path fill="currentColor" d="m21 12l-4-4v3H9v2h8v3z"/></svg>
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
            {hand.map((card, i) => (
              <div
                className={`card ${getSuitColor(card.suit)} ${i % 2 !== 0 ? 'dark' : ''}`}
                key={card.id}
                onClick={() => (card.rank === '5' ? promptPlayerSelection(card) : handlePlayCard(card.id))}
              >
                <div className="rank">{card.rank}<span className="suit">{card.suit}</span></div>
                <div className="corner">
                  <div className="rank">{card.rank}</div><div className="suit">{card.suit}</div>
                </div>
              </div>
            ))}
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
    </div>
  );
}

export default InGame;
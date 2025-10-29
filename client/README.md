# Poker 99 - Client

This directory contains the frontend single-page application (SPA) for the "Poker 99" real-time multiplayer card game.

## Core Functionality

1.  **Component-Based Structure**: The application is divided into four main components/screens:
    *   `JoinGame`: The entry point for players to join a game.
    *   `GameLobby`: The lobby where players wait for the game to start.
    *   `InGame`: The main screen during gameplay, displaying the player's hand, game state, and logs.
    *   `GameOver`: The screen that displays the results when the game ends.

2.  **State Management**: The central `App.jsx` component acts as the controller for the entire application. It manages all critical state, including player information, room ID, cards in hand, the current game value, whose turn it is, and game logs.

3.  **Real-time Communication**: The application connects to a backend server at `http://localhost:8080` using Socket.IO. It listens for various events from the server (e.g., `room_update`, `game_state`, `game_over`) to update the UI in real-time and sends events (e.g., `join_room`, `start_game`, `play_card`) to communicate player actions to the server.

4.  **Routing**: It uses React Router to navigate between different game states. For example, when a player successfully joins a room, they are automatically navigated from the join page (`/`) to the lobby (`/lobby`). When the game starts, it navigates to the in-game view (`/in-game`).

## Tech Stack

*   **Framework**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Routing**: [React Router](https://reactrouter.com/)
*   **Real-time Communication**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)

## Summary

The `client` is a comprehensive React application that provides a full user experience for the "Poker 99" game, from joining and waiting to playing and finishing. It works closely with the backend via WebSockets to ensure that all players have a synchronized and real-time view of the game state.

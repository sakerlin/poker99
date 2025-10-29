# 九九 (Prototype)

簡易 prototype：Node.js + Express + socket.io 實作，提供最小功能（建立/加入房間、發牌、出牌、currentValue 更新、淘汰判定）。

快速啟動（Windows + PowerShell）：

```powershell
# 安裝後端依賴
cd d:\develop\poker99
npm install

# 啟動後端伺服器
start /b npm start

# 安裝前端依賴
cd d:\develop\poker99\client
npm install

# 啟動前端開發伺服器
start /b npm run dev
```

打開瀏覽器： http://localhost:5173 (前端預設端口) ，在兩個分頁模擬兩位玩家（輸入不同 name，輸入相同 room），點 Start Game 開始。

**注意：** 後端伺服器運行在 http://localhost:8080。

---

## 專案結構與功能分析

### 前端 (`client/`) 功能分析

`client` 目錄包含一個完整的單頁應用程式 (SPA)，是為一個名為 "Poker 99" 的即時多人卡牌遊戲所設計的前端介面。

**核心功能：**

1.  **組件化結構**: 應用程式被拆分成四個主要畫面/組件：`JoinGame` (加入遊戲), `GameLobby` (遊戲大廳), `InGame` (遊戲中), 和 `GameOver` (遊戲結束)。
2.  **狀態管理**: 核心組件 `App.jsx` 管理著所有重要的遊戲狀態。
3.  **即時通訊**: 應用透過 Socket.IO 連接到後端伺服器，即時更新 UI 並傳遞玩家操作。
4.  **路由控制**: 使用 React Router 在不同遊戲階段之間進行畫面切換。

**技術棧**: React, Vite, React Router, Socket.IO Client。

更多詳細資訊請參閱 `client/README.md`。

### 後端 (`server.js`) 功能分析

`server.js` 檔案包含 Node.js 伺服器，它驅動了 "Poker 99" 遊戲的核心邏輯。

**核心功能**

1.  **技術棧**: 使用 `Express` 框架處理 HTTP 請求，並整合 `Socket.IO` 來實現與前端客戶端的即時 WebSocket 通訊。
2.  **遊戲狀態管理**: 所有遊戲房間 (`rooms`) 和玩家狀態都儲存在伺服器的記憶體中。
3.  **核心遊戲邏輯**: 透過事件驅動，實現卡牌效果、玩家淘汰和遊戲結束等規則。
4.  **主要的 Socket.IO 事件處理**: 處理 `connection`, `join_room`, `start_game`, `play_card`, `disconnect` 等事件，管理遊戲流程。
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const GameEngine = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize Dogfight Game Engine
const game = new GameEngine(io);

io.on('connection', (socket) => {
  console.log(`[+] Pilot connected: ${socket.id}`);

  socket.on('joinGame', (data) => {
    let cleanNick = 'Pilot';
    let team = 'ffa';
    if (typeof data === 'string') {
      cleanNick = (data || 'Pilot').substring(0, 16);
    } else if (data && typeof data === 'object') {
      cleanNick = (data.nickname || 'Pilot').substring(0, 16);
      team = data.team || 'ffa';
    }

    const ship = game.addPlayer(socket.id, cleanNick, { team });
    socket.emit('gameJoined', {
      id: socket.id,
      mapSize: game.mapSize,
      landmarks: game.landmarks,
      team: ship.team,
      ship: {
        x: ship.x,
        y: ship.y,
        tier: ship.tier,
        tierName: ship.tierName,
        level: ship.level,
        team: ship.team
      }
    });
  });

  socket.on('playerInput', (input) => {
    game.handleInput(socket.id, input);
  });

  socket.on('upgradeStat', (statKey) => {
    game.handleUpgradeStat(socket.id, statKey);
  });

  socket.on('chooseEvolution', (classKey) => {
    game.handleChooseEvolution(socket.id, classKey);
  });

  socket.on('activateKillstreak', (data) => {
    game.handleActivateKillstreak(socket.id, data.streakKey, data);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Pilot disconnected: ${socket.id}`);
    game.removePlayer(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`✈️ AeroClash.io Biome & Skill Server Online!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`=============================================`);
});

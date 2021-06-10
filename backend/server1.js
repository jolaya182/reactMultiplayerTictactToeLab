/* eslint-disable func-names */
const express = require('express');

const app = express();
// const http = require('https');

// const server = http.createServer(app);
const socket = require('socket.io');

// const io = socket(server);
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '/database');
const db = new sqlite3.Database(`${dbPath}/tictactoe.db`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  // res.header('Content-Type', 'application/json; charset=utf-8');
  // res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// const newPort = 3000;
// server.listen(newPort, () => console.log(`server is also on port ${newPort}`));
const newP = 3000;
const server = app.listen(newP, () => {
  console.log(`server listening port: ${newP}`);
});
const cors = {
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST'],
  allowHeaders: ['Content-Type']
};
const io = socket(server, cors);

const users = [];
const messages = {
  general: [],
  random: [],
  jokes: [],
  javascript: []
};

const tempPlayers = [];
const allPlayers = {};

io.on('connection', (clientSocket) => {
  console.log('connected!');
  console.log('clientSocket # of rooms', clientSocket.rooms);

  clientSocket.on('join game', (player) => {
    const usersId = clientSocket.id;
    const user = {
      // playerSocket: clientSocket,
      playerName: player,
      id: usersId,
      gameInfo: null,
      oponentPlayer: null
    };

    if (tempPlayers.length % 2 !== 0) {
      const olderPlayer = tempPlayers.pop();
      // const olderPlayerSocket = olderPlayer.playerSocket;
      const olderPlayerId = olderPlayer.id;
      const newRoom = `${olderPlayer.id}${usersId}`;
      const gameInfo = {
        roomName: newRoom,
        firstPlayer: { ...olderPlayer, oponentPlayer: usersId },
        secondPlayer: { ...user, oponentPlayer: olderPlayerId },
        iAm: 'firstPlayer'
      };
      allPlayers[olderPlayerId] = {
        ...allPlayers[olderPlayerId],
        oponentPlayer: usersId,
        ...gameInfo
      };
      allPlayers[usersId] = {
        ...allPlayers[usersId],
        oponentPlayer: olderPlayerId,
        ...gameInfo,
        iAm: 'secondPlayer'
      };

      // clientSocket.join(olderPlayerId);
      // console.log('allPlayers[olderPlayerId]', allPlayers[olderPlayerId]);
      // allPlayers[olderPlayerId].join('sand');
      // olderPlayerSocket.join('sand');
      // console.log('gameInfo', gameInfo);
      // console.log('usersId', usersId);
      clientSocket.emit('game joined', {
        oponentPlayer: olderPlayerId,
        ...gameInfo,
        iAm: 'secondPlayer'
      });
      clientSocket
        .to(olderPlayerId)
        .emit('game joined', { oponentPlayer: usersId, ...gameInfo });
    } else {
      tempPlayers.push(user);
      //
      const gameInfo = {
        roomName: 'TBA',
        first: user,
        second: { player: 'waiting for player to connect', id: null }
      };

      clientSocket.emit('game joined', gameInfo);
    }

    allPlayers[usersId] = user;

    // console.log('tempPlayers ->', tempPlayers);
  });

  clientSocket.on('send to player', (id) => {
    console.log('room', clientSocket.rooms);
    clientSocket.broadcast.to(id).emit('receive from player', { id });
  });

  clientSocket.on('join server', (username) => {
    const user = {
      username,
      id: clientSocket.id
    };
    users.push(user);
    // tempPlayers.push(user);
    clientSocket.emit('new user', users);
  });

  clientSocket.on('join room', (roomName, cb) => {
    clientSocket.join(roomName);
    cb(messages[roomName]);
    // socket.emit('joined', messages[roomName]);
  });

  clientSocket.on(
    'send message',
    ({ content, to, sender, chatName, isChannel }) => {
      console.log('send message', content);
      if (isChannel) {
        const payload = {
          content,
          chatName,
          sender
        };
        clientSocket.to(to).emit('new message', payload);
      } else {
        const payload = {
          content,
          chatName: sender,
          sender
        };
        clientSocket.to(to).emit('new message', payload);
      }
      if (messages[chatName]) {
        messages[chatName].push({
          sender,
          content
        });
      }
    }
  );

  clientSocket.on('disconnect', () => {
    console.log('disconect', clientSocket.id);
    const userId = clientSocket.id;
    const disconectedPlayer = allPlayers[userId];
    console.log('disconectedPlayer', disconectedPlayer);
    if (disconectedPlayer.oponentPlayer) {
      const { oponentPlayer } = disconectedPlayer;
      const playerLeft = allPlayers[oponentPlayer];
      tempPlayers.push(playerLeft);
      delete allPlayers[userId];
    } else {
      delete allPlayers[userId];
      tempPlayers.pop();
    }

    // users = users.filter((u) => u.id !== clientSocket.id);
    // clientSocket.emit('new user', users);
    console.log('remaining users', tempPlayers);
    console.log('rooms', clientSocket.rooms);
  });
});
// @todo create function that chechks for error. pass it as middleware
db.run('PRAGMA foreign_keys=on');
db.run(
  'CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT )'
);
db.run(
  'CREATE TABLE IF NOT EXISTS leaderboard (userId INTEGER, wins INTEGER,  FOREIGN KEY(userId) REFERENCES users(userId) ON DELETE CASCADE )'
);

let sql = '';
const returnResults = (req, res) => {
  res.send({ data: req.body });
};

app.get(
  '/',
  async (req, res, next) => {
    console.log('went through get!!');
    sql = 'SELECT * FROM users';
    const result = await db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        req.body = rows;
        next();
      }
    });
    console.log('result', result);
  },
  returnResults
);

app.get(
  '/create',
  (req, res, next) => {
    const name = 'ja';
    const password = 'pas';
    sql = `INSERT INTO users( name, password ) VALUES( '${name}', '${password}' )`;
    db.run(sql, [], function (err) {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        req.body = this.lastID;
        next();
      }
    });
  },
  returnResults
);

app.get(
  '/win',
  (req, res, next) => {
    const id = 12;
    const wins = 15;
    sql = `INSERT INTO leaderboard( userId, wins ) VALUES( '${id}', '${wins}' )`;
    db.run(sql, [], function (err) {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        req.body = this.lastID;
        next();
      }
    });
  },
  returnResults
);

app.get(
  '/leaderboard',
  (req, res, next) => {
    sql = `Select * FROM leaderboard`;
    db.all(sql, [], function (err, rows) {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        req.body = rows;
        next();
      }
    });
  },
  returnResults
);

app.get(
  '/delete',
  (req, res, next) => {
    const id = 12;

    sql = `DELETE FROM users WHERE userId = ${id}`;
    db.all(sql, [], (err) => {
      if (err) {
        res.status(500).send({ error: err.message });
      } else {
        req.body = `deleted id # ${id}`;
        next();
      }
    });
  },
  returnResults
);

// db.close();

module.exports = app;

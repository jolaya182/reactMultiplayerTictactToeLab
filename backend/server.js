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

const tempPlayers = [];
const allPlayers = {};

io.on('connection', (clientSocket) => {
  console.log('connected!');
  console.log('clientSocket # of rooms', clientSocket.rooms);

  clientSocket.join('tic-tact-toe-room');

  clientSocket.on('join game', (player) => {
    const usersId = clientSocket.id;
    const user = {
      // playerSocket: clientSocket,
      playerName: player,
      id: usersId,
      oponentPlayer: null
    };

    if (tempPlayers.length % 2 !== 0) {
      const olderPlayer = tempPlayers.pop();
      // const olderPlayerSocket = olderPlayer.playerSocket;
      const olderPlayerId = olderPlayer.id;
      console.log('olderPlayerId-->', olderPlayerId);
      const newUser = { ...user, oponentPlayer: olderPlayerId };
      const gameInfo = {
        firstPlayer: { ...olderPlayer, oponentPlayer: usersId },
        secondPlayer: { ...newUser, oponentPlayer: olderPlayerId },
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
      allPlayers[usersId] = newUser;
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
      allPlayers[usersId] = user;
    }

    // console.log('tempPlayers ->', tempPlayers);
  });

  clientSocket.on('send to player', (id) => {
    console.log('room', clientSocket.rooms);
    console.log('id', id);
    clientSocket.broadcast
      .to(id)
      .emit('receive from player', { row: 0, col: 0 });
  });

  clientSocket.on('disconnect', () => {
    console.log('disconect', clientSocket.id);
    const userId = clientSocket.id;
    const disconectedPlayer = allPlayers[userId];
    if (!disconectedPlayer) return;
    console.log('disconectedPlayer', disconectedPlayer);

    if (disconectedPlayer.oponentPlayer) {
      const { oponentPlayer } = disconectedPlayer;
      console.log('oponentPlayer--->', oponentPlayer);
      const playerLeft = allPlayers[oponentPlayer];
      console.log('playerLeft', playerLeft);
      const newPlayer = { ...playerLeft, oponentPlayer: null };
      allPlayers[newPlayer.id] = newPlayer;
      delete allPlayers[userId];

      // check if any tempPlayers available and deque the player
      // an pair the tempPlayer with the newPlayer
      if (tempPlayers.length >= 1) {
        console.log(`tempPlayers.length >= 1 ${tempPlayers.length >= 1}`);
        const nextPlayer = tempPlayers.pop();
        const nextPlayerId = nextPlayer.id;
        const newPlayerId = newPlayer.id;
        const newNextPlayer = { ...nextPlayer, oponentPlayer: newPlayer.id };
        const newerPlayer = { ...nextPlayer, oponentPlayer: newPlayerId };
        const gameInfo = {
          firstPlayer: { ...newerPlayer, oponentPlayer: nextPlayerId },
          secondPlayer: { ...newNextPlayer, oponentPlayer: newPlayerId },
          iAm: 'firstPlayer'
        };
        allPlayers[newPlayerId] = {
          ...allPlayers[newPlayerId],
          oponentPlayer: nextPlayerId,
          ...gameInfo
        };
        allPlayers[nextPlayerId] = {
          ...allPlayers[nextPlayerId],
          oponentPlayer: newPlayerId,
          ...gameInfo,
          iAm: 'secondPlayer'
        };

        clientSocket.to(nextPlayerId).emit('game joined', {
          oponentPlayer: newPlayerId,
          ...gameInfo,
          iAm: 'secondPlayer'
        });
        clientSocket
          .to(newPlayerId)
          .emit('game joined', { oponentPlayer: nextPlayerId, ...gameInfo });

        allPlayers[newPlayerId] = newerPlayer;
        allPlayers[nextPlayerId] = newNextPlayer;
      } else {
        tempPlayers.push(newPlayer);
      }
    } else {
      // clear out the last player connected through sockets
      delete allPlayers[userId];
      tempPlayers.pop();
    }

    console.log('remaining users', tempPlayers);
    console.log('rooms', clientSocket.rooms);
  });

  clientSocket.on('get-leader-board', () => {
    clientSocket
      .to('tic-tact-toe-room')
      .emit('receive-leader-board', 'This is the leaderboard');
    clientSocket.broadcast.emit(
      `receive-leader-board`,
      `This is the leaderboard`
    );
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
  const { body } = req;
  console.log('returnResults', body);

  res.send({ data: req.body });
};

const checkForErrors = (req, res, next) => {
  const { body } = req;
  const { err, rows } = body;
  console.log('checkForErrors', body);
  if (err) {
    res.status(500).send({ error: body.message });
  } else {
    req.body = rows;
    // returnResults(req, res);
    // res.send({ data: body });
    next();
  }
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
    const id = 13;
    const wins = 13;
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

const getLeaderBoard = (req, res, next) => {
  const { body } = req;
  io.to('tic-tact-toe-room').emit('leaderBoardReceived', body);
  next();
};

// select top ten leaders with the highest wins
app.get(
  '/leaderboard',
  (req, res, next) => {
    sql = `SELECT  users.name, leaderboard.userId, leaderboard.wins
    FROM users
    INNER JOIN leaderboard 
    ON users.userId = leaderboard.userId
    ORDER BY wins DESC
    LIMIT 10`;
    db.all(sql, [], function (err, rows) {
      req.body = { err, rows };
      next();
    });
  },
  checkForErrors,
  getLeaderBoard,
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

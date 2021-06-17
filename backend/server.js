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
    console.log('join Game Request');
    console.log('tempPlayers->', tempPlayers);
    const usersId = clientSocket.id;
    const user = {
      playerName: player,
      id: usersId,
      oponentPlayer: null
    };

    // @todo place an and. if the userId ex.
    if (tempPlayers.length % 2 !== 0) {
      const olderPlayer = tempPlayers.pop();
      const olderPlayerId = olderPlayer.id;
      const olderPlayerName = olderPlayer.playerName;
      console.log('olderPlayer-->', olderPlayer);
      // eslint-disable-next-line prettier/prettier
      const secondPlayer = {
        ...user,
        oponentPlayer: olderPlayerId,
        oponentPlayerName: player
      };
      const firstPlayer = {
        ...olderPlayer,
        oponentPlayer: usersId,
        oponentPlayerName: olderPlayerName
      };

      allPlayers[olderPlayerId] = {
        ...firstPlayer,
        iAm: 'firstPlayer'
      };

      allPlayers[usersId] = {
        ...secondPlayer,
        iAm: 'secondPlayer'
      };

      console.log('oldier', allPlayers[olderPlayerId]);
      console.log('usier', allPlayers[usersId]);
      clientSocket.emit('game joined', allPlayers[usersId]);
      clientSocket
        .to(olderPlayerId)
        .emit('game joined', allPlayers[olderPlayerId]);
      console.log('allPlayers', allPlayers);
    } else {
      console.log('pushing in the user');
      const gameInfo = {
        ...user,
        oponentPlayer: null,
        oponentPlayerName: 'waiting for player to connect',
        iAm: 'firstPlayer'
      };
      if (allPlayers[usersId]) {
        tempPlayers.push(gameInfo);
        return;
      }
      clientSocket.emit('game joined', gameInfo);
      allPlayers[usersId] = gameInfo;
      tempPlayers.push(gameInfo);
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
    clientSocket.disconnect();
    if (!disconectedPlayer) return;
    console.log('disconectedPlayer', disconectedPlayer);

    if (disconectedPlayer.oponentPlayer) {
      const { oponentPlayer } = disconectedPlayer;
      console.log('oponentPlayer--->', oponentPlayer);
      const playerLeft = allPlayers[oponentPlayer];
      console.log('playerLeft', playerLeft);
      const newPlayer = {
        ...playerLeft,
        oponentPlayer: null,
        oponentPlayerName: null,
        iAm: 'firstPlayer'
      };
      allPlayers[newPlayer.id] = newPlayer;
      delete allPlayers[userId];
      clientSocket.to(newPlayer.id).emit('player-left');
      // check if any tempPlayers available and deque the player
      // an pair the tempPlayer with the newPlayer
      console.log('tempPlayers-->', tempPlayers);
      if (tempPlayers.length >= 1) {
        console.log(`tempPlayers.length >= 1 ${tempPlayers.length >= 1}`);
        const nextPlayer = tempPlayers.pop();
        const nextPlayerId = nextPlayer.id;
        const nextPlayerOponentName = newPlayer.playerName;
        const newPlayerId = newPlayer.id;
        const newPlayerOponentName = nextPlayer.playerName;

        const firstPlayer = {
          ...newPlayer,
          oponentPlayer: nextPlayerId,
          oponentPlayerName: nextPlayerOponentName,
          iAm: 'firstPlayer'
        };
        const secondPlayer = {
          ...nextPlayer,
          oponentPlayer: newPlayer.id,
          oponentPlayerName: newPlayerOponentName,
          iAm: 'secondPlayer'
        };

        allPlayers[newPlayerId] = {
          ...firstPlayer,
          iAm: 'firstPlayer'
        };
        allPlayers[nextPlayerId] = {
          ...secondPlayer,
          iAm: 'secondPlayer'
        };

        clientSocket
          .to(nextPlayerId)
          .emit('game joined', allPlayers[nextPlayerId]);

        clientSocket
          .to(newPlayerId)
          .emit('game joined', allPlayers[newPlayerId]);
      } else {
        tempPlayers.push(newPlayer);
      }
    } else {
      // clear out the last player connected through sockets
      delete allPlayers[userId];
      tempPlayers.pop();
    }

    console.log('discont remaining users', tempPlayers);
    console.log('rooms', clientSocket.rooms);
    console.log('allPlayers', allPlayers);
  });

  clientSocket.on('get-leader-board', () => {
    console.log('get-leader-board');
    clientSocket.emit(`receive-leader-board`, `This is the leaderboard`);
    clientSocket.broadcast
      .to('tic-tact-toe-room')
      .emit('receive-leader-board', 'This is the leaderboard');
  });

  clientSocket.on(
    'send-grid',
    (playerId, gridMatrix, currentPlayer, winner, totalMarks, tie) => {
      console.log('send-grid', playerId, gridMatrix);
      clientSocket
        .to(playerId)
        .emit(
          'receive-grid',
          gridMatrix,
          currentPlayer,
          winner,
          totalMarks,
          tie
        );
    }
  );

  // clientSocket.on('inform-player-new-player-entered-the-room',()=>{

  // } );
  clientSocket.on('inform-player-changed-room', (oponentId) => {
    console.log('inform-player-changed-room', oponentId);
    clientSocket.to(oponentId).emit('player-left', 'changedLeft');
    // place this player into the tempPlayer array
    tempPlayers.push(allPlayers[oponentId]);
    console.log('oponentId', tempPlayers);
  });
});
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
  // console.log('returnResults', body);

  res.send({ data: body });
};

const checkForErrors = (req, res, next) => {
  const { body } = req;
  const { err, rows } = body;
  // console.log('checkForErrors', body);
  if (err) {
    res.status(500).send({ error: body.message });
  } else {
    req.body = rows;
    // returnResults(req, res);
    // res.send({ data: body });
    next();
  }
};

const pullInLeaders = (req, res, next) => {
  sql = `SELECT  users.name, leaderboard.userId, leaderboard.wins
  FROM users
  INNER JOIN leaderboard 
  ON users.userId = leaderboard.userId
  ORDER BY wins DESC
  LIMIT 10`;
  db.all(sql, [], (err, rows) => {
    req.body = { err, rows };
    // console.log('rows', rows);
    req.body = rows;
    next();
  });
};

app.post(
  '/login',
  (req, res, next) => {
    console.log('went through get!!');
    const { name, password } = req.body;
    sql = `SELECT name FROM users WHERE password='${password}' AND name='${name}'`;
    db.all(sql, [], (err, rows) => {
      req.body = { err, rows };
      // console.log('rows', rows);
      next();
    });
  },
  checkForErrors,
  pullInLeaders,
  returnResults
);
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
  io.to('tic-tact-toe-room').emit('receive-leader-board', body);
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

/* eslint-disable func-names */
/**
 * @Author: Javier Olaya
 * @fileName: server.js
 * @date: 6/18/2021
 * @description: Main backend application that makes calls to the database and manages the sockets
 */
const express = require('express');

const app = express();

const socket = require('socket.io');

const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '/database');
const db = new sqlite3.Database(`${dbPath}/tictactoe.db`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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

// sets up all the communication between the server and the client
io.on('connection', (clientSocket) => {
  clientSocket.join('tic-tact-toe-room');

  // main socket to add a new player to the game
  clientSocket.on('join game', (player) => {
    const usersId = clientSocket.id;
    const user = {
      playerName: player,
      id: usersId,
      oponentPlayer: null
    };

    if (tempPlayers.length % 2 !== 0) {
      const olderPlayer = tempPlayers.pop();
      const olderPlayerId = olderPlayer.id;
      const olderPlayerName = olderPlayer.playerName;
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

      clientSocket.emit('game joined', allPlayers[usersId]);
      clientSocket
        .to(olderPlayerId)
        .emit('game joined', allPlayers[olderPlayerId]);
    } else {
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
  });

  // main socket to communicate the coordinates the player is marking
  clientSocket.on('send to player', (id) => {
    clientSocket.broadcast
      .to(id)
      .emit('receive from player', { row: 0, col: 0 });
  });

  // disconnects player that leaves or logs and automatically joins any waiting player
  clientSocket.on('disconnect', () => {
    const userId = clientSocket.id;
    const disconectedPlayer = allPlayers[userId];
    clientSocket.disconnect();
    if (!disconectedPlayer) return;

    if (disconectedPlayer.oponentPlayer) {
      const { oponentPlayer } = disconectedPlayer;
      const playerLeft = allPlayers[oponentPlayer];
      const newPlayer = {
        ...playerLeft,
        oponentPlayer: null,
        oponentPlayerName: null,
        iAm: 'firstPlayer'
      };
      allPlayers[newPlayer.id] = newPlayer;
      delete allPlayers[userId];
      clientSocket.to(newPlayer.id).emit('player-left');
      if (tempPlayers.length >= 1) {
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
      delete allPlayers[userId];
      tempPlayers.pop();
    }
  });

  // sends the grid to the other player to update the game state
  clientSocket.on(
    'send-grid',
    (
      playerId,
      gridMatrix,
      currentPlayer,
      winner,
      totalMarks,
      tie,
      gamePlayer
    ) => {
      clientSocket
        .to(playerId)
        .emit(
          'receive-grid',
          gridMatrix,
          currentPlayer,
          winner,
          totalMarks,
          tie,
          gamePlayer
        );
    }
  );

  // informs the player that is still playing that his/her opoenent has left
  clientSocket.on('inform-player-changed-room', (oponentId) => {
    clientSocket.to(oponentId).emit('player-left', 'changedLeft');
    tempPlayers.push(allPlayers[oponentId]);
  });
});
db.run('PRAGMA foreign_keys=on');
db.run(
  'CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT )'
);
db.run(
  'CREATE TABLE IF NOT EXISTS leaderboard (userId INTEGER, wins INTEGER,  FOREIGN KEY(userId) REFERENCES users(userId) ON DELETE CASCADE )'
);

// db.run('DROP TABLE history');

db.run(
  'CREATE TABLE IF NOT EXISTS history (historyId INTEGER PRIMARY KEY AUTOINCREMENT, winnerId INTEGER, loserId INTEGER,  FOREIGN KEY(winnerId) REFERENCES users(userId) ON DELETE CASCADE,   FOREIGN KEY(loserId) REFERENCES users(userId) ON DELETE CASCADE)'
);

let sql = '';
/**
 * helper funciton that returns the data to the client
 */
const returnResults = (req, res) => {
  const { body } = req;
  res.send({ data: body });
};

/**
 * helper function that finds any error that the query
 * produced
 */
const checkForErrors = (req, res, next) => {
  const { body } = req;
  const { err, rows } = body;
  if (err) {
    console.log('checkForErrors', body);
    res.status(500).send({ error: body.message });
  } else {
    req.body = rows;
    next();
  }
};

/**
 * querys who are the top ranked players
 */
const pullInLeaders = (req, res, next) => {
  const rows = req.body;
  sql = `SELECT  users.name, leaderboard.userId, leaderboard.wins
  FROM users
  INNER JOIN leaderboard 
  ON users.userId = leaderboard.userId
  ORDER BY wins DESC
  LIMIT 10`;

  db.all(sql, [], (err, allLeaders) => {
    req.body = { err, rows: { allLeaders, player: rows } };
    next();
  });
};

/**
 * helper function querys who are the top ranked players
 */
const callLeaderBoard = (req, res, next) => {
  const { player, history } = req.body;
  sql = `SELECT  users.name, leaderboard.userId, leaderboard.wins
    FROM users
    INNER JOIN leaderboard 
    ON users.userId = leaderboard.userId
    ORDER BY wins DESC
    LIMIT 10`;
  db.all(sql, [], function (err, leaders) {
    req.body = { err, rows: { allLeaders: leaders, player, history } };
    next();
  });
};

const getLeaderBoard = (req, res, next) => {
  const { body } = req;
  io.to('tic-tact-toe-room').emit('receive-leader-board', body);
  req.body = { rows: body };
  next();
};

/**
 * inserts new win for the victorious player
 */
const updateLeaderBoard = (req, res, next) => {
  const { winnerId, totalWins, history } = req.body;
  let wins;
  if (totalWins.wins === 0) {
    // insert
    wins = totalWins.wins + 1;
    sql = `INSERT INTO leaderboard( userId, wins ) VALUES( '${winnerId}', '${wins}' )`;
    db.run(sql, [], function (err) {
      req.body = { err, rows: { player: [{ userId: this.lastID }], history } };
      next();
    });
  } else {
    // update
    wins = totalWins.wins + 1;
    sql = `UPDATE leaderboard SET  wins='${wins}' WHERE userId='${winnerId}'`;
    db.run(sql, [], function (err) {
      req.body = { err, rows: { player: [{ userId: this.lastID }], history } };
      next();
    });
  }
};

const getHistory = (req, res, next) => {
  sql = ` SELECT T1.winnerId, T2.loserId
    FROM 
    (SELECT u.name AS winnerId, u.userId, h.historyId FROM users AS u INNER JOIN history AS H ON u.userId=h.winnerId) AS T1
    INNER JOIN 
    (SELECT u.name AS loserId, u.userId, h.historyId FROM users AS u INNER JOIN history AS h ON u.userId=h.loserId) AS T2
    ON T1.historyId=T2.historyId
   `;

  db.all(sql, [], function (err, history) {
    req.body.history = history;
    req.body = { err, rows: req.body };
    next();
  });
};

const insertHistory = (req, res, next) => {
  const { winnerId, loserId } = req.body;
  sql = `INSERT INTO history(winnerId, loserId) VALUES('${winnerId}','${loserId}' )`;
  db.run(sql, [], function (err) {
    req.body = { err, rows: req.body };
    next();
  });
};

app.post(
  '/login',
  function (req, res, next) {
    const { name, password } = req.body;
    sql = `SELECT userId FROM users WHERE password='${password}' AND name='${name}'`;
    db.all(sql, [], (err, player) => {
      const playerId = player[0];
      req.body = { err, rows: [playerId] };
      next();
    });
  },
  checkForErrors,
  pullInLeaders,
  checkForErrors,
  getHistory,
  checkForErrors,
  returnResults
);

app.get(
  '/',
  (req, res, next) => {
    sql = 'SELECT * FROM users';
    db.all(sql, [], (err, rows) => {
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

app.post(
  '/win',
  (req, res, next) => {
    const { winnerId, loserId } = req.body;
    sql = `SELECT wins FROM leaderboard WHERE userId='${winnerId}'`;
    db.all(sql, [], function (err, tw) {
      const totalWins = tw[0] || { wins: 0 };
      const rows = { winnerId, totalWins, loserId };
      req.body = { err, rows };
      next();
    });
  },
  checkForErrors,
  insertHistory,
  checkForErrors,
  getHistory,
  checkForErrors,
  updateLeaderBoard,
  checkForErrors,
  callLeaderBoard,
  checkForErrors,
  getLeaderBoard,
  checkForErrors,
  returnResults
);

app.post(
  '/create',
  (req, res, next) => {
    const { name, password } = req.body;

    sql = `INSERT INTO users( name, password ) VALUES( '${name}', '${password}' )`;
    db.run(sql, [], function (err) {
      req.body = { err, rows: { player: [{ userId: this.lastID }] } };
      next();
    });
  },
  checkForErrors,
  getHistory,
  checkForErrors,
  callLeaderBoard,
  checkForErrors,
  returnResults
);

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

app.post(
  '/delete',
  (req, res, next) => {
    const id = JSON.stringify(req.body.id);
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

app.get(
  '/history',
  (req, res, next) => {
    sql = `SELECT * FROM history`;
    db.all(sql, [], function (err, history) {
      req.body = { err, rows: history };
      next();
    });
  },
  checkForErrors,
  returnResults
);

// db.close();

module.exports = app;

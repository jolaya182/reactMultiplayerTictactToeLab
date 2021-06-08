/* eslint-disable func-names */
const express = require('express');
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '/database');
const db = new sqlite3.Database(`${dbPath}/tictactoe.db`);

db.run('PRAGMA foreign_keys=on');
db.run(
  'CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT )'
);
db.run(
  'CREATE TABLE IF NOT EXISTS leaderboard (userId INTEGER, wins INTEGER,  FOREIGN KEY(userId) REFERENCES users(userId) ON DELETE CASCADE )'
);

const app = express();
let sql = '';
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  // res.header('Content-Type', 'application/json; charset=utf-8');
  // res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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